package com.inscribeme.cursos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicioCursosApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServicioCursosApplication.class, args);
    }
}
