package com.example.inscribeMe.Model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    private EstadoCompra estado;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "compra_id") // FK en la tabla ItemCompra
    private List<ItemCompra> items;
}
