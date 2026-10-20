package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.AlunoCadastroDTO;
import com.biblioconnect.api.repository.AlunoRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Aluno cadastrar(AlunoCadastroDTO dto) {
        if (!Boolean.TRUE.equals(dto.termosAceitos())) {
            throw new IllegalArgumentException("Você precisa aceitar os Termos de Uso e Regulamento.");
        }
        if (!dto.senha().equals(dto.confirmarSenha())) {
            throw new IllegalArgumentException("As senhas não coincidem.");
        }
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Este email já está cadastrado.");
        }
        if (alunoRepository.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("Este CPF já está cadastrado.");
        }
        if (alunoRepository.existsByMatricula(dto.matricula())) {
            throw new IllegalArgumentException("Esta matrícula já está cadastrada.");
        }

        Aluno aluno = new Aluno();
        // Dados da tabela pai (Usuario)
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setSenha(passwordEncoder.encode(dto.senha())); // Usando Argon2
        aluno.setPerfil(Perfil.ALUNO);

        // Dados da tabela filha (Aluno)
        aluno.setCpf(dto.cpf());
        aluno.setDataNascimento(dto.dataNascimento());
        aluno.setTelefoneResponsavel(dto.telefoneResponsavel());
        aluno.setMatricula(dto.matricula());
        aluno.setSerie(dto.serie());
        aluno.setTurma(dto.turma());
        aluno.setTurno(dto.turno());

        return alunoRepository.save(aluno);
    }
}