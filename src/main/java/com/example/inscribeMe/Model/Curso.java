package com.example.inscribeMe.Model;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.*;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Curso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    
    private String descripcion;

    private int cupoMaximo;

    private int cupoDisponible;

    private LocalDate fechaInicio;

    private LocalDate fechaFin;

    @ManyToOne
    @JoinColumn(name = "instructor_id")
    private Usuario instructor;

    @OneToMany(mappedBy =  "cursos", cascade = CascadeType.ALL)
    private List<Inscripcion> inscripciones;

    public enum Rol{
        ADMIN,
        ESTUDIANTE,
        INSTRUCTOR
    }
    
}
