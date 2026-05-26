package com.inscribeme.inscripciones.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumnoCursoDTO {
    private Long usuarioId;
    private String nombreUsuario;
    private String nombreCurso;
    private Long cursoId;
    private String fechaInscripcion;
    private String estado;
}
