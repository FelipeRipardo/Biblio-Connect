package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;

public record GestorResponseDTO(
        Integer id,
        String nome,
        String email,
        Perfil perfil
) {
    public static GestorResponseDTO fromEntity(Usuario u) {
        return new GestorResponseDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                u.getPerfil()
        );
    }
}