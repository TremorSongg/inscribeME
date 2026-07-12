import { api } from "./api";

// ── Tipos ───────────────────────────────────────────────────────
export type EstadoInscripcion = "INSCRITO" | "COMPLETADO" | "CANCELADO";

export type InscripcionDTO = {
    id?: number;
    cursoId: number;
    nombreCurso: string;
    descripcionCurso: string;
    fechaInicioCurso: string;
    fechaFinCurso: string;
    fechaInscripcion: string;
    estado: EstadoInscripcion;
    nombreInstructor: string;
};

export type AlumnoCursoDTO = {
    inscripcionId?: number;
    usuarioId: number;
    nombreUsuario: string;
    cursoId: number;
    nombreCurso: string;
    fechaInscripcion: string;
    estado: string;
};

export type AsistenciaDTO = {
    id?: number;
    cursoId: number;
    usuarioId: number;
    nombreUsuario: string;
    nombreCurso: string;
    fecha: string; // "YYYY-MM-DD"
    presente: boolean;
    observacion?: string;
};

export type InscripcionPayload = {
    usuarioId: number;
    cursoId: number;
    nombreCurso: string;
    nombreUsuario?: string;       // nombre desnormalizado del estudiante
    descripcionCurso?: string;
    fechaInicioCurso?: string;
    fechaFinCurso?: string;
    nombreInstructor?: string;
    estado: EstadoInscripcion;
};

// ── Servicio ────────────────────────────────────────────────────
export const inscripcionesService = {

    /** Inscripciones de un estudiante (perfil) */
    listarPorUsuario: async (usuarioId: number): Promise<InscripcionDTO[]> => {
        try {
            const result = await api.get<InscripcionDTO[]>(`/api/inscripciones/usuario/${usuarioId}`);
            return result ?? [];
        } catch {
            return [];
        }
    },

    /** Alumnos inscritos en un curso (instructor/admin) */
    listarPorCurso: async (cursoId: number): Promise<AlumnoCursoDTO[]> => {
        try {
            const result = await api.get<AlumnoCursoDTO[]>(`/api/inscripciones/curso/${cursoId}`);
            return result ?? [];
        } catch {
            return [];
        }
    },

    /** Admin: crear inscripción directa sin carrito */
    crear: (payload: InscripcionPayload) =>
        api.post<{ id: number }>("/api/inscripciones", payload),

    /** Dar de baja / eliminar inscripción */
    eliminar: (id: number) =>
        api.delete<void>(`/api/inscripciones/${id}`),

    /** Registrar asistencia individual (upsert) */
    registrarAsistencia: (dto: AsistenciaDTO) =>
        api.post<AsistenciaDTO>("/api/inscripciones/asistencia", dto),

    /** Registrar asistencia en lote para una sesión completa */
    registrarAsistenciaLote: (lista: AsistenciaDTO[]) =>
        api.post<AsistenciaDTO[]>("/api/inscripciones/asistencia/lote", lista),

    /** Asistencia de un curso en una fecha específica */
    getAsistenciaPorFecha: (cursoId: number, fecha: string): Promise<AsistenciaDTO[]> =>
        api.get<AsistenciaDTO[]>(`/api/inscripciones/asistencia/curso/${cursoId}/fecha/${fecha}`),

    /** Historial completo de asistencia de un curso */
    getHistorialAsistencia: (cursoId: number): Promise<AsistenciaDTO[]> =>
        api.get<AsistenciaDTO[]>(`/api/inscripciones/asistencia/curso/${cursoId}`),
};
