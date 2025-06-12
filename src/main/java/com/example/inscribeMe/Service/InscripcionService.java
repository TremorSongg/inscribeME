package com.example.inscribeMe.Service;

import com.example.inscribeMe.DTO.InscripcionDTO;
import com.example.inscribeMe.Model.Inscripcion;
import com.example.inscribeMe.Repository.InscripcionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;

    public InscripcionService(InscripcionRepository inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }

    public List<Inscripcion> obtenerTodas() {
        return inscripcionRepository.findAll();
    }

    public Optional<Inscripcion> obtenerPorId(Long id) {
        return inscripcionRepository.findById(id);
    }

    public Inscripcion crear(Inscripcion inscripcion) {
        return inscripcionRepository.save(inscripcion);
    }

    public Inscripcion actualizar(Long id, Inscripcion inscripcion) {
        inscripcion.setId(id);
        return inscripcionRepository.save(inscripcion);
    }

    public void eliminar(Long id) {
        inscripcionRepository.deleteById(id);
    }

    public List<InscripcionDTO> obtenerInscripcionesPorUsuario(Long usuarioId) {
        return inscripcionRepository.findByUsuarioId(usuarioId).stream()
                .map(inscripcion -> {
                    
                    String instructorName = (inscripcion.getCurso().getInstructor() != null)
                            ? inscripcion.getCurso().getInstructor().getNombre()
                            : "No asignado";
                    

                    return InscripcionDTO.builder()
                            .cursoId(inscripcion.getCurso().getId())
                            .nombreCurso(inscripcion.getCurso().getNombre())
                            .descripcionCurso(inscripcion.getCurso().getDescripcion())
                            .fechaInicioCurso(inscripcion.getCurso().getFechaInicio())
                            .fechaFinCurso(inscripcion.getCurso().getFechaFin())
                            .fechaInscripcion(inscripcion.getFechaInscripcion())
                            .estado(inscripcion.getEstado())
                            .nombreInstructor(instructorName) // Ahora la variable existe
                            .build();
                })
                .collect(Collectors.toList());
    }
}