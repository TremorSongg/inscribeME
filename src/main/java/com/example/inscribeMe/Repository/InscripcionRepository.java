package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Inscripcion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    List<Inscripcion> findByUsuarioId(Long usuarioId);
    // Ejemplo de método extra si quieres: List<Inscripcion> findByUsuarioId(Long usuarioId);
}
