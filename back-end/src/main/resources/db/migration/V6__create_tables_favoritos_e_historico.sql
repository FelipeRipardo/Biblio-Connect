CREATE TABLE favoritos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_favorito_usuario_material UNIQUE (usuario_id, material_id)
);

CREATE TABLE historico_acessos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES materiais(id) ON DELETE CASCADE,
    acessado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_historico_usuario ON historico_acessos(usuario_id);