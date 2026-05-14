package com.example.inscribeMe.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference; // Importante
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true)
    // Evitamos que al cargar el carrito se traiga todo el objeto usuario 
    // si este a su vez intenta cargar el carrito de nuevo.
    @JsonIgnoreProperties("carrito") 
    private Usuario usuario;

    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    // @JsonManagedReference indica que este es el lado que "manda" la relación.
    // Jackson serializará los ítems, pero detendrá la vuelta atrás desde el ítem.
    @JsonManagedReference(value = "carrito-item")
    private List<ItemCarrito> items;
}