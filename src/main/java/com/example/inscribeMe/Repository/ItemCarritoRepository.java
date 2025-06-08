package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.ItemCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    // Agregar métodos custom si los necesitás
}
