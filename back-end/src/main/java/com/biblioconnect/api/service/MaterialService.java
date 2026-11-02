package com.biblioconnect.api.service;

import com.biblioconnect.api.domain.Material;
import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.dto.MaterialRequestDTO;
import com.biblioconnect.api.dto.MaterialResponseDTO;
import com.biblioconnect.api.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
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
    public List<MaterialResponseDTO> listar(String termo, CategoriaMaterial categoria, String serie, String disciplina) {
        return materialRepository.findAll().stream()
                .filter(m -> termo == null || termo.isBlank() ||
                        m.getTitulo().toLowerCase().contains(termo.trim().toLowerCase()) ||
                        m.getAutor().toLowerCase().contains(termo.trim().toLowerCase()))
                .filter(m -> categoria == null || m.getCategoria() == categoria)
                .filter(m -> serie == null || serie.isBlank() ||
                        m.getSerie().equalsIgnoreCase(serie.trim()))
                .filter(m -> disciplina == null || disciplina.isBlank() ||
                        m.getDisciplina().toLowerCase().contains(disciplina.trim().toLowerCase()))
                .sorted(Comparator.comparing(Material::getTitulo))
                .map(MaterialResponseDTO::fromEntity)
                .toList();
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