package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.EsqueciSenhaDTO;
import com.biblioconnect.api.dto.LoginRequestDTO;
import com.biblioconnect.api.dto.RedefinirSenhaDTO;
import com.biblioconnect.api.repository.AlunoRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository;
    private final PasswordEncoder passwordEncoder;
    private final SenhaValidator senhaValidator;

    public Usuario autenticar(LoginRequestDTO dto) {
        Usuario usuario;

        if (dto.perfil() == Perfil.ALUNO) {
            if (dto.identificador().contains("@")) {
                throw new IllegalArgumentException("Alunos devem realizar login utilizando exclusivamente a Matrícula Escolar.");
            }
            usuario = alunoRepository.findByMatricula(dto.identificador())
                    .orElseThrow(() -> new IllegalArgumentException("Matrícula ou senha inválidos."));
        } else {
            if (!dto.identificador().contains("@")) {
                throw new IllegalArgumentException("Para este perfil, utilize o seu E-mail Institucional para realizar login.");
            }
            usuario = usuarioRepository.findByEmail(dto.identificador())
                    .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));

            if (usuario.getPerfil() != dto.perfil()) {
                throw new IllegalArgumentException("O usuário informado não pertence ao perfil selecionado (" + dto.perfil() + ").");
            }
        }

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Credenciais inválidas. Verifique sua senha.");
        }

        return usuario;
    }

    @Transactional
    public Map<String, Object> solicitarRecuperacaoSenha(EsqueciSenhaDTO dto) {
        String id = dto.identificador().trim();

        //Permite localizar tanto pelo E-mail quanto pela Matrícula (caso seja Aluno)
        Usuario usuario = id.contains("@")
                ? usuarioRepository.findByEmail(id)
                .orElseThrow(() -> new IllegalArgumentException("Nenhum usuário encontrado com o e-mail informado."))
                : alunoRepository.findByMatricula(id)
                .map(a -> (Usuario) a)
                .orElseThrow(() -> new IllegalArgumentException("Nenhum aluno encontrado com a matrícula informada."));

        String token = UUID.randomUUID().toString();
        LocalDateTime expiracao = LocalDateTime.now().plusMinutes(30);

        usuario.setTokenRecuperacao(token);
        usuario.setTokenExpiracao(expiracao);
        usuarioRepository.save(usuario);

        System.out.println(">>> [E-MAIL DE RECUPERAÇÃO SIMULADO] Para: " + usuario.getEmail() + " | Token: " + token);

        return Map.of(
                "mensagem", "Instruções de recuperação de senha enviadas para o e-mail cadastrado.",
                "emailDestino", usuario.getEmail(),
                "tokenGeradoParaTeste", token,
                "validoAte", expiracao.toString()
        );
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaDTO dto) {
        if (!dto.novaSenha().equals(dto.confirmarNovaSenha())) {
            throw new IllegalArgumentException("A nova senha e a confirmação de senha não coincidem.");
        }

        senhaValidator.validarForcaSenha(dto.novaSenha());

        Usuario usuario = usuarioRepository.findByTokenRecuperacao(dto.token())
                .orElseThrow(() -> new IllegalArgumentException("Token de recuperação inválido ou já utilizado."));

        if (usuario.getTokenExpiracao() == null || usuario.getTokenExpiracao().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("O token de recuperação expirou. Solicite um novo link.");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuario.setTokenRecuperacao(null);
        usuario.setTokenExpiracao(null);

        usuarioRepository.save(usuario);
    }
}