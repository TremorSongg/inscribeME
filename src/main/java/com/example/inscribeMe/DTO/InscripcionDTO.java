package com.example.inscribeMe.DTO;

import com.example.inscribeMe.Model.EstadoInscripcion;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class InscripcionDTO {
    private Long cursoId;
    private String nombreCurso;
    private String descripcionCurso;
    private LocalDate fechaInicioCurso;
    private LocalDate fechaFinCurso;
    private LocalDate fechaInscripcion;
    private EstadoInscripcion estado;
    private String nombreInstructor;
}