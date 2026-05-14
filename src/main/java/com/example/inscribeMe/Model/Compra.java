package com.example.inscribeMe.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter // Mejor que @Data para evitar bucles en toString/hashCode
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    // Evita que al cargar la compra se intente cargar el historial del usuario
    // y este a su vez cargue sus compras nuevamente.
    @JsonIgnoreProperties({"compras", "inscripciones", "carrito"})
    private Usuario usuario;

    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    private EstadoCompra estado;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "compra_id") 
    // Usamos ManagedReference para que Jackson serialice los items,
    // pero el item no intente volver a serializar la compra padre.
    @JsonManagedReference(value = "compra-item")
    private List<ItemCompra> items;
}