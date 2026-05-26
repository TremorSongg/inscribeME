import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { inscripcionesService, type InscripcionDTO } from "../../services/inscripcionesService";
import { getIcon } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";

// ── Mini Calendario ────────────────────────────────────────────
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
        <div className="rounded-xl bg-[#F8F9FA] border border-[#455A64]/10 p-4">
            <p className="mb-3 text-center text-xs font-bold capitalize text-[#37474F]">{monthName}</p>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#455A64] mb-1">
                {WEEK.map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {empties.map(k => <div key={k} />)}
                {days.map(day => (
                    <div key={day} className={`flex h-7 w-7 items-center justify-center rounded-full mx-auto text-[11px] font-medium transition
                        ${isStart(day) || isEnd(day) ? "bg-[#FFA000] text-white font-black" :
                          inRange(day) ? "bg-[#FFA000]/20 text-[#37474F]" :
                          isToday(day) ? "ring-2 ring-[#FFA000] text-[#37474F] font-bold" :
                          "text-[#455A64]"}`}>
                        {day}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex gap-3 text-[10px] text-[#455A64]">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FFA000] inline-block" />Inicio/Fin</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#FFA000]/30 inline-block" />Período</span>
            </div>
        </div>
    );
};

// ── Subida de foto de perfil ───────────────────────────────────
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
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">📷 Cambiar</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} id={`photo-input-${userId}`} />
        </div>
    );
};

// ── Página Principal ───────────────────────────────────────────
const StudentProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"info" | "cursos" | "notificaciones">("info");
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
        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-6">
            <div className="text-center">
                <p className="text-[#455A64]">No estás autenticado.</p>
                <Link to="/login" className="mt-4 inline-block text-[#FFA000] font-semibold hover:underline">Iniciar sesión</Link>
            </div>
        </main>
    );

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-4 py-10 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">Mi cuenta</p>
                    <h1 className="mt-1 text-4xl font-bold text-[#37474F]">Perfil de Estudiante</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                    {/* Sidebar */}
                    <aside className="h-fit rounded-2xl bg-white p-6 shadow-md text-center">
                        <ProfilePhoto userId={user.id} username={user.username} />
                        <h2 className="text-xl font-bold text-[#37474F]">{user.username}</h2>
                        <p className="mt-1 text-sm text-[#455A64]">{user.email}</p>
                        <span className="mt-3 inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold text-emerald-700">
                            Estudiante
                        </span>
                        {user.phone && (
                            <div className="mt-4 rounded-xl bg-[#FAFAFA] p-3 text-left">
                                <p className="text-xs font-semibold text-[#455A64]">Teléfono</p>
                                <p className="text-sm font-medium text-[#37474F]">{user.phone}</p>
                            </div>
                        )}
                        <div className="mt-2 rounded-xl bg-[#FAFAFA] p-3">
                            <p className="text-xs font-semibold text-[#455A64]">Cursos inscritos</p>
                            <p className="text-3xl font-black text-[#FFA000]">{loading ? "…" : inscripciones.length}</p>
                        </div>
                        <p className="mt-3 text-[10px] text-[#455A64]">Haz clic en tu foto para cambiarla</p>
                    </aside>

                    {/* Content */}
                    <div>
                        {/* Tabs */}
                        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
                            {[
                                { key: "info",           label: "👤 Mi Perfil" },
                                { key: "cursos",         label: "📚 Mis Cursos" },
                                { key: "notificaciones", label: "🔔 Notificaciones" },
                            ].map(tab => (
                                <button key={tab.key} id={`tab-${tab.key}`}
                                    onClick={() => setActiveTab(tab.key as any)}
                                    className={`relative flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                                        activeTab === tab.key ? "bg-[#37474F] text-white shadow-md" : "text-[#455A64] hover:bg-[#FAFAFA]"
                                    }`}>
                                    <span className="flex items-center justify-center gap-1.5">
                                        {tab.label}
                                        {tab.key === "notificaciones" && unreadCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Tab Info */}
                        {activeTab === "info" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md">
                                <h3 className="mb-5 text-xl font-bold text-[#37474F]">Información personal</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        { label: "Nombre completo", value: user.username },
                                        { label: "Correo electrónico", value: user.email },
                                        { label: "Teléfono", value: user.phone || "No registrado" },
                                        { label: "Rol en el sistema", value: "Estudiante" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#455A64]">{f.label}</p>
                                            <p className="mt-1 text-base font-bold text-[#212121]">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
                                    💡 Para actualizar tu información, contacta al administrador.
                                </div>
                            </div>
                        )}

                        {/* Tab Cursos */}
                        {activeTab === "cursos" && (
                            <div className="animate-fadeIn space-y-6">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => <div key={i} className="h-52 animate-pulse rounded-2xl bg-gray-200" />)}
                                    </div>
                                ) : inscripciones.length === 0 ? (
                                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                                        <div className="mb-3 text-4xl">📭</div>
                                        <p className="font-bold text-[#37474F]">No tienes cursos inscritos aún.</p>
                                        <Link to="/cursos" className="mt-4 inline-block text-[#FFA000] font-semibold hover:underline">
                                            Explorar cursos →
                                        </Link>
                                    </div>
                                ) : (
                                    inscripciones.map((ins, idx) => (
                                        <div key={`${ins.cursoId}-${idx}`} className="rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                            <div className="mb-4 flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FFA000]/20 text-2xl">
                                                    {getIcon(ins.nombreCurso)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-[#37474F]">{ins.nombreCurso}</h3>
                                                    <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                                                        ins.estado === "INSCRITO" ? "bg-green-100 text-green-700" :
                                                        ins.estado === "COMPLETADO" ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-600"}`}>
                                                        {ins.estado ?? "INSCRITO"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mb-4 grid gap-3 rounded-xl bg-[#FAFAFA] p-4 sm:grid-cols-2 text-sm">
                                                <div>
                                                    <p className="text-xs font-semibold text-[#455A64]">Instructor</p>
                                                    <p className="font-bold text-[#37474F]">{ins.nombreInstructor || "—"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#455A64]">Fecha de inscripción</p>
                                                    <p className="font-bold text-[#37474F]">
                                                        {ins.fechaInscripcion ? new Date(ins.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#455A64]">Inicio del curso</p>
                                                    <p className="font-bold text-[#37474F]">
                                                        {ins.fechaInicioCurso ? new Date(ins.fechaInicioCurso + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#455A64]">Término del curso</p>
                                                    <p className="font-bold text-[#37474F]">
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

                        {/* Tab Notificaciones */}
                        {activeTab === "notificaciones" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#37474F]">Bandeja de Notificaciones</h3>
                                        <p className="text-xs text-[#455A64] mt-0.5">
                                            Tienes {notificaciones.length} notificaciones ({unreadCount} sin leer)
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllNotifsRead}
                                            className="rounded-xl border border-[#455A64]/30 px-4 py-2 text-xs font-bold text-[#37474F] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                                        >
                                            ✓ Marcar todas leídas
                                        </button>
                                    )}
                                </div>

                                {loadingNotifs ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}
                                    </div>
                                ) : notificaciones.length === 0 ? (
                                    <div className="rounded-xl bg-[#FAFAFA] p-8 text-center text-[#455A64]">
                                        <p className="text-3xl mb-2">📭</p>
                                        <p className="text-sm font-semibold">No tienes notificaciones en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {notificaciones.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`rounded-xl border p-4 transition-all duration-200 ${
                                                    !n.leido
                                                        ? "border-[#FFA000]/40 bg-[#FFF8E1] shadow-xs animate-pulse-soft"
                                                        : "border-[#455A64]/10 bg-white"
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {!n.leido && (
                                                                <span className="flex h-2 w-2 rounded-full bg-[#FFA000] inline-block" />
                                                            )}
                                                            <span className="text-[10px] font-bold text-[#455A64] uppercase tracking-wider">
                                                                {!n.leido ? "Nueva" : "Leída"}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[#212121] leading-relaxed">{n.mensaje}</p>
                                                        {n.fechaCreacion && (
                                                            <p className="mt-1 text-[11px] text-[#455A64]/60">
                                                                📅 {new Date(n.fechaCreacion).toLocaleString("es-CL")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                                        {!n.leido && (
                                                            <button
                                                                onClick={() => markNotifRead(n)}
                                                                className="rounded-lg bg-white border border-[#455A64]/20 px-3 py-1 text-xs font-semibold text-[#455A64] hover:bg-[#ECEFF1] transition-colors cursor-pointer"
                                                            >
                                                                Marcar leída
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteNotif(n.id)}
                                                            className="rounded-lg bg-red-50 border border-red-200/40 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                        >
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
