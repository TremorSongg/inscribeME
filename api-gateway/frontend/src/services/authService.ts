import { api } from "./api";

// ── Tipos que devuelve el backend ───────────────────────────────
export type LoginResponse = {
    token: string;
    id: number;
    nombre: string;
    email: string;
    rol: "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN";
};

export type RegisterPayload = {
    nombre: string;
    email: string;
    password: string;
    telefono: string;
    rol: "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN";
};

export type UsuarioBackend = {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
    rol: "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN";
};

export const authService = {
    login: (email: string, password: string) =>
        api.post<LoginResponse>("/api/usuarios/login", { email, password }),

    registrar: (payload: RegisterPayload) =>
        api.post<UsuarioBackend>("/api/usuarios/registrar", payload),
};

export const usuariosService = {
    listarTodos: () => api.get<UsuarioBackend[]>("/api/usuarios"),
    obtenerPorId: (id: number) => api.get<UsuarioBackend>(`/api/usuarios/${id}`),
    listarInstructores: () => api.get<UsuarioBackend[]>("/api/usuarios/instructores"),
    eliminar: (id: number) => api.delete<void>(`/api/usuarios/${id}`),
};
