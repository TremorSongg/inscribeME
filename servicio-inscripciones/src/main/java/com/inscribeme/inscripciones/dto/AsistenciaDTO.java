package com.inscribeme.inscripciones.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AsistenciaDTO {
    private Long id;
    private Long cursoId;
    private Long usuarioId;
    private String nombreUsuario;
    private String nombreCurso;
    private LocalDate fecha;
    private Boolean presente;
    private String observacion;
}
