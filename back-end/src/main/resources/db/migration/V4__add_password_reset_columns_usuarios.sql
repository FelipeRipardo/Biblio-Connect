ALTER TABLE usuarios
    ADD COLUMN token_recuperacao VARCHAR(100),
    ADD COLUMN token_expiracao TIMESTAMP;