package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Integer> {

    boolean existsByIsbn(String isbn);

    @Query("""
        SELECT m FROM Material m
        WHERE (:termo IS NULL OR LOWER(m.titulo) LIKE LOWER(CONCAT('%', :termo, '%'))
               OR LOWER(m.autor) LIKE LOWER(CONCAT('%', :termo, '%')))
          AND (:categoria IS NULL OR m.categoria = :categoria)
          AND (:serie IS NULL OR LOWER(m.serie) LIKE LOWER(CONCAT('%', :serie, '%')))
          AND (:disciplina IS NULL OR LOWER(m.disciplina) LIKE LOWER(CONCAT('%', :disciplina, '%')))
        ORDER BY m.titulo ASC
    """)
    List<Material> buscarComFiltros(
            @Param("termo") String termo,
            @Param("categoria") CategoriaMaterial categoria,
            @Param("serie") String serie,
            @Param("disciplina") String disciplina
    );
}