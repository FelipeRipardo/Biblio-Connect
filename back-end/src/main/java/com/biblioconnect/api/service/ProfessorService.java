package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Professor;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.ProfessorAtualizacaoDTO;
import com.biblioconnect.api.dto.ProfessorCadastroDTO;
import com.biblioconnect.api.dto.ProfessorResponseDTO;
import com.biblioconnect.api.repository.ProfessorRepository;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SenhaValidator senhaValidator;

    @Transactional
    public Professor cadastrar(ProfessorCadastroDTO dto) {
        senhaValidator.validarForcaSenha(dto.senha());

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Este e-mail institucional já está cadastrado.");
        }
        if (professorRepository.existsByCpf(dto.cpf())) {
            throw new IllegalArgumentException("Este CPF já está cadastrado.");
        }
        if (professorRepository.existsByRegistroFuncional(dto.registroFuncional())) {
            throw new IllegalArgumentException("Este registro funcional já está cadastrado.");
        }

        Professor professor = new Professor();
        professor.setNome(dto.nome());
        professor.setEmail(dto.email());
        professor.setSenha(passwordEncoder.encode(dto.senha()));
        professor.setPerfil(Perfil.PROFESSOR);

        professor.setCpf(dto.cpf());
        professor.setTelefone(dto.telefone());
        professor.setRegistroFuncional(dto.registroFuncional());
        professor.setDisciplinas(String.join(", ", dto.disciplinas()));
        professor.setTurmas(String.join(", ", dto.turmas()));
        professor.setComprovanteVinculo(dto.comprovanteVinculo());

        return professorRepository.save(professor);
    }

    public List<ProfessorResponseDTO> listar(String nome) {
        List<Professor> lista = (nome != null && !nome.isBlank())
                ? professorRepository.findByNomeContainingIgnoreCase(nome)
                : professorRepository.findAll();
        return lista.stream().map(ProfessorResponseDTO::fromEntity).toList();
    }

    public ProfessorResponseDTO buscarPorId(Integer id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado."));
        return ProfessorResponseDTO.fromEntity(professor);
    }

    @Transactional
    public ProfessorResponseDTO atualizar(Integer id, ProfessorAtualizacaoDTO dto) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado."));

        if (!professor.getEmail().equals(dto.email()) && usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Este e-mail já está em uso por outro usuário.");
        }

        professor.setNome(dto.nome());
        professor.setEmail(dto.email());
        professor.setTelefone(dto.telefone());
        professor.setDisciplinas(String.join(", ", dto.disciplinas()));
        professor.setTurmas(String.join(", ", dto.turmas()));
        professor.setComprovanteVinculo(dto.comprovanteVinculo());

        return ProfessorResponseDTO.fromEntity(professorRepository.save(professor));
    }

    @Transactional
    public void excluir(Integer id) {
        if (!professorRepository.existsById(id)) {
            throw new IllegalArgumentException("Professor não encontrado para exclusão.");
        }
        professorRepository.deleteById(id);
    }
}