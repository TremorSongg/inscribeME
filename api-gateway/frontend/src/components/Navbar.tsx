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
    const photo = user?.fotoPerfil || null;
    const [unreadCount, setUnreadCount] = useState(0);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

    // Sincronizar tema
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.removeAttribute("data-theme");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light");

    // Shadow on scroll
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close menus on route change
    useEffect(() => { setMenuOpen(false); setUserMenuOpen(false); }, [location.pathname]);

    const handleLogout = () => { logout(); navigate("/login"); };

    // Cargar notificaciones sin leer reactivamente
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setUnreadCount(0);
            return;
        }
        const fetchUnread = () => {
            const promise = user.role === "ADMIN"
                ? notificacionesService.listarTodas()
                : notificacionesService.listarPorUsuario(user.id);

            promise.then(notifs => {
                    const count = (notifs ?? []).filter(n => !n.leido).length;
                    setUnreadCount(count);
                })
                .catch(() => {});
        };

        fetchUnread();

        const handleNotifUpdate = () => fetchUnread();
        window.addEventListener("notificationsUpdated", handleNotifUpdate);

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
            { name: "Notificaciones",     path: "/admin/notificaciones" },
          ];

    const roleInfo: Record<string, { label: string; dot: string }> = {
        ESTUDIANTE: { label: "Estudiante",     dot: "bg-emerald-400" },
        INSTRUCTOR: { label: "Instructor",     dot: "bg-blue-400"   },
        ADMIN:      { label: "Administrador",  dot: "bg-violet-400" },
    };

    const ri = user ? (roleInfo[user.role] ?? { label: user.role, dot: "bg-gray-400" }) : null;

    return (
        <header className={`sticky top-0 z-50 w-full flex flex-col items-center border-b transition-all duration-300 ${
            scrolled
                ? "bg-white/95 backdrop-blur-md border-sky-100 shadow-sm"
                : "bg-white/80 backdrop-blur-md border-sky-100/50"
        }`}>
            <nav className="w-full max-w-7xl mx-auto flex h-16 md:h-20 lg:h-28 items-center justify-between px-4 md:px-6 gap-4 md:gap-8">

                {/* ── Logo ─────────────────────────────────────── */}
                <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setMenuOpen(false)}>
                    <div className="flex h-8 w-8 md:h-11 md:w-11 items-center justify-center rounded-lg md:rounded-xl bg-primary-500 font-black text-white text-sm md:text-base shadow-md transition-transform group-hover:scale-105 duration-200">
                        IM
                    </div>
                    <span className="text-lg md:text-2xl font-bold tracking-tight text-neutral-900 font-display">
                        Inscribe<span className="text-primary-500">Me</span>
                    </span>
                </Link>

                {/* ── Desktop nav ──────────────────────────────── */}
                <div className="hidden items-center bg-sky-100 rounded-full p-2 border border-sky-100 gap-6 md:flex">
                    {navItems.map(item => (
                        <NavLink key={item.name} to={item.path}
                            className={({ isActive }) =>
                                `relative rounded-full !px-8 py-3 text-base font-bold transition-all duration-200 ${
                                    isActive
                                        ? "text-white shadow-sm"
                                        : "text-sky-800 hover:bg-sky-100 hover:text-sky-900"
                                }`
                            }
                            style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #006397, #0EA5E9)' } : {}}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* ── Right actions ─────────────────────────────── */}
                <div className="hidden items-center gap-x-6 md:flex">
                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-8">
                            {/* Botón de Modo Claro / Oscuro */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-neutral-800 hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
                                title={theme === "light" ? "Modo oscuro" : "Modo claro"}
                            >
                                <span className="text-lg">{theme === "light" ? "🌙" : "☀️"}</span>
                            </button>

                            {/* Campana de Notificaciones */}
                            <div className="relative">
                                <Link
                                    to={user.role === "ESTUDIANTE" ? "/perfil" : user.role === "INSTRUCTOR" ? "/instructor/perfil" : "/admin/notificaciones"}
                                    className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-neutral-800 hover:bg-neutral-200 transition-all duration-200"
                                    title="Notificaciones"
                                    onClick={() => {
                                        if (user.role === "ESTUDIANTE" || user.role === "INSTRUCTOR") {
                                            sessionStorage.setItem("activeProfileTab", "notificaciones");
                                            window.dispatchEvent(new Event("activeProfileTabChanged"));
                                        }
                                    }}
                                >
                                    <span className="text-lg">🔔</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Menú de Usuario */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(v => !v)}
                                    id="btn-user-menu"
                                    className="flex items-center gap-3 rounded-full bg-sky-100 px-4 py-2.5 hover:bg-sky-200 transition group cursor-pointer border border-neutral-200/50">
                                    <Link
                                        to={user.role === "ESTUDIANTE" ? "/perfil" : user.role === "INSTRUCTOR" ? "/instructor/perfil" : "/admin"}
                                        className="hover:scale-105 transition-transform"
                                        title="Ir a mi perfil"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setUserMenuOpen(false);
                                        }}
                                    >
                                        {photo ? (
                                            <img
                                                src={photo}
                                                alt="Avatar"
                                                className="h-10 w-10 rounded-full object-cover border border-primary-500"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-base font-black text-white">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </Link>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-neutral-800 leading-none">{user.username.split(" ")[0]}</p>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className={`h-1.5 w-1.5 rounded-full ${ri?.dot}`} />
                                            <span className="text-xs text-neutral-900">{ri?.label}</span>
                                        </div>
                                    </div>
                                    <span className={`text-neutral-400 text-sm transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}>▾</span>
                                </button>

                                {/* Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-sky-100 shadow-2xl border border-neutral-200 !py-3 animate-fadeInDown z-950">
                                        <div className="px-4 py-3 border-b border-neutral-100">
                                            <p className="text-center text-xs font-bold text-neutral-900 truncate">{user.username}</p>
                                            <p className="text-center text-xs text-neutral-900 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to={user.role === "ESTUDIANTE" ? "/perfil" : user.role === "INSTRUCTOR" ? "/instructor/perfil" : "/admin"}
                                            className="flex w-full items-center gap-2 px-4 !py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-150 transition"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <span>👤</span> Mi Perfil
                                        </Link>
                                        <button id="btn-logout"
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 border-t border-neutral-100 transition cursor-pointer">
                                            <span>🚪</span> Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
                                title={theme === "light" ? "Modo oscuro" : "Modo claro"}
                            >
                                <span className="text-lg">{theme === "light" ? "🌙" : "☀️"}</span>
                            </button>
                            <NavLink to="/login"
                                className="px-5 py-3 text-base font-bold text-neutral-700 hover:text-primary-600 transition-colors">
                                Iniciar sesión
                            </NavLink>
                            <NavLink to="/registro" id="btn-register-nav"
                                className="btn btn-primary px-6 py-3 text-base font-bold rounded-full animate-fadeInUp">
                                Registrarse
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* ── Hamburger ────────────────────────────────── */}
                <button
                    type="button"
                    className="flex flex-col gap-1.5 p-2 md:hidden"
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label="Menú" id="btn-menu-mobile">
                    <span className={`block h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                    <span className={`block h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
                    <span className={`block h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </button>
            </nav>

            {/* ── Mobile menu ────────────────────────────────────── */}
            <div className={`w-full overflow-hidden transition-all duration-300 md:hidden ${menuOpen ? "max-h-screen" : "max-h-0"}`}>
                <div className="border-t border-neutral-200 bg-white px-5 pb-6 pt-4">
                    {isAuthenticated && user && (
                        <div className="mb-4 flex items-center justify-between rounded-2xl bg-neutral-50 border border-neutral-200 p-3 shadow-inner">
                            <div className="flex items-center gap-3">
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt="Avatar"
                                        className="h-9 w-9 rounded-full object-cover border border-primary-500"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-sm font-black text-white">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-neutral-900 leading-none">{user.username}</p>
                                    <p className="text-xs text-neutral-500 mt-1">{ri?.label}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
                                title={theme === "light" ? "Modo oscuro" : "Modo claro"}
                            >
                                <span className="text-base">{theme === "light" ? "🌙" : "☀️"}</span>
                            </button>
                        </div>
                    )}
                        <div className="flex flex-col gap-1">
                            {navItems.map(item => (
                                <NavLink key={item.name} to={item.path}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            isActive ? "bg-sky-50 text-sky-700 font-bold border border-sky-100" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                                        }`
                                    }>
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    <div className="mt-4 border-t border-neutral-200 pt-4">
                        {isAuthenticated ? (
                            <button onClick={handleLogout}
                                type="button"
                                className="w-full rounded-xl border border-red-400/40 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer">
                                🚪 Cerrar sesión
                            </button>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="mb-2 flex items-center justify-between px-2">
                                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tema</span>
                                    <button
                                        type="button"
                                        onClick={toggleTheme}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-all duration-200 cursor-pointer"
                                        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
                                    >
                                        <span className="text-base">{theme === "light" ? "🌙" : "☀️"}</span>
                                    </button>
                                </div>
                                <NavLink to="/login" onClick={() => setMenuOpen(false)}
                                    className="rounded-xl py-3 text-center text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition">
                                    Iniciar sesión
                                </NavLink>
                                <NavLink to="/registro" onClick={() => setMenuOpen(false)}
                                    className="rounded-xl bg-primary-500 text-white py-3 text-center text-sm font-bold hover:bg-primary-600 transition shadow-md">
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