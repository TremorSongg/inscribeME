package com.example.inscribeMe.Service;

import com.example.inscribeMe.DTO.NotificacionDTO;
import com.example.inscribeMe.Model.Curso;
import com.example.inscribeMe.Model.Inscripcion;
import com.example.inscribeMe.Model.Notificacion;
import com.example.inscribeMe.Model.Usuario;
import com.example.inscribeMe.Repository.InscripcionRepository;
import com.example.inscribeMe.Repository.NotificacionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final InscripcionRepository inscripcionRepository;

    /**
     * Genera y obtiene notificaciones como DTOs para un usuario específico.
     */
    public List<NotificacionDTO> generarYObtenerNotificaciones(Long usuarioId) {
        List<Inscripcion> inscripciones = inscripcionRepository.findByUsuarioId(usuarioId);
        LocalDate hoy = LocalDate.now();

        for (Inscripcion inscripcion : inscripciones) {
            Curso curso = inscripcion.getCurso();

            if (curso.getFechaInicio() != null && curso.getFechaInicio().equals(hoy.plusDays(1))) {
                String msg = "¡Atención! Tu curso '" + curso.getNombre() + "' comienza mañana.";
                if (!notificacionRepository.existsByUsuarioIdAndMensajeAndFechaAfter(usuarioId, msg, LocalDateTime.now().minusHours(23))) {
                    crearNotificacionParaUsuario(inscripcion.getUsuario(), msg);
                }
            }

            if (curso.getFechaFin() != null && curso.getFechaFin().equals(hoy.plusDays(1))) {
                String msg = "¡Ya casi! Tu curso '" + curso.getNombre() + "' finaliza mañana.";
                if (!notificacionRepository.existsByUsuarioIdAndMensajeAndFechaAfter(usuarioId, msg, LocalDateTime.now().minusHours(23))) {
                    crearNotificacionParaUsuario(inscripcion.getUsuario(), msg);
                }
            }
        }
        
        // ▼▼▼ CAMBIO PRINCIPAL: Convertimos las entidades a DTOs ▼▼▼
        return notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(notificacion -> NotificacionDTO.builder()
                        .id(notificacion.getId())
                        .mensaje(notificacion.getMensaje())
                        .fecha(notificacion.getFecha().toString()) // Convertimos la fecha a un String estándar
                        .leido(notificacion.isLeido())
                        .build())
                .collect(Collectors.toList());
    }
    
    public Notificacion crearNotificacionParaUsuario(Usuario usuario, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setMensaje(mensaje);
        notificacion.setFecha(LocalDateTime.now());
        notificacion.setLeido(false);
        return notificacionRepository.save(notificacion);
    }
    
    // --- Resto de métodos CRUD (se mantienen igual) ---

    public List<Notificacion> obtenerTodos() {
        return notificacionRepository.findAll();
    }

    public Optional<Notificacion> obtenerPorId(Long id) {
        return notificacionRepository.findById(id);
    }
    
    public Notificacion crear(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public Notificacion actualizar(Long id, Notificacion notificacionDetails) {
        Notificacion notificacionExistente = notificacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notificación no encontrada con id: " + id));

        notificacionExistente.setLeido(notificacionDetails.isLeido());
        return notificacionRepository.save(notificacionExistente);
    }

    public void eliminar(Long id) {
        notificacionRepository.deleteById(id);
    }
}