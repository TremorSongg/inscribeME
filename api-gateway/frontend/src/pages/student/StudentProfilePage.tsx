import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { inscripcionesService, type InscripcionDTO, type AsistenciaDTO } from "../../services/inscripcionesService";
import { getIcon } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";
import { usuariosService } from "../../services/authService";

// ── MINI CALENDARIO CON ASISTENCIA ───────────────────────────────────────
const MiniCalendar = ({ ins, asistencias }: { ins: InscripcionDTO; asistencias: AsistenciaDTO[] }) => {
    const start = new Date(ins.fechaInicioCurso + "T00:00:00");
    const end   = new Date(ins.fechaFinCurso   + "T00:00:00");
    const today = new Date();

    const [viewDate, setViewDate] = useState(new Date(start.getFullYear(), start.getMonth(), 1));

    const firstDay    = (viewDate.getDay() + 6) % 7;
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    const d        = (day: number) => new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateKey  = (dt: Date)    => dt.toISOString().slice(0, 10);
    const isStart  = (day: number) => d(day).toDateString() === start.toDateString();
    const isEnd    = (day: number) => d(day).toDateString() === end.toDateString();
    const inRange  = (day: number) => d(day) >= start && d(day) <= end;
    const isToday  = (day: number) => d(day).toDateString() === today.toDateString();

    // Mapear asistencias por fecha
    const attendanceMap = new Map<string, boolean>();
    asistencias.forEach(a => attendanceMap.set(a.fecha, a.presente));

    const presentes = asistencias.filter(a => a.presente).length;
    const total     = asistencias.length;
    const pct       = total > 0 ? Math.round((presentes / total) * 100) : null;
    const ausencias = total - presentes;

    const WEEK = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];
    const monthName = viewDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
    const empties = Array.from({ length: firstDay }, (_, i) => `e${i}`);
    const days    = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const goToStart = () => setViewDate(new Date(start.getFullYear(), start.getMonth(), 1));
    const goToEnd   = () => setViewDate(new Date(end.getFullYear(),   end.getMonth(),   1));
    const prevMonth = () => setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1));
    const nextMonth = () => setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1));

    return (
        <div className="rounded-xl bg-sky-100 border border-sky-200 p-5 mt-5 text-left space-y-4">

            {/* Estadísticas de asistencia */}
            {total > 0 && (
                <div className="flex items-center gap-3 flex-wrap">
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                        pct! >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        pct! >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-red-50 text-red-700 border-red-200"
                    }`}>
                        <span>{pct! >= 75 ? "✓" : pct! >= 50 ? "~" : "✗"}</span>
                        {pct}% asistencia ({presentes}/{total} clases)
                    </div>
                    {ausencias > 0 && (
                        <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-700">
                            {ausencias} ausencia{ausencias !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            )}

            {/* Barra de progreso */}
            {total > 0 && (
                <div className="h-1.5 w-full rounded-full bg-sky-200 overflow-hidden">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${
                        pct! >= 75 ? "bg-emerald-500" : pct! >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`} style={{ width: `${pct}%` }} />
                </div>
            )}

            {/* Controles de navegación */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                    <button type="button" onClick={goToStart}
                        className="rounded-lg bg-sky-200 hover:bg-sky-300 px-2.5 py-1 text-[10px] font-bold text-sky-800 transition cursor-pointer"
                        title="Ir al mes de inicio">
                        ⏮ Inicio
                    </button>
                    <button type="button" onClick={goToEnd}
                        className="rounded-lg bg-sky-200 hover:bg-sky-300 px-2.5 py-1 text-[10px] font-bold text-sky-800 transition cursor-pointer"
                        title="Ir al mes de término">
                        Fin ⏭
                    </button>
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={prevMonth}
                        className="rounded-lg bg-white border border-sky-200 hover:bg-sky-50 w-7 h-7 flex items-center justify-center text-sky-700 font-bold transition cursor-pointer text-sm">
                        ‹
                    </button>
                    <span className="text-xs font-bold text-sky-900 capitalize min-w-[110px] text-center">{monthName}</span>
                    <button type="button" onClick={nextMonth}
                        className="rounded-lg bg-white border border-sky-200 hover:bg-sky-50 w-7 h-7 flex items-center justify-center text-sky-700 font-bold transition cursor-pointer text-sm">
                        ›
                    </button>
                </div>
            </div>

            {/* Días de la semana + días del mes — mismo grid para alineación perfecta */}
            <div className="grid grid-cols-7" style={{ gap: "2px" }}>
                {/* Cabecera */}
                {WEEK.map(w => (
                    <div key={w} className="flex items-center justify-center h-7 text-[10px] font-bold text-sky-600">
                        {w}
                    </div>
                ))}
                {/* Celdas vacías */}
                {empties.map(k => <div key={k} className="h-8" />)}
                {/* Días */}
                {days.map(day => {
                    const key = dateKey(d(day));
                    const attended = attendanceMap.get(key);
                    const hasRecord = attendanceMap.has(key);
                    return (
                        <div key={day} className="flex items-center justify-center h-8">
                            <div title={hasRecord ? (attended ? "Presente" : "Ausente") : undefined}
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all
                                    ${isStart(day) || isEnd(day)
                                        ? "bg-sky-700 text-white font-extrabold shadow-sm ring-2 ring-sky-300"
                                        : hasRecord
                                            ? attended
                                                ? "bg-emerald-500 text-white shadow-sm"
                                                : "bg-red-400 text-white shadow-sm"
                                            : inRange(day)
                                                ? "bg-sky-200 text-sky-800"
                                                : isToday(day)
                                                    ? "ring-2 ring-sky-600 text-sky-800"
                                                    : "text-neutral-600"
                                    }`}>
                                {day}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-bold text-sky-800 border-t border-sky-200 pt-3">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-700 inline-block" /> Inicio / Fin</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-200 inline-block" /> Período</span>
                {total > 0 && <>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Presente</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Ausente</span>
                </>}
            </div>
        </div>
    );
};

// ── SUBIDA DE FOTO DE PERFIL COMPARTIDA ───────────────────────────────────
const ProfilePhoto = ({ username }: { username: string }) => {
    const { user, updateUserPhoto } = useAuth();
    const photo = user?.fotoPerfil || null;
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target?.result as string;
            try {
                await usuariosService.actualizar(user!.id, { fotoPerfil: base64 });
                updateUserPhoto(base64);
            } catch (err) {
                alert("Error al guardar la foto de perfil en el servidor.");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative mx-auto mb-4 h-24 w-24 cursor-pointer group" onClick={() => inputRef.current?.click()}>
            {photo ? (
                <img src={photo} alt="Foto de perfil" className="h-24 w-24 rounded-full object-cover border-4 border-primary-500 shadow-lg" />
            ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-900 border-4 border-primary-100 shadow-lg text-4xl font-extrabold text-white">
                    {username.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-xs font-bold">📷 Cambiar</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} id={`photo-input-${user?.id}`} />
        </div>
    );
};

// ── PÁGINA PRINCIPAL DEL PERFIL ───────────────────────────────────────────
const StudentProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"info" | "cursos" | "notificaciones" | any>("info");
    const [inscripciones, setInscripciones] = useState<InscripcionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [asistenciaMap, setAsistenciaMap] = useState<Record<number, AsistenciaDTO[]>>({});
    const asistenciaFetched = useRef(false);
    const [notificaciones, setNotificaciones] = useState<NotificacionDTO[]>([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    // const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null);

    // ── Modal cambio de contraseña ──
    const [pwdModal, setPwdModal] = useState(false);
    const [pwdActual, setPwdActual]     = useState("");
    const [pwdNueva, setPwdNueva]       = useState("");
    const [pwdConfirm, setPwdConfirm]   = useState("");
    const [pwdError, setPwdError]       = useState<string | null>(null);
    const [pwdOk, setPwdOk]             = useState(false);
    const [pwdEnviando, setPwdEnviando] = useState(false);

    const abrirPwdModal = () => {
        setPwdActual(""); setPwdNueva(""); setPwdConfirm("");
        setPwdError(null); setPwdOk(false);
        setPwdModal(true);
    };

    const handleCambiarPassword = async () => {
        if (!user) return;
        setPwdError(null);
        if (!pwdActual) { setPwdError("Ingresa tu contraseña actual."); return; }
        if (pwdNueva.length < 8) { setPwdError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
        if (pwdNueva.length > 72) { setPwdError("La contraseña no puede superar los 72 caracteres."); return; }
        if (pwdNueva !== pwdConfirm) { setPwdError("Las contraseñas no coinciden."); return; }
        setPwdEnviando(true);
        try {
            // Verificar contraseña actual haciendo login
            await import("../../services/authService").then(m => m.authService.login(user.email, pwdActual));
            await usuariosService.actualizar(user.id, { password: pwdNueva } as any);
            setPwdOk(true);
        } catch {
            setPwdError("La contraseña actual es incorrecta o hubo un error. Inténtalo de nuevo.");
        } finally {
            setPwdEnviando(false);
        }
    };

    // ── Modal solicitud de baja ──
    const TITULOS_BAJA = [
        "Solicitud de baja voluntaria",
        "Incompatibilidad de horario",
        "Motivos económicos",
        "Motivos de salud",
        "Cambio de actividad",
        "Viaje o traslado",
        "Otros",
    ];
    const [bajaModal, setBajaModal] = useState<{ cursoId: number; nombreCurso: string } | null>(null);
    const [bajaTitulo, setBajaTitulo] = useState(TITULOS_BAJA[0]);
    const [bajaTituloCustom, setBajaTituloCustom] = useState("");
    const [bajaJustificacion, setBajaJustificacion] = useState("");
    const [bajaEnviando, setBajaEnviando] = useState(false);
    const [bajaExito, setBajaExito] = useState(false);

    const abrirModalBaja = (cursoId: number, nombreCurso: string) => {
        setBajaTitulo(TITULOS_BAJA[0]);
        setBajaTituloCustom("");
        setBajaJustificacion("");
        setBajaExito(false);
        setBajaModal({ cursoId, nombreCurso });
    };

    /*
    const handleDarseBaja = async (inscripcionId: number, nombreCurso: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas darte de baja del curso «${nombreCurso}»?`)) return;
        setUnsubscribingId(inscripcionId);
        try {
            await inscripcionesService.eliminar(inscripcionId);
            setInscripciones(prev => prev.filter(ins => ins.id !== inscripcionId));
            alert(`Te has dado de baja de «${nombreCurso}» correctamente.`);
        } catch (err) {
            alert("Error al intentar darse de baja. Inténtalo de nuevo.");
        } finally {
            setUnsubscribingId(null);
        }
    };
    */

    const handleEnviarSolicitudBaja = async () => {
        if (!bajaModal || !user) return;
        const tituloFinal = bajaTitulo === "Otros" ? bajaTituloCustom.trim() : bajaTitulo;
        if (!tituloFinal) return;
        if (!bajaJustificacion.trim()) return;
        setBajaEnviando(true);
        try {
            const mensaje = `📋 SOLICITUD DE BAJA\n` +
                `Alumno: ${user.username} (${user.email})\n` +
                `Curso: ${bajaModal.nombreCurso}\n` +
                `Motivo: ${tituloFinal}\n` +
                `Justificación: ${bajaJustificacion.trim()}`;
            await notificacionesService.crear(1, mensaje);
            setBajaExito(true);
        } catch {
            alert("Error al enviar la solicitud. Inténtalo de nuevo.");
        } finally {
            setBajaEnviando(false);
        }
    };

    // Sincronizar pestaña activa de sessionStorage si se hace click en la campana
    useEffect(() => {
        const storedTab = sessionStorage.getItem("activeProfileTab");
        if (storedTab === "notificaciones") {
            setActiveTab("notificaciones");
            sessionStorage.removeItem("activeProfileTab");
        }

        const handleTabChange = () => {
            const nextTab = sessionStorage.getItem("activeProfileTab");
            if (nextTab === "notificaciones") {
                setActiveTab("notificaciones");
                sessionStorage.removeItem("activeProfileTab");
            }
        };

        window.addEventListener("activeProfileTabChanged", handleTabChange);
        return () => window.removeEventListener("activeProfileTabChanged", handleTabChange);
    }, []);

    // Cargar inscripciones
    useEffect(() => {
        if (!user) { setLoading(false); return; }
        inscripcionesService.listarPorUsuario(user.id)
            .then(data => { setInscripciones(data ?? []); setLoading(false); })
            .catch(() => { setInscripciones([]); setLoading(false); });
    }, [user]);

    // Cargar asistencias la primera vez que se abre la pestaña "cursos"
    useEffect(() => {
        if (activeTab !== "cursos" || asistenciaFetched.current || inscripciones.length === 0 || !user) return;
        asistenciaFetched.current = true;
        Promise.all(
            inscripciones.map(ins =>
                inscripcionesService.getHistorialAsistencia(ins.cursoId)
                    .then(data => ({ cursoId: ins.cursoId, data: data.filter(a => a.usuarioId === user.id) }))
                    .catch(() => ({ cursoId: ins.cursoId, data: [] }))
            )
        ).then(results => {
            const map: Record<number, AsistenciaDTO[]> = {};
            results.forEach(r => { map[r.cursoId] = r.data; });
            setAsistenciaMap(map);
        });
    }, [activeTab, inscripciones, user]);

    // Cargar notificaciones
    const fetchNotificaciones = () => {
        if (!user) return;
        setLoadingNotifs(true);
        notificacionesService.listarPorUsuario(user.id)
            .then(data => {
                setNotificaciones(data ?? []);
                setLoadingNotifs(false);
            })
            .catch(() => {
                setNotificaciones([]);
                setLoadingNotifs(false);
            });
    };

    useEffect(() => {
        if (user) {
            fetchNotificaciones();
        }
    }, [user]);

    const markNotifRead = async (notif: NotificacionDTO) => {
        try {
            await notificacionesService.marcarLeida(notif.id, { ...notif, leido: true });
            setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch {
            setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
            window.dispatchEvent(new Event("notificationsUpdated"));
        }
    };

    const markAllNotifsRead = async () => {
        const unread = notificaciones.filter(n => !n.leido);
        if (unread.length === 0) return;
        try {
            await Promise.all(unread.map(n => notificacionesService.marcarLeida(n.id, { ...n, leido: true })));
        } catch {}
        setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
        window.dispatchEvent(new Event("notificationsUpdated"));
    };

    const deleteNotif = async (id: number) => {
        try {
            await notificacionesService.eliminar(id);
            setNotificaciones(prev => prev.filter(n => n.id !== id));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch {}
    };

    const unreadCount = notificaciones.filter(n => !n.leido).length;

    if (!user) return (
        <main className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-neutral-50 px-6">
            <div className="text-center rounded-[24px] bg-white p-8 shadow-xl border border-neutral-200 max-w-sm animate-scaleIn">
                <p className="text-4xl mb-2">🔒</p>
                <p className="font-bold text-neutral-800 font-display">No estás autenticado.</p>
                <Link to="/login" className="mt-4 btn btn-primary inline-block">Iniciar sesión</Link>
            </div>
        </main>
    );

    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para centrar perfectamente en monitores panorámicos */
        <main className="min-h-[calc(100vh-64px)] bg-neutral-50 px-6 pt-14 pb-28 text-sky-800 w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Superior */}
                <div className="mb-10 text-left animate-fadeInUp">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide">
                        Mi cuenta
                    </span>
                    <h1 className="mt-3 text-3xl font-extrabold text-sky-800 md:text-4xl font-display">Perfil de Estudiante</h1>
                </div>

                {/* Grid Estructural del Dashboard del Alumno */}
                <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
                    
                    {/* ── BARRA LATERAL (SIDEBAR) ─────────────────────────────── */}
                    <aside className="space-y-5 h-fit">
                        <div className="rounded-[24px] bg-sky-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-200 text-center flex flex-col items-center">
                            <ProfilePhoto username={user.username} />
                            <h2 className="text-lg font-bold text-sky-800 font-display tracking-tight truncate">{user.username}</h2>
                            <p className="text-xs font-semibold text-sky-600 truncate mt-0.5">{user.email}</p>
                            
                            <span className="mt-3 mx-auto block w-fit rounded-full bg-primary-50 border border-primary-100 px-3.5 py-0.5 text-xs font-bold text-primary-700 tracking-wide">
                                Estudiante
                            </span>
                            
                            {user.phone && (
                                <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3 text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Teléfono</p>
                                    <p className="text-sm font-bold text-sky-800 mt-0.5">{user.phone}</p>
                                </div>
                            )}
                            
                            <div className="mt-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Cursos inscritos</p>
                                <p className="text-center text-3xl font-black text-primary-600 mt-0.5 tracking-tight">{loading ? "…" : inscripciones.length}</p>
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-sky-600 uppercase tracking-wider">Haz clic en tu foto para cambiarla</p>
                        </div>
                    </aside>

                    {/* ── CUERPO CENTRAL DE INFORMACIÓN ───────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Fila de Pestañas (Tabs) */}
                        <div className="mb-6 tab-pill-bar">
                            {[
                                { key: "info",           label: "Mi Perfil",       icon: "👤" },
                                { key: "cursos",         label: "Mis Cursos",       icon: "📚" },
                                { key: "notificaciones", label: "Notificaciones",   icon: "🔔" },
                            ].map(tab => (
                                <button key={tab.key} id={`tab-${tab.key}`}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`tab-pill ${activeTab === tab.key ? 'active' : ''}`}>
                                    <span className="text-base leading-none">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                    {tab.key === "notificaciones" && unreadCount > 0 && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* PANEL: INFORMACIÓN GENERAL */}
                        {activeTab === "info" && (
                            <div className="animate-fadeIn rounded-2xl bg-white border border-neutral-200 text-left overflow-hidden shadow-sm">
                                {/* Header */}
                                <div className="px-8 py-6 border-b border-neutral-100">
                                    <h3 className="text-xl font-bold text-sky-900 font-display">Información personal</h3>
                                    <p className="mt-1 text-sm text-neutral-500">Datos asociados a tu cuenta en InscribeMe.</p>
                                </div>

                                {/* Campos */}
                                <div className="px-8 py-7 grid gap-5 md:grid-cols-2">
                                    {[
                                        { label: "Nombre completo",    value: user.username,                        icon: "👤" },
                                        { label: "Correo electrónico", value: user.email,                           icon: "✉️" },
                                        { label: "Teléfono",           value: user.phone || "No registrado",        icon: "📱" },
                                        { label: "Rol en el sistema",  value: "Estudiante Regular InscribeMe",      icon: "🎓" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-xl border border-neutral-100 bg-neutral-50 px-5 py-4 transition duration-200 hover:border-primary-200 hover:bg-white hover:shadow-sm">
                                            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-600 mb-2">
                                                <span>{f.icon}</span>{f.label}
                                            </p>
                                            <p className="text-base font-semibold text-neutral-900 leading-snug">{f.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Aviso + botón cambio de contraseña */}
                                <div className="mx-8 mb-8 space-y-3">
                                    <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 text-sm font-medium text-primary-700 flex items-start gap-2.5">
                                        <span className="mt-0.5 shrink-0">💡</span>
                                        <span>Para actualizar o rectificar tu información institucional, contacta al administrador del campus.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={abrirPwdModal}
                                        className="w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition flex items-center gap-2 cursor-pointer shadow-sm"
                                    >
                                        🔑 Cambiar contraseña
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PANEL: MIS CURSOS CON CALENDARIOS INDIVIDUALES */}
                        {activeTab === "cursos" && (
                            <div className="animate-fadeIn space-y-8 text-left">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-100" />)}
                                    </div>
                                ) : inscripciones.length === 0 ? (
                                    <div className="rounded-[24px] bg-white p-14 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-200 border-dashed">
                                        <div className="mb-3 text-5xl">📭</div>
                                        <p className="text-xl font-bold text-neutral-900 font-display">No tienes cursos inscritos aún.</p>
                                        <Link to="/cursos" className="mt-4 inline-block text-sm font-bold text-primary-500 hover:underline tracking-wide">
                                            Explorar catálogo de actividades →
                                        </Link>
                                    </div>
                                ) : (
                                    inscripciones.map((ins, idx) => (
                                        <div key={`${ins.cursoId}-${idx}`} className="rounded-[24px] bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-200 transition-all hover:shadow-md duration-300">
                                            <div className="mb-5 flex items-center gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 text-2xl shadow-inner">
                                                    {getIcon(ins.nombreCurso)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-neutral-900 font-display truncate">{ins.nombreCurso}</h3>
                                                    <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide border ${
                                                        ins.estado === "INSCRITO" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        ins.estado === "COMPLETADO" ? "bg-primary-50 text-primary-700 border-primary-100" :
                                                        "bg-neutral-50 text-neutral-600 border-neutral-200"}`}>
                                                        {ins.estado ?? "INSCRITO"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-5 grid gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 sm:grid-cols-2 text-sm">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Profesor Jefe / Instructor</p>
                                                    <p className="font-bold text-neutral-800 mt-0.5">{ins.nombreInstructor || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Fecha de matrícula</p>
                                                    <p className="font-bold text-neutral-800 mt-0.5">
                                                        {ins.fechaInscripcion ? new Date(ins.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Inicio del período</p>
                                                    <p className="font-bold text-neutral-800 mt-0.5">
                                                        {ins.fechaInicioCurso ? new Date(ins.fechaInicioCurso + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Término del período</p>
                                                    <p className="font-bold text-neutral-800 mt-0.5">
                                                        {ins.fechaFinCurso ? new Date(ins.fechaFinCurso + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                            </div>

                                            {ins.fechaInicioCurso && ins.fechaFinCurso && (
                                                <MiniCalendar ins={ins} asistencias={asistenciaMap[ins.cursoId] ?? []} />
                                            )}

                                            <div className="mt-4 flex justify-end border-t border-neutral-100 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => abrirModalBaja(ins.cursoId, ins.nombreCurso)}
                                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm"
                                                >
                                                    🚪 Solicitar baja
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* PANEL: BANDEJA DE NOTIFICACIONES */}
                        {activeTab === "notificaciones" && (
                            <div className="animate-fadeIn rounded-[24px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-200 text-left">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-sky-900 font-display">Bandeja de Notificaciones</h3>
                                        <p className="text-xs font-semibold text-sky-500 mt-1">
                                            Tienes {notificaciones.length} avisos · {unreadCount} sin leer
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button type="button" onClick={markAllNotifsRead} className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer shadow-sm">
                                            ✓ Marcar todas leídas
                                        </button>
                                    )}
                                </div>

                                {loadingNotifs ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-50" />)}
                                    </div>
                                ) : notificaciones.length === 0 ? (
                                    <div className="rounded-[24px] bg-neutral-50 p-12 text-center text-sky-600 border border-dashed border-sky-200">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="text-sm font-bold">No tienes alertas ni notificaciones en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notificaciones.map((n) => (
                                            <div key={n.id} className={`rounded-xl border p-4 transition-all duration-300 ${
                                                !n.leido ? "border-primary-200 bg-primary-50/50 shadow-sm" : "border-sky-200 bg-sky-100"
                                            }`}>
                                                <div className="flex flex-col !px-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {!n.leido && <span className="flex h-2 w-2 rounded-full bg-primary-500 inline-block animate-pulse" />}
                                                            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                                                                {!n.leido ? "Nueva" : "Leída"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-neutral-800 font-medium leading-relaxed">{n.mensaje}</p>
                                                        {n.fechaCreacion && (
                                                            <p className="mt-2 text-xs font-semibold text-neutral-600">
                                                                🕒 {new Date(n.fechaCreacion).toLocaleString("es-CL")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                                        {!n.leido && (
                                                            <button type="button" onClick={() => markNotifRead(n)} className="rounded-lg bg-white border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer shadow-sm">
                                                                Marcar leída
                                                            </button>
                                                        )}
                                                        <button type="button" onClick={() => deleteNotif(n.id)} className="rounded-lg bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer shadow-sm">
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Modal cambio de contraseña ──────────────────────── */}
            {pwdModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="baja-modal-card w-full max-w-md rounded-2xl bg-white border border-neutral-100 shadow-2xl overflow-hidden">
                        <div className="baja-modal-header border-b border-neutral-100 bg-sky-50 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-sky-800 font-display">Cambiar contraseña</h2>
                                <p className="mt-1 text-sm text-sky-600 font-medium">Actualiza tu contraseña de acceso</p>
                            </div>
                            <button type="button" onClick={() => setPwdModal(false)}
                                className="rounded-lg p-2 text-sky-400 hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer shrink-0">✕</button>
                        </div>

                        {pwdOk ? (
                            <div className="baja-modal-success text-center">
                                <div className="mb-4 text-6xl">🔐</div>
                                <h3 className="text-xl font-bold text-neutral-900 font-display">Contraseña actualizada</h3>
                                <p className="mt-3 text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
                                    Tu contraseña fue cambiada correctamente. Úsala en tu próximo inicio de sesión.
                                </p>
                                <button type="button" onClick={() => setPwdModal(false)}
                                    className="mt-8 w-full btn btn-primary py-3.5 font-bold cursor-pointer">Entendido</button>
                            </div>
                        ) : (
                            <div className="baja-modal-body space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Contraseña actual</label>
                                    <input type="password" value={pwdActual} onChange={e => setPwdActual(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Nueva contraseña</label>
                                    <input type="password" value={pwdNueva} onChange={e => setPwdNueva(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        maxLength={72}
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">Confirmar nueva contraseña</label>
                                    <input type="password" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)}
                                        placeholder="Repite la nueva contraseña"
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition" />
                                </div>
                                {pwdError && (
                                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-medium text-red-700 flex items-center gap-2">
                                        <span>⚠️</span><span>{pwdError}</span>
                                    </div>
                                )}
                                <div className="flex gap-4 pt-1">
                                    <button type="button" onClick={() => setPwdModal(false)}
                                        className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button type="button" onClick={handleCambiarPassword} disabled={pwdEnviando}
                                        className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-3 text-sm font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                        {pwdEnviando ? "Guardando..." : "Guardar cambios"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal solicitud de baja ─────────────────────────── */}
            {bajaModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="baja-modal-card w-full max-w-xl rounded-2xl bg-white border border-neutral-100 shadow-2xl overflow-hidden mx-4">

                        {/* Header */}
                        <div className="baja-modal-header border-b border-neutral-100 bg-red-50">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-red-800 font-display">Solicitar baja del curso</h2>
                                    <p className="mt-1 text-sm text-red-600 font-medium">{bajaModal.nombreCurso}</p>
                                </div>
                                <button type="button" onClick={() => setBajaModal(null)}
                                    className="rounded-lg p-2 text-red-400 hover:bg-red-100 hover:text-red-700 transition cursor-pointer shrink-0">
                                    ✕
                                </button>
                            </div>
                        </div>

                        {bajaExito ? (
                            /* Estado de éxito */
                            <div className="baja-modal-success text-center">
                                <div className="mb-4 text-6xl">✅</div>
                                <h3 className="text-xl font-bold text-neutral-900 font-display">Solicitud enviada</h3>
                                <p className="mt-3 text-sm text-neutral-600 leading-relaxed max-w-xs mx-auto">
                                    Tu solicitud fue enviada al administrador. Te contactarán para confirmar el proceso de baja.
                                </p>
                                <button type="button" onClick={() => setBajaModal(null)}
                                    className="mt-8 w-full btn btn-primary py-3.5 font-bold cursor-pointer">
                                    Entendido
                                </button>
                            </div>
                        ) : (
                            /* Formulario */
                            <div className="baja-modal-body space-y-6">
                                {/* Motivo (desplegable) */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                        Motivo de la solicitud
                                    </label>
                                    <select
                                        value={bajaTitulo}
                                        onChange={e => setBajaTitulo(e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition cursor-pointer"
                                    >
                                        {TITULOS_BAJA.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Título personalizado si elige "Otros" */}
                                {bajaTitulo === "Otros" && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                            Especifica el motivo
                                        </label>
                                        <input
                                            type="text"
                                            value={bajaTituloCustom}
                                            onChange={e => setBajaTituloCustom(e.target.value)}
                                            placeholder="Describe brevemente el motivo..."
                                            maxLength={80}
                                            className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition"
                                        />
                                    </div>
                                )}

                                {/* Justificación */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                        Justificación <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={bajaJustificacion}
                                        onChange={e => setBajaJustificacion(e.target.value)}
                                        placeholder="Explica con detalle los motivos de tu solicitud de baja..."
                                        rows={5}
                                        maxLength={500}
                                        className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition resize-none"
                                    />
                                    <p className="mt-1.5 text-right text-[11px] text-neutral-400">{bajaJustificacion.length}/500</p>
                                </div>

                                {/* Aviso */}
                                <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-xs font-medium text-amber-800 flex items-start gap-2.5">
                                    <span className="shrink-0 mt-0.5">⚠️</span>
                                    <span>Esta solicitud será revisada por el administrador. La baja no es inmediata hasta que sea aprobada.</span>
                                </div>

                                {/* Botones */}
                                <div className="flex gap-4 pt-1">
                                    <button type="button" onClick={() => setBajaModal(null)}
                                        className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEnviarSolicitudBaja}
                                        disabled={bajaEnviando || !bajaJustificacion.trim() || (bajaTitulo === "Otros" && !bajaTituloCustom.trim())}
                                        className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-3 text-sm font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        {bajaEnviando ? "Enviando..." : "Enviar solicitud"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default StudentProfilePage;