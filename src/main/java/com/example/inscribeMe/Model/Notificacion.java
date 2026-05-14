package com.example.inscribeMe.Model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacion {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    // Solo necesitamos saber a quién pertenece, no ver toda su actividad
    @JsonIgnoreProperties({"notificaciones", "inscripciones", "carrito", "compras", "password"})
    private Usuario usuario;

    private String mensaje;
    private LocalDateTime fecha;
    private boolean leido;
}