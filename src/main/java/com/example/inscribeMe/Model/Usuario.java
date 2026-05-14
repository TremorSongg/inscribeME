package com.example.inscribeMe.Model;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String email;

    @JsonIgnore // Crucial: Nunca enviar el password en ningún JSON de la API
    private String password;
    
    private String telefono;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    // Debe coincidir exactamente con el nombre en Inscripcion.java
    @JsonManagedReference(value = "usuario-inscripciones")
    private List<Inscripcion> inscripciones;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    // Evitamos que las notificaciones vuelvan a cargar al usuario completo
    @JsonIgnoreProperties("usuario")
    private List<Notificacion> notificaciones;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    // Evitamos bucles con el historial de compras
    @JsonIgnoreProperties("usuario")
    private List<Compra> historialCompras;
    
    // Si tienes una relación inversa con Carrito, añádela aquí con @JsonIgnoreProperties("usuario")
}