package com.inscribeme.notificaciones.service;

import com.inscribeme.notificaciones.dto.NotificacionDTO;
import com.inscribeme.notificaciones.model.Notificacion;
import com.inscribeme.notificaciones.repository.NotificacionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public List<Notificacion> obtenerTodos() {
        return notificacionRepository.findAll();
    }

    public Optional<Notificacion> obtenerPorId(Long id) {
        return notificacionRepository.findById(id);
    }

    public List<NotificacionDTO> obtenerPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(n -> NotificacionDTO.builder()
                        .id(n.getId())
                        .mensaje(n.getMensaje())
                        .fecha(n.getFecha() != null ? n.getFecha().toString() : LocalDateTime.now().toString())
                        .leido(n.isLeido())
                        .build())
                .collect(Collectors.toList());
    }

    public Notificacion crear(Long usuarioId, String mensaje) {
        try {
            if (notificacionRepository.existsByUsuarioIdAndMensajeAndFechaAfter(
                    usuarioId, mensaje, LocalDateTime.now().minusHours(23))) {
                return null;
            }
        } catch (Exception ignored) {
            // Si falla la verificación de duplicados, continuamos con la creación
        }
        Notificacion n = Notificacion.builder()
                .usuarioId(usuarioId)
                .mensaje(mensaje)
                .fecha(LocalDateTime.now())
                .leido(false)
                .build();
        return notificacionRepository.save(n);
    }

    public Notificacion crearDirecta(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public Notificacion actualizar(Long id, Notificacion datos) {
        Notificacion n = notificacionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notificación no encontrada: " + id));
        n.setLeido(datos.isLeido());
        return notificacionRepository.save(n);
    }

    public void eliminar(Long id) {
        notificacionRepository.deleteById(id);
    }
}
