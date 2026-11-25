package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.HistoricoAcesso;
import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.domain.enums.Perfil;
import com.biblioconnect.api.dto.HistoricoProgressoRequestDTO;
import com.biblioconnect.api.dto.HistoricoResponseDTO;
import com.biblioconnect.api.repository.HistoricoAcessoRepository;
import com.biblioconnect.api.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoricoAcessoService {

    private final HistoricoAcessoRepository historicoRepository;
    private final MaterialRepository materialRepository;

    @Transactional
    public HistoricoResponseDTO registrarOuAtualizarAcesso(
            Usuario usuarioLogado,
            Integer materialId,
            HistoricoProgressoRequestDTO dto) {

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + materialId));

        HistoricoAcesso historico = historicoRepository
                .findByUsuarioIdAndMaterialId(usuarioLogado.getId(), materialId)
                .orElseGet(() -> {
                    HistoricoAcesso novo = new HistoricoAcesso();
                    novo.setUsuario(usuarioLogado);
                    novo.setMaterial(material);
                    novo.setPaginaAtual(1);
                    return novo;
                });

        if (dto != null) {
            if (dto.totalPaginas() != null) {
                historico.setTotalPaginas(dto.totalPaginas());
            }
            if (dto.paginaAtual() != null) {
                int pagina = dto.paginaAtual();
                if (historico.getTotalPaginas() != null && pagina > historico.getTotalPaginas()) {
                    pagina = historico.getTotalPaginas();
                }
                historico.setPaginaAtual(pagina);
            }
        }

        historico.setAcessadoEm(LocalDateTime.now());

        return HistoricoResponseDTO.fromEntity(historicoRepository.save(historico));
    }

    @Transactional(readOnly = true)
    public HistoricoResponseDTO buscarProgressoMaterial(Usuario usuarioLogado, Integer materialId) {
        HistoricoAcesso historico = historicoRepository
                .findByUsuarioIdAndMaterialId(usuarioLogado.getId(), materialId)
                .orElseThrow(() -> new IllegalArgumentException("Nenhum progresso de leitura encontrado para este material."));
        return HistoricoResponseDTO.fromEntity(historico);
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
        if (!usuarioLogado.getId().equals(usuarioIdAlvo)
                && usuarioLogado.getPerfil() == Perfil.ALUNO) {
            throw new AccessDeniedException("Alunos só podem consultar o próprio histórico de leitura.");
        }

        return historicoRepository.findByUsuarioIdOrderByAcessadoEmDesc(usuarioIdAlvo)
                .stream()
                .map(HistoricoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void removerDoHistorico(Usuario usuarioLogado, Integer materialId) {
        HistoricoAcesso historico = historicoRepository
                .findByUsuarioIdAndMaterialId(usuarioLogado.getId(), materialId)
                .orElseThrow(() -> new IllegalArgumentException("Este material não consta no seu histórico de leitura."));
        historicoRepository.delete(historico);
    }
}