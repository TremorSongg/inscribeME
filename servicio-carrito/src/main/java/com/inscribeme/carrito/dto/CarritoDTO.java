package com.inscribeme.carrito.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarritoDTO {
    private List<ItemCarritoDTO> items;
    private double total;
}
