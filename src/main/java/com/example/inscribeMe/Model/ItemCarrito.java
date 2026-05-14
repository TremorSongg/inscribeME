package com.example.inscribeMe.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "carrito_id")
    // Este nombre "carrito-item" DEBE coincidir con el del modelo Carrito
    @JsonBackReference(value = "carrito-item")
    private Carrito carrito;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    // Evitamos que al ver el ítem del carrito, el curso intente 
    // cargar su lista de inscripciones (que es pesada y no se necesita aquí)
    @JsonIgnoreProperties("inscripciones")
    private Curso curso;

    private int cantidad;
}