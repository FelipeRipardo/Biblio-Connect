package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record GestorCadastroDTO(
        @NotBlank(message = "O nome do gestor é obrigatório")
        String nome,

        @NotBlank(message = "O e-mail institucional é obrigatório")
        @Email(message = "Informe um endereço de e-mail válido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senha
) {}