package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.ItemCarrito;
import com.example.inscribeMe.Service.ItemCarritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itemcarrito")
@CrossOrigin(origins = "*")
public class ItemCarritoController {

    private final ItemCarritoService itemCarritoService;

    public ItemCarritoController(ItemCarritoService itemCarritoService) {
        this.itemCarritoService = itemCarritoService;
    }

    @GetMapping
    public List<ItemCarrito> listar() {
        return itemCarritoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCarrito> obtener(@PathVariable Long id) {
        return itemCarritoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ItemCarrito crear(@RequestBody ItemCarrito itemCarrito) {
        return itemCarritoService.crear(itemCarrito);
    }

    @PutMapping("/{id}")
    public ItemCarrito actualizar(@PathVariable Long id, @RequestBody ItemCarrito itemCarrito) {
        return itemCarritoService.actualizar(id, itemCarrito);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        itemCarritoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
