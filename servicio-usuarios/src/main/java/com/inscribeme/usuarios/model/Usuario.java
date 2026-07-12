package com.inscribeme.usuarios.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "usuarios")
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

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private boolean eliminado = false;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String telefono;

    @Enumerated(EnumType.STRING)
    private Rol rol;
}
