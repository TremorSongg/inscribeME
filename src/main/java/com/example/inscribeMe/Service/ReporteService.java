package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.*;
import com.example.inscribeMe.Repository.ReporteRepository;
import com.example.inscribeMe.Repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final ReporteRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;
    
    
    private final NotificacionService notificacionService;
    

    @Transactional
    public Reporte crearReporte(Long usuarioId, String mensaje) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Reporte reporte = new Reporte();
        reporte.setUsuario(usuario);
        reporte.setMensaje(mensaje);
        reporte.setFechaCreacion(LocalDateTime.now());
        reporte.setEstado(EstadoReporte.PENDIENTE);

        Reporte reporteGuardado = reporteRepository.save(reporte);

        // Notificación para el usuario
        String msgUsuario = "Hemos recibido tu reporte #" + reporteGuardado.getId() + ". Lo revisaremos pronto.";
        notificacionService.crearNotificacionParaUsuario(usuario, msgUsuario);

        // Notificación para un admin (asumimos que el admin tiene ID 1)
        usuarioRepository.findById(1L).ifPresent(admin -> {
            String msgAdmin = "Nuevo reporte #" + reporteGuardado.getId() + " del usuario " + usuario.getNombre() + ".";
            notificacionService.crearNotificacionParaUsuario(admin, msgAdmin);
        });

        return reporteGuardado;
    }
}