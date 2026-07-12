package com.inscribeme.inscripciones.dto;

import com.inscribeme.inscripciones.model.EstadoInscripcion;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InscripcionDTO {
    private Long id;
    private Long cursoId;
    private String nombreCurso;
    private String descripcionCurso;
    private LocalDate fechaInicioCurso;
    private LocalDate fechaFinCurso;
    private LocalDate fechaInscripcion;
    private EstadoInscripcion estado;
    private String nombreInstructor;
}
