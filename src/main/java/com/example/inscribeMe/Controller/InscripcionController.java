package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.InscripcionDTO;
import com.example.inscribeMe.Model.Inscripcion;
import com.example.inscribeMe.Service.InscripcionService;
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
@RequestMapping("/api/inscripciones")
@CrossOrigin(origins = "*")
@Tag(name = "Gestión de Inscripciones", description = "Endpoints para matricular alumnos en cursos y consultar su historial académico")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    @Operation(summary = "Listar todas las inscripciones", description = "Retorna el historial global de todas las matriculaciones (Uso administrativo)")
    @GetMapping
    public List<Inscripcion> listar() {
        return inscripcionService.obtenerTodas();
    }

    @Operation(summary = "Consultar inscripción por ID", description = "Obtiene los detalles específicos de una matrícula individual")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Inscripción encontrada"),
        @ApiResponse(responseCode = "404", description = "No existe una inscripción con ese ID", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Inscripcion> obtener(
            @Parameter(description = "ID único de la inscripción") @PathVariable Long id) {
        return inscripcionService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear nueva inscripción", description = "Registra manualmente a un usuario en un curso")
    @ApiResponse(responseCode = "201", description = "Inscripción creada con éxito")
    @PostMapping
    public Inscripcion crear(@RequestBody Inscripcion inscripcion) {
        return inscripcionService.crear(inscripcion);
    }

    @Operation(summary = "Actualizar inscripción", description = "Modifica los datos (como fecha o estado) de una inscripción existente")
    @PutMapping("/{id}")
    public Inscripcion actualizar(
            @Parameter(description = "ID de la inscripción a modificar") @PathVariable Long id, 
            @RequestBody Inscripcion inscripcion) {
        return inscripcionService.actualizar(id, inscripcion);
    }

    @Operation(summary = "Anular inscripción", description = "Elimina el registro de una matrícula")
    @ApiResponse(responseCode = "204", description = "Inscripción eliminada correctamente")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        inscripcionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Listar inscripciones de un usuario", description = "Obtiene todos los cursos en los que está matriculado un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de inscripciones encontrada", 
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = InscripcionDTO.class)))),
        @ApiResponse(responseCode = "204", description = "El usuario no tiene inscripciones activas", content = @Content)
    })
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<InscripcionDTO>> getInscripcionesPorUsuario(
            @Parameter(description = "ID del usuario para filtrar sus cursos", example = "10") @PathVariable Long usuarioId) {
        List<InscripcionDTO> inscripciones = inscripcionService.obtenerInscripcionesPorUsuario(usuarioId);
        if (inscripciones.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(inscripciones);
    }
}