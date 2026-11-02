CREATE TABLE materiais (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo_material VARCHAR(50) NOT NULL,
    ano INTEGER NOT NULL,
    serie VARCHAR(50) NOT NULL,
    disciplina VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    isbn VARCHAR(30),
    editora VARCHAR(100),
    url_arquivo VARCHAR(500) NOT NULL,
    capa_url VARCHAR(500),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);