import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { usuariosService, type UsuarioBackend } from "../../services/authService";
import { inscripcionesService, type InscripcionDTO, type AsistenciaDTO } from "../../services/inscripcionesService";

// ── COMPONENTE DETALLE DE UN ESTUDIANTE (MODAL) ───────────────────────
const StudentDetailPanel = ({
    student,
    onClose,
}: {
    student: UsuarioBackend;
    onClose: () => void;
}) => {
    const [inscripciones, setInscripciones] = useState<InscripcionDTO[]>([]);
    const [attendance, setAttendance] = useState<AsistenciaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"cursos" | "asistencia">("cursos");

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

    const photo = localStorage.getItem(`profilePhoto_${student.id}`);

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
                                            <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
                                                ins.estado === "INSCRITO" ? "bg-green-50 text-green-700" :
                                                ins.estado === "COMPLETADO" ? "bg-blue-50 text-blue-700" :
                                                "bg-neutral-50 text-neutral-600"}`}>
                                                {ins.estado}
                                            </span>
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

// ── PÁGINA PRINCIPAL DE ESTUDIANTES ───────────────────────────────────────────
const AdminStudentsPage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const roleParam = searchParams.get("role");

    const [allUsers, setAllUsers] = useState<UsuarioBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<UsuarioBackend | null>(null);
    const [activeTab, setActiveTab] = useState<"ESTUDIANTE" | "INSTRUCTOR">(
        roleParam === "instructor" ? "INSTRUCTOR" : "ESTUDIANTE"
    );

    useEffect(() => {
        if (roleParam === "instructor") {
            setActiveTab("INSTRUCTOR");
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

    const handleTabChange = (role: "ESTUDIANTE" | "INSTRUCTOR") => {
        setActiveTab(role);
        setSearchParams({ role: role === "INSTRUCTOR" ? "instructor" : "student" });
    };

    const filteredUsers = allUsers.filter(u => u.rol === activeTab);

    const filtered = filteredUsers.filter(s =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para forzar alineación central */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-neutral-800 w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Unificado */}
                <div className="mb-14 text-left animate-fadeInUp">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">Administración</p>
                    <h1 className="mt-2 text-5xl font-black text-sky-900 md:text-6xl tracking-tight">
                        {activeTab === "ESTUDIANTE" ? "Estudiantes" : "Instructores"}
                    </h1>
                    <p className="mt-3 !py-4 text-lg text-sky-600">
                        {activeTab === "ESTUDIANTE" 
                            ? "Consulta el perfil, cursos y asistencia de cada alumno registrado en el ecosistema."
                            : "Consulta la lista de instructores y profesores activos que dictan clases en el ecosistema."}
                    </p>
                </div>

                {/* Tabs de Selección Estudiantes vs Instructores */}
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
                </div>

                {/* Search Bar Refinada */}
                <div className="mb-10 animate-fadeInUp" style={{ animationDelay: "80ms" }}>
                    <div className="relative w-full max-w-2xl text-left">                        
                        <input id="student-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={activeTab === "ESTUDIANTE" 
                                ? "🔍 Buscar estudiantes por nombre o correo electrónico..."
                                : "🔍 Buscar instructores por nombre o correo electrónico..."}
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
                            const studentPhoto = localStorage.getItem(`profilePhoto_${s.id}`);
                            const isStudent = activeTab === "ESTUDIANTE";
                            return (
                                <button key={s.id} id={`${isStudent ? 'student' : 'instructor'}-card-${s.id}`}
                                    type="button"
                                    onClick={() => { if (isStudent) setSelected(s); }}
                                    className={`group w-full rounded-xl p-6 shadow-sm border text-left transition-all duration-300 animate-fadeInUp flex flex-col justify-between ${
                                        isStudent 
                                            ? "bg-sky-100 border-sky-300 hover:-translate-y-1 hover:shadow-lg hover:border-sky-500/30 cursor-pointer"
                                            : "bg-violet-100 border-violet-300 cursor-default"
                                    }`}
                                    style={{ animationDelay: `${i * 50}ms` }}>
                                    
                                    <div>
                                        <div className="flex items-center gap-4">
                                            {studentPhoto ? (
                                                <img src={studentPhoto} alt={s.nombre}
                                                    className={`h-12 w-12 rounded-full object-cover border-2 shadow-sm ${isStudent ? 'border-sky-500/30' : 'border-violet-500/30'}`} />
                                            ) : (
                                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm bg-gradient-to-br ${
                                                    isStudent ? 'from-sky-900 to-sky-950' : 'from-violet-900 to-violet-950'
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
                                            isStudent ? 'bg-emerald-50 text-emerald-700' : 'bg-violet-50 text-violet-700'
                                        }`}>{isStudent ? "Estudiante" : "Instructor"}</span>
                                        {isStudent ? (
                                            <span className="text-xs font-bold text-sky-600 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                Ver detalle →
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-violet-600">
                                                Docente Activo
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Panel detalle modal */}
            {selected && (
                <StudentDetailPanel student={selected} onClose={() => setSelected(null)} />
            )}
        </main>
    );
};

export default AdminStudentsPage;