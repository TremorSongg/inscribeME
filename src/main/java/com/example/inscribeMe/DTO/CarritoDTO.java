package com.example.inscribeMe.DTO;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@Schema(description = "Resumen del carrito de compras")
public class CarritoDTO {
    private List<ItemCarritoDTO> items;
    
    @Schema(example = "250.50")
    private double total;
}