package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.domain.enums.TipoMaterial;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaterialRequestDTO(
        @NotBlank(message = "O título do material é obrigatório")
        String titulo,

        @NotBlank(message = "O autor é obrigatório")
        String autor,

        @NotNull(message = "A categoria é obrigatória (ex: LITERATURA, DIDATICO, CIENTIFICO, TECNICO)")
        CategoriaMaterial categoria,

        @NotNull(message = "O tipo do material é obrigatório (ex: LIVRO, ARTIGO, APOSTILA)")
        TipoMaterial tipoMaterial,

        @NotNull(message = "O ano de publicação é obrigatório")
        @Min(value = 1500, message = "Informe um ano de publicação válido")
        @Max(value = 2030, message = "O ano de publicação não pode ser superior a 2030")
        Integer ano,

        @NotBlank(message = "A série recomendada é obrigatória")
        String serie,

        @NotBlank(message = "A disciplina vinculada é obrigatória")
        String disciplina,

        @NotBlank(message = "A descrição/sinopse do material é obrigatória")
        String descricao,

        String isbn,

        String editora,

        @NotBlank(message = "A URL do arquivo digital (PDF/E-book) é obrigatória")
        String urlArquivo,

        String capaUrl
) {}