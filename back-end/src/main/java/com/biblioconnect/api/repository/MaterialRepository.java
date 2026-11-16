package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MaterialRepository extends JpaRepository<Material, Integer>, JpaSpecificationExecutor<Material> {
    boolean existsByIsbn(String isbn);
}