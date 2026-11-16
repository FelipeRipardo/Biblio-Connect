package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.HistoricoResponseDTO;
import com.biblioconnect.api.service.HistoricoAcessoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/historico")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HistoricoAcessoController {

    private final HistoricoAcessoService historicoService;

    @PostMapping("/{materialId}")
    public ResponseEntity<?> registrarAcesso(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId) {
        try {
            HistoricoResponseDTO salvo = historicoService.registrarAcesso(usuarioLogado, materialId);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<HistoricoResponseDTO>> listarMeuHistorico(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(historicoService.listarMeuHistorico(usuarioLogado));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> listarPorUsuario(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer usuarioId) {
        try {
            return ResponseEntity.ok(historicoService.listarPorUsuario(usuarioLogado, usuarioId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        }
    }
}