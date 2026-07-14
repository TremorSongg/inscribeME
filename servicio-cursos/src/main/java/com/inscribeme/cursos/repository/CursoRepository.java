package com.inscribeme.cursos.repository;

import com.inscribeme.cursos.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByEliminadoFalse();
    Optional<Curso> findByIdAndEliminadoFalse(Long id);
    List<Curso> findByInstructorIdAndEliminadoFalse(Long instructorId);
}
