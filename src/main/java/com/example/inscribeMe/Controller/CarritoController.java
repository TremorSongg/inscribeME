package com.example.inscribeMe.Controller;

import com.example.inscribeMe.DTO.CarritoDTO;
import com.example.inscribeMe.Model.Compra;
import com.example.inscribeMe.Service.CarritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    // Obtener el contenido del carrito de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<CarritoDTO> getCarritoByUsuarioId(@PathVariable Long usuarioId) {
        CarritoDTO carritoDTO = carritoService.obtenerContenidoCarrito(usuarioId);
        return ResponseEntity.ok(carritoDTO);
    }

    // Agregar un curso al carrito
    @PostMapping("/agregar")
    public ResponseEntity<?> addItemToCart(@RequestBody Map<String, Long> payload) {
        Long usuarioId = payload.get("usuarioId");
        Long cursoId = payload.get("cursoId");
        try {
            carritoService.agregarCursoAlCarrito(usuarioId, cursoId);
            return ResponseEntity.ok().body(Map.of("message", "Curso agregado al carrito exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Eliminar un item del carrito
    @DeleteMapping("/item/{cursoId}")
    public ResponseEntity<?> removeItemFromCart(@PathVariable Long cursoId, @RequestParam Long usuarioId) {
         try {
            carritoService.eliminarItemDelCarrito(usuarioId, cursoId);
            return ResponseEntity.ok().body(Map.of("message", "Item eliminado del carrito"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Vaciar el carrito completo
    @DeleteMapping("/vaciar")
    public ResponseEntity<?> clearCart(@RequestParam Long usuarioId) {
        try {
            carritoService.vaciarCarrito(usuarioId);
            return ResponseEntity.ok().body(Map.of("message", "El carrito ha sido vaciado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Finalizar compra
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