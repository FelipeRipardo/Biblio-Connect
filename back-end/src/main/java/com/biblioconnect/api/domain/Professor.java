package com.biblioconnect.api.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "professores")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Professor extends Usuario {

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(name = "registro_funcional", nullable = false, unique = true, length = 50)
    private String registroFuncional;

    //Salva as tags separadas por vírgula (ex: "Matemática, Física")
    @Column(nullable = false)
    private String disciplinas;

    //Salva as turmas separadas por vírgula (ex: "9º A, 9º B, 8º A")
    @Column(nullable = false)
    private String turmas;

    @Column(name = "comprovante_vinculo")
    private String comprovanteVinculo;
}