-- ============================================================
--  InscribeMe - Datos de prueba completos
--  Ejecutado automáticamente por Docker SOLO en la primera
--  inicialización (cuando el volumen mysql-data no existe aún)
--
--  Para volver a ejecutar: docker compose down -v && docker compose up
-- ============================================================

-- ── USUARIOS ──────────────────────────────────────────────────
USE inscribeme_usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    telefono VARCHAR(255),
    rol VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO usuarios (id, nombre, email, password, telefono, rol) VALUES
-- Administrador
(1, 'Admin Sistema',    'admin@inscribeme.cl',     'admin123',    '+56912345678', 'ADMIN'),
-- Instructores
(2, 'Carlos Rojas',     'carlos@inscribeme.cl',    'instructor1', '+56911111111', 'INSTRUCTOR'),
(3, 'Maria Gonzalez',   'maria@inscribeme.cl',     'instructor2', '+56922222222', 'INSTRUCTOR'),
(4, 'Ana Munoz',        'ana@inscribeme.cl',        'instructor3', '+56933333333', 'INSTRUCTOR'),
-- Estudiantes
(5, 'Juan Rodriguez',   'juan@inscribeme.cl',       'estudiante1', '+56944444444', 'ESTUDIANTE'),
(6, 'Valentina Cruz',   'valentina@inscribeme.cl',  'estudiante2', '+56955555555', 'ESTUDIANTE'),
(7, 'Pedro Soto',       'pedro@inscribeme.cl',      'estudiante3', '+56966666666', 'ESTUDIANTE');

-- ── CURSOS ────────────────────────────────────────────────────
USE inscribeme_cursos;

CREATE TABLE IF NOT EXISTS cursos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT,
    precio DOUBLE NOT NULL,
    cupo_total INT NOT NULL,
    cupo_disponible INT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    instructor_id BIGINT,
    nombre_instructor VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO cursos (id, nombre, descripcion, precio, cupo_total, cupo_disponible, fecha_inicio, fecha_fin, instructor_id, nombre_instructor) VALUES
(1, 'Futbol Infantil',
 'Actividad deportiva orientada a ninos que buscan aprender fundamentos del futbol en un ambiente seguro y entretenido.',
 0, 15, 12, '2025-07-01', '2025-08-31', 2, 'Carlos Rojas'),

(2, 'Zumba Femenino',
 'Clases grupales de zumba para mejorar la condicion fisica mediante baile, musica y entrenamiento dinamico.',
 5000, 20, 18, '2025-08-01', '2025-09-30', 3, 'Maria Gonzalez'),

(3, 'Escalada Grupal',
 'Experiencia grupal de escalada guiada para principiantes, enfocada en trabajo en equipo y superacion personal.',
 12000, 10, 8, '2025-09-01', '2025-10-31', 4, 'Ana Munoz'),

(4, 'Taller de Natacion',
 'Taller practico para aprender y mejorar tecnicas basicas de natacion, respiracion y seguridad en el agua.',
 8000, 12, 10, '2025-10-01', '2025-11-30', 2, 'Carlos Rojas'),

(5, 'Yoga Inicial',
 'Sesiones de yoga para principiantes enfocadas en respiracion, movilidad, equilibrio y relajacion.',
 6000, 20, 15, '2025-11-01', '2025-12-31', 3, 'Maria Gonzalez'),

(6, 'Taller de Arte',
 'Actividad formativa para desarrollar habilidades artisticas basicas mediante pintura, dibujo y expresion creativa.',
 7000, 25, 20, '2025-12-01', '2026-01-31', 4, 'Ana Munoz'),

(7, 'Karate Tradicional',
 'Fortalece cuerpo y mente mediante las tecnicas del karate tradicional. Ideal para todos los niveles.',
 9000, 18, 14, '2025-07-15', '2025-10-15', 2, 'Carlos Rojas');

-- ── INSCRIPCIONES ─────────────────────────────────────────────
USE inscribeme_inscripciones;

CREATE TABLE IF NOT EXISTS inscripciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_inscripcion DATE,
    estado VARCHAR(255),
    usuario_id BIGINT,
    curso_id BIGINT,
    nombre_curso VARCHAR(255),
    descripcion_curso VARCHAR(255),
    fecha_inicio_curso DATE,
    fecha_fin_curso DATE,
    nombre_instructor VARCHAR(255),
    nombre_usuario VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO inscripciones
    (id, usuario_id, curso_id, nombre_usuario, nombre_curso, descripcion_curso,
     fecha_inicio_curso, fecha_fin_curso, nombre_instructor, fecha_inscripcion, estado)
VALUES
-- Juan Rodriguez (id=5) → Futbol Infantil, Yoga Inicial, Karate Tradicional
(1, 5, 1, 'Juan Rodriguez',  'Futbol Infantil',    'Actividad deportiva orientada a ninos.',  '2025-07-01', '2025-08-31',  'Carlos Rojas',   '2025-06-01', 'INSCRITO'),
(2, 5, 5, 'Juan Rodriguez',  'Yoga Inicial',       'Sesiones de yoga para principiantes.',    '2025-11-01', '2025-12-31',  'Maria Gonzalez', '2025-06-01', 'INSCRITO'),
(3, 5, 7, 'Juan Rodriguez',  'Karate Tradicional', 'Fortalece cuerpo y mente.',               '2025-07-15', '2025-10-15',  'Carlos Rojas',   '2025-06-04', 'INSCRITO'),
-- Valentina Cruz (id=6) → Zumba Femenino, Taller de Arte
(4, 6, 2, 'Valentina Cruz',  'Zumba Femenino',     'Clases grupales de zumba.',               '2025-08-01', '2025-09-30',  'Maria Gonzalez', '2025-06-02', 'INSCRITO'),
(5, 6, 6, 'Valentina Cruz',  'Taller de Arte',     'Actividad formativa artistica.',           '2025-12-01', '2026-01-31',  'Ana Munoz',      '2025-06-02', 'INSCRITO'),
-- Pedro Soto (id=7) → Futbol Infantil, Escalada Grupal
(6, 7, 1, 'Pedro Soto',      'Futbol Infantil',    'Actividad deportiva orientada a ninos.',  '2025-07-01', '2025-08-31',  'Carlos Rojas',   '2025-06-03', 'INSCRITO'),
(7, 7, 3, 'Pedro Soto',      'Escalada Grupal',    'Escalada guiada para principiantes.',     '2025-09-01', '2025-10-31',  'Ana Munoz',      '2025-06-03', 'INSCRITO');

-- ── ASISTENCIAS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asistencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    curso_id BIGINT,
    usuario_id BIGINT,
    nombre_usuario VARCHAR(255),
    nombre_curso VARCHAR(255),
    fecha DATE,
    presente TINYINT(1),
    observacion VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO asistencias (id, curso_id, usuario_id, nombre_usuario, nombre_curso, fecha, presente, observacion) VALUES
(1, 1, 5, 'Juan Rodriguez', 'Futbol Infantil', '2025-07-02', 1, 'Clase normal'),
(2, 1, 7, 'Pedro Soto', 'Futbol Infantil', '2025-07-02', 1, 'Clase normal'),
(3, 1, 5, 'Juan Rodriguez', 'Futbol Infantil', '2025-07-04', 1, 'Llego temprano'),
(4, 1, 7, 'Pedro Soto', 'Futbol Infantil', '2025-07-04', 0, 'Injustificado'),
(5, 1, 5, 'Juan Rodriguez', 'Futbol Infantil', '2025-07-06', 0, 'Enfermedad'),
(6, 1, 7, 'Pedro Soto', 'Futbol Infantil', '2025-07-06', 1, 'Participativo');

-- ── NOTIFICACIONES ────────────────────────────────────────────
USE inscribeme_notificaciones;

CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    mensaje TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO notificaciones (id, usuario_id, mensaje, leido) VALUES
(1, 1, 'Bienvenido al panel de administracion de InscribeMe.', 0),
(2, 2, 'Tienes 3 alumnos inscritos en Futbol Infantil. Revisa tu panel.', 0),
(3, 3, 'Zumba Femenino comienza el 1 de agosto. Prepara tu clase!', 1),
(4, 5, 'Tu cuenta fue creada exitosamente. Explora los cursos disponibles.', 0),
(5, 6, 'Bienvenida a InscribeMe, Valentina. Revisa el catalogo de cursos.', 0),
(6, 7, 'Bienvenido a InscribeMe. Explora nuestras actividades disponibles.', 0);
