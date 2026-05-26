package com.inscribeme.reportes.controller;

import com.inscribeme.reportes.model.EstadoReporte;
import com.inscribeme.reportes.model.Reporte;
import com.inscribeme.reportes.service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Reportes y Soporte", description = "Envío de comentarios, fallos y sugerencias")
public class ReporteController {

    private final ReporteService reporteService;

    @Operation(
        summary = "Crear reporte",
        description = "Payload: {usuarioId, nombreUsuario, mensaje}"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte creado"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        content = @Content(
            mediaType = "application/json",
            examples = @ExampleObject(
                value = "{ \"usuarioId\": 1, \"nombreUsuario\": \"Juan\", \"mensaje\": \"El video no carga\" }"
            )
        )
    )
    @PostMapping("/crear")
    public ResponseEntity<Reporte> crear(@RequestBody Map<String, Object> payload) {
        Long usuarioId     = Long.parseLong(payload.get("usuarioId").toString());
        String nombre      = payload.getOrDefault("nombreUsuario", "Anónimo").toString();
        String mensaje     = payload.get("mensaje").toString();
        return ResponseEntity.ok(reporteService.crearReporte(usuarioId, nombre, mensaje));
    }

    @Operation(summary = "Listar todos los reportes")
    @GetMapping
    public List<Reporte> listar() {
        return reporteService.obtenerTodos();
    }

    @Operation(summary = "Reportes de un usuario")
    @GetMapping("/usuario/{usuarioId}")
    public List<Reporte> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return reporteService.obtenerPorUsuario(usuarioId);
    }

    @Operation(summary = "Actualizar estado del reporte (admin)")
    @PutMapping("/{id}/estado")
    public ResponseEntity<Reporte> actualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoReporte estado) {
        return ResponseEntity.ok(reporteService.actualizarEstado(id, estado));
    }
}
