package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.Professor;
import com.biblioconnect.api.domain.enums.Perfil;
import java.util.Arrays;
import java.util.List;

public record ProfessorResponseDTO(
        Integer id,
        String nome,
        String email,
        Perfil perfil,
        String cpf,
        String telefone,
        String registroFuncional,
        List<String> disciplinas,
        List<String> turmas,
        String comprovanteVinculo
) {
    public static ProfessorResponseDTO fromEntity(Professor p) {
        List<String> listaDisciplinas = (p.getDisciplinas() != null && !p.getDisciplinas().isBlank())
                ? Arrays.asList(p.getDisciplinas().split(",\\s*"))
                : List.of();

        List<String> listaTurmas = (p.getTurmas() != null && !p.getTurmas().isBlank())
                ? Arrays.asList(p.getTurmas().split(",\\s*"))
                : List.of();

        return new ProfessorResponseDTO(
                p.getId(),
                p.getNome(),
                p.getEmail(),
                p.getPerfil(),
                p.getCpf(),
                p.getTelefone(),
                p.getRegistroFuncional(),
                listaDisciplinas,
                listaTurmas,
                p.getComprovanteVinculo()
        );
    }
}