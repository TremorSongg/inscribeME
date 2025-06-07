package com.example.inscribeMe.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.inscribeMe.Model.CarritoCurso;

public interface CarritoRepository extends JpaRepository<CarritoCurso, Integer> {
    List<CarritoCurso> findByUsuarioId(int usuarioId);
    void deleteByUsuarioId(int usuarioId);
    Optional<CarritoCurso> findByUsuarioIdAndCursoId(int usuarioId, int cursoId);
  

}
