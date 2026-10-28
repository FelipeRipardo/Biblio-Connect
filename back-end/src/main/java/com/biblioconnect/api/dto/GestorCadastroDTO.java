package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record GestorCadastroDTO(
        @NotBlank(message = "O nome é obrigatório") String nome,
        @NotBlank(message = "O e-mail institucional é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "A senha inicial é obrigatória") String senha
) {}