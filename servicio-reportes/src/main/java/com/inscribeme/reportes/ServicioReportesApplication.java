package com.inscribeme.reportes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServicioReportesApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServicioReportesApplication.class, args);
    }
}
