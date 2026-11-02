package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.domain.enums.TipoMaterial;

import java.time.LocalDateTime;

public record MaterialResponseDTO(
        Integer id,
        String titulo,
        String autor,
        CategoriaMaterial categoria,
        TipoMaterial tipoMaterial,
        Integer ano,
        String serie,
        String disciplina,
        String descricao,
        String isbn,
        String editora,
        String urlArquivo,
        String capaUrl,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static MaterialResponseDTO fromEntity(Material m) {
        return new MaterialResponseDTO(
                m.getId(),
                m.getTitulo(),
                m.getAutor(),
                m.getCategoria(),
                m.getTipoMaterial(),
                m.getAno(),
                m.getSerie(),
                m.getDisciplina(),
                m.getDescricao(),
                m.getIsbn(),
                m.getEditora(),
                m.getUrlArquivo(),
                m.getCapaUrl(),
                m.getCriadoEm(),
                m.getAtualizadoEm()
        );
    }
}