package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.LoginRequestDTO;
import com.biblioconnect.api.dto.LoginResponseDTO;
import com.biblioconnect.api.repository.AlunoRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AlunoRepository alunoRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponseDTO autenticar(LoginRequestDTO dto) {

        //1 - Validação Inteligente: Campo Vazio baseado no Perfil
        if (dto.identificador() == null || dto.identificador().trim().isEmpty()) {
            if (dto.perfil() == Perfil.ALUNO) {
                throw new IllegalArgumentException("A matrícula é obrigatória para acessar como Aluno.");
            } else {
                throw new IllegalArgumentException("O e-mail é obrigatório para este perfil de acesso.");
            }
        }

        Usuario usuario;

        //2 - Regras Estritas de Autenticação por Perfil
        if (dto.perfil() == Perfil.ALUNO) {
            //Se tentar usar email com o botão de Aluno selecionado
            if (dto.identificador().contains("@")) {
                throw new IllegalArgumentException("Alunos devem fazer login utilizando a matrícula escolar, não o e-mail.");
            }

            usuario = alunoRepository.findByMatricula(dto.identificador())
                    .orElseThrow(() -> new IllegalArgumentException("Matrícula não encontrada ou credenciais inválidas."));
        } else {
            //Se tentar usar matrícula com botões de Professor/Admin selecionados
            if (!dto.identificador().contains("@")) {
                throw new IllegalArgumentException("Professores e Administradores devem fazer login utilizando o e-mail institucional.");
            }

            usuario = usuarioRepository.findByEmail(dto.identificador())
                    .orElseThrow(() -> new IllegalArgumentException("E-mail não encontrado ou credenciais inválidas."));

            //Garante que o professor não logue clicando no botão de Admin e vice-versa
            if (usuario.getPerfil() != dto.perfil()) {
                throw new IllegalArgumentException("Acesso negado: sua conta não pertence ao perfil " + dto.perfil() + ".");
            }
        }

        //3 - Verifica a Senha (Argon2)
        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new IllegalArgumentException("Senha incorreta. Tente novamente.");
        }

        //4 - Retorno de Sucesso
        return new LoginResponseDTO(
                "Login realizado com sucesso!",
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil()
        );
    }
}