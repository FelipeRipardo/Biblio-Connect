package com.biblioconnect.api.controller;

import com.biblioconnect.api.dto.GestorAtualizacaoDTO;
import com.biblioconnect.api.dto.GestorCadastroDTO;
import com.biblioconnect.api.dto.GestorResponseDTO;
import com.biblioconnect.api.service.GestorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gestores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GestorController {

    private final GestorService gestorService;

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid GestorCadastroDTO dto) {
        try {
            GestorResponseDTO salvo = gestorService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<GestorResponseDTO>> listar(
            @RequestParam(required = false) String termo) {
        return ResponseEntity.ok(gestorService.listar(termo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(gestorService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable Integer id,
            @RequestBody @Valid GestorAtualizacaoDTO dto) {
        try {
            return ResponseEntity.ok(gestorService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Integer id) {
        try {
            gestorService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Gestor removido com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}