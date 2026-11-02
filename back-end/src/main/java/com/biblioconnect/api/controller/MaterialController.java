package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.dto.MaterialRequestDTO;
import com.biblioconnect.api.dto.MaterialResponseDTO;
import com.biblioconnect.api.service.MaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materiais")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid MaterialRequestDTO dto) {
        try {
            MaterialResponseDTO salvo = materialService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<MaterialResponseDTO>> listar(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) CategoriaMaterial categoria,
            @RequestParam(required = false) String serie,
            @RequestParam(required = false) String disciplina) {
        return ResponseEntity.ok(materialService.listar(termo, categoria, serie, disciplina));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(materialService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody @Valid MaterialRequestDTO dto) {
        try {
            return ResponseEntity.ok(materialService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Integer id) {
        try {
            materialService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Material removido do acervo com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}