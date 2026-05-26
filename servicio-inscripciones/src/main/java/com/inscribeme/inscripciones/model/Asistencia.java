package com.inscribeme.inscripciones.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "asistencias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long cursoId;
    private Long usuarioId;

    // Nombre desnormalizado para respuestas rápidas
    private String nombreUsuario;
    private String nombreCurso;

    private LocalDate fecha;

    private Boolean presente;

    private String observacion;
}
