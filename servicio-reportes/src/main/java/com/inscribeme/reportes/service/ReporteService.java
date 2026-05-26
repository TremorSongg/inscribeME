package com.inscribeme.reportes.service;

import com.inscribeme.reportes.model.EstadoReporte;
import com.inscribeme.reportes.model.Reporte;
import com.inscribeme.reportes.repository.ReporteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final ReporteRepository reporteRepository;

    @Transactional
    public Reporte crearReporte(Long usuarioId, String nombreUsuario, String mensaje) {
        Reporte reporte = Reporte.builder()
                .usuarioId(usuarioId)
                .nombreUsuario(nombreUsuario)
                .mensaje(mensaje)
                .fechaCreacion(LocalDateTime.now())
                .estado(EstadoReporte.PENDIENTE)
                .build();
        return reporteRepository.save(reporte);
    }

    public List<Reporte> obtenerTodos() {
        return reporteRepository.findAll();
    }

    public Optional<Reporte> obtenerPorId(Long id) {
        return reporteRepository.findById(id);
    }

    public List<Reporte> obtenerPorUsuario(Long usuarioId) {
        return reporteRepository.findByUsuarioId(usuarioId);
    }

    @Transactional
    public Reporte actualizarEstado(Long id, EstadoReporte estado) {
        return reporteRepository.findById(id).map(r -> {
            r.setEstado(estado);
            return reporteRepository.save(r);
        }).orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + id));
    }
}
