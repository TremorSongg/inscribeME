package com.inscribeme.gateway.filter;

import com.inscribeme.gateway.util.JwtUtil;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    // Rutas públicas que NO requieren JWT
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/usuarios/login",
            "/api/usuarios/registrar",
            "/api/usuarios/instructores",
            "/api/cursos",
            "/actuator"
    );

    // Prefijos de rutas estáticas
    private static final List<String> STATIC_PREFIXES = List.of(
            "/css/", "/js/", "/img/", "/index.html", "/login.html",
            "/registro.html", "/cursos.html", "/acerca-de.html",
            "/contacto.html", "/favicon"
    );

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Permitir recursos estáticos sin autenticación
        if (isPublicPath(path) || isStaticResource(path)) {
            return chain.filter(exchange);
        }

        // Verificar header Authorization
        if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Token JWT requerido");
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Formato de token inválido");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            return onError(exchange, HttpStatus.UNAUTHORIZED, "Token JWT inválido o expirado");
        }

        // Extraer claims y propagar como headers internos a los microservicios
        String userId = jwtUtil.getUserId(token);
        String email = jwtUtil.getEmail(token);
        String rol = jwtUtil.getRol(token);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-User-Email", email)
                .header("X-User-Rol", rol)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean isPublicPath(String path) {
        // GET /api/cursos y GET /api/cursos/{id} son públicos
        if (path.startsWith("/api/cursos")) return true;
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean isStaticResource(String path) {
        return path.equals("/") || STATIC_PREFIXES.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json");
        var body = response.bufferFactory()
                .wrap(("{\"error\": \"" + message + "\"}").getBytes());
        return response.writeWith(Mono.just(body));
    }

    @Override
    public int getOrder() {
        return -100; // Alta prioridad
    }
}
