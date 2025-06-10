package com.example.inscribeMe.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CursoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private double precio;
    private int cupoTotal;
    private int cupoDisponible;
    private String nombreInstructor;
}