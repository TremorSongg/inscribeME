package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.NotificacionDTO;
import com.example.inscribeMe.Model.Notificacion;
import com.example.inscribeMe.Service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    
    @GetMapping
    public List<Notificacion> listar() {
        return notificacionService.obtenerTodos();
    }

    
    @GetMapping("/{id}")
    public ResponseEntity<Notificacion> obtener(@PathVariable Long id) {
        return notificacionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @GetMapping("/usuario/{usuarioId}")
    public List<NotificacionDTO> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return notificacionService.generarYObtenerNotificaciones(usuarioId);
    }

    
    @PostMapping
    public Notificacion crear(@RequestBody Notificacion notificacion) {
        return notificacionService.crear(notificacion);
    }

    
    @PutMapping("/{id}")
    public Notificacion actualizar(@PathVariable Long id, @RequestBody Notificacion notificacion) {
        return notificacionService.actualizar(id, notificacion);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
