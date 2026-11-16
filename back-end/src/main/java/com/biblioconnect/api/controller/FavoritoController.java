package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.FavoritoResponseDTO;
import com.biblioconnect.api.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favoritos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;

    @PostMapping("/{materialId}")
    public ResponseEntity<?> adicionar(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId) {
        try {
            FavoritoResponseDTO salvo = favoritoService.adicionar(usuarioLogado, materialId);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<FavoritoResponseDTO>> listarMeusFavoritos(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(favoritoService.listarMeusFavoritos(usuarioLogado));
    }

    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> remover(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer materialId) {
        try {
            favoritoService.remover(usuarioLogado, materialId);
            return ResponseEntity.ok(Map.of("mensagem", "Material removido dos favoritos com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}