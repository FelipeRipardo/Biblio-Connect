package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Gestor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GestorRepository extends JpaRepository<Gestor, Integer> {
}