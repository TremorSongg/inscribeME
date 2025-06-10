package com.example.inscribeMe.Service;

import com.example.inscribeMe.Model.Pago;
import com.example.inscribeMe.Repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagoService {
    private final PagoRepository pagoRepository;

    public Pago guardarPago(Pago pago) {
        return pagoRepository.save(pago);
    }
}
