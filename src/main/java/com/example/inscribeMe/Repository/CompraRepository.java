package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {
    // Ej: List<Compra> findByUsuarioId(Long id);
}
