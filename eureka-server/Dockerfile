# ── Stage 1: Build ────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-22 AS build

WORKDIR /workspace

# Copiar POM raíz y POMs de TODOS los módulos (necesario para el multi-module POM)
COPY pom.xml ./
COPY eureka-server/pom.xml          eureka-server/
COPY admin-dashboard/pom.xml        admin-dashboard/
COPY api-gateway/pom.xml            api-gateway/
COPY servicio-usuarios/pom.xml      servicio-usuarios/
COPY servicio-cursos/pom.xml        servicio-cursos/
COPY servicio-inscripciones/pom.xml servicio-inscripciones/
COPY servicio-carrito/pom.xml       servicio-carrito/
COPY servicio-notificaciones/pom.xml servicio-notificaciones/
COPY servicio-reportes/pom.xml      servicio-reportes/

# Descargar dependencias del módulo (cacheado si los pom.xml no cambian)
RUN mvn dependency:go-offline -pl eureka-server -am -q

# Copiar fuentes del módulo y construir
COPY eureka-server/src eureka-server/src
RUN mvn package -pl eureka-server -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM eclipse-temurin:22-jre-alpine

WORKDIR /app

COPY --from=build /workspace/eureka-server/target/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]
