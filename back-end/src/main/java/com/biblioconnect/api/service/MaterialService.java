package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.domain.enums.TipoMaterial;
import com.biblioconnect.api.dto.MaterialRequestDTO;
import com.biblioconnect.api.dto.MaterialResponseDTO;
import com.biblioconnect.api.repository.MaterialRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    @Transactional
    public MaterialResponseDTO cadastrar(MaterialRequestDTO dto) {
        if (dto.isbn() != null && !dto.isbn().isBlank() && materialRepository.existsByIsbn(dto.isbn().trim())) {
            throw new IllegalArgumentException("Já existe um material cadastrado com este ISBN.");
        }

        Material material = new Material();
        preencherDados(material, dto);

        return MaterialResponseDTO.fromEntity(materialRepository.save(material));
    }

    @Transactional(readOnly = true)
    public List<MaterialResponseDTO> listar(
            String termo,
            String isbn,
            CategoriaMaterial categoria,
            TipoMaterial tipoMaterial,
            Integer ano,
            String serie,
            String disciplina) {

        Specification<Material> spec = criarFiltroSpecification(termo, isbn, categoria, tipoMaterial, ano, serie, disciplina);
        return materialRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "titulo"))
                .stream()
                .map(MaterialResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<MaterialResponseDTO> listarPaginado(
            String termo,
            String isbn,
            CategoriaMaterial categoria,
            TipoMaterial tipoMaterial,
            Integer ano,
            String serie,
            String disciplina,
            Pageable pageable) {

        Specification<Material> spec = criarFiltroSpecification(termo, isbn, categoria, tipoMaterial, ano, serie, disciplina);
        return materialRepository.findAll(spec, pageable).map(MaterialResponseDTO::fromEntity);
    }

    private Specification<Material> criarFiltroSpecification(
            String termo,
            String isbn,
            CategoriaMaterial categoria,
            TipoMaterial tipoMaterial,
            Integer ano,
            String serie,
            String disciplina) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (termo != null && !termo.isBlank()) {
                String busca = "%" + termo.trim().toLowerCase() + "%";
                String buscaIsbn = "%" + termo.trim().replace("-", "").toLowerCase() + "%";

                Predicate porTitulo = cb.like(cb.lower(root.get("titulo")), busca);
                Predicate porAutor = cb.like(cb.lower(root.get("autor")), busca);
                Predicate porIsbn = cb.like(
                        cb.function("replace", String.class, cb.lower(root.get("isbn")), cb.literal("-"), cb.literal("")),
                        buscaIsbn
                );
                predicates.add(cb.or(porTitulo, porAutor, porIsbn));
            }

            if (isbn != null && !isbn.isBlank()) {
                String isbnLimpo = "%" + isbn.trim().replace("-", "").toLowerCase() + "%";
                predicates.add(cb.like(
                        cb.function("replace", String.class, cb.lower(root.get("isbn")), cb.literal("-"), cb.literal("")),
                        isbnLimpo
                ));
            }

            if (categoria != null) {
                predicates.add(cb.equal(root.get("categoria"), categoria));
            }

            if (tipoMaterial != null) {
                predicates.add(cb.equal(root.get("tipoMaterial"), tipoMaterial));
            }

            if (ano != null) {
                predicates.add(cb.equal(root.get("ano"), ano));
            }

            if (serie != null && !serie.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("serie")), "%" + serie.trim().toLowerCase() + "%"));
            }

            if (disciplina != null && !disciplina.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("disciplina")), "%" + disciplina.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Transactional(readOnly = true)
    public MaterialResponseDTO buscarPorId(Integer id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + id));
        return MaterialResponseDTO.fromEntity(material);
    }

    @Transactional
    public MaterialResponseDTO atualizar(Integer id, MaterialRequestDTO dto) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material educacional não encontrado com o ID: " + id));

        if (dto.isbn() != null && !dto.isbn().isBlank()
                && !dto.isbn().trim().equals(material.getIsbn())
                && materialRepository.existsByIsbn(dto.isbn().trim())) {
            throw new IllegalArgumentException("Já existe outro material cadastrado com este ISBN.");
        }

        preencherDados(material, dto);
        return MaterialResponseDTO.fromEntity(materialRepository.save(material));
    }

    @Transactional
    public void excluir(Integer id) {
        if (!materialRepository.existsById(id)) {
            throw new IllegalArgumentException("Material educacional não encontrado com o ID: " + id);
        }
        materialRepository.deleteById(id);
    }

    private void preencherDados(Material material, MaterialRequestDTO dto) {
        material.setTitulo(dto.titulo().trim());
        material.setAutor(dto.autor().trim());
        material.setCategoria(dto.categoria());
        material.setTipoMaterial(dto.tipoMaterial());
        material.setAno(dto.ano());
        material.setSerie(dto.serie().trim());
        material.setDisciplina(dto.disciplina().trim());
        material.setDescricao(dto.descricao().trim());
        material.setIsbn(dto.isbn() != null ? dto.isbn().trim() : null);
        material.setEditora(dto.editora() != null ? dto.editora().trim() : null);
        material.setUrlArquivo(dto.urlArquivo().trim());
        material.setCapaUrl(dto.capaUrl() != null ? dto.capaUrl().trim() : null);
    }
}