package com.biblioconnect.api.dto;

import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaDTO(
        @NotBlank(message = "Informe o seu e-mail institucional ou matrícula escolar")
        String identificador
) {}