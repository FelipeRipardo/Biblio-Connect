package com.biblioconnect.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_acessos", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"usuario_id", "material_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "pagina_atual", nullable = false)
    private Integer paginaAtual = 1;

    @Column(name = "total_paginas")
    private Integer totalPaginas;

    @Column(name = "acessado_em", nullable = false)
    private LocalDateTime acessadoEm;

    @PrePersist
    protected void onCreate() {
        if (this.paginaAtual == null || this.paginaAtual < 1) {
            this.paginaAtual = 1;
        }
        this.acessadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.acessadoEm = LocalDateTime.now();
    }
}