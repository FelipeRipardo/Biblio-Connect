import { encerrarSessao, obterSessao, salvarSessao } from '../api/sessao';
import type { CategoriaMaterial, Favorito, Leitura, Material, Perfil } from '../types/api';
import { senhaForte, REGRA_SENHA } from '../utils/senha';
import { USUARIOS_MOCK, bancoInicial, diasAtrasIso, type BancoMock, type LeituraMock } from './dados';

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
    //Bancos salvos por versões anteriores do preview ganham os campos novos com os valores iniciais
    if (salvo) return { ...bancoInicial(), ...(JSON.parse(salvo) as Partial<BancoMock>) };
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
const agora = () => diasAtrasIso(0);

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

  //Recuperação de senha: qualquer e-mail ou matrícula é aceito; o token fictício vem na resposta, como no back-end
  if (caminho === '/auth/esqueci-senha' && metodo === 'POST') {
    const identificador = String(corpo.identificador ?? '');
    const email = identificador.includes('@') ? identificador : USUARIOS_MOCK.ALUNO.email;
    const validoAte = new Date(Date.now() + 30 * 60_000).toISOString().slice(0, 19);
    return [200, { mensagem: 'Instruções enviadas para o e-mail cadastrado.', emailDestino: email, tokenGeradoParaTeste: 'token-preview-123', validoAte }];
  }
  if (caminho === '/auth/redefinir-senha' && metodo === 'POST') {
    if (corpo.token !== 'token-preview-123') return erro(400, 'Token de recuperação inválido ou expirado.');
    const problema = validarNovaSenha(corpo);
    if (problema) return erro(400, problema);
    return [200, { mensagem: 'Senha redefinida com sucesso! Faça login com a nova senha.' }];
  }
  //No preview a senha atual de todos os usuários é "Senha@123"
  if (caminho === '/auth/alterar-senha' && metodo === 'POST') {
    if (corpo.senhaAtual !== 'Senha@123') return erro(400, 'A senha atual está incorreta.');
    if (corpo.novaSenha === corpo.senhaAtual) return erro(400, 'A nova senha deve ser diferente da senha atual.');
    const problema = validarNovaSenha(corpo);
    if (problema) return erro(400, problema);
    return [200, { mensagem: 'Senha alterada com sucesso!' }];
  }

  const usuarioId = obterSessao()?.id;
  const materialPorId = (materialId: number) => banco.materiais.find((m) => m.id === materialId);

  if (recurso === 'favoritos') {
    if (!usuarioId) return erro(401, 'Sua sessão não é válida. Faça login novamente.');
    const doUsuario = banco.favoritos.filter((f) => f.usuarioId === usuarioId);
    if (metodo === 'GET') {
      const lista: Favorito[] = doUsuario
        .map((f) => ({ material: materialPorId(f.materialId)!, favoritadoEm: f.favoritadoEm }))
        .filter((f) => f.material);
      return [200, lista];
    }
    if (metodo === 'POST') {
      const material = materialPorId(Number(corpo.materialId));
      if (!material) return erro(404, `Material educacional não encontrado com o ID: ${corpo.materialId}`);
      if (doUsuario.some((f) => f.materialId === material.id)) return erro(400, 'Este material já está nos seus favoritos.');
      const novo = { usuarioId, materialId: material.id, favoritadoEm: agora() };
      banco.favoritos.push(novo);
      return [201, { material, favoritadoEm: novo.favoritadoEm }];
    }
    if (metodo === 'DELETE') {
      const indice = banco.favoritos.findIndex((f) => f.usuarioId === usuarioId && f.materialId === id);
      if (indice < 0) return erro(404, 'Este material não está nos seus favoritos.');
      banco.favoritos.splice(indice, 1);
      return [200, { mensagem: 'Material removido dos favoritos.' }];
    }
  }

  if (recurso === 'leituras') {
    if (!usuarioId) return erro(401, 'Sua sessão não é válida. Faça login novamente.');
    const comMaterial = (l: LeituraMock): Leitura | null => {
      const material = materialPorId(l.materialId);
      const { usuarioId: _, materialId: __, ...dados } = l;
      return material ? { ...dados, material } : null;
    };
    if (metodo === 'GET') {
      return [200, banco.leituras.filter((l) => l.usuarioId === usuarioId).map(comMaterial).filter(Boolean)];
    }
    //Inicia uma nova leitura ou retoma a existente, atualizando o último acesso
    if (metodo === 'POST') {
      const material = materialPorId(Number(corpo.materialId));
      if (!material) return erro(404, `Material educacional não encontrado com o ID: ${corpo.materialId}`);
      let leitura = banco.leituras.find((l) => l.usuarioId === usuarioId && l.materialId === material.id);
      if (leitura) {
        leitura.ultimoAcessoEm = agora();
        return [200, comMaterial(leitura)];
      }
      leitura = { id: banco.proximoId++, usuarioId, materialId: material.id, paginaAtual: 1, totalPaginas: null, concluida: false, iniciadaEm: agora(), ultimoAcessoEm: agora() };
      banco.leituras.push(leitura);
      return [201, comMaterial(leitura)];
    }
    if (metodo === 'PUT') {
      const leitura = banco.leituras.find((l) => l.id === id && l.usuarioId === usuarioId);
      if (!leitura) return erro(404, 'Leitura não encontrada.');
      const pagina = Number(corpo.paginaAtual);
      const total = corpo.totalPaginas === null ? null : Number(corpo.totalPaginas);
      if (!Number.isInteger(pagina) || pagina < 1) return erro(400, 'A página atual deve ser maior que zero.');
      if (total !== null && (!Number.isInteger(total) || total < pagina)) return erro(400, 'O total de páginas não pode ser menor que a página atual.');
      Object.assign(leitura, { paginaAtual: pagina, totalPaginas: total, concluida: !!corpo.concluida, ultimoAcessoEm: agora() });
      return [200, comMaterial(leitura)];
    }
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
      banco.favoritos = banco.favoritos.filter((f) => f.materialId !== id);
      banco.leituras = banco.leituras.filter((l) => l.materialId !== id);
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

function validarNovaSenha(corpo: { novaSenha?: string; confirmarNovaSenha?: string }): string | null {
  if (!corpo.novaSenha || !senhaForte(corpo.novaSenha)) return REGRA_SENHA;
  if (corpo.novaSenha !== corpo.confirmarNovaSenha) return 'A nova senha e a confirmação de senha não coincidem.';
  return null;
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
  visibilidade: 'INTERNO',
});

const emailEmUso = (banco: BancoMock, email: string) =>
  [...banco.gestores, ...banco.alunos, ...banco.professores].some((u) => u.email.toLowerCase() === String(email).toLowerCase());
