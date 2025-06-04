package com.example.inscribeMe.Model;

import java.util.List;

import jakarta.persistence.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true, nullable = false)
    private String correo;

    private String password;

    private String telefono;

    @Enumerated(EnumType.STRING)
    private Rol rol; //Esto da error, yo creo que
    // podría hacerse la generación de rol en una clase aparte del modelo

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Inscripcion> inscripciones;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Notificacion> notificaciones;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Pago> pagos;

}
