package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Notificacion;
import com.example.inscribeMe.Repository.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    public List<Notificacion> obtenerTodos() {
        return notificacionRepository.findAll();
    }

    public Optional<Notificacion> obtenerPorId(Long id) {
        return notificacionRepository.findById(id);
    }

    public List<Notificacion> obtenerPorUsuarioId(Long usuarioId) {
        return notificacionRepository.findByUsuarioId(usuarioId);
    }

    public Notificacion crear(Notificacion notificacion) {
        return notificacionRepository.save(notificacion);
    }

    public Notificacion actualizar(Long id, Notificacion notificacion) {
        notificacion.setId(id);
        return notificacionRepository.save(notificacion);
    }

    public void eliminar(Long id) {
        notificacionRepository.deleteById(id);
    }
}
