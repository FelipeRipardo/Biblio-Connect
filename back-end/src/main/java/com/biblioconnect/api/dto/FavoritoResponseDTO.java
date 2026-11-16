package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.Favorito;
import java.time.LocalDateTime;

public record FavoritoResponseDTO(
        Integer id,
        Integer usuarioId,
        MaterialResponseDTO material,
        LocalDateTime favoritadoEm
) {
    public static FavoritoResponseDTO fromEntity(Favorito f) {
        return new FavoritoResponseDTO(
                f.getId(),
                f.getUsuario().getId(),
                MaterialResponseDTO.fromEntity(f.getMaterial()),
                f.getCriadoEm()
        );
    }
}