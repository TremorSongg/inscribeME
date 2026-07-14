package com.inscribeme.inscripciones.controller;

import com.inscribeme.inscripciones.dto.AlumnoCursoDTO;
import com.inscribeme.inscripciones.dto.AsistenciaDTO;
import com.inscribeme.inscripciones.dto.InscripcionDTO;
import com.inscribeme.inscripciones.model.Asistencia;
import com.inscribeme.inscripciones.model.Inscripcion;
import com.inscribeme.inscripciones.repository.AsistenciaRepository;
import com.inscribeme.inscripciones.service.InscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inscripciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InscripcionController {

    private final InscripcionService inscripcionService;
    private final AsistenciaRepository asistenciaRepository;

    // ── INSCRIPCIONES ──────────────────────────────────────────────

    @GetMapping
    public List<Inscripcion> listar() {
        return inscripcionService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscripcion> obtener(@PathVariable Long id) {
        return inscripcionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Inscripcion> crear(@RequestBody Inscripcion inscripcion) {
        return ResponseEntity.ok(inscripcionService.crear(inscripcion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inscripcion> actualizar(@PathVariable Long id, @RequestBody Inscripcion inscripcion) {
        return ResponseEntity.ok(inscripcionService.actualizar(id, inscripcion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            inscripcionService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(
                java.util.Map.of("error", e.getMessage(), "message", e.getMessage()));
        }
    }

    /** Eliminar asistencias de un alumno en un curso específico */
    @Transactional
    @DeleteMapping("/asistencia/curso/{cursoId}/usuario/{usuarioId}")
    public ResponseEntity<Void> eliminarAsistenciasPorCursoYUsuario(
            @PathVariable Long cursoId, @PathVariable Long usuarioId) {
        asistenciaRepository.deleteByCursoIdAndUsuarioId(cursoId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /** Inscripciones de un usuario (perfil estudiante) */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<InscripcionDTO>> getPorUsuario(@PathVariable Long usuarioId) {
        List<InscripcionDTO> result = inscripcionService.obtenerInscripcionesPorUsuario(usuarioId);
        // Siempre devolvemos 200 (con array vacío) para evitar crash en el frontend
        return ResponseEntity.ok(result);
    }

    /** Lista de alumnos inscritos en un curso (para instructores y admin) */
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<AlumnoCursoDTO>> getPorCurso(@PathVariable Long cursoId) {
        List<AlumnoCursoDTO> alumnos = inscripcionService.obtenerAlumnosPorCurso(cursoId);
        return ResponseEntity.ok(alumnos);
    }

    // ── ASISTENCIA ─────────────────────────────────────────────────

    /**
     * Registrar o actualizar asistencia de un alumno en una fecha.
     * Si ya existe un registro para (curso, usuario, fecha), lo actualiza (upsert).
     */
    @PostMapping("/asistencia")
    public ResponseEntity<AsistenciaDTO> registrarAsistencia(@RequestBody AsistenciaDTO dto) {
        Asistencia saved = asistenciaRepository
                .findByCursoIdAndUsuarioIdAndFecha(dto.getCursoId(), dto.getUsuarioId(), dto.getFecha())
                .map(existing -> {
                    existing.setPresente(dto.getPresente());
                    existing.setObservacion(dto.getObservacion());
                    return asistenciaRepository.save(existing);
                })
                .orElseGet(() -> asistenciaRepository.save(
                        Asistencia.builder()
                                .cursoId(dto.getCursoId())
                                .usuarioId(dto.getUsuarioId())
                                .nombreUsuario(dto.getNombreUsuario())
                                .nombreCurso(dto.getNombreCurso())
                                .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                                .presente(dto.getPresente())
                                .observacion(dto.getObservacion())
                                .build()
                ));

        return ResponseEntity.ok(toDTO(saved));
    }

    /** Asistencia de un curso en una fecha específica */
    @GetMapping("/asistencia/curso/{cursoId}/fecha/{fecha}")
    public ResponseEntity<List<AsistenciaDTO>> getAsistenciaPorFecha(
            @PathVariable Long cursoId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        List<AsistenciaDTO> result = asistenciaRepository
                .findByCursoIdAndFecha(cursoId, fecha)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Historial completo de asistencia de un curso */
    @GetMapping("/asistencia/curso/{cursoId}")
    public ResponseEntity<List<AsistenciaDTO>> getAsistenciaCurso(@PathVariable Long cursoId) {
        List<AsistenciaDTO> result = asistenciaRepository
                .findByCursoId(cursoId)
                .stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Registrar asistencia en lote para todos los alumnos de una sesión */
    @PostMapping("/asistencia/lote")
    public ResponseEntity<List<AsistenciaDTO>> registrarAsistenciaLote(@RequestBody List<AsistenciaDTO> lista) {
        List<AsistenciaDTO> result = lista.stream().map(dto -> {
            Asistencia saved = asistenciaRepository
                    .findByCursoIdAndUsuarioIdAndFecha(dto.getCursoId(), dto.getUsuarioId(), dto.getFecha())
                    .map(existing -> {
                        existing.setPresente(dto.getPresente());
                        existing.setObservacion(dto.getObservacion());
                        return asistenciaRepository.save(existing);
                    })
                    .orElseGet(() -> asistenciaRepository.save(
                            Asistencia.builder()
                                    .cursoId(dto.getCursoId())
                                    .usuarioId(dto.getUsuarioId())
                                    .nombreUsuario(dto.getNombreUsuario())
                                    .nombreCurso(dto.getNombreCurso())
                                    .fecha(dto.getFecha() != null ? dto.getFecha() : LocalDate.now())
                                    .presente(dto.getPresente())
                                    .observacion(dto.getObservacion())
                                    .build()
                    ));
            return toDTO(saved);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ── Helpers ────────────────────────────────────────────────────

    private AsistenciaDTO toDTO(Asistencia a) {
        return AsistenciaDTO.builder()
                .id(a.getId())
                .cursoId(a.getCursoId())
                .usuarioId(a.getUsuarioId())
                .nombreUsuario(a.getNombreUsuario())
                .nombreCurso(a.getNombreCurso())
                .fecha(a.getFecha())
                .presente(a.getPresente())
                .observacion(a.getObservacion())
                .build();
    }
}
