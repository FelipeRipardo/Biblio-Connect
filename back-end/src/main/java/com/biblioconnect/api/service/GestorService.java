package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Gestor;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.GestorAtualizacaoDTO;
import com.biblioconnect.api.dto.GestorCadastroDTO;
import com.biblioconnect.api.dto.GestorResponseDTO;
import com.biblioconnect.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GestorService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public GestorResponseDTO cadastrar(GestorCadastroDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email().trim())) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail institucional.");
        }

        Gestor gestor = new Gestor();
        gestor.setNome(dto.nome().trim());
        gestor.setEmail(dto.email().trim());
        gestor.setSenha(passwordEncoder.encode(dto.senha()));
        gestor.setPerfil(Perfil.GESTOR);

        return GestorResponseDTO.fromEntity(usuarioRepository.save(gestor));
    }

    @Transactional(readOnly = true)
    public List<GestorResponseDTO> listar(String termo) {
        return usuarioRepository.findAll().stream()
                .filter(u -> u.getPerfil() == Perfil.GESTOR)
                .filter(u -> termo == null || termo.isBlank() ||
                        u.getNome().toLowerCase().contains(termo.trim().toLowerCase()) ||
                        (u.getEmail() != null && u.getEmail().toLowerCase().contains(termo.trim().toLowerCase())))
                .sorted(Comparator.comparing(Usuario::getNome))
                .map(GestorResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public GestorResponseDTO buscarPorId(Integer id) {
        Usuario gestor = buscarEntidadeGestor(id);
        return GestorResponseDTO.fromEntity(gestor);
    }

    @Transactional
    public GestorResponseDTO atualizar(Integer id, GestorAtualizacaoDTO dto) {
        Usuario gestor = buscarEntidadeGestor(id);

        String novoEmail = dto.email().trim();
        if (!novoEmail.equalsIgnoreCase(gestor.getEmail()) && usuarioRepository.existsByEmail(novoEmail)) {
            throw new IllegalArgumentException("Já existe outro usuário cadastrado com este e-mail institucional.");
        }

        gestor.setNome(dto.nome().trim());
        gestor.setEmail(novoEmail);

        if (dto.senha() != null && !dto.senha().isBlank()) {
            if (dto.senha().trim().length() < 8) {
                throw new IllegalArgumentException("A nova senha deve ter no mínimo 8 caracteres.");
            }
            gestor.setSenha(passwordEncoder.encode(dto.senha()));
        }

        return GestorResponseDTO.fromEntity(usuarioRepository.save(gestor));
    }

    @Transactional
    public void excluir(Integer id) {
        Usuario gestor = buscarEntidadeGestor(id);
        usuarioRepository.delete(gestor);
    }

    private Usuario buscarEntidadeGestor(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gestor não encontrado com o ID: " + id));

        if (usuario.getPerfil() != Perfil.GESTOR) {
            throw new IllegalArgumentException("O registro informado não pertence ao perfil de Gestor.");
        }

        return usuario;
    }
}