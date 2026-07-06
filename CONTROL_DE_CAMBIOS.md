# 📝 Control de Cambios - InscribeMe

Este documento registra de manera detallada el historial de versiones, modificaciones y mejoras implementadas en el proyecto **InscribeMe**, estructurado en microservicios y frontend unificado.

---

## [v2.0.0] - 2026-07-06 (Versión Actual)

Esta versión marca un hito importante con la unificación del FrontEnd, mejoras críticas de usabilidad alineadas con auditorías de QA y optimización de infraestructura de red/despliegue.

### 🚀 Novedades y Mejoras Principales

#### 🎨 1. Unificación y Rediseño del FrontEnd
*   **Consolidación de código:** Se eliminó por completo el directorio obsoleto `front-inscribeme` y se unificó la aplicación cliente de React en `api-gateway/frontend/`.
*   **Tema y Estilos Dinámicos:** Implementación de un sistema de temas avanzados (soporte completo de modo oscuro/claro y variables CSS centralizadas en `index.css`).
*   **Mejora de Componentes:** Rediseño completo y estilización moderna de componentes clave:
    *   `Navbar` y `Footer` responsivos.
    *   Formularios de autenticación animados (`AuthForm.tsx` y `RegisterForm.tsx`).
    *   Secciones de inicio, testimonios y destacados con transiciones suaves.
    *   Panel de generación de voucher de inscripciones (`VoucherPanel.tsx`).
*   **Adaptabilidad Móvil (Responsive):** Ajustes en paddings, tamaños de fuentes y áreas de toque en pantallas pequeñas (viewport de 375px o inferior, atendiendo el caso de prueba QA TC-096).

#### 🛡️ 2. Seguridad y Configuración de CORS
*   **Filtro de Desduplicación en Gateway:** Creación del filtro `CorsDeduplicationFilter.java` en `api-gateway` para resolver y limpiar la redundancia de cabeceras CORS duplicadas (evitando errores del navegador al combinar configuraciones del Gateway y microservicios).
*   **Actualización de Configuración:** Modificación de `application.yml` en el API Gateway y actualización de variables del entorno local en `docker-compose.yml`.

#### 📋 3. QA y Documentación de Calidad
*   **Informe de Mejoras:** Creación de `Informe_Mejoras_InscribeMe.md` conteniendo el diagnóstico arquitectónico de CORS, base de datos relacional entre microservicios, y propuestas técnicas (EDA con RabbitMQ, Feign Clients y auditoría JPA).
*   **Plan de Pruebas:** Incorporación del archivo excel `PlanPruebas_InscribeMe.xlsx` con la planilla de control de pruebas QA del sistema.

#### ⚙️ 4. Mantenibilidad del Repositorio
*   **Configuración de `.gitignore`:** Creación de un archivo de exclusión robusto en la raíz del proyecto para evitar el seguimiento de dependencias (`node_modules/`), compilados (`target/`, `.class`), configuraciones locales y variables de entorno.
*   **Limpieza de Historial:** Remoción del seguimiento de Git de carpetas pesadas para aligerar el tamaño del repositorio.

---

## [v1.4] - Histórico

*   Ajustes y parches de configuración general de servicios.
*   Correcciones menores en Docker y variables de integración.

---

## [v1.1] - Histórico

*   Actualización de la documentación en el archivo `README.md`.
*   Alineación de puertos y reestructuración del backend.

---

## [v1.0] - Histórico

*   **Lanzamiento Inicial Estable:** Primera versión funcional con arquitectura distribuida en microservicios:
    *   `servicio-usuarios`
    *   `servicio-cursos`
    *   `servicio-inscripciones`
    *   `servicio-carrito`
    *   `servicio-notificaciones`
    *   `servicio-reportes`
*   Configuración base de base de datos relacional independiente por servicio (Database-per-Service).

---

## [v0.3] - Histórico

*   Implementación de login personalizado.
*   Correcciones de persistencia para el registro de contraseñas de usuario en base de datos.
