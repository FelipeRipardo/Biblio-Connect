package com.biblioconnect.api.domain;

import com.biblioconnect.api.domain.enums.Perfil;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data //Gera Getters, Setters, toString, equals e hashCode
@NoArgsConstructor //Gera construtor vazio, pois é exigido pelo JPA
@AllArgsConstructor //Gera construtor com todos os argumentos
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED) //Cria tabelas separadas para as classes filhas (Aluno, Professor) unidas por chave estrangeira
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 100) //unique = true atende à Regra de Negócio RN03 (E-mail único)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Enumerated(EnumType.STRING) //Garante que será salvo como VARCHAR (ex: 'ALUNO') no banco
    @Column(nullable = false, length = 50)
    private Perfil perfil;
}