package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.CursoDTO;
import com.example.inscribeMe.Model.Curso;
import com.example.inscribeMe.Service.CursoService;
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
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "*")
@Tag(name = "Catálogo de Cursos", description = "Operaciones para gestionar la oferta académica y detalles de los cursos")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    @Operation(summary = "Listar cursos (formato DTO)", description = "Obtiene la lista de cursos optimizada para la vista del catálogo (sin datos sensibles o innecesarios)")
    @ApiResponse(responseCode = "200", description = "Lista de cursos obtenida correctamente", 
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = CursoDTO.class))))
    @GetMapping
    public List<CursoDTO> listar() {
        return cursoService.obtenerTodosComoDTO();
    }

    @Operation(summary = "Obtener detalle del curso", description = "Busca la entidad completa de un curso por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Detalles del curso encontrados"),
        @ApiResponse(responseCode = "404", description = "El curso con el ID especificado no existe", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtener(
            @Parameter(description = "ID del curso a consultar", example = "1") @PathVariable Long id) {
        return cursoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Registrar un nuevo curso", description = "Crea un nuevo curso en la base de datos")
    @ApiResponse(responseCode = "201", description = "Curso creado exitosamente")
    @PostMapping
    public Curso crear(@RequestBody Curso curso) {
        return cursoService.crear(curso);
    }

    @Operation(summary = "Actualizar información del curso", description = "Permite modificar los datos de un curso existente")
    @PutMapping("/{id}")
    public Curso actualizar(
            @Parameter(description = "ID del curso a modificar") @PathVariable Long id, 
            @RequestBody Curso curso) {
        return cursoService.actualizar(id, curso);
    }

    @Operation(summary = "Dar de baja un curso", description = "Elimina físicamente el curso del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Curso eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "No se pudo eliminar: curso no encontrado")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID del curso a eliminar") @PathVariable Long id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}