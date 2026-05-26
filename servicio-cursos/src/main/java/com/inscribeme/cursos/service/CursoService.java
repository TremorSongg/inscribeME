package com.inscribeme.cursos.service;

import com.inscribeme.cursos.dto.CursoDTO;
import com.inscribeme.cursos.model.Curso;
import com.inscribeme.cursos.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;

    public List<CursoDTO> obtenerTodosComoDTO() {
        return cursoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<Curso> obtenerPorId(Long id) {
        return cursoRepository.findById(id);
    }

    public Curso crear(Curso curso) {
        if (curso.getCupoDisponible() == 0) {
            curso.setCupoDisponible(curso.getCupoTotal());
        }
        return cursoRepository.save(curso);
    }

    public Curso actualizar(Long id, Curso cursoActualizado) {
        return cursoRepository.findById(id).map(c -> {
            c.setNombre(cursoActualizado.getNombre());
            c.setDescripcion(cursoActualizado.getDescripcion());
            c.setPrecio(cursoActualizado.getPrecio());
            c.setCupoTotal(cursoActualizado.getCupoTotal());
            c.setCupoDisponible(cursoActualizado.getCupoDisponible());
            c.setFechaInicio(cursoActualizado.getFechaInicio());
            c.setFechaFin(cursoActualizado.getFechaFin());
            c.setInstructorId(cursoActualizado.getInstructorId());
            c.setNombreInstructor(cursoActualizado.getNombreInstructor());
            return cursoRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Curso no encontrado con id: " + id));
    }

    public void eliminar(Long id) {
        cursoRepository.deleteById(id);
    }

    private CursoDTO toDTO(Curso c) {
        return CursoDTO.builder()
                .id(c.getId())
                .nombre(c.getNombre())
                .descripcion(c.getDescripcion())
                .precio(c.getPrecio())
                .cupoTotal(c.getCupoTotal())
                .cupoDisponible(c.getCupoDisponible())
                .fechaInicio(c.getFechaInicio())
                .fechaFin(c.getFechaFin())
                .nombreInstructor(c.getNombreInstructor())
                .build();
    }
}
