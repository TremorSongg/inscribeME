package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioId(Long usuarioId);

    // Ordena las notificaciones por fecha descendente
    List<Notificacion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    // Revisa si ya existe una notificación similar reciente para no duplicar
    boolean existsByUsuarioIdAndMensajeAndFechaAfter(Long usuarioId, String mensaje, LocalDateTime fecha);
}
