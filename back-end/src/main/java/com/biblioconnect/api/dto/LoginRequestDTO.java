package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.enums.Perfil;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LoginRequestDTO(
        String identificador,

        @NotBlank(message = "A senha é obrigatória")
        String senha,

        @NotNull(message = "O perfil de acesso é obrigatório")
        Perfil perfil
) {}