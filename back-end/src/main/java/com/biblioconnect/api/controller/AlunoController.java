package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.dto.AlunoAtualizacaoDTO;
import com.biblioconnect.api.dto.AlunoCadastroDTO;
import com.biblioconnect.api.service.AlunoService;
import com.biblioconnect.api.service.PermissaoService;
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
    private final PermissaoService permissaoService;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(
            @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId,
            @RequestBody @Valid AlunoCadastroDTO dto) {
        permissaoService.validarAdministrador(adminId);
        try {
            Aluno novoAluno = alunoService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "mensagem", "Aluno provisionado pelo Administrador com sucesso!",
                    "id", novoAluno.getId(),
                    "nome", novoAluno.getNome(),
                    "matricula", novoAluno.getMatricula()
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
    public ResponseEntity<?> atualizar(
            @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId,
            @PathVariable Integer id,
            @RequestBody @Valid AlunoAtualizacaoDTO dto) {
        permissaoService.validarAdministrador(adminId);
        try {
            return ResponseEntity.ok(alunoService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(
            @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId,
            @PathVariable Integer id) {
        permissaoService.validarAdministrador(adminId);
        try {
            alunoService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Aluno excluído com sucesso!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}