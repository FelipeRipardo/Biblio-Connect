import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listarGestores } from '../../api/gestores';
import { ApiError } from '../../api/http';
import { Avatar } from '../../components/Avatar';
import { CartaoNumero } from '../../components/PainelLayout';
import { Paginacao } from '../../components/Paginacao';
import type { Gestor } from '../../types/api';
import { AdminLayout } from './AdminLayout';

const POR_PAGINA = 7;

//Gestão de Gestores: sem wireframe próprio, segue o padrão das telas de Alunos (21) e Professores (22).
//O back-end só permite cadastrar e listar gestores, por isso não há ações de editar/excluir.
export function ListaGestores() {
  const mensagemRecebida = (useLocation().state as { mensagem?: string } | null)?.mensagem ?? null;

  const [gestores, setGestores] = useState<Gestor[] | null>(null);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    listarGestores()
      .then(setGestores)
      .catch((err) => setErro(err instanceof ApiError ? err.message : 'Ocorreu um erro inesperado. Tente novamente.'));
  }, []);

  const lista = gestores ?? [];
  const termo = busca.trim().toLowerCase();
  const filtrados = lista.filter((g) => !termo || [g.nome, g.email].some((v) => v.toLowerCase().includes(termo)));
  const visiveis = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <AdminLayout titulo="Gestão de Gestores">
      <section className="indicadores">
        <CartaoNumero icone="🗂️" rotulo="Total de Gestores" valor={gestores ? lista.length : '…'} cor="var(--azul-escuro)" detalhe="Servidores que gerenciam o acervo" />
      </section>

      <div className="filtros filtros--soltos">
        <input
          className="input filtros__busca filtros__busca--larga"
          placeholder="🔍 Buscar gestor por nome ou email..."
          aria-label="Buscar gestor por nome ou email"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
        />
        <Link className="botao botao--verde botao--pequeno filtros__acao" to="/admin/gestores/novo">+ Novo Gestor</Link>
      </div>

      {mensagemRecebida && <div className="alerta alerta--sucesso" role="status">{mensagemRecebida}</div>}
      {erro && <div className="alerta alerta--erro" role="alert">{erro}</div>}

      <section className="cartao cartao--tabela">
        <div className="tabela__rolagem">
          <table className="tabela tabela--clara">
            <thead>
              <tr>
                <th>Gestor</th>
                <th>Email</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="pessoa">
                      <Avatar nome={g.nome} id={g.id} tamanho={36} />
                      <strong className="pessoa__nome-normal">{g.nome}</strong>
                    </div>
                  </td>
                  <td>{g.email}</td>
                  <td><span className="etiqueta etiqueta--azul">Gestor</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {gestores && visiveis.length === 0 && <p className="vazio">Nenhum gestor encontrado.</p>}
          {!gestores && !erro && <p className="vazio">Carregando...</p>}
        </div>
        <Paginacao pagina={pagina} total={filtrados.length} porPagina={POR_PAGINA} rotulo="gestores" onChange={setPagina} />
      </section>

      <small className="dica">🔒 Contas de gestor não podem ser editadas nem excluídas pelo sistema.</small>
    </AdminLayout>
  );
}
