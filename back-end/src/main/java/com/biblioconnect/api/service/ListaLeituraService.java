package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.ListaLeitura;
import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.ListaLeituraRequestDTO;
import com.biblioconnect.api.dto.ListaLeituraResponseDTO;
import com.biblioconnect.api.repository.ListaLeituraRepository;
import com.biblioconnect.api.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ListaLeituraService {

    private final ListaLeituraRepository listaLeituraRepository;
    private final MaterialRepository materialRepository;

    @Transactional
    public ListaLeituraResponseDTO criar(Usuario usuarioLogado, ListaLeituraRequestDTO dto) {
        validarPermissaoProfessorOuAdmin(usuarioLogado);

        ListaLeitura lista = new ListaLeitura();
        lista.setTitulo(dto.titulo().trim());
        lista.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);
        lista.setTurma(dto.turma().trim());
        lista.setProfessor(usuarioLogado);

        if (dto.materiaisIds() != null && !dto.materiaisIds().isEmpty()) {
            lista.setMateriais(buscarMateriaisPorIds(dto.materiaisIds()));
        }

        return ListaLeituraResponseDTO.fromEntity(listaLeituraRepository.save(lista));
    }

    @Transactional(readOnly = true)
    public List<ListaLeituraResponseDTO> listar(String turma, Integer professorId) {
        return listaLeituraRepository.findAllByOrderByCriadoEmDesc().stream()
                .filter(l -> turma == null || turma.isBlank() ||
                        l.getTurma().toLowerCase().contains(turma.trim().toLowerCase()))
                .filter(l -> professorId == null || l.getProfessor().getId().equals(professorId))
                .map(ListaLeituraResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ListaLeituraResponseDTO> listarMinhasListas(Usuario usuarioLogado) {
        return listaLeituraRepository.findByProfessorIdOrderByCriadoEmDesc(usuarioLogado.getId())
                .stream()
                .map(ListaLeituraResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ListaLeituraResponseDTO buscarPorId(Integer id) {
        ListaLeitura lista = listaLeituraRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lista de leitura não encontrada com o ID: " + id));
        return ListaLeituraResponseDTO.fromEntity(lista);
    }

    @Transactional
    public ListaLeituraResponseDTO atualizar(Usuario usuarioLogado, Integer id, ListaLeituraRequestDTO dto) {
        ListaLeitura lista = buscarEValidarDono(usuarioLogado, id);

        lista.setTitulo(dto.titulo().trim());
        lista.setDescricao(dto.descricao() != null ? dto.descricao().trim() : null);
        lista.setTurma(dto.turma().trim());

        if (dto.materiaisIds() != null) {
            lista.setMateriais(buscarMateriaisPorIds(dto.materiaisIds()));
        }

        return ListaLeituraResponseDTO.fromEntity(listaLeituraRepository.save(lista));
    }

    @Transactional
    public void excluir(Usuario usuarioLogado, Integer id) {
        ListaLeitura lista = buscarEValidarDono(usuarioLogado, id);
        listaLeituraRepository.delete(lista);
    }

    @Transactional
    public ListaLeituraResponseDTO adicionarMaterial(Usuario usuarioLogado, Integer listaId, Integer materialId) {
        ListaLeitura lista = buscarEValidarDono(usuarioLogado, listaId);

        boolean jaExiste = lista.getMateriais().stream()
                .anyMatch(m -> m.getId().equals(materialId));
        if (jaExiste) {
            throw new IllegalArgumentException("Este material já faz parte desta lista de leitura.");
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + materialId));

        lista.getMateriais().add(material);
        return ListaLeituraResponseDTO.fromEntity(listaLeituraRepository.save(lista));
    }

    @Transactional
    public ListaLeituraResponseDTO removerMaterial(Usuario usuarioLogado, Integer listaId, Integer materialId) {
        ListaLeitura lista = buscarEValidarDono(usuarioLogado, listaId);

        boolean removido = lista.getMateriais().removeIf(m -> m.getId().equals(materialId));
        if (!removido) {
            throw new IllegalArgumentException("O material informado não faz parte desta lista de leitura.");
        }

        return ListaLeituraResponseDTO.fromEntity(listaLeituraRepository.save(lista));
    }

    private void validarPermissaoProfessorOuAdmin(Usuario usuario) {
        if (usuario.getPerfil() != Perfil.PROFESSOR && usuario.getPerfil() != Perfil.ADMINISTRADOR) {
            throw new AccessDeniedException("Apenas professores ou administradores podem gerenciar listas de leitura.");
        }
    }

    private ListaLeitura buscarEValidarDono(Usuario usuarioLogado, Integer listaId) {
        validarPermissaoProfessorOuAdmin(usuarioLogado);

        ListaLeitura lista = listaLeituraRepository.findById(listaId)
                .orElseThrow(() -> new IllegalArgumentException("Lista de leitura não encontrada com o ID: " + listaId));

        boolean isDono = lista.getProfessor().getId().equals(usuarioLogado.getId());
        boolean isAdmin = usuarioLogado.getPerfil() == Perfil.ADMINISTRADOR;

        if (!isDono && !isAdmin) {
            throw new AccessDeniedException("Você não tem permissão para alterar ou excluir listas de outro professor.");
        }

        return lista;
    }

    private Set<Material> buscarMateriaisPorIds(List<Integer> ids) {
        Set<Material> materiais = new LinkedHashSet<>();
        for (Integer materialId : ids) {
            Material material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + materialId));
            materiais.add(material);
        }
        return materiais;
    }
}