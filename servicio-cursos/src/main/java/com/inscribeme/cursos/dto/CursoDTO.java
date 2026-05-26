package com.inscribeme.cursos.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private double precio;
    private int cupoTotal;
    private int cupoDisponible;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String nombreInstructor;
}
