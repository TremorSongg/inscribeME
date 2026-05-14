package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.ItemCarrito;
import com.example.inscribeMe.Service.ItemCarritoService;
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
@RequestMapping("/api/itemcarrito")
@CrossOrigin(origins = "*")
@Tag(name = "Items del Carrito", description = "Operaciones granulares sobre los elementos individuales dentro de los carritos de compra")
public class ItemCarritoController {

    private final ItemCarritoService itemCarritoService;

    public ItemCarritoController(ItemCarritoService itemCarritoService) {
        this.itemCarritoService = itemCarritoService;
    }

    @Operation(summary = "Listar todos los ítems", description = "Obtiene una lista global de todos los ítems que se encuentran actualmente en cualquier carrito")
    @GetMapping
    public List<ItemCarrito> listar() {
        return itemCarritoService.obtenerTodos();
    }

    @Operation(summary = "Obtener un ítem específico", description = "Recupera la información detallada de un ítem del carrito mediante su ID único")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Ítem encontrado con éxito"),
        @ApiResponse(responseCode = "404", description = "No se encontró el ítem solicitado", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<ItemCarrito> obtener(
            @Parameter(description = "ID del ítem del carrito", example = "501") @PathVariable Long id) {
        return itemCarritoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Crear un ítem manualmente", description = "Añade un ítem directamente a la base de datos (Uso técnico o administrativo)")
    @ApiResponse(responseCode = "201", description = "Ítem creado correctamente")
    @PostMapping
    public ItemCarrito crear(@RequestBody ItemCarrito itemCarrito) {
        return itemCarritoService.crear(itemCarrito);
    }

    @Operation(summary = "Actualizar un ítem", description = "Modifica las propiedades de un ítem existente (ej. cambiar el curso asociado o el carrito)")
    @PutMapping("/{id}")
    public ItemCarrito actualizar(
            @Parameter(description = "ID del ítem a modificar") @PathVariable Long id, 
            @RequestBody ItemCarrito itemCarrito) {
        return itemCarritoService.actualizar(id, itemCarrito);
    }

    @Operation(summary = "Eliminar un ítem", description = "Borra definitivamente un ítem de un carrito")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Ítem eliminado con éxito"),
        @ApiResponse(responseCode = "404", description = "No se pudo eliminar: el ítem no existe")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID del ítem a eliminar") @PathVariable Long id) {
        itemCarritoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}