package com.inscribeme.carrito.controller;

import com.inscribeme.carrito.dto.CarritoDTO;
import com.inscribeme.carrito.model.Compra;
import com.inscribeme.carrito.service.CarritoService;
import io.swagger.v3.oas.annotations.Operation;
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
@Tag(name = "Carrito de Compras", description = "Gestión del carrito y proceso de compra de cursos")
public class CarritoController {

    private final CarritoService carritoService;

    @Operation(summary = "Obtener carrito del usuario")
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<CarritoDTO> getCarrito(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(carritoService.obtenerContenido(usuarioId));
    }

    @Operation(summary = "Agregar curso al carrito",
               description = "Payload: {usuarioId, cursoId, nombreCurso, precio}")
    @PostMapping("/agregar")
    public ResponseEntity<?> agregarCurso(@RequestBody Map<String, Object> payload) {
        try {
            Long usuarioId = Long.parseLong(payload.get("usuarioId").toString());
            Long cursoId   = Long.parseLong(payload.get("cursoId").toString());
            String nombre  = payload.get("nombreCurso").toString();
            double precio  = Double.parseDouble(payload.get("precio").toString());
            carritoService.agregarCurso(usuarioId, cursoId, nombre, precio);
            return ResponseEntity.ok(Map.of("message", "Curso agregado al carrito exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Eliminar curso del carrito")
    @DeleteMapping("/item/{cursoId}")
    public ResponseEntity<?> eliminarItem(
            @PathVariable Long cursoId,
            @RequestParam Long usuarioId) {
        try {
            carritoService.eliminarItem(usuarioId, cursoId);
            return ResponseEntity.ok(Map.of("message", "Item eliminado del carrito"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Vaciar carrito")
    @DeleteMapping("/vaciar")
    public ResponseEntity<?> vaciar(@RequestParam Long usuarioId) {
        try {
            carritoService.vaciarCarrito(usuarioId);
            return ResponseEntity.ok(Map.of("message", "Carrito vaciado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Checkout - Finalizar compra")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Compra realizada",
                     content = @Content(schema = @Schema(implementation = Compra.class))),
        @ApiResponse(responseCode = "400", description = "Error (carrito vacío o similar)")
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
