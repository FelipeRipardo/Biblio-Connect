package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.dto.AlunoAtualizacaoDTO;
import com.biblioconnect.api.dto.AlunoCadastroDTO;
import com.biblioconnect.api.service.AlunoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/alunos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService alunoService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody @Valid AlunoCadastroDTO dto) {
        try {
            Aluno novoAluno = alunoService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensagem", "Aluno cadastrado com sucesso!",
                    "id", novoAluno.getId(),
                    "nome", novoAluno.getNome(),
                    "email", novoAluno.getEmail()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required = false) String nome) {
        return ResponseEntity.ok(alunoService.listar(nome));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(alunoService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @RequestBody @Valid AlunoAtualizacaoDTO dto) {
        try {
            return ResponseEntity.ok(alunoService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Integer id) {
        try {
            alunoService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Aluno excluído com sucesso!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}