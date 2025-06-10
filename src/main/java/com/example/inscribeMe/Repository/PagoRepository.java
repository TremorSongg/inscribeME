package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    // Hereda todos los métodos CRUD básicos
}
