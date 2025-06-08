package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Inscripcion;
import com.example.inscribeMe.Repository.InscripcionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;

    public InscripcionService(InscripcionRepository inscripcionRepository) {
        this.inscripcionRepository = inscripcionRepository;
    }

    public List<Inscripcion> obtenerTodas() {
        return inscripcionRepository.findAll();
    }

    public Optional<Inscripcion> obtenerPorId(Long id) {
        return inscripcionRepository.findById(id);
    }

    public Inscripcion crear(Inscripcion inscripcion) {
        return inscripcionRepository.save(inscripcion);
    }

    public Inscripcion actualizar(Long id, Inscripcion inscripcion) {
        inscripcion.setId(id);
        return inscripcionRepository.save(inscripcion);
    }

    public void eliminar(Long id) {
        inscripcionRepository.deleteById(id);
    }
}
