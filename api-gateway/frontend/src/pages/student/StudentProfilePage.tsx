import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { inscripcionesService, type InscripcionDTO } from "../../services/inscripcionesService";
import { getIcon } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";

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
        <div className="rounded-xl bg-[#F8F9FA] border border-[#455A64]/10 p-4 mt-4 text-left">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-[#37474F]">{monthName}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-[#455A64]/70 mb-1.5">
                {WEEK.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {empties.map(k => <div key={k} />)}
                {days.map(day => (
                    <div key={day} className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto text-[11px] font-bold transition-all
                        ${isStart(day) || isEnd(day) ? "bg-[#FFA000] text-white font-black shadow-sm" :
                          inRange(day) ? "bg-[#FFA000]/15 text-[#37474F]" :
                          isToday(day) ? "ring-2 ring-[#FFA000] text-[#37474F] font-black" :
                          "text-[#455A64]"}`}>
                        {day}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex gap-4 text-[10px] font-bold text-[#455A64]/80 border-t border-gray-200/50 pt-2">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FFA000] inline-block" /> Inicio / Fin</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FFA000]/25 inline-block" /> Período asignado</span>
            </div>
        </div>
    );
};

// ── SUBIDA DE FOTO DE PERFIL COMPARTIDA ───────────────────────────────────
const ProfilePhoto = ({ userId, username }: { userId: number; username: string }) => {
    const storageKey = `profilePhoto_${userId}`;
    const [photo, setPhoto] = useState<string | null>(() => localStorage.getItem(storageKey));
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            localStorage.setItem(storageKey, base64);
            setPhoto(base64);
            window.dispatchEvent(new Event("profilePhotoUpdated"));
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative mx-auto mb-4 h-24 w-24 cursor-pointer group" onClick={() => inputRef.current?.click()}>
            {photo ? (
                <img src={photo} alt="Foto de perfil" className="h-24 w-24 rounded-full object-cover border-4 border-[#FFA000] shadow-lg" />
            ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#37474F] border-4 border-[#FFA000]/40 shadow-lg text-4xl font-black text-[#FFA000]">
                    {username.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white text-xs font-bold">📷 Cambiar</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} id={`photo-input-${userId}`} />
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
        <main className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-[#FAFAFA] px-6">
            <div className="text-center rounded-2xl bg-white p-8 shadow-md border border-gray-100 max-w-sm animate-scaleIn">
                <p className="text-4xl mb-2">🔒</p>
                <p className="font-bold text-[#37474F]">No estás autenticado.</p>
                <Link to="/login" className="mt-4 inline-block rounded-xl bg-[#FFA000] px-5 py-2 text-sm font-bold text-[#212121] shadow-md hover:bg-[#ffb300] transition">Iniciar sesión</Link>
            </div>
        </main>
    );

    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para centrar perfectamente en monitores panorámicos */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-[#212121] w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Superior */}
                <div className="mb-14 text-left animate-fadeInUp">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFA000]">Mi cuenta</p>
                    <h1 className="mt-2 text-5xl font-black text-[#37474F] md:text-6xl tracking-tight">Perfil de Estudiante</h1>
                </div>

                {/* Grid Estructural del Dashboard del Alumno */}
                <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
                    
                    {/* ── BARRA LATERAL (SIDEBAR) ─────────────────────────────── */}
                    <aside className="space-y-5 h-fit">
                        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 text-center">
                            <ProfilePhoto userId={user.id} username={user.username} />
                            <h2 className="text-lg font-black text-[#37474F] tracking-tight truncate">{user.username}</h2>
                            <p className="text-xs font-semibold text-[#455A64] truncate mt-0.5">{user.email}</p>
                            
                            <span className="mt-3 mx-auto block w-fit rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-0.5 text-xs font-bold text-emerald-700 tracking-wide">
                                Estudiante
                            </span>
                            
                            {user.phone && (
                                <div className="mt-4 rounded-xl border border-gray-50 bg-[#FAFAFA]/70 p-3 text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#455A64]">Teléfono</p>
                                    <p className="text-sm font-bold text-[#37474F] mt-0.5">{user.phone}</p>
                                </div>
                            )}
                            
                            <div className="mt-3 rounded-xl border border-gray-50 bg-[#FAFAFA]/70 p-3 text-left">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#455A64]">Cursos inscritos</p>
                                <p className="text-3xl font-black text-[#FFA000] mt-0.5 tracking-tight">{loading ? "…" : inscripciones.length}</p>
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-[#455A64]/50 uppercase tracking-wider">Haz clic en tu foto para cambiarla</p>
                        </div>
                    </aside>

                    {/* ── CUERPO CENTRAL DE INFORMACIÓN ───────────────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Fila de Pestañas (Tabs) */}
                        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm border border-gray-100">
                            {[
                                { key: "info",           label: "👤 Mi Perfil" },
                                { key: "cursos",         label: "📚 Mis Cursos" },
                                { key: "notificaciones", label: "🔔 Notificaciones" },
                            ].map(tab => (
                                <button key={tab.key} id={`tab-${tab.key}`}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`relative flex-1 min-w-[100px] rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                        activeTab === tab.key ? "bg-[#37474F] text-white shadow-md" : "text-[#455A64] hover:bg-gray-50"
                                    }`}>
                                    <span className="flex items-center justify-center gap-1.5">
                                        {tab.label}
                                        {tab.key === "notificaciones" && unreadCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* PANEL: INFORMACIÓN GENERAL */}
                        {activeTab === "info" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-7 shadow-md border border-gray-100 text-left">
                                <h3 className="mb-6 text-xl font-black text-[#37474F] border-b border-gray-50 pb-3">Información personal</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        { label: "Nombre completo", value: user.username },
                                        { label: "Correo electrónico", value: user.email },
                                        { label: "Teléfono", value: user.phone || "No registrado" },
                                        { label: "Rol en el sistema", value: "Estudiante Regular InscribeMe" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-xl border border-gray-100 bg-[#FAFAFA]/70 p-4">
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#455A64]">{f.label}</p>
                                            <p className="mt-1.5 text-base font-bold text-[#212121]">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 rounded-xl bg-blue-50/50 border border-blue-200/60 p-4 text-xs font-bold text-blue-700 flex items-center gap-2">
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
                                    <div className="rounded-2xl bg-white p-14 text-center shadow-md border border-gray-100 border-dashed">
                                        <div className="mb-3 text-5xl">📭</div>
                                        <p className="text-xl font-black text-[#37474F]">No tienes cursos inscritos aún.</p>
                                        <Link to="/cursos" className="mt-4 inline-block text-sm font-bold text-[#FFA000] hover:underline tracking-wide">
                                            Explorar catálogo de actividades →
                                        </Link>
                                    </div>
                                ) : (
                                    inscripciones.map((ins, idx) => (
                                        <div key={`${ins.cursoId}-${idx}`} className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 transition-all hover:shadow-lg duration-300">
                                            <div className="mb-5 flex items-center gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#FFA000]/15 text-2xl shadow-inner">
                                                    {getIcon(ins.nombreCurso)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-black text-[#37474F] truncate">{ins.nombreCurso}</h3>
                                                    <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                                        ins.estado === "INSCRITO" ? "bg-green-50 text-green-700" :
                                                        ins.estado === "COMPLETADO" ? "bg-blue-50 text-blue-700" :
                                                        "bg-gray-50 text-gray-600"}`}>
                                                        {ins.estado ?? "INSCRITO"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-5 grid gap-3 rounded-xl border border-gray-50 bg-[#FAFAFA]/70 p-4 sm:grid-cols-2 text-sm">
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#455A64]">Profesor Jefe / Instructor</p>
                                                    <p className="font-bold text-[#37474F] mt-0.5">{ins.nombreInstructor || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#455A64]">Fecha de matrícula</p>
                                                    <p className="font-bold text-[#37474F] mt-0.5">
                                                        {ins.fechaInscripcion ? new Date(ins.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#455A64]">Inicio del período</p>
                                                    <p className="font-bold text-[#37474F] mt-0.5">
                                                        {ins.fechaInicioCurso ? new Date(ins.fechaInicioCurso + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wider text-[#455A64]">Término del período</p>
                                                    <p className="font-bold text-[#37474F] mt-0.5">
                                                        {ins.fechaFinCurso ? new Date(ins.fechaFinCurso + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                            </div>

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
                            <div className="animate-fadeIn rounded-2xl bg-white p-7 shadow-md border border-gray-100 text-left">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-[#37474F]">Bandeja de Notificaciones</h3>
                                        <p className="text-xs font-semibold text-[#455A64] mt-1">
                                            Tienes {notificaciones.length} avisos · {unreadCount} sin leer
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button type="button" onClick={markAllNotifsRead} className="rounded-xl border border-[#455A64]/30 px-4 py-2 text-xs font-bold text-[#37474F] hover:bg-[#FAFAFA] transition-colors cursor-pointer shadow-sm">
                                            ✓ Marcar todas leídas
                                        </button>
                                    )}
                                </div>

                                {loadingNotifs ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-50" />)}
                                    </div>
                                ) : notificaciones.length === 0 ? (
                                    <div className="rounded-2xl bg-[#FAFAFA] p-12 text-center text-[#455A64] border border-dashed border-gray-200">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="text-sm font-bold">No tienes alertas ni notificaciones en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notificaciones.map((n) => (
                                            <div key={n.id} className={`rounded-xl border p-4 transition-all duration-300 ${
                                                !n.leido ? "border-[#FFA000]/40 bg-[#FFF8E1] shadow-sm" : "border-[#455A64]/10 bg-white"
                                            }`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {!n.leido && <span className="flex h-2 w-2 rounded-full bg-[#FFA000] inline-block animate-pulse" />}
                                                            <span className="text-[10px] font-bold text-[#455A64] uppercase tracking-wider">
                                                                {!n.leido ? "Nueva" : "Leída"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[#212121] font-medium leading-relaxed">{n.mensaje}</p>
                                                        {n.fechaCreacion && (
                                                            <p className="mt-2 text-xs font-semibold text-[#455A64]/60">
                                                                🕒 {new Date(n.fechaCreacion).toLocaleString("es-CL")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                                        {!n.leido && (
                                                            <button type="button" onClick={() => markNotifRead(n)} className="rounded-lg bg-white border border-[#455A64]/20 px-3 py-1 text-xs font-bold text-[#455A64] hover:bg-[#ECEFF1] transition-colors cursor-pointer shadow-sm">
                                                                Marcar leída
                                                            </button>
                                                        )}
                                                        <button type="button" onClick={() => deleteNotif(n.id)} className="rounded-lg bg-red-50 border border-red-200/30 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer shadow-sm">
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