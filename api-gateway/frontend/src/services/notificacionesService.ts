import { api } from "./api";

export type NotificacionDTO = {
    id: number;
    usuarioId: number;
    mensaje: string;
    leido: boolean;
    fechaCreacion?: string;
};

export const notificacionesService = {
    listarPorUsuario: (usuarioId: number) =>
        api.get<NotificacionDTO[]>(`/api/notificaciones/usuario/${usuarioId}`),

    listarTodas: () => api.get<NotificacionDTO[]>("/api/notificaciones"),

    crear: (usuarioId: number, mensaje: string) =>
        api.post<NotificacionDTO>("/api/notificaciones", { usuarioId, mensaje }),

    marcarLeida: (id: number, notif: Partial<NotificacionDTO>) =>
        api.put<NotificacionDTO>(`/api/notificaciones/${id}`, notif),

    eliminar: (id: number) => api.delete<void>(`/api/notificaciones/${id}`),
};
