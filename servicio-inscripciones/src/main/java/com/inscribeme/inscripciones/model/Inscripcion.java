package com.inscribeme.inscripciones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "inscripciones")
@Getter
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

    // Referencias por ID (sin JPA cross-service join)
    private Long usuarioId;
    private Long cursoId;

    // Desnormalizados para respuestas rápidas sin llamadas adicionales
    private String nombreCurso;
    private String descripcionCurso;
    private LocalDate fechaInicioCurso;
    private LocalDate fechaFinCurso;
    private String nombreInstructor;

    // Nombre del estudiante desnormalizado (evita llamada cross-service al listar alumnos por curso)
    private String nombreUsuario;
}
