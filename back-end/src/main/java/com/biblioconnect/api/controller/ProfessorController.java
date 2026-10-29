package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Professor;
import com.biblioconnect.api.dto.ProfessorAtualizacaoDTO;
import com.biblioconnect.api.dto.ProfessorCadastroDTO;
import com.biblioconnect.api.dto.ProfessorResponseDTO;
import com.biblioconnect.api.service.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/professores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid ProfessorCadastroDTO dto) {
        try {
            Professor professor = professorService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensagem", "Professor provisionado pelo Administrador com sucesso!",
                    "id", professor.getId(),
                    "nome", professor.getNome(),
                    "registroFuncional", professor.getRegistroFuncional()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ProfessorResponseDTO>> listar(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(professorService.listar(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(professorService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody @Valid ProfessorAtualizacaoDTO dto) {
        try {
            return ResponseEntity.ok(professorService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Integer id) {
        try {
            professorService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Professor excluído com sucesso."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}