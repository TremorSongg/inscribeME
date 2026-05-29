import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { cursosService, type CursoDTO } from "../../services/cursosService";
import { usuariosService, type UsuarioBackend } from "../../services/authService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CursoDTO[]>([]);
    const [users, setUsers] = useState<UsuarioBackend[]>([]);
    const [notifs, setNotifs] = useState<NotificacionDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            cursosService.listar(),
            usuariosService.listarTodos(),
            notificacionesService.listarPorUsuario(user.id),
        ]).then(([c, u, n]) => {
            setCourses(c); setUsers(u); setNotifs(n); setLoading(false);
        }).catch(() => setLoading(false));
    }, [user]);

    if (!user) return null;

    const students = users.filter(u => u.rol === "ESTUDIANTE");
    const instructors = users.filter(u => u.rol === "INSTRUCTOR");
    const unreadCount = notifs.filter(n => !n.leido).length;

    const stats = [
        { label: "Cursos activos", value: loading ? "…" : courses.length,       icon: "📚", from: "from-blue-500",    to: "to-blue-700"    },
        { label: "Estudiantes",    value: loading ? "…" : students.length,      icon: "🎒", from: "from-emerald-500", to: "to-emerald-700" },
        { label: "Instructores",   value: loading ? "…" : instructors.length,   icon: "🏫", from: "from-violet-500",  to: "to-violet-700"  },
        { label: "Sin leer",       value: loading ? "…" : unreadCount,          icon: "🔔", from: "from-amber-400",   to: "to-orange-500"  },
    ];

    const quickLinks = [
        {
            to: "/admin/cursos",
            id: "link-admin-courses",
            icon: "📖",
            title: "Gestión de Cursos",
            desc: "Crear, editar, eliminar cursos y asignar instructores y alumnos.",
            cta: "Ir a cursos",
            accent: "bg-blue-600",
        },
        {
            to: "/admin/estudiantes",
            id: "link-admin-students",
            icon: "👥",
            title: "Estudiantes",
            desc: "Ver perfil completo, cursos inscritos y registro de asistencia de cada alumno.",
            cta: "Ver estudiantes",
            accent: "bg-emerald-600",
        },
        {
            to: "/admin/notificaciones",
            id: "link-admin-notifs",
            icon: "🔔",
            title: "Notificaciones",
            desc: "Revisa y envía notificaciones a estudiantes e instructores.",
            cta: "Ver notificaciones",
            accent: "bg-amber-500",
            badge: unreadCount > 0 ? unreadCount : null,
        },
    ];

    return (
        /* CAMBIO CLAVE: Cambiamos py-10 por pt-14 pb-28 y agregamos flex flex-col items-center 
           para amarrar perfectamente el panel al centro geométrico del navegador */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-[#212121] w-full flex flex-col items-center">
            {/* w-full asegura la expansión correcta de la rejilla interna */}
            <div className="w-full max-w-7xl mx-auto">

                {/* ── HEADER DEL DASHBOARD ─────────────────────────────────────── */}
                <div className="mb-16 animate-fadeInUp">
                    {/* Sincronizamos la etiqueta con la tipografía más grande y espaciada */}
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFA000]">
                        Panel Admin
                    </p>
                    {/* Escalamos el título a un robusto text-5xl/md:text-6xl */}
                    <h1 className="mt-2 text-5xl font-black text-[#37474F] md:text-6xl tracking-tight">
                        Dashboard
                    </h1>
                    <p className="mt-3 text-lg text-[#455A64]">
                        Bienvenido, <span className="font-semibold text-[#37474F]">{user.username}</span>.
                    </p>
                </div>

                {/* ── BLOQUE DE ESTADÍSTICAS ─────────────────────────────────────── */}
                {/* Agregamos gap-x-6 gap-y-4 para dar más holgura lateral a los contadores rápidos */}
                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 mb-16">
                    {stats.map((s, i) => (
                        <div key={s.label}
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.from} ${s.to} p-6 shadow-md transition-transform hover:scale-[1.02] duration-300 animate-fadeInUp`}
                            style={{ animationDelay: `${i * 80}ms` }}>
                            
                            <div className="absolute -right-4 -top-4 text-8xl opacity-10 select-none pointer-events-none">
                                {s.icon}
                            </div>
                            <p className="text-5xl font-black text-white tracking-tight">{s.value}</p>
                            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/80">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ── ACCESOS RÁPIDOS ─────────────────────────────────────────────── */}
                {/* CAMBIO CLAVE: Incorporamos la clase 'espaciado-secciones' en el margen de abajo 
                    para garantizar aire real antes de tocar la tabla de usuarios */}
                <div className="mb-16">
                    <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-[#455A64]">
                        Accesos rápidos
                    </h2>
                    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                        {quickLinks.map((q, i) => (
                            <Link key={q.id} to={q.to} id={q.id}
                                className="group relative rounded-2xl bg-white p-7 shadow-sm border border-gray-100 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#FFA000]/20 transition-all duration-300 animate-fadeInUp flex flex-col justify-between"
                                style={{ animationDelay: `${320 + i * 80}ms` }}>
                                
                                {q.badge && (
                                    <span className="absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white shadow-sm animate-pulse">
                                        {q.badge}
                                    </span>
                                )}
                                <div>
                                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${q.accent} text-2xl shadow-md transition-transform group-hover:scale-105 duration-300`}>
                                        {q.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#37474F]">{q.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[#455A64]">{q.desc}</p>
                                </div>
                                <span className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#FFA000] group-hover:gap-2 transition-all">
                                    {q.cta} <span className="transition-transform group-hover:translate-x-1">→</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── SECCIÓN DE USUARIOS RECIENTES ────────────────────────────────── */}
                <div className="animate-fadeInUp" style={{ animationDelay: "560ms" }}>
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#455A64]">
                            Usuarios recientes
                        </h2>
                        <Link to="/admin/estudiantes" className="text-sm font-bold text-[#FFA000] hover:underline tracking-wide">
                            Ver todos →
                        </Link>
                    </div>
                    
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
                        {loading ? (
                            <div className="p-6 space-y-3">
                                {[1,2,3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {users.slice(0, 6).map((u, i) => (
                                    <div key={u.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition animate-fadeInUp"
                                        style={{ animationDelay: `${640 + i * 40}ms` }}>
                                        
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm ${
                                            u.rol === "ADMIN" ? "bg-violet-600" :
                                            u.rol === "INSTRUCTOR" ? "bg-blue-500" :
                                            "bg-emerald-500"}`}>
                                            {u.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-bold text-[#37474F] truncate">{u.nombre}</p>
                                            <p className="text-xs font-semibold text-[#455A64] truncate mt-0.5">{u.email}</p>
                                        </div>
                                        
                                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                                            u.rol === "ADMIN" ? "bg-violet-50 text-violet-700" :
                                            u.rol === "INSTRUCTOR" ? "bg-blue-50 text-blue-700" :
                                            "bg-emerald-50 text-emerald-700"}`}>
                                            {u.rol}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
};

export default AdminDashboardPage;