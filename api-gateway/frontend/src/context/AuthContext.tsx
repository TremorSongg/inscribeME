import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService, type RegisterPayload } from "../services/authService";

// ── Tipos ──────────────────────────────────────────────────────
export type UserRole = "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN";

export type AuthUser = {
    id: number;
    username: string; // = nombre del backend
    email: string;
    phone: string;    // = telefono del backend
    role: UserRole;
    fotoPerfil?: string;
};

type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    updateUserPhoto: (photoBase64: string) => void;
};

// ── Contexto ───────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    isAuthenticated: false,
    updateUserPhoto: () => {},
});

// ── Provider ───────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        const stored = localStorage.getItem("authUser");
        return stored ? (JSON.parse(stored) as AuthUser) : null;
    });

    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem("authToken")
    );

    useEffect(() => {
        if (user) {
            localStorage.setItem("authUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("authUser");
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);

    // ── Login real contra el backend ───────────────────────────
    const login = async (email: string, password: string) => {
        const data = await authService.login(email, password);
        const authUser: AuthUser = {
            id: data.id,
            username: data.nombre,
            email: data.email,
            phone: "",
            role: data.rol,
            fotoPerfil: data.fotoPerfil,
        };
        setToken(data.token);
        setUser(authUser);
    };

    // ── Registro real + auto-login ─────────────────────────────
    const register = async (payload: RegisterPayload) => {
        await authService.registrar(payload);
        // Tras registrar, hace login automático para obtener el token
        await login(payload.email, payload.password);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("cartCourses");
    };

    const updateUserPhoto = (photoBase64: string) => {
        setUser(prev => prev ? { ...prev, fotoPerfil: photoBase64 } : null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: user !== null && token !== null,
                updateUserPhoto,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
