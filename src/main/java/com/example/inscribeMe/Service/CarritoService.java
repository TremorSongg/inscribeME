package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Carrito;
import com.example.inscribeMe.Repository.CarritoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;

    public CarritoService(CarritoRepository carritoRepository) {
        this.carritoRepository = carritoRepository;
    }

    public List<Carrito> obtenerTodos() {
        return carritoRepository.findAll();
    }

    public Optional<Carrito> obtenerPorId(Long id) {
        return carritoRepository.findById(id);
    }

    public Optional<Carrito> obtenerPorUsuarioId(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId);
    }

    public Carrito crear(Carrito carrito) {
        return carritoRepository.save(carrito);
    }

    public Carrito actualizar(Long id, Carrito carrito) {
        carrito.setId(id);
        return carritoRepository.save(carrito);
    }

    public void eliminar(Long id) {
        carritoRepository.deleteById(id);
    }
}
