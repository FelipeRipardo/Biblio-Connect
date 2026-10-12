--Tabela Pai (Centraliza os dados comuns e a autenticação)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL
);

--Tabelas Filhas (Ligadas ao pai pela chave estrangeira no ID)
CREATE TABLE alunos (
    id INTEGER PRIMARY KEY,
    CONSTRAINT fk_alunos_usuario FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE professores (
    id INTEGER PRIMARY KEY,
    CONSTRAINT fk_professores_usuario FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE gestores (
    id INTEGER PRIMARY KEY,
    CONSTRAINT fk_gestores_usuario FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE TABLE administradores (
    id INTEGER PRIMARY KEY,
    CONSTRAINT fk_administradores_usuario FOREIGN KEY (id) REFERENCES usuarios (id) ON DELETE CASCADE
);