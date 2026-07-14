# 📝 Control de Cambios - InscribeMe

Este documento registra de manera detallada el historial de versiones, modificaciones y mejoras implementadas en el proyecto **InscribeMe**, estructurado en microservicios y frontend unificado.

---

## [v2.2.0] - 2026-07-13

Esta versión introduce la garantía de integridad relacional mediante protecciones de eliminación cruzada entre microservicios, eliminaciones en cascada y mejoras visuales en modo oscuro y alineación del calendario.

### 🚀 Novedades y Mejoras Principales

#### 🛡️ 1. Integridad Relacional y Protecciones de Eliminación Cruzada
*   **Microservicio de Usuarios:** Se agregaron protecciones en `UsuarioService.java` que bloquean la eliminación de estudiantes si tienen inscripciones activas, o de instructores si tienen cursos asignados, realizando peticiones HTTP síncronas a los respectivos servicios. También implementa eliminación en cascada de carritos y notificaciones.
*   **Microservicio de Cursos:** Modificado `CursoService.java` para denegar la eliminación de un curso si existen alumnos inscritos.
*   **Microservicio de Inscripciones:** Modificado `InscripcionService.java` para hacer la eliminación transaccional, remover en cascada los registros de asistencia del estudiante en el curso, y forzar la restauración de cupos en el servicio de cursos.
*   **Manejo Global de Conflictos (HTTP 409):** Captura de `IllegalStateException` y retorno consistente de código de estado HTTP 409 (Conflict) con explicaciones precisas del motivo del bloqueo.

#### 🎨 2. Interfaz y Experiencia Visual
*   **Alineación de Calendario de Asistencia:** Reestructurado el diseño de `MiniCalendar` en `StudentProfilePage.tsx` para una alineación perfecta en grid y traducción de días en español de dos letras (`Lu`, `Ma`, etc.).
*   **Estandarización en Modo Oscuro:** Modificaciones exhaustivas de contraste y color para componentes en tema oscuro en `index.css` (dropdowns nativos, dropdown de usuario en navbar, testimonios, badges e insignias).
*   **Mensajes de Error Descriptivos:** Modificado `AdminStudentsPage.tsx` y `CourseManagementPage.tsx` para leer los mensajes de error de la API y mostrarlos directamente al administrador al fallar una eliminación o cancelación.
*   **Notificaciones Toast y Refinamiento de Modales:** Implementado un sistema de alertas interactivas flotantes (Toast) y estilizado moderno para los formularios de creación de usuarios y asignación manual de alumnos (con gradientes visuales y manejo de excepciones locales).
*   **Integración de Datos de Perfil (Teléfono y Foto):** Restaurado el diseño de barras laterales en los perfiles de usuario, corrigiendo el contexto de autenticación (`AuthContext.tsx`) para cargar correctamente el teléfono de la base de datos.
*   **Cierre de Modales por Clic Externo:** Configurada la interactividad de modales en `AdminStudentsPage.tsx` y `CourseManagementPage.tsx` para permitir su cierre al hacer clic en el fondo oscuro/backdrop, implementando la prevención de propagación de eventos (`e.stopPropagation()`).
*   **Estadísticas Dinámicas y Enlaces de Redes:** Actualizada la `SeccionCupos.tsx` para cargar dinámicamente el número real de cursos, estudiantes e instructores desde las APIs, y configurados los enlaces a redes en `Footer.tsx` (con enlace real al repositorio GitHub y seguridad `target="_blank"`).

---

## [v2.1.2] - 2026-07-13

Esta versión introduce ajustes finos de diseño en las interfaces principales del frontend, incluyendo animaciones y la estandarización de componentes de la página de registro e inicio.

### 🚀 Novedades y Mejoras Principales

#### 🎨 1. Ajustes y Mejoras de Diseño en el FrontEnd
*   **Página de Registro:** Se añadieron animaciones fluidas de nubes y siluetas de pájaros de fondo, ajuste de márgenes, y desactivación temporal del tema oscuro en esta pantalla para optimizar el contraste de los degradados del cielo. Se incorporó una marca de agua flotante de "InscribeMe" en la esquina inferior.
*   **Alineación de Componentes:** Corrección de espaciados (padding y margins) en [Navbar.tsx](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/api-gateway/frontend/src/components/Navbar.tsx), [Destacados.tsx](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/api-gateway/frontend/src/components/Destacados.tsx), [Testimonios.tsx](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/api-gateway/frontend/src/components/Testimonios.tsx) y [SeccionCupos.tsx](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/api-gateway/frontend/src/components/SeccionCupos.tsx).
*   **Fichas de Cursos y Tienda:** Optimización del espaciado, reducción de paddings en botones para evitar desbordamientos de texto en resoluciones pequeñas y redondeo de botones en [ProductPage.tsx](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/api-gateway/frontend/src/pages/ProductPage.tsx).

---

## [v2.1.1] - 2026-07-12

Esta versión introduce el control y manejo de excepciones para el registro de correos electrónicos duplicados en el microservicio de usuarios.

### 🚀 Novedades y Mejoras Principales

#### 🛡️ 1. Control de Correos Duplicados en Registro
*   **Validación de Correo Único:** Modificado [UsuarioService.java](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/servicio-usuarios/src/main/java/com/inscribeme/usuarios/service/UsuarioService.java) para verificar la existencia del correo electrónico previo al registro (`crearUsuario`) o actualización (`actualizarUsuario`), lanzando una excepción personalizada si ya existe.
*   **Excepción de Negocio:** Creación de la excepción [EmailAlreadyExistsException.java](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/servicio-usuarios/src/main/java/com/inscribeme/usuarios/exception/EmailAlreadyExistsException.java) para diferenciar los conflictos de correo duplicado.
*   **Manejo Global de Excepciones:** Implementado [GlobalExceptionHandler.java](file:///c:/Users/User/OneDrive/Documentos/inscribeME_REPO/inscribeME/servicio-usuarios/src/main/java/com/inscribeme/usuarios/exception/GlobalExceptionHandler.java) para interceptar `EmailAlreadyExistsException` y `DataIntegrityViolationException`, retornando un estado `400 Bad Request` y un cuerpo JSON con el mensaje `"El correo ya está registrado"`.

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
