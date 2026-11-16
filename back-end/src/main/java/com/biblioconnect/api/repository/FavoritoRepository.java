package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoritoRepository extends JpaRepository<Favorito, Integer> {
    boolean existsByUsuarioIdAndMaterialId(Integer usuarioId, Integer materialId);
    List<Favorito> findByUsuarioIdOrderByCriadoEmDesc(Integer usuarioId);
    Optional<Favorito> findByUsuarioIdAndMaterialId(Integer usuarioId, Integer materialId);
}