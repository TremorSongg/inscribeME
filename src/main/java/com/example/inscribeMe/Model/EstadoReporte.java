package com.example.inscribeMe.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Estados para el seguimiento de tickets de soporte o reportes")
public enum EstadoReporte {
    
    @Schema(description = "El reporte ha sido recibido pero aún no ha sido visto por soporte")
    PENDIENTE,
    
    @Schema(description = "Un administrador está trabajando en la solicitud")
    EN_REVISION,
    
    @Schema(description = "El problema ha sido solucionado o la duda aclarada")
    RESUELTO
}