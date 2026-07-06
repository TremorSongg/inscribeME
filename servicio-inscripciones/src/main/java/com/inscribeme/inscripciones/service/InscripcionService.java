package com.inscribeme.inscripciones.service;

import com.inscribeme.inscripciones.dto.AlumnoCursoDTO;
import com.inscribeme.inscripciones.dto.InscripcionDTO;
import com.inscribeme.inscripciones.model.Inscripcion;
import com.inscribeme.inscripciones.repository.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final RestTemplate restTemplate;

    public List<Inscripcion> obtenerTodas() {
        return inscripcionRepository.findAll();
    }

    public Optional<Inscripcion> obtenerPorId(Long id) {
        return inscripcionRepository.findById(id);
    }

    public Inscripcion crear(Inscripcion inscripcion) {
        if (inscripcionRepository.existsByUsuarioIdAndCursoId(
                inscripcion.getUsuarioId(), inscripcion.getCursoId())) {
            throw new IllegalStateException(
                "El usuario ya está inscrito en este curso.");
        }
        
        try {
            restTemplate.put("http://SERVICIO-CURSOS/api/cursos/" + inscripcion.getCursoId() + "/decrementar-cupo", null);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo completar la inscripción: " + e.getMessage());
        }
        
        return inscripcionRepository.save(inscripcion);
    }

    public Inscripcion actualizar(Long id, Inscripcion inscripcion) {
        return inscripcionRepository.findById(id).map(i -> {
            i.setEstado(inscripcion.getEstado());
            i.setFechaInscripcion(inscripcion.getFechaInscripcion());
            return inscripcionRepository.save(i);
        }).orElseThrow(() -> new RuntimeException("Inscripcion no encontrada: " + id));
    }

    public void eliminar(Long id) {
        inscripcionRepository.findById(id).ifPresent(i -> {
            try {
                restTemplate.put("http://SERVICIO-CURSOS/api/cursos/" + i.getCursoId() + "/incrementar-cupo", null);
            } catch (Exception e) {
                // Silently log or ignore to prevent blocking deletion
            }
            inscripcionRepository.delete(i);
        });
    }

    public List<InscripcionDTO> obtenerInscripcionesPorUsuario(Long usuarioId) {
        return inscripcionRepository.findByUsuarioId(usuarioId).stream()
                .map(i -> InscripcionDTO.builder()
                        .cursoId(i.getCursoId())
                        .nombreCurso(i.getNombreCurso())
                        .descripcionCurso(i.getDescripcionCurso())
                        .fechaInicioCurso(i.getFechaInicioCurso())
                        .fechaFinCurso(i.getFechaFinCurso())
                        .fechaInscripcion(i.getFechaInscripcion())
                        .estado(i.getEstado())
                        .nombreInstructor(i.getNombreInstructor())
                        .build())
                .collect(Collectors.toList());
    }

    public List<AlumnoCursoDTO> obtenerAlumnosPorCurso(Long cursoId) {
        return inscripcionRepository.findByCursoId(cursoId).stream()
                .map(i -> AlumnoCursoDTO.builder()
                        .usuarioId(i.getUsuarioId())
                        .nombreUsuario(i.getNombreUsuario() != null ? i.getNombreUsuario() : "Alumno #" + i.getUsuarioId())
                        .cursoId(i.getCursoId())
                        .nombreCurso(i.getNombreCurso())
                        .fechaInscripcion(i.getFechaInscripcion() != null ? i.getFechaInscripcion().toString() : "")
                        .estado(i.getEstado() != null ? i.getEstado().name() : "INSCRITO")
                        .build())
                .collect(Collectors.toList());
    }
}
