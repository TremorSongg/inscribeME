package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.ItemCompra;
import com.example.inscribeMe.Service.ItemCompraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itemcompra")
@CrossOrigin(origins = "*")
public class ItemCompraController {

    private final ItemCompraService itemCompraService;

    public ItemCompraController(ItemCompraService itemCompraService) {
        this.itemCompraService = itemCompraService;
    }

    @GetMapping
    public List<ItemCompra> listar() {
        return itemCompraService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemCompra> obtener(@PathVariable Long id) {
        return itemCompraService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ItemCompra crear(@RequestBody ItemCompra itemCompra) {
        return itemCompraService.crear(itemCompra);
    }

    @PutMapping("/{id}")
    public ItemCompra actualizar(@PathVariable Long id, @RequestBody ItemCompra itemCompra) {
        return itemCompraService.actualizar(id, itemCompra);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        itemCompraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
