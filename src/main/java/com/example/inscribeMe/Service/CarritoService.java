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
    
    // ▼▼▼ CORRECCIÓN AQUÍ ▼▼▼
    // Se inyecta el SERVICIO, no el controlador.
    private final NotificacionService notificacionService;
    // ▲▲▲ FIN DE LA CORRECIÓN ▲▲▲

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

        if (carrito.getItems().stream().anyMatch(item -> item.getCurso().getId().equals(cursoId))) {
            throw new IllegalStateException("El curso ya está en el carrito.");
        }
        
        if (curso.getCupoDisponible() < 1) {
            throw new IllegalStateException("No hay cupos disponibles para el curso: " + curso.getNombre());
        }

        ItemCarrito nuevoItem = ItemCarrito.builder()
                .carrito(carrito)
                .curso(curso)
                .cantidad(1)
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
        
        Compra nuevaCompra = new Compra();
        nuevaCompra.setUsuario(carrito.getUsuario());
        nuevaCompra.setFecha(LocalDateTime.now());
        nuevaCompra.setEstado(EstadoCompra.SIMULADA_PAGADA);

        List<ItemCompra> itemsCompra = new ArrayList<>();
        double montoTotal = 0;

        for (ItemCarrito itemCarrito : new ArrayList<>(carrito.getItems())) {
            Curso curso = itemCarrito.getCurso();
            
            if (curso.getCupoDisponible() < itemCarrito.getCantidad()) {
                throw new IllegalStateException("No hay suficientes cupos para el curso: " + curso.getNombre());
            }

            curso.setCupoDisponible(curso.getCupoDisponible() - itemCarrito.getCantidad());
            cursoRepository.save(curso);

            ItemCompra itemCompra = ItemCompra.builder()
                .compra(nuevaCompra)
                .curso(curso)
                .cantidad(itemCarrito.getCantidad())
                .precioUnitario(curso.getPrecio())
                .build();
            itemsCompra.add(itemCompra);

            montoTotal += curso.getPrecio() * itemCarrito.getCantidad();

            Inscripcion inscripcion = Inscripcion.builder()
                .usuario(carrito.getUsuario())
                .curso(curso)
                .fechaInscripcion(LocalDate.now())
                .estado(EstadoInscripcion.INSCRITO)
                .build();
            inscripcionRepository.save(inscripcion);

            String msg = "¡Gracias por tu compra! Te has inscrito al curso: '" + curso.getNombre() + "'.";
            notificacionService.crearNotificacionParaUsuario(carrito.getUsuario(), msg);
        }

        nuevaCompra.setItems(itemsCompra);
        
        Pago pago = new Pago();
        pago.setMonto(montoTotal);
        pago.setFecha(LocalDateTime.now());
        pago.setExitoso(true);
        pago.setMedioPago("SIMULADO_TARJETA_CREDITO");
        pagoService.guardarPago(pago);

        Compra compraGuardada = compraRepository.save(nuevaCompra);

        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return compraGuardada;
    }
}