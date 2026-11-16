package com.biblioconnect.api.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_acessos")
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

    @Column(name = "acessado_em", updatable = false)
    private LocalDateTime acessadoEm;

    @PrePersist
    protected void onCreate() {
        this.acessadoEm = LocalDateTime.now();
    }
}