package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Aluno;
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
@CrossOrigin(origins = "*") //Libera temporariamente para testes com o Front-end
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
}