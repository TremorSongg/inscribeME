package com.example.inscribeMe.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.inscribeMe.Model.Usuario;

public interface UsuarioRepository  extends JpaRepository<Usuario, Long>{
    Optional<Usuario> findByCorreo(String correo);
}
