package com.example.inscribeMe.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "DTO simplificado de un curso para el catálogo")
public class CursoDTO {
    
    @Schema(example = "1")
    private Long id;
    
    @Schema(example = "Java Spring Boot Master")
    private String nombre;
    
    @Schema(example = "Aprende a crear microservicios desde cero")
    private String descripcion;
    
    @Schema(example = "49.99")
    private double precio;
    
    @Schema(example = "30")
    private int cupoTotal;
    
    @Schema(example = "12")
    private int cupoDisponible;
    
    @Schema(example = "Prof. Juan Pérez")
    private String nombreInstructor;
}