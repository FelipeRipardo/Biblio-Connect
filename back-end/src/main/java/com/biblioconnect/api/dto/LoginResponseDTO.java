package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.enums.Perfil;

public record LoginResponseDTO(
        String mensagem,
        Integer id,
        String nome,
        String email,
        Perfil perfil
) {}