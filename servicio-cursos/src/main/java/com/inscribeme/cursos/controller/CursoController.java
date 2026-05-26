package com.inscribeme.cursos.controller;

import com.inscribeme.cursos.dto.CursoDTO;
import com.inscribeme.cursos.model.Curso;
import com.inscribeme.cursos.service.CursoService;
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

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Catálogo de Cursos", description = "Operaciones para gestionar la oferta académica")
public class CursoController {

    private final CursoService cursoService;

    @Operation(summary = "Listar cursos (DTO)", description = "Catálogo completo de cursos disponibles")
    @GetMapping
    public List<CursoDTO> listar() {
        return cursoService.obtenerTodosComoDTO();
    }

    @Operation(summary = "Obtener detalle del curso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Curso encontrado"),
        @ApiResponse(responseCode = "404", description = "Curso no encontrado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtener(
            @Parameter(description = "ID del curso", example = "1") @PathVariable Long id) {
        return cursoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear curso", description = "Registra un nuevo curso (requiere JWT con rol INSTRUCTOR o ADMIN)")
    @PostMapping
    public ResponseEntity<Curso> crear(@RequestBody Curso curso) {
        return ResponseEntity.ok(cursoService.crear(curso));
    }

    @Operation(summary = "Actualizar curso")
    @PutMapping("/{id}")
    public ResponseEntity<Curso> actualizar(
            @Parameter(description = "ID del curso") @PathVariable Long id,
            @RequestBody Curso curso) {
        return ResponseEntity.ok(cursoService.actualizar(id, curso));
    }

    @Operation(summary = "Eliminar curso")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "No encontrado", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID del curso") @PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
