package com.example.inscribeMe.Model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidad que representa un ticket de soporte o reporte de error")
public class Reporte {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    // Al ver un reporte, solo necesitamos datos básicos del denunciante.
    // Ignoramos las listas pesadas del Usuario para evitar recursión infinita.
    @JsonIgnoreProperties({"reportes", "inscripciones", "carrito", "compras", "notificaciones", "password"})
    private Usuario usuario;

    @Schema(example = "No puedo visualizar el video del módulo 2")
    private String mensaje;

    private LocalDateTime fechaCreacion;

    @Enumerated(EnumType.STRING)
    @Schema(description = "Estado actual del ticket")
    private EstadoReporte estado;
}