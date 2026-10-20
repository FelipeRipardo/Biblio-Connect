package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ProfessorAtualizacaoDTO(
        @NotBlank(message = "O nome completo é obrigatório") String nome,
        @NotBlank(message = "O e-mail institucional é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "O telefone é obrigatório") String telefone,
        @NotEmpty(message = "Selecione pelo menos uma disciplina") List<String> disciplinas,
        @NotEmpty(message = "Selecione pelo menos uma turma") List<String> turmas,
        String comprovanteVinculo
) {}