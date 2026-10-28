package com.biblioconnect.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AlunoAtualizacaoDTO(
        @NotBlank(message = "O nome é obrigatório") String nome,
        @NotBlank(message = "O email é obrigatório") @Email(message = "Email inválido") String email,
        @NotNull(message = "A data de nascimento é obrigatória") LocalDate dataNascimento,
        @NotBlank(message = "O telefone do responsável é obrigatório") String telefoneResponsavel,
        @NotBlank(message = "A série é obrigatória") String serie,
        @NotBlank(message = "A turma é obrigatória") String turma,
        @NotBlank(message = "O turno é obrigatório") String turno
) {}