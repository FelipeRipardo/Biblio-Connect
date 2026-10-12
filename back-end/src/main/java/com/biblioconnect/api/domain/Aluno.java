package com.biblioconnect.api.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true) //Importante para considerar o ID e Email da classe pai no equals/hashCode
@Entity
@Table(name = "alunos")
public class Aluno extends Usuario {

}