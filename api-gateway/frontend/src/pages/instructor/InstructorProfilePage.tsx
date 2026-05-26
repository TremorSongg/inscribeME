import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { cursosService, getIcon, type CursoDTO } from "../../services/cursosService";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";
import {
    inscripcionesService,
    type AlumnoCursoDTO,
    type AsistenciaDTO,
} from "../../services/inscripcionesService";

// ── Foto de perfil compartida ──────────────────────────────────
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

// ── InstructorProfilePage ──────────────────────────────────────
const InstructorProfilePage = () => {
    const { user } = useAuth();
    const [myCourses, setMyCourses] = useState<CursoDTO[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CursoDTO | null>(null);
    const [activeTab, setActiveTab] = useState<"perfil" | "alumnos" | "asistencia" | "historial" | "notificacion">("perfil");
    const [loading, setLoading] = useState(true);
    const [myNotifs, setMyNotifs] = useState<NotificacionDTO[]>([]);

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

        notificacionesService.listarPorUsuario(user.id).then(setMyNotifs).catch(() => {});
    }, [user]);

    // Cargar alumnos cuando cambia el curso
    useEffect(() => {
        if (!selectedCourse) return;
        setLoadingAlumnos(true);
        inscripcionesService.listarPorCurso(selectedCourse.id)
            .then(data => { setAlumnos(data ?? []); setLoadingAlumnos(false); })
            .catch(() => { setAlumnos([]); setLoadingAlumnos(false); });

        // Inicializar asistencia con false para todos
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
            nombreUsuario: a.nombreUsuario || `Alumno #${a.usuarioId}`,
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

    const presentesCount = Object.values(attendance).filter(Boolean).length;

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-4 py-10 text-[#212121]">
            <section className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">Panel Instructor</p>
                    <h1 className="mt-1 text-4xl font-bold text-[#37474F]">Mis Cursos</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside>
                        <div className="rounded-2xl bg-white p-5 shadow-md mb-4 text-center">
                            <ProfilePhoto userId={user.id} username={user.username} />
                            <p className="font-bold text-[#37474F]">{user.username}</p>
                            <p className="text-xs text-[#455A64]">{user.email}</p>
                            <span className="mt-2 mx-auto block w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                Instructor
                            </span>
                            <p className="mt-2 text-[10px] text-[#455A64]">Haz clic en tu foto para cambiarla</p>
                            {myNotifs.filter(n => !n.leido).length > 0 && (
                                <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 text-left">
                                    <p className="text-xs font-bold text-amber-700 mb-1">🔔 {myNotifs.filter(n => !n.leido).length} nueva(s)</p>
                                    {myNotifs.slice(0, 2).map(n => (
                                        <p key={n.id} className="text-xs text-amber-600 truncate">{n.mensaje}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-md">
                            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#455A64]">Cursos asignados</h2>
                            {loading ? (
                                <div className="space-y-2">{[1, 2].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-200" />)}</div>
                            ) : myCourses.length === 0 ? (
                                <p className="text-sm text-[#455A64] p-2">No tienes cursos asignados.</p>
                            ) : (
                                <div className="space-y-2">
                                    {myCourses.map(c => (
                                        <button key={c.id} id={`btn-course-${c.id}`}
                                            onClick={() => { setSelectedCourse(c); setActiveTab("alumnos"); setAttendanceSaved(false); }}
                                            className={`w-full rounded-xl p-3 text-left text-sm transition ${
                                                selectedCourse?.id === c.id ? "bg-[#37474F] text-white" : "bg-[#FAFAFA] text-[#455A64] hover:bg-[#ECEFF1]"
                                            }`}>
                                            <span className="mr-2">{getIcon(c.nombre)}</span>
                                            <span className="font-semibold">{c.nombre}</span>
                                            <span className={`ml-2 text-xs ${selectedCourse?.id === c.id ? "text-white/70" : "text-[#455A64]/60"}`}>
                                                ({c.cupoTotal - c.cupoDisponible} alumnos)
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Panel principal */}
                    <div className="flex-1">
                        {/* Tabs del Panel */}
                        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
                            {[
                                { key: "perfil",       label: "👤 Mi Perfil" },
                                { key: "alumnos",      label: "👥 Alumnos" },
                                { key: "asistencia",   label: "✅ Asistencia" },
                                { key: "historial",    label: "📋 Historial" },
                                { key: "notificacion", label: "📣 Reportar" },
                            ].map(t => (
                                <button key={t.key} id={`instructor-tab-${t.key}`}
                                    onClick={() => setActiveTab(t.key as any)}
                                    className={`flex-1 min-w-[95px] rounded-xl py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                                        activeTab === t.key ? "bg-[#37474F] text-white shadow-md" : "text-[#455A64] hover:bg-[#FAFAFA]"
                                    }`}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Perfil (Independiente de curso seleccionado) */}
                        {activeTab === "perfil" && (
                            <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                <h3 className="mb-5 text-xl font-bold text-[#37474F]">Mi Perfil de Instructor</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {[
                                        { label: "Nombre completo", value: user.username },
                                        { label: "Correo electrónico", value: user.email },
                                        { label: "Teléfono", value: user.phone || "No registrado" },
                                        { label: "Rol en el sistema", value: "Instructor Certificado" },
                                    ].map(f => (
                                        <div key={f.label} className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-[#455A64]">{f.label}</p>
                                            <p className="mt-1 text-base font-bold text-[#212121]">{f.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 shadow-xs">
                                        <p className="text-xs font-bold text-blue-700">📚 Cursos Asignados</p>
                                        <p className="mt-1 text-3xl font-black text-blue-900">{myCourses.length}</p>
                                    </div>
                                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 shadow-xs">
                                        <p className="text-xs font-bold text-amber-700">👥 Total Estudiantes</p>
                                        <p className="mt-1 text-3xl font-black text-amber-900">
                                            {myCourses.reduce((acc, c) => acc + (c.cupoTotal - c.cupoDisponible), 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tabs que requieren curso */}
                        {activeTab !== "perfil" && (
                            selectedCourse ? (
                                <div>
                                    {/* Header curso */}
                                    <div className="mb-4 rounded-2xl bg-[#37474F] p-5 text-white shadow-md">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-3xl">{getIcon(selectedCourse.nombre)}</span>
                                            <div className="flex-1">
                                                <h2 className="text-xl font-bold">{selectedCourse.nombre}</h2>
                                                <p className="text-sm text-white/70">
                                                    {selectedCourse.cupoTotal - selectedCourse.cupoDisponible} inscritos · {selectedCourse.cupoDisponible} cupos libres
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-white/70">
                                                <p>{selectedCourse.fechaInicio ? new Date(selectedCourse.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : ""}</p>
                                                <p>al {selectedCourse.fechaFin ? new Date(selectedCourse.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : ""}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tab Alumnos */}
                                    {activeTab === "alumnos" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="font-bold text-[#37474F]">Alumnos inscritos</h3>
                                                <span className="rounded-full bg-[#FFA000]/20 px-3 py-1 text-xs font-bold text-[#37474F]">
                                                    {alumnos.length} estudiantes
                                                </span>
                                            </div>
                                            {loadingAlumnos ? (
                                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
                                            ) : alumnos.length === 0 ? (
                                                <div className="rounded-xl bg-[#FAFAFA] p-8 text-center text-[#455A64]">
                                                    <p className="text-3xl mb-2">📭</p>
                                                    <p className="text-sm font-medium">No hay alumnos inscritos en este curso aún.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {alumnos.map((a, i) => (
                                                        <div key={a.usuarioId} className="flex items-center gap-3 py-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#37474F] text-xs font-bold text-[#FFA000]">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-semibold text-[#37474F]">
                                                                    {a.nombreUsuario || `Alumno #${a.usuarioId}`}
                                                                </p>
                                                                <p className="text-xs text-[#455A64]">
                                                                    Inscrito: {a.fechaInscripcion ? new Date(a.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                                </p>
                                                            </div>
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                                                a.estado === "INSCRITO" ? "bg-green-100 text-green-700" :
                                                                a.estado === "COMPLETADO" ? "bg-blue-100 text-blue-700" :
                                                                "bg-gray-100 text-gray-600"}`}>
                                                                {a.estado}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Asistencia */}
                                    {activeTab === "asistencia" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                                <h3 className="font-bold text-[#37474F]">Registro de Asistencia</h3>
                                                <div className="flex items-center gap-3">
                                                    <input type="date" value={attendanceDate}
                                                        onChange={e => { setAttendanceDate(e.target.value); setAttendanceSaved(false); }}
                                                        className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition" />
                                                    {attendanceSaved && (
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 animate-fadeIn">✓ Guardado en BD</span>
                                                    )}
                                                </div>
                                            </div>

                                            {alumnos.length === 0 ? (
                                                <div className="rounded-xl bg-[#FAFAFA] p-8 text-center text-[#455A64]">
                                                    <p className="text-sm">No hay alumnos inscritos para registrar asistencia.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="mb-4 flex gap-4 text-sm">
                                                        <span className="font-semibold text-green-700">✓ Presentes: {presentesCount}</span>
                                                        <span className="font-semibold text-red-600">✗ Ausentes: {alumnos.length - presentesCount}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {alumnos.map((a, i) => {
                                                            const presente = !!attendance[a.usuarioId];
                                                            return (
                                                                <div key={a.usuarioId}
                                                                    className={`flex items-center justify-between rounded-xl border p-3 transition ${
                                                                        presente ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#37474F] text-xs font-bold text-[#FFA000]">
                                                                            {i + 1}
                                                                        </div>
                                                                        <span className="text-sm font-medium text-[#37474F]">
                                                                            {a.nombreUsuario || `Alumno #${a.usuarioId}`}
                                                                        </span>
                                                                    </div>
                                                                    <button id={`attendance-btn-${a.usuarioId}`}
                                                                        onClick={() => toggleAttendance(a.usuarioId)}
                                                                        className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                                                                            presente
                                                                                ? "bg-green-500 text-white hover:bg-green-600"
                                                                                : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"}`}>
                                                                        {presente ? "✓ Presente" : "✗ Ausente"}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <button id="btn-save-attendance"
                                                        onClick={saveAttendance}
                                                        disabled={savingAttendance}
                                                        className="mt-5 w-full rounded-xl bg-[#FFA000] py-3 font-bold text-[#212121] hover:bg-[#ffb300] transition disabled:opacity-60">
                                                        {savingAttendance ? "Guardando en base de datos…" : "💾 Guardar asistencia"}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Historial */}
                                    {activeTab === "historial" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                            <h3 className="mb-5 font-bold text-[#37474F]">Historial de Asistencia</h3>
                                            {loadingHistorial ? (
                                                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />)}</div>
                                            ) : historial.length === 0 ? (
                                                <div className="rounded-xl bg-[#FAFAFA] p-8 text-center text-[#455A64]">
                                                    <p className="text-3xl mb-2">📋</p>
                                                    <p className="text-sm">Aún no hay registros de asistencia para este curso.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-[#37474F] text-white text-xs">
                                                                <th className="px-4 py-3 text-left rounded-tl-xl">Fecha</th>
                                                                <th className="px-4 py-3 text-left">Alumno</th>
                                                                <th className="px-4 py-3 text-left rounded-tr-xl">Asistencia</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {historial.map((h, i) => (
                                                                <tr key={h.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                                                                    <td className="px-4 py-2 text-[#455A64]">
                                                                        {h.fecha ? new Date(h.fecha + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                                    </td>
                                                                    <td className="px-4 py-2 font-medium text-[#37474F]">
                                                                        {h.nombreUsuario || `#${h.usuarioId}`}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                                                                            h.presente ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                                            {h.presente ? "✓ Presente" : "✗ Ausente"}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Notificación */}
                                    {activeTab === "notificacion" && (
                                        <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10">
                                            <h3 className="mb-4 text-lg font-bold text-[#37474F]">
                                                Enviar reporte o notificación — «{selectedCourse.nombre}»
                                            </h3>
                                            {notifSent && (
                                                <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 animate-fadeIn">
                                                    ✅ Reporte/notificación enviado correctamente a los destinatarios.
                                                </div>
                                            )}

                                            {/* Selector de destinatario */}
                                            <div className="mb-5 grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <label className="mb-2 block text-xs font-bold text-[#455A64] uppercase tracking-wide">Destinatario</label>
                                                    <select
                                                        id="notif-target-select"
                                                        value={notifTarget}
                                                        onChange={e => setNotifTarget(e.target.value as any)}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition-all bg-white"
                                                    >
                                                        <option value="course_all">👥 Todos los alumnos de este curso ({alumnos.length})</option>
                                                        <option value="single_student">👤 Alumno específico</option>
                                                        <option value="admin">🛡️ Administrador del Sistema</option>
                                                    </select>
                                                </div>

                                                {notifTarget === "single_student" && (
                                                    <div>
                                                        <label className="mb-2 block text-xs font-bold text-[#455A64] uppercase tracking-wide">Seleccionar Alumno</label>
                                                        <select
                                                            id="notif-student-select"
                                                            value={selectedStudentId}
                                                            onChange={e => setSelectedStudentId(e.target.value)}
                                                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition-all bg-white"
                                                        >
                                                            <option value="">-- Elige un estudiante --</option>
                                                            {alumnos.map(a => (
                                                                <option key={a.usuarioId} value={a.usuarioId}>
                                                                    {a.nombreUsuario || `Alumno #${a.usuarioId}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-xs font-bold text-[#455A64] uppercase tracking-wide">Mensaje del reporte</label>
                                                <textarea
                                                    id="instructor-notif-textarea"
                                                    value={notifMsg}
                                                    onChange={e => setNotifMsg(e.target.value)}
                                                    rows={5}
                                                    placeholder="Escribe el mensaje del reporte o notificación aquí..."
                                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition text-sm leading-relaxed"
                                                />
                                            </div>

                                            <button
                                                id="btn-send-notif-instructor"
                                                onClick={sendNotification}
                                                disabled={!notifMsg.trim() || sendingNotif || (notifTarget === "single_student" && !selectedStudentId)}
                                                className="mt-4 rounded-xl bg-[#FFA000] px-6 py-3 font-bold text-[#212121] hover:bg-[#ffb300] hover:-translate-y-0.5 shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {sendingNotif ? "Enviando reporte..." : "📣 Enviar reporte"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-md text-center border border-[#455A64]/10 animate-fadeIn">
                                    <div>
                                        <div className="mb-3 text-4xl">📚</div>
                                        <p className="font-bold text-[#37474F]">Por favor selecciona un curso del menú lateral</p>
                                        <p className="text-sm text-[#455A64] mt-1">Necesitas elegir una actividad para gestionar su asistencia o alumnos.</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default InstructorProfilePage;
