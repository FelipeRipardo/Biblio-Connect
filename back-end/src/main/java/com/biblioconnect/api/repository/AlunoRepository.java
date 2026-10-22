package com.biblioconnect.api.repository;

import com.biblioconnect.api.domain.Aluno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlunoRepository extends JpaRepository<Aluno, Integer> {
    boolean existsByCpf(String cpf);
    boolean existsByMatricula(String matricula);
    Optional<Aluno> findByMatricula(String matricula);
    List<Aluno> findByNomeContainingIgnoreCase(String nome);
}