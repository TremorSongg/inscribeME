package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.NotificacionDTO;
import com.example.inscribeMe.Model.Notificacion;
import com.example.inscribeMe.Service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
@Tag(name = "Sistema de Notificaciones", description = "Gestión de alertas y mensajes informativos para los usuarios")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @Operation(summary = "Listar todas las notificaciones", description = "Obtiene un histórico global de todas las notificaciones enviadas en el sistema")
    @GetMapping
    public List<Notificacion> listar() {
        return notificacionService.obtenerTodos();
    }

    @Operation(summary = "Obtener notificación por ID", description = "Recupera los detalles de una notificación específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notificación encontrada"),
        @ApiResponse(responseCode = "404", description = "ID de notificación no válido o inexistente", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Notificacion> obtener(
            @Parameter(description = "ID único de la notificación") @PathVariable Long id) {
        return notificacionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(
        summary = "Obtener notificaciones del usuario", 
        description = "Genera nuevas alertas pendientes y devuelve la lista completa de notificaciones para un usuario específico"
    )
    @ApiResponse(responseCode = "200", description = "Lista de notificaciones (DTO) recuperada con éxito",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = NotificacionDTO.class))))
    @GetMapping("/usuario/{usuarioId}")
    public List<NotificacionDTO> obtenerPorUsuario(
            @Parameter(description = "ID del usuario para procesar sus notificaciones", example = "1") @PathVariable Long usuarioId) {
        return notificacionService.generarYObtenerNotificaciones(usuarioId);
    }

    @Operation(summary = "Enviar notificación manual", description = "Crea y envía una notificación personalizada a un usuario")
    @ApiResponse(responseCode = "201", description = "Notificación creada correctamente")
    @PostMapping
    public Notificacion crear(@RequestBody Notificacion notificacion) {
        return notificacionService.crear(notificacion);
    }

    @Operation(summary = "Actualizar estado de notificación", description = "Permite marcar una notificación como leída o modificar su contenido")
    @PutMapping("/{id}")
    public Notificacion actualizar(
            @Parameter(description = "ID de la notificación a modificar") @PathVariable Long id, 
            @RequestBody Notificacion notificacion) {
        return notificacionService.actualizar(id, notificacion);
    }

    @Operation(summary = "Eliminar notificación", description = "Borra permanentemente una notificación del registro")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notificación eliminada"),
        @ApiResponse(responseCode = "404", description = "No se pudo eliminar: la notificación no existe")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID de la notificación a borrar") @PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}