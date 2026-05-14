package com.example.inscribeMe.Model;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter // Cambiamos @Data por @Getter y @Setter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private double precio;
    private int cupoTotal;
    private int cupoDisponible;

    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    // El instructor es un Usuario. Usamos un nombre único para esta relación.
    // O mejor aún, ignoramos las listas pesadas del instructor al ver el curso.
    @JsonIgnoreProperties({"cursosImpartidos", "inscripciones", "carrito", "password"})
    private Usuario instructor;

    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, orphanRemoval = true)
    // Nombre único y específico para la relación Curso -> Inscripción
    @JsonManagedReference(value = "curso-inscripciones")
    private List<Inscripcion> inscripciones;
}