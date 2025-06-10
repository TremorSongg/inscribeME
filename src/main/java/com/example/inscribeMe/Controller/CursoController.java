package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.CursoDTO;
import com.example.inscribeMe.Model.Curso;
import com.example.inscribeMe.Service.CursoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*") // Por si usás frontend aparte
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @GetMapping
    public List<CursoDTO> listar() {
        return cursoService.obtenerTodosComoDTO();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtener(@PathVariable Long id) {
        return cursoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Curso crear(@RequestBody Curso curso) {
        return cursoService.crear(curso);
    }

    @PutMapping("/{id}")
    public Curso actualizar(@PathVariable Long id, @RequestBody Curso curso) {
        return cursoService.actualizar(id, curso);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    
}
