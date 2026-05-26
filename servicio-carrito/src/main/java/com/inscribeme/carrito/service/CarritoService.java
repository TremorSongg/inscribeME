package com.inscribeme.carrito.service;

import com.inscribeme.carrito.dto.CarritoDTO;
import com.inscribeme.carrito.dto.ItemCarritoDTO;
import com.inscribeme.carrito.model.*;
import com.inscribeme.carrito.repository.CarritoRepository;
import com.inscribeme.carrito.repository.CompraRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CompraRepository  compraRepository;
    private final RestTemplate      restTemplate;

    // URL interna via Eureka (load-balanced)
    private static final String INSCRIPCIONES_URL = "http://SERVICIO-INSCRIPCIONES/api/inscripciones";

    // ── Obtener o crear carrito ─────────────────────────────────────────────
    private Carrito obtenerOCrearCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId).orElseGet(() -> {
            Carrito nuevo = Carrito.builder()
                    .usuarioId(usuarioId)
                    .items(new ArrayList<>())
                    .build();
            return carritoRepository.save(nuevo);
        });
    }

    // ── Agregar curso al carrito ────────────────────────────────────────────
    @Transactional
    public void agregarCurso(Long usuarioId, Long cursoId, String nombreCurso, double precio) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);

        // Verificar que no esté ya en el carrito
        boolean yaEnCarrito = carrito.getItems().stream()
                .anyMatch(i -> i.getCursoId().equals(cursoId));
        if (yaEnCarrito) {
            throw new IllegalStateException("El curso ya está en el carrito.");
        }

        // Verificar que no esté ya inscrito (llamada a servicio-inscripciones)
        try {
            String url = "http://SERVICIO-INSCRIPCIONES/api/inscripciones/usuario/" + usuarioId;
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> inscripciones =
                    restTemplate.getForObject(url, java.util.List.class);
            if (inscripciones != null) {
                boolean yaInscrito = inscripciones.stream()
                        .anyMatch(i -> i.get("cursoId") != null &&
                                Long.parseLong(i.get("cursoId").toString()) == cursoId);
                if (yaInscrito) {
                    throw new IllegalStateException("Ya estás inscrito en este curso.");
                }
            }
        } catch (IllegalStateException e) {
            throw e; // re-lanzar el error de negocio
        } catch (Exception e) {
            log.warn("No se pudo verificar inscripción previa para curso {}: {}", cursoId, e.getMessage());
        }

        ItemCarrito item = ItemCarrito.builder()
                .carrito(carrito)
                .cursoId(cursoId)
                .nombreCurso(nombreCurso)
                .precioUnitario(precio)
                .cantidad(1)
                .build();

        carrito.getItems().add(item);
        carritoRepository.save(carrito);
    }

    // ── Eliminar item del carrito ───────────────────────────────────────────
    @Transactional
    public void eliminarItem(Long usuarioId, Long cursoId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Carrito no encontrado"));
        carrito.getItems().removeIf(i -> i.getCursoId().equals(cursoId));
        carritoRepository.save(carrito);
    }

    // ── Vaciar carrito ─────────────────────────────────────────────────────
    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Carrito no encontrado"));
        carrito.getItems().clear();
        carritoRepository.save(carrito);
    }

    // ── Obtener contenido del carrito (DTO) ────────────────────────────────
    @Transactional(readOnly = true)
    public CarritoDTO obtenerContenido(Long usuarioId) {
        Carrito carrito = obtenerOCrearCarrito(usuarioId);

        List<ItemCarritoDTO> itemsDTO = carrito.getItems().stream().map(item ->
            ItemCarritoDTO.builder()
                .cursoId(item.getCursoId())
                .nombreCurso(item.getNombreCurso())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .subtotal(item.getPrecioUnitario() * item.getCantidad())
                .build()
        ).collect(Collectors.toList());

        double total = itemsDTO.stream().mapToDouble(ItemCarritoDTO::getSubtotal).sum();

        return CarritoDTO.builder()
                .items(itemsDTO)
                .total(total)
                .build();
    }

    // ── Checkout / Realizar compra ─────────────────────────────────────────
    @Transactional
    public Compra realizarCompra(Long usuarioId) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Carrito no encontrado"));

        if (carrito.getItems().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío.");
        }

        // 1. Guardar la Compra
        Compra compra = Compra.builder()
                .usuarioId(usuarioId)
                .fecha(LocalDateTime.now())
                .estado(EstadoCompra.SIMULADA_PAGADA)
                .build();

        List<ItemCompra> itemsCompra = new ArrayList<>();
        double montoTotal = 0;

        for (ItemCarrito itemCarrito : new ArrayList<>(carrito.getItems())) {
            ItemCompra itemCompra = ItemCompra.builder()
                    .compra(compra)
                    .cursoId(itemCarrito.getCursoId())
                    .nombreCurso(itemCarrito.getNombreCurso())
                    .cantidad(itemCarrito.getCantidad())
                    .precioUnitario(itemCarrito.getPrecioUnitario())
                    .build();
            itemsCompra.add(itemCompra);
            montoTotal += itemCarrito.getPrecioUnitario() * itemCarrito.getCantidad();
        }

        compra.setItems(itemsCompra);
        compra.setMontoTotal(montoTotal);
        Compra compraGuardada = compraRepository.save(compra);

        // 2. Crear inscripciones en servicio-inscripciones
        for (ItemCarrito itemCarrito : carrito.getItems()) {
            crearInscripcion(usuarioId, itemCarrito);
        }

        // 3. Vaciar el carrito
        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return compraGuardada;
    }

    // ── Llamada HTTP interna a servicio-inscripciones ─────────────────────
    private void crearInscripcion(Long usuarioId, ItemCarrito item) {
        try {
            // 1. Obtener datos del curso desde servicio-cursos para enriquecer la inscripción
            String    descripcion      = "Curso adquirido vía carrito";
            String    fechaInicio      = null;
            String    fechaFin         = null;
            String    nombreInstructor = null;

            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> curso = restTemplate.getForObject(
                        "http://SERVICIO-CURSOS/api/cursos/" + item.getCursoId(),
                        Map.class);
                if (curso != null) {
                    if (curso.get("descripcion")      != null) descripcion      = curso.get("descripcion").toString();
                    if (curso.get("fechaInicio")       != null) fechaInicio      = curso.get("fechaInicio").toString();
                    if (curso.get("fechaFin")          != null) fechaFin         = curso.get("fechaFin").toString();
                    if (curso.get("nombreInstructor")  != null) nombreInstructor = curso.get("nombreInstructor").toString();
                }
            } catch (Exception ex) {
                log.warn("No se pudo obtener detalle del curso {}: {}", item.getCursoId(), ex.getMessage());
            }

            // 2. Crear la inscripción con todos los datos disponibles
            Map<String, Object> payload = new HashMap<>();
            payload.put("usuarioId",        usuarioId);
            payload.put("cursoId",          item.getCursoId());
            payload.put("nombreCurso",      item.getNombreCurso());
            payload.put("descripcionCurso", descripcion);
            payload.put("fechaInscripcion", LocalDate.now().toString());
            payload.put("estado",           "INSCRITO");
            if (fechaInicio      != null) payload.put("fechaInicioCurso",  fechaInicio);
            if (fechaFin         != null) payload.put("fechaFinCurso",     fechaFin);
            if (nombreInstructor != null) payload.put("nombreInstructor",  nombreInstructor);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    INSCRIPCIONES_URL, payload, String.class);

            log.info("Inscripcion creada para usuario {} / curso {}: {}",
                    usuarioId, item.getCursoId(), response.getStatusCode());

        } catch (Exception e) {
            log.error("Error al crear inscripcion para curso {}: {}", item.getCursoId(), e.getMessage());
        }
    }
}
