package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Compra;
import com.example.inscribeMe.Repository.CompraRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompraService {

    private final CompraRepository compraRepository;

    public CompraService(CompraRepository compraRepository) {
        this.compraRepository = compraRepository;
    }

    public List<Compra> obtenerTodas() {
        return compraRepository.findAll();
    }

    public Optional<Compra> obtenerPorId(Long id) {
        return compraRepository.findById(id);
    }

    public Compra crear(Compra compra) {
        return compraRepository.save(compra);
    }

    public Compra actualizar(Long id, Compra compra) {
        compra.setId(id);
        return compraRepository.save(compra);
    }

    public void eliminar(Long id) {
        compraRepository.deleteById(id);
    }
}
