package com.example.inscribeMe.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Notificacion {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne
    private Usuario usuario;

    private String mensaje;
    private LocalDateTime fecha;
    private boolean leido;
}

