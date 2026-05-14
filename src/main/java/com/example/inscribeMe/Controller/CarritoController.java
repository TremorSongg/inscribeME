package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.CarritoDTO;
import com.example.inscribeMe.Model.Compra;
import com.example.inscribeMe.Service.CarritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
// @Tag agrupa los endpoints en la interfaz de Swagger
@Tag(name = "Carrito de Compras", description = "Endpoints para gestionar el carrito y realizar compras")
public class CarritoController {

    private final CarritoService carritoService;

    @Operation(summary = "Obtener carrito", description = "Recupera todos los cursos añadidos al carrito de un usuario específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carrito encontrado con éxito"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content)
    })
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<CarritoDTO> getCarritoByUsuarioId(
            @Parameter(description = "ID del usuario propietario del carrito") @PathVariable Long usuarioId) {
        CarritoDTO carritoDTO = carritoService.obtenerContenidoCarrito(usuarioId);
        return ResponseEntity.ok(carritoDTO);
    }

    @Operation(summary = "Agregar curso", description = "Añade un nuevo curso al carrito mediante el ID del usuario y del curso")
    @PostMapping("/agregar")
    public ResponseEntity<?> addItemToCart(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Mapa con usuarioId y cursoId") 
            @RequestBody Map<String, Long> payload) {
        Long usuarioId = payload.get("usuarioId");
        Long cursoId = payload.get("cursoId");
        try {
            carritoService.agregarCursoAlCarrito(usuarioId, cursoId);
            return ResponseEntity.ok().body(Map.of("message", "Curso agregado al carrito exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Eliminar item", description = "Quita un curso específico del carrito de un usuario")
    @DeleteMapping("/item/{cursoId}")
    public ResponseEntity<?> removeItemFromCart(
            @PathVariable Long cursoId, 
            @RequestParam Long usuarioId) {
         try {
            carritoService.eliminarItemDelCarrito(usuarioId, cursoId);
            return ResponseEntity.ok().body(Map.of("message", "Item eliminado del carrito"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Vaciar carrito", description = "Elimina todos los productos del carrito del usuario")
    @DeleteMapping("/vaciar")
    public ResponseEntity<?> clearCart(@RequestParam Long usuarioId) {
        try {
            carritoService.vaciarCarrito(usuarioId);
            return ResponseEntity.ok().body(Map.of("message", "El carrito ha sido vaciado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Checkout / Finalizar compra", description = "Procesa la compra de todos los items en el carrito y genera un registro de Compra")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compra realizada con éxito", 
                     content = @Content(schema = @Schema(implementation = Compra.class))),
        @ApiResponse(responseCode = "400", description = "Error en el proceso de compra (ej. Carrito vacío)")
    })
    @PostMapping("/comprar")
    public ResponseEntity<?> checkout(@RequestParam Long usuarioId) {
        try {
            Compra compra = carritoService.realizarCompra(usuarioId);
            return ResponseEntity.ok(compra);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}