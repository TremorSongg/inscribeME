import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { notificacionesService } from "../services/notificacionesService";

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Shadow on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close menus on route change
    useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate("/login"); };

    // Sincronizar foto de perfil reactivamente
    useEffect(() => {
        if (user) {
            setPhoto(localStorage.getItem(`profilePhoto_${user.id}`));
        } else {
            setPhoto(null);
        }

        const handlePhotoUpdate = () => {
            if (user) {
                setPhoto(localStorage.getItem(`profilePhoto_${user.id}`));
            }
        };

        window.addEventListener("profilePhotoUpdated", handlePhotoUpdate);
        return () => window.removeEventListener("profilePhotoUpdated", handlePhotoUpdate);
    }, [user]);

    // Cargar notificaciones sin leer reactivamente
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = () => {
            notificacionesService.listarPorUsuario(user.id)
                .then(notifs => {
                    const count = notifs.filter(n => !n.leido).length;
                    setUnreadCount(count);
                })
                .catch(() => {});
        };

        fetchUnread();

        const handleNotifUpdate = () => fetchUnread();
        window.addEventListener("notificationsUpdated", handleNotifUpdate);

        // Polling de 15 segundos
        const interval = setInterval(fetchUnread, 15000);

        return () => {
            window.removeEventListener("notificationsUpdated", handleNotifUpdate);
            clearInterval(interval);
        };
    }, [user, isAuthenticated]);

    // ── Nav items by role ────────────────────────────────────────
    const navItems = !isAuthenticated
        ? [
            { name: "Inicio",    path: "/" },
            { name: "Cursos",    path: "/cursos" },
            { name: "Nosotros",  path: "/nosotros" },
          ]
        : user?.role === "ESTUDIANTE"
        ? [
            { name: "Inicio",    path: "/" },
            { name: "Cursos",    path: "/cursos" },
            { name: "Carrito",   path: "/carrito" },
            { name: "Mi Perfil", path: "/perfil" },
          ]
        : user?.role === "INSTRUCTOR"
        ? [
            { name: "Inicio",       path: "/" },
            { name: "Mis Cursos",   path: "/instructor/perfil" },
          ]
        : [
            { name: "Inicio",       path: "/" },
            { name: "Dashboard",    path: "/admin" },
            { name: "Cursos",       path: "/admin/cursos" },
            { name: "Estudiantes",  path: "/admin/estudiantes" },
            { name: "Notific.",     path: "/admin/notificaciones" },
          ];

    const roleInfo: Record<string, { label: string; dot: string }> = {
        ESTUDIANTE: { label: "Estudiante",     dot: "bg-emerald-400" },
        INSTRUCTOR: { label: "Instructor",     dot: "bg-blue-400"   },
        ADMIN:      { label: "Administrador",  dot: "bg-violet-400" },
    };

    const ri = user ? (roleInfo[user.role] ?? { label: user.role, dot: "bg-gray-400" }) : null;

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
            scrolled
                ? "bg-[#263238]/95 backdrop-blur-md shadow-xl shadow-black/20"
                : "bg-[#37474F]"
        }`}>
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* ── Logo ─────────────────────────────────────── */}
                <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFA000] font-black text-[#263238] text-sm shadow-lg shadow-[#FFA000]/30 transition-transform group-hover:scale-110 duration-200">
                        IM
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                        Inscribe<span className="text-[#FFA000]">Me</span>
                    </span>
                </Link>

                {/* ── Desktop nav ──────────────────────────────── */}
                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map(item => (
                        <NavLink key={item.name} to={item.path}
                            className={({ isActive }) =>
                                `relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "text-[#FFA000]"
                                        : "text-white/75 hover:text-white hover:bg-white/8"
                                }`
                            }>
                            {({ isActive }) => (
                                <>
                                    {item.name}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[#FFA000]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* ── Right actions ─────────────────────────────── */}
                <div className="hidden items-center gap-3 md:flex">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            {/* Campana de Notificaciones */}
                            <div className="relative">
                                <Link
                                    to={user.role === "ESTUDIANTE" ? "/perfil" : user.role === "INSTRUCTOR" ? "/instructor/perfil" : "/admin/notificaciones"}
                                    className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/15 transition-all duration-200"
                                    title="Notificaciones"
                                    onClick={() => {
                                        if (user.role === "ESTUDIANTE") {
                                            sessionStorage.setItem("activeProfileTab", "notificaciones");
                                            window.dispatchEvent(new Event("activeProfileTabChanged"));
                                        }
                                    }}
                                >
                                    <span className="text-base">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-[#37474F]">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Menú de Usuario */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(v => !v)}
                                    id="btn-user-menu"
                                    className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/15 transition group">
                                    {/* Avatar */}
                                    {photo ? (
                                        <img
                                            src={photo}
                                            alt="Avatar"
                                            className="h-8 w-8 rounded-full object-cover border border-[#FFA000]"
                                        />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA000] text-sm font-black text-[#263238]">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-white leading-none">{user.username.split(" ")[0]}</p>
                                        <div className="mt-0.5 flex items-center gap-1">
                                            <span className={`h-1.5 w-1.5 rounded-full ${ri?.dot}`} />
                                            <span className="text-[10px] text-white/50">{ri?.label}</span>
                                        </div>
                                    </div>
                                    <span className={`text-white/40 text-xs transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                                </button>

                                {/* Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-gray-100 py-1 animate-fadeInDown z-50">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-xs font-bold text-[#37474F] truncate">{user.username}</p>
                                            <p className="text-xs text-[#455A64] truncate">{user.email}</p>
                                        </div>
                                        <button id="btn-logout"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                                            <span>🚪</span> Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <NavLink to="/login"
                                className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white transition-colors">
                                Iniciar sesión
                            </NavLink>
                            <NavLink to="/registro" id="btn-register-nav"
                                className="rounded-xl bg-[#FFA000] px-5 py-2 text-sm font-bold text-[#263238] shadow-lg shadow-[#FFA000]/25 hover:bg-[#FFB300] hover:-translate-y-0.5 transition-all duration-200">
                                Registrarse
                            </NavLink>
                        </>
                    )}
                </div>

                {/* ── Hamburger ────────────────────────────────── */}
                <button
                    className="flex flex-col gap-1.5 p-2 md:hidden"
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label="Menú" id="btn-menu-mobile">
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                    <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </button>
            </nav>

            {/* ── Mobile menu ────────────────────────────────────── */}
            <div className={`overflow-hidden transition-all duration-300 md:hidden ${menuOpen ? "max-h-screen" : "max-h-0"}`}>
                <div className="border-t border-white/10 bg-[#263238] px-5 pb-6 pt-4">
                    {isAuthenticated && user && (
                        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/8 p-3">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt="Avatar"
                                    className="h-9 w-9 rounded-full object-cover border border-[#FFA000]"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFA000] text-sm font-black text-[#263238]">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-bold text-white">{user.username}</p>
                                <p className="text-xs text-white/50">{ri?.label}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        {navItems.map(item => (
                            <NavLink key={item.name} to={item.path}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        isActive ? "bg-[#FFA000] text-[#263238]" : "text-white/80 hover:bg-white/10 hover:text-white"
                                    }`
                                }>
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-4">
                        {isAuthenticated ? (
                            <button onClick={handleLogout}
                                className="w-full rounded-xl border border-red-400/40 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition">
                                🚪 Cerrar sesión
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <NavLink to="/login" onClick={() => setMenuOpen(false)}
                                    className="rounded-xl py-3 text-center text-sm font-semibold text-white/80 hover:bg-white/10 transition">
                                    Iniciar sesión
                                </NavLink>
                                <NavLink to="/registro" onClick={() => setMenuOpen(false)}
                                    className="rounded-xl bg-[#FFA000] py-3 text-center text-sm font-bold text-[#263238] hover:bg-[#FFB300] transition">
                                    Registrarse
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
