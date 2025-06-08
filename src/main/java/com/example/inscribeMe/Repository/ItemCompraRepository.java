package com.example.inscribeMe.Repository;

import com.example.inscribeMe.Model.ItemCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemCompraRepository extends JpaRepository<ItemCompra, Long> {
    // Puedes agregar métodos específicos si necesitas buscar por compra o curso
}
