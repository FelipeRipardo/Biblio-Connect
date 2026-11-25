CREATE TABLE listas_leitura (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    turma VARCHAR(100) NOT NULL,
    professor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lista_leitura_materiais (
    lista_id INTEGER NOT NULL REFERENCES listas_leitura(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
    PRIMARY KEY (lista_id, material_id)
);

CREATE INDEX idx_listas_leitura_professor ON listas_leitura(professor_id);
CREATE INDEX idx_listas_leitura_turma ON listas_leitura(turma);