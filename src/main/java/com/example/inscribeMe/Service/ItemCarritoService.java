package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.ItemCarrito;
import com.example.inscribeMe.Repository.ItemCarritoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemCarritoService {

    private final ItemCarritoRepository itemCarritoRepository;

    public ItemCarritoService(ItemCarritoRepository itemCarritoRepository) {
        this.itemCarritoRepository = itemCarritoRepository;
    }

    public List<ItemCarrito> obtenerTodos() {
        return itemCarritoRepository.findAll();
    }

    public Optional<ItemCarrito> obtenerPorId(Long id) {
        return itemCarritoRepository.findById(id);
    }

    public ItemCarrito crear(ItemCarrito itemCarrito) {
        return itemCarritoRepository.save(itemCarrito);
    }

    public ItemCarrito actualizar(Long id, ItemCarrito itemCarrito) {
        itemCarrito.setId(id);
        return itemCarritoRepository.save(itemCarrito);
    }

    public void eliminar(Long id) {
        itemCarritoRepository.deleteById(id);
    }
}
