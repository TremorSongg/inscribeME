package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    // Agregá métodos personalizados si necesitás más adelante
}
