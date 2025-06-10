package com.example.inscribeMe.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ItemCarritoDTO {
    private Long cursoId;
    private String nombreCurso;
    private String imagenUrl; // Podríamos añadir esto a Curso.java en el futuro
    private int cantidad;
    private double precioUnitario;
    private double subtotal;
}
