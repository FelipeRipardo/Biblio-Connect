package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ProfessorCadastroDTO(
        @NotBlank(message = "O nome completo é obrigatório") String nome,
        @NotBlank(message = "O e-mail institucional é obrigatório") @Email(message = "E-mail inválido") String email,
        @NotBlank(message = "O CPF é obrigatório") String cpf,
        @NotBlank(message = "O telefone é obrigatório") String telefone,
        @NotBlank(message = "O registro funcional é obrigatório") String registroFuncional,
        @NotEmpty(message = "Selecione pelo menos uma disciplina") List<String> disciplinas,
        @NotEmpty(message = "Selecione pelo menos uma turma") List<String> turmas,
        @NotBlank(message = "A senha inicial é obrigatória") String senha,
        String comprovanteVinculo
) {}