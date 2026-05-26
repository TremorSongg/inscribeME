package com.inscribeme.carrito.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarritoDTO {
    private Long cursoId;
    private String nombreCurso;
    private int cantidad;
    private double precioUnitario;
    private double subtotal;
}
