import { api } from "./api";

// ── Tipos reales del backend ─────────────────────────────────────
export type ItemCarritoDTO = {
    cursoId: number;
    nombreCurso: string;
    cantidad: number;
    precioUnitario: number;   // nombre real del backend
    subtotal: number;
};

export type CarritoDTO = {
    items: ItemCarritoDTO[];
    total: number;
};

// ── Servicio ─────────────────────────────────────────────────────
export const carritoService = {
    obtener: async (usuarioId: number): Promise<CarritoDTO> => {
        try {
            const data = await api.get<CarritoDTO>(`/api/carrito/usuario/${usuarioId}`);
            return { items: data?.items ?? [], total: data?.total ?? 0 };
        } catch {
            return { items: [], total: 0 };
        }
    },

    agregar: (usuarioId: number, cursoId: number, nombreCurso: string, precio: number) =>
        api.post<{ message: string }>("/api/carrito/agregar", {
            usuarioId,
            cursoId,
            nombreCurso,
            precio,
        }),

    eliminarItem: (usuarioId: number, cursoId: number) =>
        api.delete<{ message: string }>(`/api/carrito/item/${cursoId}`, { usuarioId }),

    vaciar: (usuarioId: number) =>
        api.delete<{ message: string }>("/api/carrito/vaciar", { usuarioId }),

    checkout: (usuarioId: number) =>
        api.post<object>("/api/carrito/comprar", undefined, { usuarioId }),
};
