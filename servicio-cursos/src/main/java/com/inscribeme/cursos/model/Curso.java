package com.inscribeme.cursos.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private double precio;
    private int cupoTotal;
    private int cupoDisponible;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    private Long instructorId;
    private String nombreInstructor; // Desnormalizado para consultas rápidas

    @Column(nullable = false)
    @Builder.Default
    private boolean eliminado = false;
}
