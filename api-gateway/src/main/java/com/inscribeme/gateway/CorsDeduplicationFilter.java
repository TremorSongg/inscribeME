package com.inscribeme.gateway;

import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class CorsDeduplicationFilter implements WebFilter, Ordered {

    @Override
    public int getOrder() {
        // Register early so beforeCommit runs before the response is written
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        exchange.getResponse().beforeCommit(() -> {
            HttpHeaders headers = exchange.getResponse().getHeaders();
            
            // Deduplicate Access-Control-Allow-Origin
            List<String> origins = headers.get(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);
            if (origins != null && origins.size() > 1) {
                // Keep the first unique origin (usually "*")
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origins.get(0));
            }
            
            // Deduplicate Access-Control-Allow-Credentials
            List<String> credentials = headers.get(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS);
            if (credentials != null && credentials.size() > 1) {
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, credentials.get(0));
            }
            
            // Deduplicate Access-Control-Allow-Methods
            List<String> methods = headers.get(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS);
            if (methods != null && methods.size() > 1) {
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, methods.get(0));
            }

            // Deduplicate Access-Control-Allow-Headers
            List<String> allowHeaders = headers.get(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS);
            if (allowHeaders != null && allowHeaders.size() > 1) {
                headers.set(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, allowHeaders.get(0));
            }

            return Mono.empty();
        });
        return chain.filter(exchange);
    }
}
