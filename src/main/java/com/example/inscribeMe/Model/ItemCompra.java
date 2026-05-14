package com.example.inscribeMe.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter // Cambiamos @Data por Getter/Setter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "compra_id")
    // Debe coincidir con el nombre que pusimos en Compra.java
    @JsonBackReference(value = "compra-item")
    private Compra compra;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    // Al ver el detalle de una compra, no necesitamos ver 
    // todas las inscripciones históricas de ese curso.
    @JsonIgnoreProperties("inscripciones")
    private Curso curso;

    private int cantidad;

    private double precioUnitario; // Precio al momento de compra
}