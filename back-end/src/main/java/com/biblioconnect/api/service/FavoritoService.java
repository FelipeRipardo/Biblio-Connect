package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Favorito;
import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.Usuario;
import com.biblioconnect.api.dto.FavoritoResponseDTO;
import com.biblioconnect.api.repository.FavoritoRepository;
import com.biblioconnect.api.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final MaterialRepository materialRepository;

    @Transactional
    public FavoritoResponseDTO adicionar(Usuario usuarioLogado, Integer materialId) {
        if (favoritoRepository.existsByUsuarioIdAndMaterialId(usuarioLogado.getId(), materialId)) {
            throw new IllegalArgumentException("Este material já está na sua lista de favoritos.");
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + materialId));

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuarioLogado);
        favorito.setMaterial(material);

        return FavoritoResponseDTO.fromEntity(favoritoRepository.save(favorito));
    }

    @Transactional(readOnly = true)
    public List<FavoritoResponseDTO> listarMeusFavoritos(Usuario usuarioLogado) {
        return favoritoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioLogado.getId())
                .stream()
                .map(FavoritoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional
    public void remover(Usuario usuarioLogado, Integer materialId) {
        Favorito favorito = favoritoRepository.findByUsuarioIdAndMaterialId(usuarioLogado.getId(), materialId)
                .orElseThrow(() -> new IllegalArgumentException("Este material não consta nos seus favoritos."));
        favoritoRepository.delete(favorito);
    }
}