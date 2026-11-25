package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.ListaLeituraRequestDTO;
import com.biblioconnect.api.dto.ListaLeituraResponseDTO;
import com.biblioconnect.api.service.ListaLeituraService;
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
@RequestMapping("/api/listas-leitura")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ListaLeituraController {

    private final ListaLeituraService listaLeituraService;

    @PostMapping
    public ResponseEntity<?> criar(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @RequestBody @Valid ListaLeituraRequestDTO dto) {
        try {
            ListaLeituraResponseDTO salva = listaLeituraService.criar(usuarioLogado, dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(salva);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ListaLeituraResponseDTO>> listar(
            @RequestParam(required = false) String turma,
            @RequestParam(required = false) Integer professorId) {
        return ResponseEntity.ok(listaLeituraService.listar(turma, professorId));
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<ListaLeituraResponseDTO>> listarMinhasListas(
            @AuthenticationPrincipal Usuario usuarioLogado) {
        return ResponseEntity.ok(listaLeituraService.listarMinhasListas(usuarioLogado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(listaLeituraService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer id,
            @RequestBody @Valid ListaLeituraRequestDTO dto) {
        try {
            return ResponseEntity.ok(listaLeituraService.atualizar(usuarioLogado, id, dto));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer id) {
        try {
            listaLeituraService.excluir(usuarioLogado, id);
            return ResponseEntity.ok(Map.of("mensagem", "Lista de leitura removida com sucesso."));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/{id}/materiais/{materialId}")
    public ResponseEntity<?> adicionarMaterial(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer id,
            @PathVariable Integer materialId) {
        try {
            return ResponseEntity.ok(listaLeituraService.adicionarMaterial(usuarioLogado, id, materialId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/materiais/{materialId}")
    public ResponseEntity<?> removerMaterial(
            @AuthenticationPrincipal Usuario usuarioLogado,
            @PathVariable Integer id,
            @PathVariable Integer materialId) {
        try {
            return ResponseEntity.ok(listaLeituraService.removerMaterial(usuarioLogado, id, materialId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}