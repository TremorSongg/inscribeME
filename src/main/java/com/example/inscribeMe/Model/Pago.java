package com.example.inscribeMe.Model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pagos") // Es buena práctica pluralizar el nombre de la tabla
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Registro de transacciones de pago procesadas")
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(example = "1")
    private Long id;

    @Schema(example = "25000.0", description = "Monto total pagado")
    private double monto;

    @Schema(description = "Fecha y hora exacta de la transacción")
    private LocalDateTime fecha;

    @Schema(example = "Tarjeta de Crédito (Simulado)", description = "Método utilizado para el pago")
    private String medioPago; 

    @Schema(example = "true", description = "Indica si la pasarela de pago aprobó la transacción")
    private boolean exitoso;
}