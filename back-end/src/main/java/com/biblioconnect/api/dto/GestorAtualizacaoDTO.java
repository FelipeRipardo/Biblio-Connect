package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record GestorAtualizacaoDTO(
        @NotBlank(message = "O nome do gestor é obrigatório")
        String nome,

        @NotBlank(message = "O e-mail institucional é obrigatório")
        @Email(message = "Informe um endereço de e-mail válido")
        String email,

        String senha
) {}