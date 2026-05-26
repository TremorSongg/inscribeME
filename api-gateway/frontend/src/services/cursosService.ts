import { api } from "./api";

// ── Tipos del backend ───────────────────────────────────────────
export type CursoDTO = {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    cupoTotal: number;
    cupoDisponible: number;
    fechaInicio: string; // ISO date "2025-07-01"
    fechaFin: string;
    nombreInstructor: string;
};

export type CursoPayload = {
    nombre: string;
    descripcion: string;
    precio: number;
    cupoTotal: number;
    cupoDisponible: number;
    fechaInicio: string;
    fechaFin: string;
    instructorId?: number;
    nombreInstructor: string;
};

// Mapeo de ícono por nombre de curso (fallback)
const ICON_MAP: Record<string, string> = {
    fútbol: "⚽", futbol: "⚽", soccer: "⚽",
    zumba: "🎵", baile: "🎵", música: "🎸", musica: "🎸",
    escalada: "⛰️", aventura: "🏔️",
    natación: "🏊", natacion: "🏊",
    yoga: "🧘", bienestar: "🌿",
    karate: "🥋", artes: "🥋",
    arte: "🎨", pintura: "🎨",
    taller: "🛠️",
};

const CATEGORY_MAP: Record<string, string> = {
    fútbol: "Deporte", futbol: "Deporte", natación: "Deporte", natacion: "Deporte", karate: "Deporte",
    zumba: "Fitness", yoga: "Bienestar",
    escalada: "Aventura", aventura: "Aventura",
    arte: "Arte", pintura: "Arte", música: "Arte", musica: "Arte", taller: "Arte",
};

export function getIcon(nombre: string): string {
    const lower = nombre.toLowerCase();
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (lower.includes(key)) return icon;
    }
    return "📚";
}

export function getCategory(nombre: string): string {
    const lower = nombre.toLowerCase();
    for (const [key, cat] of Object.entries(CATEGORY_MAP)) {
        if (lower.includes(key)) return cat;
    }
    return "General";
}

export const cursosService = {
    listar: () => api.get<CursoDTO[]>("/api/cursos"),
    obtener: (id: number) => api.get<CursoDTO>(`/api/cursos/${id}`),
    crear: (payload: CursoPayload) => api.post<CursoDTO>("/api/cursos", payload),
    actualizar: (id: number, payload: CursoPayload) =>
        api.put<CursoDTO>(`/api/cursos/${id}`, payload),
    eliminar: (id: number) => api.delete<void>(`/api/cursos/${id}`),
};
