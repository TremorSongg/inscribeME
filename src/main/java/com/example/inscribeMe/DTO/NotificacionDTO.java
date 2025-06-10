package com.example.inscribeMe.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificacionDTO {
    private Long id;
    private String mensaje;
    private String fecha; // Enviamos la fecha como texto simple (String)
    private boolean leido;
}