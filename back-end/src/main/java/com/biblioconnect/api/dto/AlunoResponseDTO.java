package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.domain.enums.Perfil;
import java.time.LocalDate;

public record AlunoResponseDTO(
        Integer id,
        String nome,
        String email,
        Perfil perfil,
        String cpf,
        LocalDate dataNascimento,
        String telefoneResponsavel,
        String matricula,
        String serie,
        String turma,
        String turno
) {
    public static AlunoResponseDTO fromEntity(Aluno a) {
        return new AlunoResponseDTO(
                a.getId(),
                a.getNome(),
                a.getEmail(),
                a.getPerfil(),
                a.getCpf(),
                a.getDataNascimento(),
                a.getTelefoneResponsavel(),
                a.getMatricula(),
                a.getSerie(),
                a.getTurma(),
                a.getTurno()
        );
    }
}