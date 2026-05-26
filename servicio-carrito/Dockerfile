# ── Stage 1: Build ────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-22 AS build

WORKDIR /workspace

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

RUN mvn dependency:go-offline -pl servicio-carrito -am -q

COPY servicio-carrito/src servicio-carrito/src
RUN mvn package -pl servicio-carrito -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────
FROM eclipse-temurin:22-jre-alpine

WORKDIR /app

COPY --from=build /workspace/servicio-carrito/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
