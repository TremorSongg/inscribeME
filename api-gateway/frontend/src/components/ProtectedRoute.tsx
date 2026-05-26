import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../context/AuthContext";

type ProtectedRouteProps = {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirige al perfil correspondiente si intenta acceder a una ruta no permitida
        if (user.role === "ESTUDIANTE") return <Navigate to="/perfil" replace />;
        if (user.role === "INSTRUCTOR") return <Navigate to="/instructor/perfil" replace />;
        if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
