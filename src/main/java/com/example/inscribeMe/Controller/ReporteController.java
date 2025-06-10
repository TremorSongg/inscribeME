package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Reporte;
import com.example.inscribeMe.Service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @PostMapping("/crear")
    public ResponseEntity<Reporte> crear(@RequestBody Map<String, Object> payload) {
        Long usuarioId = Long.parseLong(payload.get("usuarioId").toString());
        String mensaje = payload.get("mensaje").toString();
        Reporte reporte = reporteService.crearReporte(usuarioId, mensaje);
        return ResponseEntity.ok(reporte);
    }
}