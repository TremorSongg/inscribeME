# 📝 Control de Cambios - InscribeMe

Este documento registra de manera detallada el historial de versiones, modificaciones y mejoras implementadas en el proyecto **InscribeMe**, estructurado en microservicios y frontend unificado.

---

## [v2.1.0] - 2026-07-06

Esta versión incorpora el control de stock de cupos en tiempo real sincronizado entre microservicios, bloqueo de duplicaciones en carrito, mejoras en el panel administrativo y estandarización global del modo oscuro.

### 🚀 Novedades y Mejoras Principales

#### 📊 1. Panel de Administración y Filtros por Rol
*   **Enlaces interactivos en Dashboard:** Los contadores rápidos (Cursos activos, Estudiantes, Instructores, Notificaciones) ahora redirigen directamente a sus secciones respectivas en la administración.
*   **Solapas/Tabs de Administración:** En `AdminStudentsPage.tsx` se añadió un control por solapas para alternar fluidamente entre la lista de Estudiantes (con acceso a historial y asistencia) e Instructores (con tarjetas personalizadas color violeta de docente).
*   **Bloqueo de Matrícula Manual:** En `CourseManagementPage.tsx` se inhabilitó el botón de asignación manual de estudiantes en cursos que se encuentren completos (0 cupos), agregando un banner de advertencia visual para el administrador.

#### 🛒 2. Control de Stock en Tiempo Real y Bloqueo de Duplicados en Carrito
*   **Endpoints de Cupo:** Creación de endpoints `/decrementar-cupo` y `/incrementar-cupo` en `servicio-cursos` para actualizar de forma segura el stock de cupos de las actividades.
*   **Integración de Microservicios:** Configurado un bean de `RestTemplate` balanceado en `servicio-inscripciones` y actualizado `InscripcionService.java` para llamar síncronamente al servicio de cursos para reducir cupos al matricularse (lanzando excepción si no hay stock disponible) o restaurarlos si se anula la inscripción.
*   **Bloqueo de Compra Duplicada:** En `ProductPage.tsx` se leen las inscripciones previas del estudiante logueado; si ya está inscrito, se bloquea el botón y muestra *"Ya inscrito"*.
*   **Diseño de Cursos Agotados:** Los cursos sin cupos en la tienda se renderizan con un borde rojizo, opacidad del 90%, una insignia de *"🔴 Sin cupos"* y botón inhabilitado con el texto *"Sin cupos"*.

#### 🎨 3. Estandarización de Contraste en Modo Oscuro
*   **Activación completa de Tailwind v4:** Se configuró el disparador de tema en `Navbar.tsx` para inyectar tanto la clase `dark` como el atributo `data-theme="dark"` al elemento raíz HTML.
*   **Legibilidad en index.css:** Se definieron overrides globales dentro del selector `.dark` para estandarizar el contraste de todos los textos neutros y primarios oscuros (`text-neutral-900`, `text-sky-900`, etc.) a tonos claros (`#F8FAFF` / `#E2E8F0`). También se crearon paletas oscuras personalizadas para las tarjetas y banners de notificación de cada rol/categoría.

#### 🗄️ 4. Base de Datos y Datos Semilla
*   **Carga Semilla:** Modificado `seed-data.sql` para registrar 10 estudiantes semilla reales y el curso *Spinning Pro* configurado inicialmente sin cupos disponibles (0) para pruebas de stock y exclusión de carrito.

---

## [v2.0.0] - 2026-07-06 (Histórico)

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
