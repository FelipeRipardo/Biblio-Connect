package com.biblioconnect.api.domain;

import com.biblioconnect.api.domain.enums.CategoriaMaterial;
import com.biblioconnect.api.domain.enums.TipoMaterial;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "materiais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(nullable = false, length = 150)
    private String autor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategoriaMaterial categoria;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_material", nullable = false, length = 50)
    private TipoMaterial tipoMaterial;

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false, length = 50)
    private String serie;

    @Column(nullable = false, length = 100)
    private String disciplina;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 30)
    private String isbn;

    @Column(length = 100)
    private String editora;

    @Column(name = "url_arquivo", nullable = false, length = 500)
    private String urlArquivo;

    @Column(name = "capa_url", length = 500)
    private String capaUrl;

    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }
}