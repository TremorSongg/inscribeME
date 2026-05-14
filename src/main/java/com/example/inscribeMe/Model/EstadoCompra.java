package com.example.inscribeMe.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estados posibles de una transacción de compra")
public enum EstadoCompra {
    
    @Schema(description = "La compra se completó exitosamente en el entorno de pruebas")
    SIMULADA_PAGADA,
    
    @Schema(description = "La compra fue anulada por el usuario o por falta de stock/cupo")
    CANCELADA
}