package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Min;

public record HistoricoProgressoRequestDTO(
        @Min(value = 1, message = "A página atual deve ser no mínimo 1.")
        Integer paginaAtual,

        @Min(value = 1, message = "O total de páginas deve ser no mínimo 1.")
        Integer totalPaginas
) {}