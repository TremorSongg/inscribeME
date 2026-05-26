package com.inscribeme.inscripciones.repository;

import com.inscribeme.inscripciones.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findByCursoId(Long cursoId);
    List<Asistencia> findByCursoIdAndFecha(Long cursoId, LocalDate fecha);
    Optional<Asistencia> findByCursoIdAndUsuarioIdAndFecha(Long cursoId, Long usuarioId, LocalDate fecha);
    List<Asistencia> findByUsuarioId(Long usuarioId);
}
