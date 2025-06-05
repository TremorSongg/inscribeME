package com.example.inscribeMe.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.inscribeMe.Model.Notificacion;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioId (Long usuarioId);
}
