# BiblioConnect

O **BiblioConnect** é um sistema de biblioteca virtual voltado para escolas públicas, desenvolvido como projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas da Universidade Christus.

A plataforma tem como objetivo complementar a biblioteca física, facilitando a organização do acervo, a consulta de livros e materiais educacionais e o acesso à leitura e ao conhecimento por meio de um ambiente digital.

## Objetivos do Projeto

- Facilitar a consulta e a localização de livros e materiais educacionais.
- Apoiar a organização e o gerenciamento do acervo das escolas.
- Disponibilizar recursos para acesso e acompanhamento dos materiais.
- Contribuir para a democratização do acesso à leitura e ao conhecimento.

## Público-alvo

- **Alunos:** consulta e acesso às informações dos materiais disponíveis.
- **Professores:** consulta de materiais e criação de listas de leitura recomendadas para suas turmas.
- **Servidores e gestores:** organização e gerenciamento do acervo da biblioteca.
- **Administradores:** gerenciamento de usuários e controle de acesso à plataforma.

## Funcionalidades

### Gerenciamento de Usuários

- Cadastro, edição, exclusão, pesquisa e ativação ou desativação de usuários.
- Gerenciamento de perfis de alunos, professores, servidores/gestores e administradores.
- Autenticação por login e senha.
- Recuperação de senha por e-mail.
- Controle de acesso conforme o perfil e as permissões de cada usuário.

### Gerenciamento do Acervo

- Cadastro, edição, exclusão e categorização de livros e materiais educacionais.
- Registro de informações como título, autor, categoria, ano, série/disciplina e descrição.
- Busca e filtros por título, autor, categoria, disciplina, série/ano e tipo de material.
- Marcação de materiais como favoritos.

### Leitura e Acompanhamento

- Histórico de acesso e leitura dos materiais por usuário.
- Criação e gerenciamento de listas de leitura recomendadas por professores para suas turmas.
- Marcador de leitura para permitir que o usuário retome posteriormente de onde parou.
- Recomendações de materiais com base nas categorias de interesse do usuário e nos materiais disponíveis no acervo.

## Tecnologias e Ferramentas

| Tecnologia | Finalidade |
|---|---|
| React | Desenvolvimento do front-end |
| TypeScript | Tipagem e desenvolvimento do front-end |
| Java | Desenvolvimento do back-end |
| Spring Boot | Construção da aplicação back-end |
| PostgreSQL | Banco de dados |
| JWT | Autenticação e controle de acesso |
| Swagger / OpenAPI | Documentação da API |
| Docker | Contêineres e padronização do ambiente |
| Git | Controle de versão |
| GitHub | Hospedagem do repositório e colaboração |
| Microsoft Visual Studio | Ambiente de desenvolvimento |

## Regras de Negócio

- As senhas dos usuários devem ser armazenadas de forma criptografada.
- A aplicação deve ser responsiva, permitindo o acesso por computadores e dispositivos móveis.
- Cada perfil deve acessar somente as funcionalidades compatíveis com suas permissões.
- A senha deve possuir, no mínimo, 8 caracteres, incluindo letras, números e pelo menos um caractere especial.
- Não deve ser permitido cadastrar mais de um usuário com o mesmo endereço de e-mail.
- Um material não pode ser adicionado mais de uma vez aos favoritos do mesmo usuário.
- O acesso aos materiais deve ser registrado no histórico do usuário.
- Cada usuário pode manter um marcador por material.
- As recomendações devem considerar os interesses registrados e os materiais disponíveis no acervo.

## Estrutura do Projeto

A estrutura de diretórios será definida de acordo com a organização dos módulos de front-end e back-end durante o desenvolvimento da aplicação.

## Como Executar

As instruções para instalação e execução do projeto serão disponibilizadas após a definição da estrutura do repositório e das configurações dos ambientes de desenvolvimento.

## Testes

O projeto prevê testes para validar as funcionalidades, as regras de negócio e os principais fluxos do sistema. Os procedimentos e comandos para execução dos testes serão documentados conforme a implementação.

## Equipe de Desenvolvimento

- Giulie Albuquerque Ribeiro
- Pollyanna Moreira Melo
- Felipe Ricardo Viana

## Instituição de Ensino

**Universidade Christus**  
Curso: Análise e Desenvolvimento de Sistemas  
Ano: 2026

---

O BiblioConnect busca tornar o acesso à informação e à leitura mais simples e acessível, utilizando a tecnologia como ferramenta de apoio à educação e à organização das bibliotecas escolares.
