package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Aluno;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.AlunoAtualizacaoDTO;
import com.biblioconnect.api.dto.AlunoCadastroDTO;
import com.biblioconnect.api.dto.AlunoResponseDTO;
import com.biblioconnect.api.repository.AlunoRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SenhaValidator senhaValidator;

    @Transactional
    public Aluno cadastrar(AlunoCadastroDTO dto) {
        senhaValidator.validarForcaSenha(dto.senha());

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
        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setSenha(passwordEncoder.encode(dto.senha()));
        aluno.setPerfil(Perfil.ALUNO);
        aluno.setCpf(dto.cpf());
        aluno.setDataNascimento(dto.dataNascimento());
        aluno.setTelefoneResponsavel(dto.telefoneResponsavel());
        aluno.setMatricula(dto.matricula());
        aluno.setSerie(dto.serie());
        aluno.setTurma(dto.turma());
        aluno.setTurno(dto.turno());

        return alunoRepository.save(aluno);
    }

    public List<AlunoResponseDTO> listar(String nome) {
        List<Aluno> lista = (nome != null && !nome.isBlank())
                ? alunoRepository.findByNomeContainingIgnoreCase(nome)
                : alunoRepository.findAll();
        return lista.stream().map(AlunoResponseDTO::fromEntity).toList();
    }

    public AlunoResponseDTO buscarPorId(Integer id) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado."));
        return AlunoResponseDTO.fromEntity(aluno);
    }

    @Transactional
    public AlunoResponseDTO atualizar(Integer id, AlunoAtualizacaoDTO dto) {
        Aluno aluno = alunoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Aluno não encontrado."));

        if (!aluno.getEmail().equals(dto.email()) && usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Este email já está em uso por outro usuário.");
        }

        aluno.setNome(dto.nome());
        aluno.setEmail(dto.email());
        aluno.setDataNascimento(dto.dataNascimento());
        aluno.setTelefoneResponsavel(dto.telefoneResponsavel());
        aluno.setSerie(dto.serie());
        aluno.setTurma(dto.turma());
        aluno.setTurno(dto.turno());

        return AlunoResponseDTO.fromEntity(alunoRepository.save(aluno));
    }

    @Transactional
    public void excluir(Integer id) {
        if (!alunoRepository.existsById(id)) {
            throw new IllegalArgumentException("Aluno não encontrado para exclusão.");
        }
        alunoRepository.deleteById(id);
    }
}