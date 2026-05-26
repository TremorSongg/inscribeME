package com.inscribeme.carrito;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicioCarritoApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServicioCarritoApplication.class, args);
    }
}
