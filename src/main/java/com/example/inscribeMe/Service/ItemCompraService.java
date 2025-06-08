package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.ItemCompra;
import com.example.inscribeMe.Repository.ItemCompraRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemCompraService {

    private final ItemCompraRepository itemCompraRepository;

    public ItemCompraService(ItemCompraRepository itemCompraRepository) {
        this.itemCompraRepository = itemCompraRepository;
    }

    public List<ItemCompra> obtenerTodos() {
        return itemCompraRepository.findAll();
    }

    public Optional<ItemCompra> obtenerPorId(Long id) {
        return itemCompraRepository.findById(id);
    }

    public ItemCompra crear(ItemCompra itemCompra) {
        return itemCompraRepository.save(itemCompra);
    }

    public ItemCompra actualizar(Long id, ItemCompra itemCompra) {
        itemCompra.setId(id);
        return itemCompraRepository.save(itemCompra);
    }

    public void eliminar(Long id) {
        itemCompraRepository.deleteById(id);
    }
}
