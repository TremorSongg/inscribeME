package com.example.inscribeMe.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estados del ciclo de vida de una matriculación")
public enum EstadoInscripcion {
    
    @Schema(description = "El alumno está matriculado activamente y puede acceder al contenido")
    INSCRITO,
    
    @Schema(description = "La inscripción fue anulada (por el alumno o administración)")
    CANCELADO,
    
    @Schema(description = "El alumno completó todos los requisitos del curso")
    FINALIZADO
}