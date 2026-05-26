/**
 * Cliente HTTP base para todos los microservicios.
 * - En producción (Docker): BASE_URL = "" → fetch usa path relativo,
 *   Nginx del frontend proxea /api/ → api-gateway:8080
 * - En desarrollo local: BASE_URL = "http://localhost:8080"
 * Añade automáticamente el JWT token del localStorage si existe.
 */

const BASE_URL = import.meta.env.PROD ? "" : "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    params?: Record<string, string | number>
): Promise<T> {
    const token = localStorage.getItem("authToken");

    // Construir la URL correctamente tanto en dev (URL absoluta) como en prod (path relativo)
    let urlString = BASE_URL + path;
    if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
        urlString += "?" + searchParams.toString();
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(urlString, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
            const errBody = await res.json() as { error?: string; message?: string };
            errorMsg = errBody.error ?? errBody.message ?? errorMsg;
        } catch {
            // ignore
        }
        throw new Error(errorMsg);
    }

    // Para DELETE 204 No Content
    if (res.status === 204) return undefined as unknown as T;

    return res.json() as Promise<T>;
}

export const api = {
    get: <T>(path: string, params?: Record<string, string | number>) =>
        request<T>("GET", path, undefined, params),
    post: <T>(path: string, body?: unknown, params?: Record<string, string | number>) =>
        request<T>("POST", path, body, params),
    put: <T>(path: string, body?: unknown) =>
        request<T>("PUT", path, body),
    delete: <T>(path: string, params?: Record<string, string | number>) =>
        request<T>("DELETE", path, undefined, params),
    patch: <T>(path: string, body?: unknown) =>
        request<T>("PATCH", path, body),
};
