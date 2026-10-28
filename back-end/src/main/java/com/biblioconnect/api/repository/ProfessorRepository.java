package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorRepository extends JpaRepository<Professor, Integer> {
    boolean existsByCpf(String cpf);
    boolean existsByRegistroFuncional(String registroFuncional);
    List<Professor> findByNomeContainingIgnoreCase(String nome);
}