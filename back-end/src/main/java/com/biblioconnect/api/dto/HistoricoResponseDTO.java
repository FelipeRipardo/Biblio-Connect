package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.HistoricoAcesso;
import java.time.LocalDateTime;

public record HistoricoResponseDTO(
        Integer id,
        Integer usuarioId,
        String nomeUsuario,
        MaterialResponseDTO material,
        LocalDateTime acessadoEm
) {
    public static HistoricoResponseDTO fromEntity(HistoricoAcesso h) {
        return new HistoricoResponseDTO(
                h.getId(),
                h.getUsuario().getId(),
                h.getUsuario().getNome(),
                MaterialResponseDTO.fromEntity(h.getMaterial()),
                h.getAcessadoEm()
        );
    }
}