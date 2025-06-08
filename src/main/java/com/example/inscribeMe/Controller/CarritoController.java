package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Carrito;
import com.example.inscribeMe.Service.CarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
@CrossOrigin(origins = "*")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping
    public List<Carrito> listar() {
        return carritoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrito> obtener(@PathVariable Long id) {
        return carritoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<Carrito> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return carritoService.obtenerPorUsuarioId(usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Carrito crear(@RequestBody Carrito carrito) {
        return carritoService.crear(carrito);
    }

    @PutMapping("/{id}")
    public Carrito actualizar(@PathVariable Long id, @RequestBody Carrito carrito) {
        return carritoService.actualizar(id, carrito);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        carritoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
