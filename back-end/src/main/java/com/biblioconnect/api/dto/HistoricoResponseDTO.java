package com.biblioconnect.api.dto;

import com.biblioconnect.api.domain.HistoricoAcesso;
import java.time.LocalDateTime;

public record HistoricoResponseDTO(
        Integer id,
        Integer usuarioId,
        String nomeUsuario,
        MaterialResponseDTO material,
        Integer paginaAtual,
        Integer totalPaginas,
        Double percentualConcluido,
        LocalDateTime acessadoEm
) {
    public static HistoricoResponseDTO fromEntity(HistoricoAcesso h) {
        double percentual = 0.0;
        if (h.getTotalPaginas() != null && h.getTotalPaginas() > 0 && h.getPaginaAtual() != null) {
            double bruto = ((double) h.getPaginaAtual() / h.getTotalPaginas()) * 100.0;
            percentual = Math.min(100.0, Math.round(bruto * 10.0) / 10.0);
        }

        return new HistoricoResponseDTO(
                h.getId(),
                h.getUsuario().getId(),
                h.getUsuario().getNome(),
                MaterialResponseDTO.fromEntity(h.getMaterial()),
                h.getPaginaAtual(),
                h.getTotalPaginas(),
                percentual,
                h.getAcessadoEm()
        );
    }
}