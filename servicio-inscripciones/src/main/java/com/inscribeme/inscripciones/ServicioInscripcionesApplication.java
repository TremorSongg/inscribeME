package com.inscribeme.inscripciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicioInscripcionesApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServicioInscripcionesApplication.class, args);
    }
}
