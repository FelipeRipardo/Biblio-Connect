import { encerrarSessao, salvarSessao } from '../api/sessao';
import type { CategoriaMaterial, Material, Perfil } from '../types/api';
import { USUARIOS_MOCK, bancoInicial, type BancoMock } from './dados';

//Modo de visualização: substitui o fetch de /api/* por respostas fictícias, para ver as telas sem back-end e sem login.
//Só existe em desenvolvimento (import.meta.env.DEV) e só fica ativo depois de abrir /preview.

const CHAVE_ATIVO = 'biblioconnect.preview';
const CHAVE_BANCO = 'biblioconnect.preview.banco';

let fetchOriginal: typeof window.fetch | null = null;

export const previewAtivo = () => import.meta.env.DEV && sessionStorage.getItem(CHAVE_ATIVO) === '1';

//Chamado no main.tsx: mantém o modo ativo depois de recarregar a página
export function instalarPreviewSeAtivo() {
  if (previewAtivo()) instalar();
}

//Liga as respostas fictícias sem criar sessão (ex.: para testar a tela de login)
export function ativarMocks() {
  if (!import.meta.env.DEV) return;
  sessionStorage.setItem(CHAVE_ATIVO, '1');
  instalar();
}

//Entra como o usuário fictício do perfil (sessão com token falso)
export function entrarComoMock(perfil: Perfil) {
  if (!import.meta.env.DEV) return;
  ativarMocks();
  salvarSessao(respostaLogin(perfil), false);
}

export function sairDoPreview() {
  sessionStorage.removeItem(CHAVE_ATIVO);
  sessionStorage.removeItem(CHAVE_BANCO);
  encerrarSessao();
  if (fetchOriginal) window.fetch = fetchOriginal;
  fetchOriginal = null;
}

export function reiniciarDadosMock() {
  sessionStorage.removeItem(CHAVE_BANCO);
}

function instalar() {
  if (fetchOriginal) return;
  const original = window.fetch.bind(window);
  fetchOriginal = original;
  window.fetch = async (entrada, init) => {
    const url = new URL(typeof entrada === 'string' ? entrada : entrada instanceof URL ? entrada.href : entrada.url, location.origin);
    if (!url.pathname.startsWith('/api/')) return original(entrada, init);

    await new Promise((r) => setTimeout(r, 250)); //Simula a latência da rede
    const metodo = (init?.method ?? 'GET').toUpperCase();
    const corpo = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const [status, dados] = responder(metodo, url.pathname.slice('/api'.length), url.searchParams, corpo);
    return new Response(JSON.stringify(dados), { status, headers: { 'Content-Type': 'application/json' } });
  };
}

function carregarBanco(): BancoMock {
  try {
    const salvo = sessionStorage.getItem(CHAVE_BANCO);
    if (salvo) return JSON.parse(salvo) as BancoMock;
  } catch {
    //Banco corrompido: recomeça com os dados iniciais
  }
  return bancoInicial();
}

function respostaLogin(perfil: Perfil) {
  return { mensagem: 'Login realizado (modo de visualização).', token: 'token-preview', tipo: 'Bearer' as const, perfil, ...USUARIOS_MOCK[perfil] };
}

type Resposta = [number, unknown];
const erro = (status: number, mensagem: string): Resposta => [status, { erro: mensagem }];
const contem = (valor: string | null | undefined, termo: string) => (valor ?? '').toLowerCase().includes(termo.toLowerCase());
const agora = () => new Date().toISOString().slice(0, 19);

//Rotas simuladas, com as mesmas mensagens dos controllers/services do back-end
function responder(metodo: string, caminho: string, params: URLSearchParams, corpo: any): Resposta {
  const banco = carregarBanco();
  const resposta = rotear(banco, metodo, caminho, params, corpo);
  if (metodo !== 'GET') sessionStorage.setItem(CHAVE_BANCO, JSON.stringify(banco));
  return resposta;
}

function rotear(banco: BancoMock, metodo: string, caminho: string, params: URLSearchParams, corpo: any): Resposta {
  const [, recurso, idTexto] = caminho.split('/');
  const id = idTexto ? Number(idTexto) : null;

  if (caminho === '/auth/login' && metodo === 'POST') {
    return [200, respostaLogin(corpo.perfil as Perfil)];
  }

  if (recurso === 'materiais') {
    const indice = id !== null ? banco.materiais.findIndex((m) => m.id === id) : -1;
    const naoEncontrado = erro(404, `Material educacional não encontrado com o ID: ${id}`);
    const isbnRepetido = (isbn: string | undefined, ignorar?: number) =>
      !!isbn && banco.materiais.some((m) => m.isbn === isbn && m.id !== ignorar);

    if (metodo === 'GET' && id === null) {
      const termo = params.get('termo') ?? '';
      const categoria = params.get('categoria') as CategoriaMaterial | null;
      const serie = params.get('serie') ?? '';
      const disciplina = params.get('disciplina') ?? '';
      const lista = banco.materiais
        .filter((m) => !termo || contem(m.titulo, termo) || contem(m.autor, termo))
        .filter((m) => !categoria || m.categoria === categoria)
        .filter((m) => !serie || (m.serie ?? '').toLowerCase() === serie.toLowerCase())
        .filter((m) => !disciplina || contem(m.disciplina, disciplina))
        .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
      return [200, lista];
    }
    if (metodo === 'GET') return indice < 0 ? naoEncontrado : [200, banco.materiais[indice]];
    if (metodo === 'POST') {
      if (isbnRepetido(corpo.isbn)) return erro(400, 'Já existe um material cadastrado com este ISBN.');
      const novo: Material = { ...vazio(), ...corpo, id: banco.proximoId++, criadoEm: agora(), atualizadoEm: null };
      banco.materiais.push(novo);
      return [201, novo];
    }
    if (metodo === 'PUT') {
      if (indice < 0) return erro(400, `Material educacional não encontrado com o ID: ${id}`);
      if (isbnRepetido(corpo.isbn, id!)) return erro(400, 'Já existe outro material cadastrado com este ISBN.');
      const atual = banco.materiais[indice];
      banco.materiais[indice] = { ...vazio(), ...corpo, id: atual.id, criadoEm: atual.criadoEm, atualizadoEm: agora() };
      return [200, banco.materiais[indice]];
    }
    if (metodo === 'DELETE') {
      if (indice < 0) return naoEncontrado;
      banco.materiais.splice(indice, 1);
      return [200, { mensagem: 'Material removido do acervo com sucesso.' }];
    }
  }

  if (recurso === 'gestores') {
    if (metodo === 'GET') return [200, banco.gestores];
    if (metodo === 'POST') {
      if (emailEmUso(banco, corpo.email)) return erro(400, 'Este e-mail já está cadastrado.');
      const novo = { id: banco.proximoId++, nome: corpo.nome, email: corpo.email, perfil: 'GESTOR' as const };
      banco.gestores.push(novo);
      return [201, { mensagem: 'Servidor/Gestor provisionado pelo Administrador com sucesso!', ...novo }];
    }
  }

  //Alunos e professores: o suficiente para o Dashboard, as listas e os painéis funcionarem
  if (recurso === 'alunos' || recurso === 'professores') {
    const lista: { id: number; nome: string; email: string }[] = banco[recurso];
    const indice = id !== null ? lista.findIndex((u) => u.id === id) : -1;
    const rotulo = recurso === 'alunos' ? 'Aluno' : 'Professor';

    if (metodo === 'GET' && id === null) {
      const nome = params.get('nome') ?? '';
      return [200, lista.filter((u) => !nome || contem(u.nome, nome))];
    }
    if (indice < 0 && id !== null) return erro(404, `${rotulo} não encontrado.`);
    if (metodo === 'GET') return [200, lista[indice]];
    if (metodo === 'PUT') {
      lista[indice] = { ...lista[indice], ...corpo };
      return [200, lista[indice]];
    }
    if (metodo === 'DELETE') {
      lista.splice(indice, 1);
      return [200, { mensagem: `${rotulo} excluído com sucesso.` }];
    }
    if (metodo === 'POST') {
      if (emailEmUso(banco, corpo.email)) return erro(400, 'Este e-mail já está cadastrado.');
      const { senha: _, ...dados } = corpo;
      const novo = { ...dados, id: banco.proximoId++, perfil: recurso === 'alunos' ? 'ALUNO' : 'PROFESSOR' };
      lista.push(novo);
      return [201, { mensagem: `${rotulo} cadastrado com sucesso!`, id: novo.id, nome: novo.nome, email: novo.email, matricula: novo.matricula }];
    }
  }

  return erro(501, `Rota ${metodo} /api${caminho} não está disponível no modo de visualização.`);
}

const vazio = (): Omit<Material, 'id' | 'criadoEm' | 'atualizadoEm' | 'titulo' | 'autor' | 'categoria' | 'tipoMaterial'> => ({
  ano: null,
  serie: null,
  disciplina: null,
  descricao: null,
  isbn: null,
  editora: null,
  urlArquivo: null,
  capaUrl: null,
});

const emailEmUso = (banco: BancoMock, email: string) =>
  [...banco.gestores, ...banco.alunos, ...banco.professores].some((u) => u.email.toLowerCase() === String(email).toLowerCase());
