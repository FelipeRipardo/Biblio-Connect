package com.biblioconnect.api.dto;

import jakarta.validation.constraints.NotBlank;

public record RedefinirSenhaDTO(
        @NotBlank(message = "O token de recuperação é obrigatório")
        String token,

        @NotBlank(message = "A nova senha é obrigatória")
        String novaSenha,

        @NotBlank(message = "A confirmação da nova senha é obrigatória")
        String confirmarNovaSenha
) {}