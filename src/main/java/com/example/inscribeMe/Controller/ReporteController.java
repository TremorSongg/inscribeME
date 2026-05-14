package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Reporte;
import com.example.inscribeMe.Service.ReporteService;
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

import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Reportes y Soporte", description = "Endpoints para que los usuarios envíen comentarios, fallos o sugerencias")
public class ReporteController {

    private final ReporteService reporteService;

    @Operation(
        summary = "Crear un nuevo reporte", 
        description = "Permite a un usuario enviar un mensaje de soporte o reporte técnico."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Reporte creado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Estructura del reporte",
        required = true,
        content = @Content(
            mediaType = "application/json",
            schema = @Schema(type = "object", example = "{\"usuarioId\": 1, \"mensaje\": \"El curso de Java no carga el video 3\"}"),
            examples = @ExampleObject(
                value = "{ \"usuarioId\": 1, \"mensaje\": \"Descripción del problema aquí\" }"
            )
        )
    )
    @PostMapping("/crear")
    public ResponseEntity<Reporte> crear(@RequestBody Map<String, Object> payload) {
        Long usuarioId = Long.parseLong(payload.get("usuarioId").toString());
        String mensaje = payload.get("mensaje").toString();
        Reporte reporte = reporteService.crearReporte(usuarioId, mensaje);
        return ResponseEntity.ok(reporte);
    }
}