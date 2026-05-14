package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Compra;
import com.example.inscribeMe.Service.CompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
@Tag(name = "Gestión de Compras", description = "Operaciones de administración y consulta de historial de compras")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @Operation(summary = "Listar todas las compras", description = "Obtiene un listado completo de todas las transacciones realizadas en el sistema")
    @GetMapping
    public List<Compra> listar() {
        return compraService.obtenerTodas();
    }

    @Operation(summary = "Obtener compra por ID", description = "Busca los detalles de una compra específica mediante su identificador")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compra encontrada"),
        @ApiResponse(responseCode = "404", description = "La compra solicitada no existe", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<Compra> obtener(
            @Parameter(description = "ID único de la compra") @PathVariable Long id) {
        return compraService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear nueva compra", description = "Registra manualmente una compra en el sistema")
    @ApiResponse(responseCode = "201", description = "Compra creada con éxito")
    @PostMapping
    public Compra crear(@RequestBody Compra compra) {
        return compraService.crear(compra);
    }

    @Operation(summary = "Actualizar compra", description = "Modifica los datos de una compra existente")
    @PutMapping("/{id}")
    public Compra actualizar(
            @Parameter(description = "ID de la compra a modificar") @PathVariable Long id, 
            @RequestBody Compra compra) {
        return compraService.actualizar(id, compra);
    }

    @Operation(summary = "Eliminar compra", description = "Borra el registro de una compra del sistema de forma permanente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Compra eliminada con éxito"),
        @ApiResponse(responseCode = "404", description = "No se pudo eliminar: Compra no encontrada")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID de la compra a eliminar") @PathVariable Long id) {
        compraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}