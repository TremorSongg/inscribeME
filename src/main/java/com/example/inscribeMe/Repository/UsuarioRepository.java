package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Rol;
import com.example.inscribeMe.Model.Usuario;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRol(Rol rol);
}
