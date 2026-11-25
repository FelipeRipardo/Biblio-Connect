package com.biblioconnect.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ListaLeituraRequestDTO(
        @NotBlank(message = "O título da lista de leitura é obrigatório.")
        @Size(max = 150, message = "O título deve ter no máximo 150 caracteres.")
        String titulo,

        String descricao,

        @NotBlank(message = "A turma de destino é obrigatória.")
        @Size(max = 100, message = "A turma deve ter no máximo 100 caracteres.")
        String turma,

        List<Integer> materiaisIds
) {}