--Remove duplicidades antigas mantendo apenas o acesso mais recente de cada livro por usuário
DELETE FROM historico_acessos h1
USING historico_acessos h2
WHERE h1.usuario_id = h2.usuario_id
  AND h1.material_id = h2.material_id
  AND h1.id < h2.id;

--Adiciona colunas de progresso de leitura
ALTER TABLE historico_acessos
    ADD COLUMN pagina_atual INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN total_paginas INTEGER;

--Garante um único registro de progresso/histórico por usuário e material
ALTER TABLE historico_acessos
    ADD CONSTRAINT uk_historico_usuario_material UNIQUE (usuario_id, material_id);