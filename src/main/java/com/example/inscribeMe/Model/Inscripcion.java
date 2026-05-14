package com.example.inscribeMe.Model;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter // Cambiamos @Data por Getter/Setter para evitar recursión en toString
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fechaInscripcion;

    @Enumerated(EnumType.STRING)
    private EstadoInscripcion estado;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    // Esta referencia debe coincidir con la que definiremos en Usuario
    @JsonBackReference(value = "usuario-inscripciones")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    // IMPORTANTE: Debe coincidir con el nombre que pusimos en Curso.java
    @JsonBackReference(value = "curso-inscripciones")
    private Curso curso;
}