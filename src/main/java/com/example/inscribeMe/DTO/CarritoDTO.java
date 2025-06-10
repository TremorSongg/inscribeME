package com.example.inscribeMe.DTO;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CarritoDTO {
    private List<ItemCarritoDTO> items;
    private double total;
}