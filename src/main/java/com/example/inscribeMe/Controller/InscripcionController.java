package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Inscripcion;
import com.example.inscribeMe.Service.InscripcionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscripciones")
@CrossOrigin(origins = "*")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    @GetMapping
    public List<Inscripcion> listar() {
        return inscripcionService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscripcion> obtener(@PathVariable Long id) {
        return inscripcionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Inscripcion crear(@RequestBody Inscripcion inscripcion) {
        return inscripcionService.crear(inscripcion);
    }

    @PutMapping("/{id}")
    public Inscripcion actualizar(@PathVariable Long id, @RequestBody Inscripcion inscripcion) {
        return inscripcionService.actualizar(id, inscripcion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        inscripcionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
