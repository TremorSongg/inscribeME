package com.example.inscribeMe.Model;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fechaInscripcion;

    @Enumerated(EnumType.STRING)
    private EstadoInscripcion estado;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonBackReference
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    @JsonBackReference
    private Curso curso;
}
