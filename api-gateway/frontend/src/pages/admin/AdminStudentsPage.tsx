import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usuariosService, authService, type UsuarioBackend } from "../../services/authService";
import { inscripcionesService, type InscripcionDTO, type AsistenciaDTO } from "../../services/inscripcionesService";

// ── COMPONENTE DETALLE DE UN ESTUDIANTE (MODAL) ───────────────────────
const StudentDetailPanel = ({
    student,
    onClose,
    onCancelInscripcion,
}: {
    student: UsuarioBackend;
    onClose: () => void;
    onCancelInscripcion?: () => void;
}) => {
    const [inscripciones, setInscripciones] = useState<InscripcionDTO[]>([]);
    const [attendance, setAttendance] = useState<AsistenciaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"cursos" | "asistencia">("cursos");

    const handleCancelInscripcion = async (inscripcionId: number, nombreCurso: string) => {
        if (!window.confirm(`¿Estás seguro de que deseas dar de baja al estudiante del curso «${nombreCurso}»?`)) return;
        try {
            await inscripcionesService.eliminar(inscripcionId);
            setInscripciones(prev => prev.filter(ins => ins.id !== inscripcionId));
            alert(`El estudiante fue dado de baja de «${nombreCurso}» correctamente.`);
            if (onCancelInscripcion) onCancelInscripcion();
        } catch {
            alert("Error al intentar dar de baja.");
        }
    };

    useEffect(() => {
        inscripcionesService.listarPorUsuario(student.id)
            .then((insc) => {
                setInscripciones(insc ?? []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [student.id]);

    // Cargar asistencia cuando cambia a esa pestaña
    useEffect(() => {
        if (activeTab !== "asistencia") return;
        const fetchAll = async () => {
            const allAttendance: AsistenciaDTO[] = [];
            for (const ins of inscripciones) {
                try {
                    const hist = await inscripcionesService.getHistorialAsistencia(ins.cursoId);
                    allAttendance.push(...hist.filter(a => a.usuarioId === student.id));
                } catch { /* skip */ }
            }
            setAttendance(allAttendance);
        };
        if (inscripciones.length > 0) fetchAll();
    }, [activeTab, inscripciones, student.id]);

    const photo = student.fotoPerfil || null;

    // Agrupar asistencia por curso
    const attendanceByCourse: Record<string, AsistenciaDTO[]> = {};
    attendance.forEach(a => {
        const key = a.nombreCurso || `Curso #${a.cursoId}`;
        if (!attendanceByCourse[key]) attendanceByCourse[key] = [];
        attendanceByCourse[key].push(a);
    });

    return (
        <div className="fixed inset-0 z-50 !py-48 flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="relative mt-12 mb-12 w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-neutral-100 animate-slideUp overflow-hidden">
                
                {/* Header Premium */}
                <div className="flex items-center gap-5 !px-4 bg-gradient-to-r from-sky-900 to-sky-950 p-6 text-left">
                    {photo ? (
                        <img src={photo} alt={student.nombre} className="h-16 w-16 rounded-full object-cover border-3 border-white/20 shadow-md" />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sky-600 text-2xl font-bold text-white border-3 border-white/10 shadow-md">
                            {student.nombre.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 !py-4 !px-2min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Perfil de Estudiante</p>
                        <h2 className="text-2xl font-black text-white truncate mt-0.5">{student.nombre}</h2>
                        <p className="text-sm text-white/70 truncate mt-0.5">{student.email}</p>
                    </div>
                    <button type="button" onClick={onClose} id="btn-close-student-panel"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-sm cursor-pointer">
                        ✕
                    </button>
                </div>

                {/* Stats rápidos */}
                <div className="grid grid-cols-3 !px-4 !py-4 divide-x divide-neutral-100 border-b border-neutral-100 bg-[#FAFAFA]">
                    {[
                        { label: "Cursos inscritos", value: loading ? "…" : inscripciones.length },
                        { label: "Teléfono", value: student.telefono || "—" },
                        { label: "Estado", value: "Activo" },
                    ].map(s => (
                        <div key={s.label} className="py-4 px-2 text-center">
                            <p className="text-xl font-bold text-sky-900 tracking-tight">{s.value}</p>
                            <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs de Navegación Interna */}
                <div className="flex !py-4 gap-6 p-4 pb-0 bg-white border-b border-neutral-50 ">
                    {[
                        { key: "cursos",     label: "📚 Cursos" },
                        { key: "asistencia", label: "Asistencia" },
                    ].map(t => (
                        <button key={t.key} id={`student-detail-tab-${t.key}`}
                            type="button"
                            onClick={() => setActiveTab(t.key as "cursos" | "asistencia")}
                            className={`rounded-t-xl px-5 py-3 text-sm font-bold transition-all border-b-2 cursor-pointer ${
                                activeTab === t.key
                                    ? "border-sky-600 text-sky-600 bg-sky-50"
                                    : "border-transparent text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body Modal */}
                <div className="p-6 min-h-[240px] bg-white text-left">
                    {/* Tab: Cursos */}
                    {activeTab === "cursos" && (
                        <div className="animate-fadeIn">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />)}
                                </div>
                            ) : inscripciones.length === 0 ? (
                                <div className="rounded-xl bg-neutral-50 py-12 text-center border border-dashed border-neutral-200">
                                    <p className="text-4xl mb-2">📭</p>
                                    <p className="text-sm font-bold text-neutral-900">Este estudiante no tiene cursos inscritos.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inscripciones.map((ins, i) => (
                                        <div key={`${ins.cursoId}-${i}`}
                                            className="flex gap-4 rounded-xl border border-neutral-100 bg-white p-4 hover:shadow-md transition-all duration-200 animate-fadeInUp"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xl font-bold text-sky-700 border border-sky-100">
                                                📚
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-neutral-900 truncate">{ins.nombreCurso}</p>
                                                <p className="text-xs font-semibold text-sky-500 mt-0.5">
                                                    Instructor: <span className="text-neutral-800">{ins.nombreInstructor || "—"}</span> ·
                                                    Inscrito: {ins.fechaInscripcion ? new Date(ins.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                </p>
                                                <p className="mt-1 text-[11px] font-bold text-neutral-900/70 uppercase tracking-wider">
                                                    {ins.fechaInicioCurso && ins.fechaFinCurso
                                                        ? `📅 ${new Date(ins.fechaInicioCurso + "T00:00:00").toLocaleDateString("es-CL")} al ${new Date(ins.fechaFinCurso + "T00:00:00").toLocaleDateString("es-CL")}`
                                                        : ""}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end justify-between shrink-0">
                                                <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                                    ins.estado === "INSCRITO" ? "bg-green-50 text-green-700" :
                                                    ins.estado === "COMPLETADO" ? "bg-blue-50 text-blue-700" :
                                                    "bg-neutral-50 text-neutral-600"}`}>
                                                    {ins.estado}
                                                </span>
                                                {ins.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCancelInscripcion(ins.id!, ins.nombreCurso)}
                                                        className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm"
                                                    >
                                                        Dar de baja
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Asistencia */}
                    {activeTab === "asistencia" && (
                        <div className="animate-fadeIn">
                            {inscripciones.length === 0 ? (
                                <div className="rounded-xl bg-neutral-50 py-12 text-center border border-dashed border-neutral-200">
                                    <p className="text-sm font-bold text-neutral-600">El estudiante no cuenta con materias activas.</p>
                                </div>
                            ) : Object.keys(attendanceByCourse).length === 0 ? (
                                <div className="rounded-xl bg-neutral-50 py-12 text-center border border-dashed border-neutral-200">
                                    <p className="text-4xl mb-3">📋</p>
                                    <p className="text-sm font-bold text-neutral-900">
                                        {loading ? "Cargando asistencia desde la base..." : "No hay registros de asistencia aún."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {Object.entries(attendanceByCourse).map(([curso, records]) => {
                                        const presentes = records.filter(r => r.presente).length;
                                        const pct = records.length > 0 ? Math.round((presentes / records.length) * 100) : 0;
                                        return (
                                            <div key={curso} className="rounded-xl border border-neutral-100 p-4 bg-white shadow-sm">
                                                <div className="mb-3 flex items-center justify-between gap-4">
                                                    <p className="font-bold text-neutral-900 truncate">{curso}</p>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs font-semibold text-neutral-900">{presentes}/{records.length} presencias</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                                                            pct >= 75 ? "bg-green-50 text-green-700" :
                                                            pct >= 50 ? "bg-amber-50 text-amber-700" :
                                                            "bg-red-50 text-red-700"}`}>
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Progress fill */}
                                                <div className="mb-4 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                                                    <div className={`h-2 rounded-full transition-all duration-500 ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                    {records.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((r, j) => (
                                                        <div key={j} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold shadow-sm border ${
                                                            r.presente ? "bg-green-50/50 text-green-700 border-green-100" : "bg-red-50/50 text-red-700 border-red-100"}`}>
                                                            <span className="font-bold text-sm leading-none">{r.presente ? "✓" : "✗"}</span>
                                                            <span>{r.fecha ? new Date(r.fecha + "T00:00:00").toLocaleDateString("es-CL") : "—"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── COMPONENTE DETALLE DE UN INSTRUCTOR (MODAL) ──────────────────────────────
const InstructorDetailPanel = ({
    instructor,
    onClose,
}: {
    instructor: UsuarioBackend;
    onClose: () => void;
}) => {
    const [cursos, setCursos] = useState<import("../../services/cursosService").CursoDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        import("../../services/cursosService").then(m =>
            m.cursosService.listar()
        ).then(todos => {
            setCursos(todos.filter(c => c.nombreInstructor === instructor.nombre));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [instructor.nombre]);

    const photo = instructor.fotoPerfil || null;
    const totalAlumnos = cursos.reduce((acc, c) => acc + (c.cupoTotal - c.cupoDisponible), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="relative mt-12 mb-12 w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-neutral-100 animate-slideUp overflow-hidden">

                {/* Header */}
                <div className="flex items-center gap-5 px-6 bg-gradient-to-r from-violet-900 to-violet-950 p-6 text-left">
                    {photo ? (
                        <img src={photo} alt={instructor.nombre} className="h-16 w-16 rounded-full object-cover border-2 border-white/20 shadow-md" />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-600 text-2xl font-bold text-white border-2 border-white/10 shadow-md">
                            {instructor.nombre.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Perfil de Instructor</p>
                        <h2 className="text-2xl font-black text-white truncate mt-0.5">{instructor.nombre}</h2>
                        <p className="text-sm text-white/70 truncate mt-0.5">{instructor.email}</p>
                    </div>
                    <button type="button" onClick={onClose}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-sm cursor-pointer">
                        ✕
                    </button>
                </div>

                {/* Stats rápidos */}
                <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100 bg-[#FAFAFA]">
                    {[
                        { label: "Cursos dictados", value: loading ? "…" : cursos.length },
                        { label: "Total alumnos",   value: loading ? "…" : totalAlumnos },
                        { label: "Teléfono",        value: instructor.telefono || "—" },
                    ].map(s => (
                        <div key={s.label} className="py-4 px-2 text-center">
                            <p className="text-xl font-bold text-violet-900 tracking-tight">{s.value}</p>
                            <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Título sección */}
                <div className="px-6 pt-5 pb-2 border-b border-neutral-50 bg-white">
                    <p className="text-sm font-bold text-neutral-700">📚 Cursos asignados</p>
                </div>

                {/* Lista cursos */}
                <div className="p-6 min-h-[200px] bg-white text-left">
                    {loading ? (
                        <div className="space-y-3">
                            {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />)}
                        </div>
                    ) : cursos.length === 0 ? (
                        <div className="rounded-xl bg-neutral-50 py-12 text-center border border-dashed border-neutral-200">
                            <p className="text-4xl mb-2">📭</p>
                            <p className="text-sm font-bold text-neutral-900">Este instructor no tiene cursos asignados.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {cursos.map((c, i) => {
                                const ocupados = c.cupoTotal - c.cupoDisponible;
                                const pct = c.cupoTotal > 0 ? Math.round((ocupados / c.cupoTotal) * 100) : 0;
                                return (
                                    <div key={c.id}
                                        className="rounded-xl border border-neutral-100 bg-white p-4 hover:shadow-md transition-all duration-200 animate-fadeInUp"
                                        style={{ animationDelay: `${i * 60}ms` }}>
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl border border-violet-100">
                                                📚
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-neutral-900 truncate">{c.nombre}</p>
                                                <p className="text-xs font-semibold text-violet-500 mt-0.5">
                                                    📅 {c.fechaInicio ? new Date(c.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                    {" al "}
                                                    {c.fechaFin ? new Date(c.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                </p>
                                                {/* Barra de ocupación */}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full transition-all duration-500 ${pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-violet-500"}`}
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-neutral-500 shrink-0">{ocupados}/{c.cupoTotal} alumnos</span>
                                                </div>
                                            </div>
                                            <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                                c.precio === 0 ? "bg-green-50 text-green-700" : "bg-violet-50 text-violet-700"}`}>
                                                {c.precio === 0 ? "Gratis" : `$${c.precio.toLocaleString("es-CL")}`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── PÁGINA PRINCIPAL DE ESTUDIANTES ───────────────────────────────────────────
const AdminStudentsPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const roleParam = searchParams.get("role");

    const [allUsers, setAllUsers] = useState<UsuarioBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<UsuarioBackend | null>(null);
    const [selectedInstructor, setSelectedInstructor] = useState<UsuarioBackend | null>(null);
    const [activeTab, setActiveTab] = useState<"ESTUDIANTE" | "INSTRUCTOR" | "ADMIN" | "TODOS">(
        roleParam === "admin" ? "ADMIN" : roleParam === "instructor" ? "INSTRUCTOR" : roleParam === "all" ? "TODOS" : "ESTUDIANTE"
    );

    const [editingUser, setEditingUser] = useState<UsuarioBackend | null>(null);
    const [editForm, setEditForm] = useState<{ nombre: string; email: string; telefono: string; rol: "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN"; nuevaPassword: string }>({
        nombre: "", email: "", telefono: "", rol: "ESTUDIANTE", nuevaPassword: ""
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        nombre: "", email: "", telefono: "", password: "", rol: "ESTUDIANTE" as "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN"
    });

    const handleOpenEditModal = (u: UsuarioBackend) => {
        setEditingUser(u);
        setEditForm({
            nombre: u.nombre,
            email: u.email,
            telefono: u.telefono || "",
            rol: u.rol,
            nuevaPassword: ""
        });
    };

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const PHONE_DIGITS_RE = /^\d{8}$/;

    const handleSaveUser = async () => {
        if (!editingUser) return;
        if (!editForm.nombre.trim()) { alert("El nombre no puede estar vacío."); return; }
        if (!EMAIL_RE.test(editForm.email.trim())) { alert("Ingresa un correo electrónico válido."); return; }
        const rawPhone = editForm.telefono.replace(/\D/g, "").replace(/^569/, "").slice(0, 8);
        if (editForm.telefono.trim() && !PHONE_DIGITS_RE.test(rawPhone)) {
            alert("El teléfono debe tener exactamente 8 dígitos después del prefijo +569."); return;
        }
        if (editForm.nuevaPassword.trim() && editForm.nuevaPassword.trim().length < 8) {
            alert("La nueva contraseña debe tener al menos 8 caracteres."); return;
        }
        try {
            const payload: any = {
                nombre: editForm.nombre.trim(),
                email: editForm.email.trim().toLowerCase(),
                telefono: editForm.telefono.trim() ? `+569${rawPhone}` : "",
                rol: editForm.rol,
            };
            if (editForm.nuevaPassword.trim()) payload.password = editForm.nuevaPassword.trim();
            const updated = await usuariosService.actualizar(editingUser.id, payload);
            setAllUsers(prev => prev.map(u => u.id === editingUser.id ? updated : u));
            setEditingUser(null);
            alert("Usuario actualizado correctamente.");
        } catch (err: any) {
            alert(err?.response?.data?.message || "Error al actualizar el usuario.");
        }
    };

    const handleConfirmDeleteUser = async (userId: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar a este usuario? Esta acción lo desactivará del sistema.")) return;
        try {
            await usuariosService.eliminar(userId);
            setAllUsers(prev => prev.filter(u => u.id !== userId));
            alert("Usuario eliminado correctamente.");
        } catch {
            alert("Error al eliminar el usuario.");
        }
    };

    const handleCreateUser = async () => {
        if (!createForm.nombre.trim()) { alert("El nombre es obligatorio."); return; }
        if (!EMAIL_RE.test(createForm.email.trim())) { alert("Ingresa un correo electrónico válido."); return; }
        if (createForm.password.length < 8) { alert("La contraseña debe tener al menos 8 caracteres."); return; }
        const rawPhone = createForm.telefono.replace(/\D/g, "").replace(/^569/, "").slice(0, 8);
        if (createForm.telefono.trim() && !PHONE_DIGITS_RE.test(rawPhone)) {
            alert("El teléfono debe tener exactamente 8 dígitos después del prefijo +569."); return;
        }
        try {
            const created = await authService.registrar({
                ...createForm,
                nombre: createForm.nombre.trim(),
                email: createForm.email.trim().toLowerCase(),
                telefono: createForm.telefono.trim() ? `+569${rawPhone}` : "",
            });
            setAllUsers(prev => [...prev, created]);
            setShowCreateModal(false);
            setCreateForm({ nombre: "", email: "", telefono: "", password: "", rol: "ESTUDIANTE" });
            alert("Usuario creado exitosamente.");
        } catch (err: any) {
            alert(err?.response?.data?.message || "Error al crear el usuario.");
        }
    };

    useEffect(() => {
        if (roleParam === "instructor") {
            setActiveTab("INSTRUCTOR");
        } else if (roleParam === "admin") {
            setActiveTab("ADMIN");
        } else if (roleParam === "all") {
            setActiveTab("TODOS");
        } else {
            setActiveTab("ESTUDIANTE");
        }
    }, [roleParam]);

    useEffect(() => {
        usuariosService.listarTodos()
            .then(data => {
                setAllUsers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const handleTabChange = (role: "ESTUDIANTE" | "INSTRUCTOR" | "ADMIN" | "TODOS") => {
        setActiveTab(role);
        setSearchParams({ role: role === "ADMIN" ? "admin" : role === "INSTRUCTOR" ? "instructor" : role === "TODOS" ? "all" : "student" });
    };

    const filteredUsers = activeTab === "TODOS" ? allUsers : allUsers.filter(u => u.rol === activeTab);

    const filtered = filteredUsers.filter(s =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para forzar alineación central */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-neutral-800 w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Unificado */}
                <div className="mb-14 flex flex-wrap items-center justify-between gap-6 animate-fadeInUp">
                    <div className="text-left">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">Administración</p>
                        <h1 className="mt-2 text-5xl font-black text-sky-900 md:text-6xl tracking-tight">
                            {activeTab === "ESTUDIANTE" ? "Estudiantes" : activeTab === "INSTRUCTOR" ? "Instructores" : activeTab === "ADMIN" ? "Administradores" : "Todos los Usuarios"}
                        </h1>
                        <p className="mt-3 !py-4 text-lg text-sky-600">
                            {activeTab === "ESTUDIANTE" 
                                ? "Consulta el perfil, cursos y asistencia de cada alumno registrado en el ecosistema."
                                : activeTab === "INSTRUCTOR"
                                    ? "Consulta la lista de instructores y profesores activos que dictan clases en el ecosistema."
                                    : activeTab === "ADMIN"
                                        ? "Administradores del sistema con privilegios de gestión de datos."
                                        : "Directorio completo de usuarios registrados en el ecosistema."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-xl bg-sky-600 !px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all hover:-translate-y-0.5 cursor-pointer animate-scaleIn"
                    >
                        ＋ Nuevo Usuario
                    </button>
                </div>

                {/* Tabs de Selección */}
                <div className="flex gap-4 mb-8 border-b border-sky-100 pb-px w-full max-w-2xl text-left animate-fadeInUp">
                    <button
                        type="button"
                        onClick={() => handleTabChange("ESTUDIANTE")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                            activeTab === "ESTUDIANTE"
                                ? "border-sky-600 text-sky-600 font-black"
                                : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        🎒 Estudiantes ({allUsers.filter(u => u.rol === "ESTUDIANTE").length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("INSTRUCTOR")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                            activeTab === "INSTRUCTOR"
                                ? "border-violet-600 text-violet-600 font-black"
                                : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        🏫 Instructores ({allUsers.filter(u => u.rol === "INSTRUCTOR").length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("ADMIN")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                            activeTab === "ADMIN"
                                ? "border-amber-600 text-amber-600 font-black"
                                : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        🛠️ Administradores ({allUsers.filter(u => u.rol === "ADMIN").length})
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange("TODOS")}
                        className={`px-6 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
                            activeTab === "TODOS"
                                ? "border-neutral-805 text-neutral-800 font-black"
                                : "border-transparent text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        👥 Todos ({allUsers.length})
                    </button>
                </div>

                {/* Search Bar Refinada */}
                <div className="mb-10 animate-fadeInUp" style={{ animationDelay: "80ms" }}>
                    <div className="relative w-full max-w-2xl text-left">                        
                        <input id="student-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={activeTab === "ESTUDIANTE" 
                                ? "🔍 Buscar estudiantes por nombre o correo electrónico..."
                                : activeTab === "INSTRUCTOR"
                                    ? "🔍 Buscar instructores por nombre o correo electrónico..."
                                    : activeTab === "ADMIN"
                                        ? "🔍 Buscar administradores por nombre o correo electrónico..."
                                        : "🔍 Buscar usuarios por nombre o correo electrónico..."}
                            className="w-full rounded-xl border border-neutral-300 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all" />
                    </div>
                </div>

                {/* Student cards grid con espaciado premium */}
                {loading ? (
                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-36 animate-pulse rounded-xl bg-neutral-200" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-xl bg-white p-14 text-center shadow-md border border-neutral-200">
                        <p className="text-5xl mb-3">👤</p>
                        <p className="text-xl font-bold text-neutral-900">
                            {search ? "Sin resultados coincidentes" : "No hay registros disponibles"}
                        </p>
                        <p className="mt-2 text-sm text-neutral-600">Verifica los criterios ingresados en la caja de búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid gap-x-6 !py-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((s, i) => {
                            const studentPhoto = s.fotoPerfil || null;
                            const isStudent = s.rol === "ESTUDIANTE";
                            const isInstructor = s.rol === "INSTRUCTOR";
                            const isAdmin = s.rol === "ADMIN";
                            return (
                                <button key={s.id} id={`${isStudent ? 'student' : isInstructor ? 'instructor' : 'admin'}-card-${s.id}`}
                                    type="button"
                                    onClick={() => { if (isStudent) setSelected(s); else if (isInstructor) setSelectedInstructor(s); }}
                                    className={`group w-full rounded-xl p-6 shadow-sm border text-left transition-all duration-300 animate-fadeInUp flex flex-col justify-between ${
                                        isStudent 
                                            ? "bg-sky-100 border-sky-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-500/30 cursor-pointer"
                                            : isInstructor
                                                ? "bg-violet-100 border-violet-300 hover:-translate-y-1 hover:shadow-lg hover:border-violet-500/30 cursor-pointer"
                                                : isAdmin
                                                    ? "bg-amber-100 border-amber-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-500/30 cursor-pointer"
                                                    : "bg-gray-100 border-gray-300"
                                    }`}
                                    style={{ animationDelay: `${i * 50}ms` }}>
                                    
                                    <div>
                                        <div className="flex items-center gap-4">
                                            {studentPhoto ? (
                                                <img src={studentPhoto} alt={s.nombre}
                                                    className={`h-12 w-12 rounded-full object-cover border-2 shadow-sm ${
                                                        isStudent ? 'border-sky-500/30' : isInstructor ? 'border-violet-500/30' : 'border-amber-500/30'
                                                    }`} />
                                            ) : (
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm bg-gradient-to-br ${
                                                    isStudent ? 'from-sky-900 to-sky-950' : isInstructor ? 'from-violet-900 to-violet-950' : 'from-amber-900 to-amber-950'
                                                }`}>
                                                    {s.nombre.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-neutral-900 text-base truncate">{s.nombre}</p>
                                                <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">{s.email}</p>
                                            </div>
                                        </div>
                                        
                                        {s.telefono && (
                                            <p className="mt-4 text-xs font-semibold text-neutral-600 flex items-center gap-2">
                                                <span>📞</span> <span className="text-neutral-900">{s.telefono}</span>
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between w-full">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                            isStudent ? 'bg-emerald-50 text-emerald-700' :
                                            isInstructor ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'
                                        }`}>{isStudent ? "Estudiante" : isInstructor ? "Instructor" : "Admin"}</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleOpenEditModal(s); }}
                                                className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleConfirmDeleteUser(s.id); }}
                                                className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Panel detalle estudiante */}
            {selected && (
                <StudentDetailPanel
                    student={selected}
                    onClose={() => setSelected(null)}
                    onCancelInscripcion={() => {
                        usuariosService.listarTodos().then(setAllUsers).catch(() => {});
                    }}
                />
            )}

            {/* Panel detalle instructor */}
            {selectedInstructor && (
                <InstructorDetailPanel
                    instructor={selectedInstructor}
                    onClose={() => setSelectedInstructor(null)}
                />
            )}

            {/* Modal de Edición de Usuario */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl border border-neutral-100 text-left animate-scaleIn">
                        <h2 className="text-2xl font-black text-neutral-900">Editar Usuario</h2>
                        <p className="mt-1 text-sm text-neutral-600">Modifica los detalles del usuario en el ecosistema.</p>
                        
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Nombre completo</label>
                                <input
                                    type="text"
                                    value={editForm.nombre}
                                    onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Correo electrónico</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Teléfono</label>
                                <div className="flex">
                                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-neutral-100 px-3 text-sm font-bold text-neutral-600 select-none">+569</span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={editForm.telefono.replace(/^\+?569?/, "")}
                                        onChange={e => {
                                            const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                                            setEditForm({ ...editForm, telefono: d });
                                        }}
                                        maxLength={8}
                                        placeholder="12345678"
                                        className="w-full rounded-r-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Rol del sistema</label>
                                <select
                                    value={editForm.rol}
                                    onChange={e => setEditForm({ ...editForm, rol: e.target.value as any })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                >
                                    <option value="ESTUDIANTE">Estudiante</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">
                                    Nueva contraseña <span className="normal-case font-normal text-neutral-400">(dejar vacío para no cambiar)</span>
                                </label>
                                <input
                                    type="password"
                                    value={editForm.nuevaPassword}
                                    onChange={e => setEditForm({ ...editForm, nuevaPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-neutral-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveUser}
                                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/10 hover:bg-sky-700 transition cursor-pointer"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Crear Usuario */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md rounded-xl bg-white p-7 shadow-2xl border border-neutral-100 text-left animate-scaleIn">
                        <h2 className="text-2xl font-black text-neutral-900">Crear Nuevo Usuario</h2>
                        <p className="mt-1 text-sm text-neutral-600">Completa los datos para registrar un nuevo usuario.</p>
                        
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Nombre completo *</label>
                                <input
                                    type="text"
                                    value={createForm.nombre}
                                    onChange={e => setCreateForm({ ...createForm, nombre: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Correo electrónico *</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Contraseña *</label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Teléfono <span className="normal-case font-normal text-neutral-400">(opcional)</span></label>
                                <div className="flex">
                                    <span className="flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-neutral-100 px-3 text-sm font-bold text-neutral-600 select-none">+569</span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={createForm.telefono}
                                        onChange={e => {
                                            const d = e.target.value.replace(/\D/g, "").slice(0, 8);
                                            setCreateForm({ ...createForm, telefono: d });
                                        }}
                                        maxLength={8}
                                        placeholder="12345678"
                                        className="w-full rounded-r-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Rol del sistema</label>
                                <select
                                    value={createForm.rol}
                                    onChange={e => setCreateForm({ ...createForm, rol: e.target.value as any })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all"
                                >
                                    <option value="ESTUDIANTE">Estudiante</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-neutral-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateUser}
                                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/10 hover:bg-sky-700 transition cursor-pointer"
                            >
                                Crear Usuario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default AdminStudentsPage;