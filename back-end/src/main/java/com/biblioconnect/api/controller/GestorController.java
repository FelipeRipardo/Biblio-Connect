package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Gestor;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.GestorCadastroDTO;
import com.biblioconnect.api.repository.GestorRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import com.biblioconnect.api.service.PermissaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gestores")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GestorController {

    private final GestorRepository gestorRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissaoService permissaoService;

    @PostMapping("/cadastro")
    @Transactional
    public ResponseEntity<?> cadastrar(
            @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId,
            @RequestBody @Valid GestorCadastroDTO dto) {
        permissaoService.validarAdministrador(adminId);

        if (usuarioRepository.existsByEmail(dto.email())) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Este e-mail já está cadastrado."));
        }

        Gestor gestor = new Gestor();
        gestor.setNome(dto.nome());
        gestor.setEmail(dto.email());
        gestor.setSenha(passwordEncoder.encode(dto.senha()));
        gestor.setPerfil(Perfil.GESTOR);

        Gestor salvo = gestorRepository.save(gestor);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensagem", "Servidor/Gestor provisionado pelo Administrador com sucesso!",
                "id", salvo.getId(),
                "nome", salvo.getNome(),
                "email", salvo.getEmail()
        ));
    }

    @GetMapping
    public ResponseEntity<List<Gestor>> listar() {
        return ResponseEntity.ok(gestorRepository.findAll());
    }
}