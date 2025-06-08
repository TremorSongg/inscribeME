package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Curso;
import com.example.inscribeMe.Repository.CursoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;

    public CursoService(CursoRepository cursoRepository) {
        this.cursoRepository = cursoRepository;
    }

    public List<Curso> obtenerTodos() {
        return cursoRepository.findAll();
    }

    public Optional<Curso> obtenerPorId(Long id) {
        return cursoRepository.findById(id);
    }

    public Curso crear(Curso curso) {
        return cursoRepository.save(curso);
    }

    public Curso actualizar(Long id, Curso curso) {
        curso.setId(id);
        return cursoRepository.save(curso);
    }

    public void eliminar(Long id) {
        cursoRepository.deleteById(id);
    }
}
