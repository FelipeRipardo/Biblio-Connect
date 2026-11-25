package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.ListaLeitura;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record ListaLeituraResponseDTO(
        Integer id,
        String titulo,
        String descricao,
        String turma,
        Integer professorId,
        String nomeProfessor,
        List<MaterialResponseDTO> materiais,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {
    public static ListaLeituraResponseDTO fromEntity(ListaLeitura lista) {
        List<MaterialResponseDTO> materiaisDto = lista.getMateriais().stream()
                .map(MaterialResponseDTO::fromEntity)
                .sorted(Comparator.comparing(MaterialResponseDTO::titulo))
                .toList();

        return new ListaLeituraResponseDTO(
                lista.getId(),
                lista.getTitulo(),
                lista.getDescricao(),
                lista.getTurma(),
                lista.getProfessor().getId(),
                lista.getProfessor().getNome(),
                materiaisDto,
                lista.getCriadoEm(),
                lista.getAtualizadoEm()
        );
    }
}