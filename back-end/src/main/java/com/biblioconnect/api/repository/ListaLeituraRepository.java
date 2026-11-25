package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.ListaLeitura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListaLeituraRepository extends JpaRepository<ListaLeitura, Integer> {
    List<ListaLeitura> findAllByOrderByCriadoEmDesc();
    List<ListaLeitura> findByProfessorIdOrderByCriadoEmDesc(Integer professorId);
}