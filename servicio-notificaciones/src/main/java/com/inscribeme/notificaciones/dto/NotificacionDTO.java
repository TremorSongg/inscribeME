package com.inscribeme.notificaciones.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacionDTO {
    private Long id;
    private String mensaje;
    private String fecha;
    private boolean leido;
}
