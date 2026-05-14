package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.ItemCompra;
import com.example.inscribeMe.Service.ItemCompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itemcompra")
@CrossOrigin(origins = "*")
@Tag(name = "Detalles de Facturación (Items de Compra)", description = "Operaciones sobre los desgloses individuales de las compras realizadas")
public class ItemCompraController {

    private final ItemCompraService itemCompraService;

    public ItemCompraController(ItemCompraService itemCompraService) {
        this.itemCompraService = itemCompraService;
    }

    @Operation(summary = "Listar todos los desgloses de compra", description = "Retorna una lista global de todos los productos/cursos vendidos individualmente")
    @GetMapping
    public List<ItemCompra> listar() {
        return itemCompraService.obtenerTodos();
    }

    @Operation(summary = "Obtener detalle por ID", description = "Busca la información de un ítem de compra específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Detalle encontrado"),
        @ApiResponse(responseCode = "404", description = "No existe el detalle de compra con ese ID", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ItemCompra> obtener(
            @Parameter(description = "ID del ítem de compra", example = "1001") @PathVariable Long id) {
        return itemCompraService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Registrar ítem de compra", description = "Crea un nuevo registro de ítem de compra (Generalmente usado por el proceso de checkout)")
    @ApiResponse(responseCode = "201", description = "Ítem de compra registrado")
    @PostMapping
    public ItemCompra crear(@RequestBody ItemCompra itemCompra) {
        return itemCompraService.crear(itemCompra);
    }

    @Operation(summary = "Actualizar ítem de compra", description = "Modifica un registro de ítem de compra existente (Uso restringido para correcciones)")
    @PutMapping("/{id}")
    public ItemCompra actualizar(
            @Parameter(description = "ID del ítem a modificar") @PathVariable Long id, 
            @RequestBody ItemCompra itemCompra) {
        return itemCompraService.actualizar(id, itemCompra);
    }

    @Operation(summary = "Eliminar ítem de compra", description = "Borra el registro de un ítem de compra del sistema")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Registro eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "El registro no existe")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID del ítem a eliminar") @PathVariable Long id) {
        itemCompraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}