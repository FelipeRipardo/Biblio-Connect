package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.HistoricoAcesso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistoricoAcessoRepository extends JpaRepository<HistoricoAcesso, Integer> {
    List<HistoricoAcesso> findByUsuarioIdOrderByAcessadoEmDesc(Integer usuarioId);
    Optional<HistoricoAcesso> findByUsuarioIdAndMaterialId(Integer usuarioId, Integer materialId);
}