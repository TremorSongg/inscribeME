import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cursosService, getIcon, type CursoDTO } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";
import {
    inscripcionesService,
    type AlumnoCursoDTO,
    type AsistenciaDTO,
} from "../../services/inscripcionesService";
import { usuariosService } from "../../services/authService";

// ── Foto de perfil compartida ──────────────────────────────────
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
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-900 border-4 border-primary-500/40 shadow-lg text-4xl font-black text-white">
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


// ── InstructorProfilePage ──────────────────────────────────────
const InstructorProfilePage = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState<CursoDTO[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CursoDTO | null>(null);
    const [activeTab, setActiveTab] = useState<"perfil" | "notificaciones" | "alumnos" | "asistencia" | "historial" | "notificacion">("perfil");
    const [loading, setLoading] = useState(true);
    const [myNotifs, setMyNotifs] = useState<NotificacionDTO[]>([]);
    const [usersMap, setUsersMap] = useState<Record<number, string>>({});

    // Alumnos inscritos en el curso seleccionado
    const [alumnos, setAlumnos] = useState<AlumnoCursoDTO[]>([]);
    const [loadingAlumnos, setLoadingAlumnos] = useState(false);

    // Asistencia del día
    const today = new Date().toISOString().split("T")[0];
    const [attendanceDate, setAttendanceDate] = useState(today);
    const [attendance, setAttendance] = useState<Record<number, boolean>>({}); // usuarioId → presente
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [attendanceSaved, setAttendanceSaved] = useState(false);

    // Historial de asistencia
    const [historial, setHistorial] = useState<AsistenciaDTO[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    // Notificación avanzada
    const [notifMsg, setNotifMsg] = useState("");
    const [notifTarget, setNotifTarget] = useState<"admin" | "course_all" | "single_student">("course_all");
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [notifSent, setNotifSent] = useState(false);
    const [sendingNotif, setSendingNotif] = useState(false);

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
            await import("../../services/authService").then(m => m.authService.login(user.email, pwdActual));
            await usuariosService.actualizar(user.id, { password: pwdNueva } as any);
            setPwdOk(true);
        } catch {
            setPwdError("La contraseña actual es incorrecta o hubo un error. Inténtalo de nuevo.");
        } finally {
            setPwdEnviando(false);
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

    const fetchInstructorNotifs = () => {
        if (!user) return;
        notificacionesService.listarPorUsuario(user.id).then(setMyNotifs).catch(() => {});
    };

    useEffect(() => {
        if (!user) return;
        cursosService.listar()
            .then(data => {
                const mine = data.filter(c => c.nombreInstructor === user.username);
                setMyCourses(mine);
                if (mine.length > 0) setSelectedCourse(mine[0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        usuariosService.listarTodos()
            .then(data => {
                const map: Record<number, string> = {};
                (data ?? []).forEach(u => { map[u.id] = u.nombre; });
                setUsersMap(map);
            })
            .catch(() => {});

        fetchInstructorNotifs();
    }, [user]);

    // Escuchar actualizaciones de notificaciones reactivamente
    useEffect(() => {
        const handleNotifUpdate = () => fetchInstructorNotifs();
        window.addEventListener("notificationsUpdated", handleNotifUpdate);
        return () => window.removeEventListener("notificationsUpdated", handleNotifUpdate);
    }, [user]);

    const markMyNotifRead = async (notif: NotificacionDTO) => {
        try {
            await notificacionesService.marcarLeida(notif.id, { ...notif, leido: true });
            setMyNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch {
            setMyNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, leido: true } : n));
            window.dispatchEvent(new Event("notificationsUpdated"));
        }
    };

    const markAllMyNotifsRead = async () => {
        const unread = myNotifs.filter(n => !n.leido);
        if (unread.length === 0) return;
        try {
            await Promise.all(unread.map(n => notificacionesService.marcarLeida(n.id, { ...n, leido: true })));
        } catch {}
        setMyNotifs(prev => prev.map(n => ({ ...n, leido: true })));
        window.dispatchEvent(new Event("notificationsUpdated"));
    };

    const deleteMyNotif = async (id: number) => {
        try {
            notificacionesService.eliminar(id);
            setMyNotifs(prev => prev.filter(n => n.id !== id));
            window.dispatchEvent(new Event("notificationsUpdated"));
        } catch {}
    };

    const unreadCount = myNotifs.filter(n => !n.leido).length;

    // Cargar alumnos cuando cambia el curso
    useEffect(() => {
        if (!selectedCourse) return;
        setLoadingAlumnos(true);
        inscripcionesService.listarPorCurso(selectedCourse.id)
            .then(data => { setAlumnos(data ?? []); setLoadingAlumnos(false); })
            .catch(() => { setAlumnos([]); setLoadingAlumnos(false); });

        setAttendance({});
        setAttendanceSaved(false);
    }, [selectedCourse]);

    // Cargar historial al entrar a esa pestaña
    useEffect(() => {
        if (activeTab !== "historial" || !selectedCourse) return;
        setLoadingHistorial(true);
        inscripcionesService.getHistorialAsistencia(selectedCourse.id)
            .then(data => { setHistorial(data ?? []); setLoadingHistorial(false); })
            .catch(() => { setHistorial([]); setLoadingHistorial(false); });
    }, [activeTab, selectedCourse]);

    // Cargar asistencia existente al cambiar fecha
    useEffect(() => {
        if (!selectedCourse || activeTab !== "asistencia") return;
        inscripcionesService.getAsistenciaPorFecha(selectedCourse.id, attendanceDate)
            .then(data => {
                const map: Record<number, boolean> = {};
                data.forEach(a => { map[a.usuarioId] = a.presente; });
                setAttendance(map);
            })
            .catch(() => {});
    }, [attendanceDate, selectedCourse, activeTab]);

    const toggleAttendance = (usuarioId: number) => {
        setAttendance(prev => ({ ...prev, [usuarioId]: !prev[usuarioId] }));
        setAttendanceSaved(false);
    };

    const saveAttendance = async () => {
        if (!selectedCourse || !user) return;
        setSavingAttendance(true);
        const lista: AsistenciaDTO[] = alumnos.map(a => ({
            cursoId: selectedCourse.id,
            usuarioId: a.usuarioId,
            nombreUsuario: getAlumnoNombre(a),
            nombreCurso: selectedCourse.nombre,
            fecha: attendanceDate,
            presente: !!attendance[a.usuarioId],
        }));
        try {
            await inscripcionesService.registrarAsistenciaLote(lista);
            setAttendanceSaved(true);
            setTimeout(() => setAttendanceSaved(false), 4000);
        } catch {
            setAttendanceSaved(false);
        } finally {
            setSavingAttendance(false);
        }
    };

    const sendNotification = async () => {
        if (!notifMsg.trim() || !user) return;
        setSendingNotif(true);
        const formattedMsg = `[Reporte - Instructor: ${user.username}${selectedCourse ? ` - Curso: ${selectedCourse.nombre}` : ""}] ${notifMsg}`;
        try {
            if (notifTarget === "admin") {
                await notificacionesService.crear(1, formattedMsg);
            } else if (notifTarget === "course_all") {
                if (alumnos.length > 0) {
                    await Promise.all(alumnos.map(a => notificacionesService.crear(a.usuarioId, formattedMsg)));
                } else {
                    alert("No hay alumnos inscritos en este curso para enviar notificaciones.");
                    return;
                }
            } else if (notifTarget === "single_student") {
                if (selectedStudentId) {
                    await notificacionesService.crear(Number(selectedStudentId), formattedMsg);
                } else {
                    alert("Selecciona un alumno antes de enviar la notificación.");
                    return;
                }
            }
            setNotifSent(true);
            setNotifMsg("");
            setSelectedStudentId("");
            setTimeout(() => setNotifSent(false), 3000);
        } catch {
            // Silenciar
        } finally {
            setSendingNotif(false);
        }
    };

    if (!user) return null;

    const getAlumnoNombre = (a: AlumnoCursoDTO) =>
        a.nombreUsuario?.trim() || usersMap[a.usuarioId] || `Alumno #${a.usuarioId}`;

    const presentesCount = Object.values(attendance).filter(Boolean).length;

    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para centrar perfectamente en monitores panorámicos */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-[#212121] w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Superior */}
                <div className="mb-14 text-left animate-fadeInUp">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">Panel Instructor</p>
                    <h1 className="mt-2 text-5xl font-black text-sky-800 md:text-6xl tracking-tight">Mis Cursos</h1>
                </div>

                {/* Grid principal expandido con gap-8 */}
                <div className="grid gap-8 lg:grid-cols-[400px_1fr] items-start">
                    
                    {/* ── COLUMNA IZQUIERDA: SIDEBAR DEL DOCENTE ─────────────────── */}
                    <aside className="space-y-5">
                        {/* Perfil rápido tarjeta */}
                        <div className="rounded-2xl bg-sky-200 p-6 shadow-md border border-neutral-200 text-center flex flex-col items-center">
                            <ProfilePhoto username={user.username} />
                            <p className="font-bold text-sky-800 text-lg tracking-tight">{user.username}</p>
                            <p className="text-xs font-semibold text-sky-600 mt-0.5 truncate">{user.email}</p>
                            <span className="mt-3 mx-auto w-fit rounded-full bg-blue-50 !px-3 !py-0.5 text-xs font-bold text-blue-700 tracking-wide border border-blue-100">
                                Instructor
                            </span>

                            {user.phone && (
                                <div className="mt-3 inline-flex flex-col items-center gap-0.5 rounded-xl border border-sky-200/60 bg-sky-50/50 px-4 py-2 dark:border-sky-800/50 dark:bg-sky-900/30">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">Teléfono</p>
                                    <p className="text-sm font-bold text-sky-800 dark:text-sky-200">{user.phone}</p>
                                </div>
                            )}

                            <p className="mt-4 text-[10px] font-bold text-sky-600/60 uppercase tracking-wider">Haz clic en tu foto para cambiarla</p>

                            {myNotifs.filter(n => !n.leido).length > 0 && (
                                <div className="mt-4 rounded-xl bg-sky-50/70 border border-sky-100 p-3 text-left">
                                    <p className="text-xs font-bold text-sky-700 mb-1 flex items-center gap-1">
                                        <span className="animate-pulse">🔔</span> {myNotifs.filter(n => !n.leido).length} nuevas alertas
                                    </p>
                                    {myNotifs.slice(0, 2).map(n => (
                                        <p key={n.id} className="text-xs font-medium text-sky-600 truncate mt-0.5">· {n.mensaje}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Listado de cursos asignados */}
                        <div className="rounded-2xl bg-white p-5 shadow-md border border-neutral-200 text-left">
                            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-neutral-700">Cursos asignados</h2>
                            {loading ? (
                                <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
                            ) : myCourses.length === 0 ? (
                                <p className="text-sm font-semibold text-neutral-600 p-2 text-center bg-gray-50 rounded-xl">No tienes cursos asignados.</p>
                            ) : (
                                <div className="space-y-2">
                                    {myCourses.map(c => (
                                        <button key={c.id} id={`btn-course-${c.id}`}
                                            type="button"
                                            onClick={() => { setSelectedCourse(c); setActiveTab("alumnos"); setAttendanceSaved(false); }}
                                            className={`w-full rounded-xl p-3.5 text-left text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                                                selectedCourse?.id === c.id 
                                                    ? "bg-sky-600 text-white shadow-md font-bold" 
                                                    : "bg-neutral-50 text-neutral-700 font-semibold hover:bg-neutral-100 border border-neutral-200/50"
                                            }`}>
                                            <span className="text-lg shrink-0">{getIcon(c.nombre)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate leading-snug">{c.nombre}</p>
                                                <p className={`text-[11px] mt-0.5 font-medium ${selectedCourse?.id === c.id ? "text-white/70" : "text-neutral-500"}`}>
                                                    ({c.cupoTotal - c.cupoDisponible} alumnos)
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ── COLUMNA DERECHA: PANEL PRINCIPAL CON TABS ───────────────── */}
                    <div className="flex-1 min-w-0">
                        {/* Menú de pestañas superior */}
                        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm border border-neutral-200">
                            {[
                                { key: "perfil",         label: "👤 Mi Perfil" },
                                { key: "notificaciones", label: "🔔 Notificaciones" },
                                { key: "alumnos",        label: "👥 Alumnos" },
                                { key: "asistencia",     label: "✅ Asistencia" },
                                { key: "historial",      label: "📋 Historial" },
                                { key: "notificacion",   label: "📣 Reportar" },
                            ].map(t => (
                                <button key={t.key} id={`instructor-tab-${t.key}`}
                                    type="button"
                                    onClick={() => setActiveTab(t.key as any)}
                                    className={`relative flex-1 min-w-[100px] rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                                        activeTab === t.key ? "bg-sky-600 text-white shadow-md" : "text-neutral-700 hover:bg-gray-50"
                                    }`}>
                                    <span className="flex items-center justify-center gap-1.5">
                                        {t.label}
                                        {t.key === "notificaciones" && unreadCount > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* ── TAB: MI PERFIL ──────────────────────────────────────── */}
                        {activeTab === "perfil" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                <h3 className="mb-6 text-xl font-bold text-sky-600 border-b border-neutral-100 pb-4 font-display">Mi Perfil de Instructor</h3>
                                <div className="grid gap-4 md:grid-cols-2 ">
                                    {[
                                        { label: "Nombre completo", value: user.username },
                                        { label: "Correo electrónico", value: user.email },
                                        { label: "Teléfono", value: user.phone || "No registrado" },
                                        { label: "Rol en el sistema", value: "Instructor Certificado InscribeMe" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-xl border border-neutral-100 bg-[#FAFAFA]/70 p-4 transition duration-200 hover:border-primary-500/20 hover:bg-white hover:shadow-sm">
                                            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">{f.label}</p>
                                            <p className="mt-1.5 text-base font-bold text-neutral-800">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-5 shadow-xs">
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-700">📚 Cursos Asignados</p>
                                        <p className="mt-2 text-4xl font-black text-blue-900 tracking-tight">{myCourses.length}</p>
                                    </div>
                                    <div className="rounded-xl bg-sky-50 border border-sky-200 p-5 shadow-xs">
                                        <p className="text-xs font-bold uppercase tracking-wider text-sky-700">👥 Total Estudiantes</p>
                                        <p className="mt-2 text-4xl font-black text-sky-900 tracking-tight">
                                            {myCourses.reduce((acc, c) => acc + (c.cupoTotal - c.cupoDisponible), 0)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={abrirPwdModal}
                                    className="mt-5 w-full rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition flex items-center gap-2 cursor-pointer shadow-sm"
                                >
                                    🔑 Cambiar contraseña
                                </button>
                            </div>
                        )}

                        {/* ── TAB: BANDEJA DE NOTIFICACIONES ───────────────────────── */}
                        {activeTab === "notificaciones" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-sky-700 font-display">Bandeja de Notificaciones</h3>
                                        <p className="text-xs font-semibold text-neutral-900 mt-1">
                                            Tienes {myNotifs.length} avisos registrados · {unreadCount} pendientes
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button type="button" onClick={markAllMyNotifsRead} className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold text-sky-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-sm">
                                            ✓ Marcar todas leídas
                                        </button>
                                    )}
                                </div>

                                {myNotifs.length === 0 ? (
                                    <div className="rounded-2xl bg-[#FAFAFA] p-12 text-center text-neutral-600 border border-dashed border-neutral-200">
                                        <p className="text-4xl mb-2">📭</p>
                                        <p className="text-sm font-bold">No tienes alertas institucionales en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {myNotifs.map((n) => (
                                            <div key={n.id} className={`rounded-xl border p-4 transition-all duration-300 ${
                                                !n.leido ? "border-sky-300 bg-sky-50 shadow-sm" : "border-neutral-200 bg-white"
                                            }`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            {!n.leido && <span className="flex h-2 w-2 rounded-full bg-sky-600 inline-block animate-pulse" />}
                                                            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
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
                                                            <button type="button" onClick={() => markMyNotifRead(n)} className="rounded-lg bg-white border border-neutral-300 px-3 py-1 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-sm">
                                                                Marcar leída
                                                            </button>
                                                        )}
                                                        <button type="button" onClick={() => deleteMyNotif(n.id)} className="rounded-lg bg-red-50 border border-red-200/30 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer shadow-sm">
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

                        {/* ── SECCIONES DEL PANEL QUE SÍ REQUIEREN UN CURSO ASIGNADO ── */}
                        {activeTab !== "perfil" && activeTab !== "notificaciones" && (
                            selectedCourse ? (
                                <div className="space-y-5">
                                    {/* Cabecera del Curso Seleccionado */}
                                    <div className="rounded-2xl bg-sky-600 px-7 py-6 text-white shadow-md text-left flex flex-wrap items-center gap-4">
                                        <span className="text-4xl shrink-0 shadow-inner p-2 rounded-xl bg-white/5">{getIcon(selectedCourse.nombre)}</span>
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-2xl font-bold tracking-tight truncate font-display">{selectedCourse.nombre}</h2>
                                            <p className="text-sm text-sky-100 font-semibold mt-0.5">
                                                Alumnos matriculados: {selectedCourse.cupoTotal - selectedCourse.cupoDisponible} · {selectedCourse.cupoDisponible} vacantes
                                            </p>
                                        </div>
                                        <div className="text-right text-lg font-bold text-sky-200 shrink-0 border-l border-white/10 pl-4 hidden sm:block leading-relaxed">
                                            <p>📅 Inicio: {selectedCourse.fechaInicio ? new Date(selectedCourse.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : ""}</p>
                                            <p>🏁 Término: {selectedCourse.fechaFin ? new Date(selectedCourse.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : ""}</p>
                                        </div>
                                    </div>

                                    {/* 📥 Sub-tab: Alumnos del curso */}
                                    {activeTab === "alumnos" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                            <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-3">
                                                <h3 className="text-xl font-bold text-sky-700 font-display">Alumnos inscritos</h3>
                                                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 tracking-wide border border-sky-100">
                                                    {alumnos.length} estudiantes activos
                                                </span>
                                            </div>
                                            {loadingAlumnos ? (
                                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-50" />)}</div>
                                            ) : alumnos.length === 0 ? (
                                                <div className="rounded-2xl bg-neutral-50 p-10 text-center text-neutral-600 border border-dashed border-neutral-200">
                                                    <p className="text-4xl mb-2">📭</p>
                                                    <p className="text-sm font-bold">No hay alumnos inscritos en este curso aún.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100 border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                                                    {alumnos.map((a, i) => (
                                                        <div key={a.usuarioId} className="flex items-center gap-3 !px-5 py-4 bg-white hover:bg-neutral-50 transition duration-150">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 shadow-sm">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-neutral-800 truncate">
                                                                    {getAlumnoNombre(a)}
                                                                </p>
                                                                <p className="text-xs font-semibold text-neutral-600 mt-0.5">
                                                                    Inscripción el: {a.fechaInscripcion ? new Date(a.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                                </p>
                                                            </div>
                                                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                                                a.estado === "INSCRITO" ? "bg-green-50 text-green-700" :
                                                                a.estado === "COMPLETADO" ? "bg-blue-50 text-blue-700" :
                                                                "bg-gray-50 text-neutral-600"}`}>
                                                                {a.estado}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 📥 Sub-tab: Registro Diario de Asistencia */}
                                    {activeTab === "asistencia" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                                                <h3 className="text-xl font-bold text-neutral-900 font-display">Registro de Asistencia</h3>
                                                <div className="flex items-center gap-3">
                                                    <input type="date" value={attendanceDate}
                                                        onChange={e => { setAttendanceDate(e.target.value); setAttendanceSaved(false); }}
                                                        className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold outline-none bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all shadow-sm" />
                                                    {attendanceSaved && (
                                                        <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-700 animate-fadeIn">✓ Guardado en BD</span>
                                                    )}
                                                </div>
                                            </div>

                                            {alumnos.length === 0 ? (
                                                <div className="rounded-2xl bg-neutral-50 p-10 text-center text-neutral-600 border border-dashed border-neutral-200">
                                                    <p className="text-sm font-bold">No hay alumnos inscritos en la lista para registrar asistencia.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mb-5 flex gap-4 text-xs font-bold uppercase tracking-wider">
                                                        <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 border border-green-100">✓ Presentes: {presentesCount}</span>
                                                        <span className="rounded-full bg-red-50 px-3 py-1 text-red-600 border border-red-100">✗ Ausentes: {alumnos.length - presentesCount}</span>
                                                    </div>
                                                    
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {alumnos.map((a, i) => {
                                                            const presente = !!attendance[a.usuarioId];
                                                            return (
                                                                <div key={a.usuarioId}
                                                                    className={`flex items-center justify-between rounded-xl border p-4 shadow-xs transition-all duration-200 ${
                                                                        presente ? "border-green-200 bg-green-50/50" : "border-neutral-200 bg-white hover:bg-neutral-50/50"
                                                                    }`}>
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-900 text-xs font-black text-white">
                                                                            {i + 1}
                                                                        </div>
                                                                        <span className="text-sm font-bold text-neutral-800 truncate">
                                                                            {getAlumnoNombre(a)}
                                                                        </span>
                                                                    </div>
                                                                    <button id={`attendance-btn-${a.usuarioId}`}
                                                                        type="button"
                                                                        onClick={() => toggleAttendance(a.usuarioId)}
                                                                        className={`rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-sm ${
                                                                            presente 
                                                                                ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/10" 
                                                                                : "bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent"
                                                                        }`}>
                                                                        {presente ? "✓ Presente" : "✗ Ausente"}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    <button id="btn-save-attendance"
                                                        type="button"
                                                        onClick={saveAttendance}
                                                        disabled={savingAttendance}
                                                        className="mt-6 w-full rounded-xl bg-sky-600 py-3.5 font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 transition-all disabled:opacity-60 cursor-pointer">
                                                        {savingAttendance ? "Guardando cambios en base de datos…" : "💾 Guardar asistencia del día"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* 📥 Sub-tab: Historial General de Asistencias */}
                                    {activeTab === "historial" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                            <h3 className="mb-5 text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-4 font-display">Historial de Asistencia</h3>
                                            {loadingHistorial ? (
                                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-50" />)}</div>
                                            ) : historial.length === 0 ? (
                                                <div className="rounded-2xl bg-neutral-50 p-10 text-center text-neutral-600 border border-dashed border-neutral-200">
                                                    <p className="text-4xl mb-2">📋</p>
                                                    <p className="text-sm font-bold">Aún no hay registros de asistencia guardados para esta actividad académica.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm">
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-sky-900 text-white text-xs font-bold uppercasetracking-wider border-b border-sky-950">
                                                                    <th className="px-5 py-4 text-center">Fecha</th>
                                                                    <th className="px-5 py-4 text-center">Alumno</th>
                                                                    <th className="px-5 py-4 text-center">Asistencia</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {historial.map((h, i) => (
                                                                    <tr key={h.id ?? i} className="hover:bg-neutral-50 transition duration-150">
                                                                        <td className="px-5 py-3.5 font-semibold text-neutral-600">
                                                                            📅 {h.fecha ? new Date(h.fecha + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                                        </td>
                                                                        <td className="px-5 py-3.5 font-bold text-neutral-850">
                                                                            {h.nombreUsuario || `#${h.usuarioId}`}
                                                                        </td>
                                                                        <td className="px-5 py-3.5">
                                                                            <span className={`rounded-full px-3 py-0.5 text-xs font-black ${
                                                                                h.presente ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                                                            }`}>
                                                                                {h.presente ? "✓ Presente" : "✗ Ausente"}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 📥 Sub-tab: Enviar Reportes o Notificaciones Avanzadas */}
                                    {activeTab === "notificacion" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-8 shadow-md border border-neutral-200 text-left">
                                            <h3 className="mb-2 text-xl font-bold text-neutral-900 font-display">
                                                Emitir Reporte o Notificación
                                            </h3>
                                            <p className="text-xs font-semibold text-sky-600 border-b border-neutral-100 pb-3">Canal asignado: <strong className="text-neutral-900">{selectedCourse.nombre}</strong></p>
                                            
                                            {notifSent && (
                                                <div className="my-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-700 animate-fadeIn">
                                                    ✅ Aviso emitido correctamente hacia las bandejas correspondientes.
                                                </div>
                                            )}

                                            <div className="mt-5 mb-5 grid gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-xs font-bold text-sky-600 uppercase tracking-wide">Segmento Destinatario</label>
                                                    <select
                                                        id="notif-target-select"
                                                        value={notifTarget}
                                                        onChange={e => setNotifTarget(e.target.value as any)}
                                                        className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all bg-white shadow-sm"
                                                    >
                                                        <option value="course_all">👥 Todos los alumnos de este curso ({alumnos.length})</option>
                                                        <option value="single_student">👤 Un alumno específico del taller</option>
                                                        <option value="admin">🛡️ Administrador General del Sistema</option>
                                                    </select>
                                                </div>

                                                {notifTarget === "single_student" && (
                                                    <div>
                                                        <label className="mb-2 block text-xs font-bold text-sky-600 uppercase tracking-wide">Seleccionar Alumno</label>
                                                        <select
                                                            id="notif-student-select"
                                                            value={selectedStudentId}
                                                            onChange={e => setSelectedStudentId(e.target.value)}
                                                            className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all bg-white shadow-sm"
                                                        >
                                                            <option value="">-- Elige un estudiante del listado --</option>
                                                            {alumnos.map(a => (
                                                                <option key={a.usuarioId} value={a.usuarioId}>
                                                                    {getAlumnoNombre(a)}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-6">
                                                <label className="mb-2 text-xs font-bold text-sky-600 uppercase tracking-wide">Cuerpo del reporte institucional</label>
                                                <textarea
                                                    id="instructor-notif-textarea"
                                                    value={notifMsg}
                                                    onChange={e => setNotifMsg(e.target.value)}
                                                    rows={5}
                                                    placeholder="   Describe el anuncio o reporte oficial de forma clara..."
                                                    className="w-full resize-none rounded-xl border border-neutral-300 !px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all text-sm leading-relaxed bg-white shadow-sm"
                                                />
                                            </div>

                                            <button
                                                id="btn-send-notif-instructor"
                                                type="button"
                                                onClick={sendNotification}
                                                disabled={!notifMsg.trim() || sendingNotif || (notifTarget === "single_student" && !selectedStudentId)}
                                                className="rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none cursor-pointer"
                                            >
                                                {sendingNotif ? "Transmitiendo aviso..." : "📣 Emitir Reporte Oficial →"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Estado vacío si no hay curso clickeado */
                                <div className="flex items-center justify-center rounded-2xl bg-white p-14 shadow-md text-center border border-neutral-200 animate-fadeIn text-left">
                                    <div className="text-center">
                                        <div className="mb-4 text-5xl">📚</div>
                                        <p className="text-xl font-bold text-neutral-900 font-display">Por favor selecciona un curso del menú lateral</p>
                                        <p className="text-sm font-medium text-neutral-600 mt-2">Necesitas elegir una actividad para gestionar su asistencia, revisar su listado de alumnos o emitir reportes.</p>
                                    </div>
                                </div>
                            )
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
                                    Tu contraseña fue cambiada correctamente.
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
        </main>
    );
};

export default InstructorProfilePage;