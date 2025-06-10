package com.example.inscribeMe.Service;

import com.example.inscribeMe.DTO.CarritoDTO;
import com.example.inscribeMe.DTO.ItemCarritoDTO;
import com.example.inscribeMe.Model.*;
import com.example.inscribeMe.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final CompraRepository compraRepository;
    private final PagoService pagoService;
    private final InscripcionRepository inscripcionRepository;

    // Obtiene o crea un carrito para un usuario
    private Carrito obtenerOCrearCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));
            Carrito nuevoCarrito = Carrito.builder()
                    .usuario(usuario)
                    .items(new ArrayList<>())
                    .build();
            return carritoRepository.save(nuevoCarrito);
        });
    }

    @Transactional
    public void agregarCursoAlCarrito(Long usuarioId, Long cursoId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new EntityNotFoundException("Curso no encontrado con id: " + cursoId));

        // Validar si ya existe el curso en el carrito
        if (carrito.getItems().stream().anyMatch(item -> item.getCurso().getId().equals(cursoId))) {
            throw new IllegalStateException("El curso ya está en el carrito.");
        }
        
        // Validar cupos
        if (curso.getCupoDisponible() < 1) {
            throw new IllegalStateException("No hay cupos disponibles para el curso: " + curso.getNombre());
        }

        ItemCarrito nuevoItem = ItemCarrito.builder()
                .carrito(carrito)
                .curso(curso)
                .cantidad(1) // Para cursos, la cantidad siempre es 1
                .build();

        carrito.getItems().add(nuevoItem);
        carritoRepository.save(carrito);
    }

    @Transactional
    public void eliminarItemDelCarrito(Long usuarioId, Long cursoId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró carrito para el usuario."));
        
        carrito.getItems().removeIf(item -> item.getCurso().getId().equals(cursoId));
        carritoRepository.save(carrito);
    }

    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró carrito para el usuario."));
        carrito.getItems().clear();
        carritoRepository.save(carrito);
    }
    
    public CarritoDTO obtenerContenidoCarrito(Long usuarioId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);
        
        List<ItemCarritoDTO> itemsDTO = carrito.getItems().stream().map(item -> 
            ItemCarritoDTO.builder()
                .cursoId(item.getCurso().getId())
                .nombreCurso(item.getCurso().getNombre())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getCurso().getPrecio())
                .subtotal(item.getCurso().getPrecio() * item.getCantidad())
                .build()
        ).collect(Collectors.toList());

        double total = itemsDTO.stream().mapToDouble(ItemCarritoDTO::getSubtotal).sum();

        return CarritoDTO.builder()
                .items(itemsDTO)
                .total(total)
                .build();
    }
    
    @Transactional
    public Compra realizarCompra(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new EntityNotFoundException("No se encontró carrito para el usuario."));
        
        if(carrito.getItems().isEmpty()){
            throw new IllegalStateException("El carrito está vacío, no se puede realizar la compra.");
        }
        
        // 1. Crear la Compra
        Compra nuevaCompra = new Compra();
        nuevaCompra.setUsuario(carrito.getUsuario());
        nuevaCompra.setFecha(LocalDateTime.now());
        nuevaCompra.setEstado(EstadoCompra.SIMULADA_PAGADA);

        List<ItemCompra> itemsCompra = new ArrayList<>();
        double montoTotal = 0;

        // 2. Procesar cada item del carrito
        for (ItemCarrito itemCarrito : carrito.getItems()) {
            Curso curso = itemCarrito.getCurso();
            
            // Doble chequeo de cupos (crítico en entornos concurrentes)
            if (curso.getCupoDisponible() < itemCarrito.getCantidad()) {
                throw new IllegalStateException("No hay suficientes cupos para el curso: " + curso.getNombre());
            }

            // 3. Descontar cupo
            curso.setCupoDisponible(curso.getCupoDisponible() - itemCarrito.getCantidad());
            cursoRepository.save(curso);

            // 4. Transformar ItemCarrito a ItemCompra
            ItemCompra itemCompra = ItemCompra.builder()
                .compra(nuevaCompra)
                .curso(curso)
                .cantidad(itemCarrito.getCantidad())
                .precioUnitario(curso.getPrecio()) // Guardar el precio al momento de la compra
                .build();
            itemsCompra.add(itemCompra);

            montoTotal += curso.getPrecio() * itemCarrito.getCantidad();

            // ▼▼▼ LÓGICA NUEVA PARA CREAR LA INSCRIPCIÓN ▼▼▼
            Inscripcion inscripcion = Inscripcion.builder()
                .usuario(carrito.getUsuario())
                .curso(curso)
                .fechaInscripcion(LocalDate.now())
                .estado(EstadoInscripcion.INSCRITO)
                .build();
            inscripcionRepository.save(inscripcion);
            
        }

        nuevaCompra.setItems(itemsCompra);
        
        // 5. Simular el Pago
        Pago pago = new Pago();
        pago.setMonto(montoTotal);
        pago.setFecha(LocalDateTime.now());
        pago.setExitoso(true);
        pago.setMedioPago("SIMULADO_TARJETA_CREDITO");
        pagoService.guardarPago(pago);
        
        // Se podría asociar el pago a la compra si el modelo lo permitiera
        // nuevaCompra.setPago(pago);

        // 6. Guardar la compra
        Compra compraGuardada = compraRepository.save(nuevaCompra);

        // 7. Vaciar el carrito
        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return compraGuardada;
    }
}