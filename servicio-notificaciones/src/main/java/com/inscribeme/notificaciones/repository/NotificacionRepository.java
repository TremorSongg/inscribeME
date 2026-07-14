package com.inscribeme.notificaciones.repository;

import com.inscribeme.notificaciones.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
    boolean existsByUsuarioIdAndMensajeAndFechaAfter(Long usuarioId, String mensaje, LocalDateTime fecha);

    void deleteByUsuarioId(Long usuarioId);
}
