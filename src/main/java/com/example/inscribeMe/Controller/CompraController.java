package com.example.inscribeMe.Controller;

import com.example.inscribeMe.Model.Compra;
import com.example.inscribeMe.Service.CompraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
@CrossOrigin(origins = "*")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @GetMapping
    public List<Compra> listar() {
        return compraService.obtenerTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Compra> obtener(@PathVariable Long id) {
        return compraService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Compra crear(@RequestBody Compra compra) {
        return compraService.crear(compra);
    }

    @PutMapping("/{id}")
    public Compra actualizar(@PathVariable Long id, @RequestBody Compra compra) {
        return compraService.actualizar(id, compra);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        compraService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
