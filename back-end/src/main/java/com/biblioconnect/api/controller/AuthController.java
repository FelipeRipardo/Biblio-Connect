package com.biblioconnect.api.controller;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.EsqueciSenhaDTO;
import com.biblioconnect.api.dto.LoginRequestDTO;
import com.biblioconnect.api.dto.RedefinirSenhaDTO;
import com.biblioconnect.api.service.AuthService;
import com.biblioconnect.api.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO dto) {
        try {
            Usuario usuario = authService.autenticar(dto);
            String token = tokenService.gerarToken(usuario);

            return ResponseEntity.ok(Map.of(
                    "mensagem", "Login realizado com sucesso!",
                    "token", token,
                    "tipo", "Bearer",
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail(),
                    "perfil", usuario.getPerfil()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@RequestBody @Valid EsqueciSenhaDTO dto) {
        try {
            return ResponseEntity.ok(authService.solicitarRecuperacaoSenha(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody @Valid RedefinirSenhaDTO dto) {
        try {
            authService.redefinirSenha(dto);
            return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso! Você já pode fazer login com a nova senha."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> dadosUsuarioAutenticado(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(Map.of(
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "perfil", usuario.getPerfil()
        ));
    }
}