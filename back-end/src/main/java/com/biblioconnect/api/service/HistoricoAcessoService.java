package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.HistoricoAcesso;
import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.HistoricoResponseDTO;
import com.biblioconnect.api.repository.HistoricoAcessoRepository;
import com.biblioconnect.api.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricoAcessoService {

    private final HistoricoAcessoRepository historicoRepository;
    private final MaterialRepository materialRepository;

    @Transactional
    public HistoricoResponseDTO registrarAcesso(Usuario usuarioLogado, Integer materialId) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + materialId));

        HistoricoAcesso historico = new HistoricoAcesso();
        historico.setUsuario(usuarioLogado);
        historico.setMaterial(material);

        return HistoricoResponseDTO.fromEntity(historicoRepository.save(historico));
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponseDTO> listarMeuHistorico(Usuario usuarioLogado) {
        return historicoRepository.findByUsuarioIdOrderByAcessadoEmDesc(usuarioLogado.getId())
                .stream()
                .map(HistoricoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HistoricoResponseDTO> listarPorUsuario(Usuario usuarioLogado, Integer usuarioIdAlvo) {
        //Regra de permissão: Usuário comum só vê o próprio histórico; Gestor, Professor e Admin podem consultar o de terceiros
        if (!usuarioLogado.getId().equals(usuarioIdAlvo)
                && usuarioLogado.getPerfil() == Perfil.ALUNO) {
            throw new AccessDeniedException("Alunos só podem consultar o próprio histórico de leitura.");
        }

        return historicoRepository.findByUsuarioIdOrderByAcessadoEmDesc(usuarioIdAlvo)
                .stream()
                .map(HistoricoResponseDTO::fromEntity)
                .toList();
    }
}