package com.inscribeme.notificaciones.controller;

import com.inscribeme.notificaciones.dto.NotificacionDTO;
import com.inscribeme.notificaciones.model.Notificacion;
import com.inscribeme.notificaciones.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Sistema de Notificaciones", description = "Gestión de alertas y mensajes a los usuarios")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @Operation(summary = "Listar todas las notificaciones")
    @GetMapping
    public List<Notificacion> listar() {
        return notificacionService.obtenerTodos();
    }

    @Operation(summary = "Obtener notificación por ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Encontrada"),
        @ApiResponse(responseCode = "404", description = "No encontrada", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Notificacion> obtener(@PathVariable Long id) {
        return notificacionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Notificaciones de un usuario")
    @GetMapping("/usuario/{usuarioId}")
    public List<NotificacionDTO> obtenerPorUsuario(
            @Parameter(description = "ID del usuario", example = "1") @PathVariable Long usuarioId) {
        return notificacionService.obtenerPorUsuario(usuarioId);
    }

    @Operation(summary = "Crear notificación manual",
               description = "Payload: {usuarioId, mensaje}")
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> payload) {
        Long usuarioId = Long.parseLong(payload.get("usuarioId").toString());
        String mensaje = payload.get("mensaje").toString();
        Notificacion n = notificacionService.crear(usuarioId, mensaje);
        return ResponseEntity.ok(n);
    }

    @Operation(summary = "Actualizar estado (leído)")
    @PutMapping("/{id}")
    public ResponseEntity<Notificacion> actualizar(
            @PathVariable Long id,
            @RequestBody Notificacion notificacion) {
        return ResponseEntity.ok(notificacionService.actualizar(id, notificacion));
    }

    @Operation(summary = "Eliminar notificación")
    @ApiResponse(responseCode = "204", description = "Eliminada")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
