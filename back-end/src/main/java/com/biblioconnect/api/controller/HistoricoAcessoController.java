package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.HistoricoProgressoRequestDTO;
import com.biblioconnect.api.dto.HistoricoResponseDTO;
import com.biblioconnect.api.service.HistoricoAcessoService;
import jakarta.validation.Valid;
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
            @PathVariable Integer materialId,
            @RequestBody(required = false) @Valid HistoricoProgressoRequestDTO dto) {
        try {
            HistoricoResponseDTO salvo = historicoService.registrarOuAtualizarAcesso(usuarioLogado, materialId, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{materialId}")
    public ResponseEntity<?> atualizarProgresso(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId,
            @RequestBody @Valid HistoricoProgressoRequestDTO dto) {
        try {
            HistoricoResponseDTO atualizado = historicoService.registrarOuAtualizarAcesso(usuarioLogado, materialId, dto);
            return ResponseEntity.ok(atualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<HistoricoResponseDTO>> listarMeuHistorico(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(historicoService.listarMeuHistorico(usuarioLogado));
    }

    @GetMapping("/{materialId}")
    public ResponseEntity<?> buscarProgressoMaterial(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId) {
        try {
            return ResponseEntity.ok(historicoService.buscarProgressoMaterial(usuarioLogado, materialId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
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

    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> removerDoHistorico(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId) {
        try {
            historicoService.removerDoHistorico(usuarioLogado, materialId);
            return ResponseEntity.ok(Map.of("mensagem", "Material removido do histórico de leitura com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}