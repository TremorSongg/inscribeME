-- ============================================================
--  InscribeMe - Creación de Bases de Datos por Microservicio
--  Ejecutado automaticamente por Docker al crear el contenedor MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS inscribeme_usuarios
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS inscribeme_cursos
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS inscribeme_inscripciones
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS inscribeme_carrito
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS inscribeme_notificaciones
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS inscribeme_reportes
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

