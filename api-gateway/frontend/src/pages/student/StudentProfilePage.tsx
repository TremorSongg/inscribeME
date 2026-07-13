import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { inscripcionesService, type InscripcionDTO } from "../../services/inscripcionesService";
import { getIcon } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";
import { usuariosService } from "../../services/authService";

// ── MINI CALENDARIO FORMATEADO ────────────────────────────────────────────
const MiniCalendar = ({ ins }: { ins: InscripcionDTO }) => {
    const start = new Date(ins.fechaInicioCurso + "T00:00:00");
    const end   = new Date(ins.fechaFinCurso + "T00:00:00");
    const today = new Date();
    const viewDate = new Date(start.getFullYear(), start.getMonth(), 1);
    const firstDay = (viewDate.getDay() + 6) % 7;
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

    const d = (day: number) => new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const isStart  = (day: number) => d(day).toDateString() === start.toDateString();
    const isEnd    = (day: number) => d(day).toDateString() === end.toDateString();
    const inRange  = (day: number) => d(day) >= start && d(day) <= end;
    const isToday  = (day: number) => d(day).toDateString() === today.toDateString();

    const WEEK = ["L","M","X","J","V","S","D"];
    const monthName = start.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
    const empties = Array.from({ length: firstDay }, (_, i) => `e${i}`);
    const days    = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 mt-4 text-left">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-sky-900 font-display">{monthName}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-sky-400 mb-1.5">
                {WEEK.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {empties.map(k => <div key={k} />)}
                {days.map(day => (
                    <div key={day} className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto text-[11px] font-bold transition-all
                        ${isStart(day) || isEnd(day) ? "bg-sky-600 text-white font-extrabold shadow-sm" :
                          inRange(day) ? "bg-sky-100 text-sky-700" :
                          isToday(day) ? "ring-2 ring-sky-500 text-sky-700 font-bold" :
                          "text-neutral-600"}`}>
                        {day}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex gap-4 text-[10px] font-bold text-neutral-600 border-t border-sky-100 pt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-600 inline-block" /> Inicio / Fin</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-100 inline-block" /> Período asignado</span>
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
    const [notificaciones, setNotificaciones] = useState<NotificacionDTO[]>([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [unsubscribingId, setUnsubscribingId] = useState<number | null>(null);

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
                            <div className="animate-fadeIn rounded-[24px] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-neutral-200 text-left">
                                <h3 className="mb-6 text-xl font-bold text-sky-900 !py-4 border-b border-neutral-100 pb-3 font-display">Información personal</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        { label: "Nombre completo", value: user.username },
                                        { label: "Correo electrónico", value: user.email },
                                        { label: "Teléfono", value: user.phone || "No registrado" },
                                        { label: "Rol en el sistema", value: "Estudiante Regular InscribeMe" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-2xl border border-neutral-100 bg-neutral-50/70 p-4 transition duration-200 hover:border-primary-500/20 hover:bg-white hover:shadow-sm">
                                            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">{f.label}</p>
                                            <p className="mt-1.5 text-base font-bold text-sky-800">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 rounded-2xl bg-primary-50 border border-primary-100 p-4 text-xs font-bold text-primary-600 flex items-center gap-2">
                                    <span>💡</span> Para actualizar o rectificar tu información institucional, contacta al administrador del campus.
                                </div>
                            </div>
                        )}

                        {/* PANEL: MIS CURSOS CON CALENDARIOS INDIVIDUALES */}
                        {activeTab === "cursos" && (
                            <div className="animate-fadeIn space-y-6 text-left">
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

                                            {ins.id && (
                                                <div className="flex justify-end mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDarseBaja(ins.id!, ins.nombreCurso)}
                                                        disabled={unsubscribingId === ins.id}
                                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                                    >
                                                        {unsubscribingId === ins.id ? "Cancelando..." : "Darse de baja"}
                                                    </button>
                                                </div>
                                            )}

                                            {ins.fechaInicioCurso && ins.fechaFinCurso && (
                                                <MiniCalendar ins={ins} />
                                            )}
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
        </main>
    );
};

export default StudentProfilePage;