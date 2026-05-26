import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usuariosService, type UsuarioBackend } from "../../services/authService";
import { inscripcionesService, type InscripcionDTO, type AsistenciaDTO } from "../../services/inscripcionesService";

// ── Componente detalle de un estudiante ───────────────────────
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
        Promise.all([
            inscripcionesService.listarPorUsuario(student.id),
        ]).then(([insc]) => {
            setInscripciones(insc ?? []);
            setLoading(false);
        }).catch(() => setLoading(false));
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="relative mt-8 mb-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-slideUp">
                {/* Header */}
                <div className="flex items-center gap-5 rounded-t-2xl bg-gradient-to-r from-[#37474F] to-[#455A64] p-6">
                    {photo ? (
                        <img src={photo} alt={student.nombre} className="h-16 w-16 rounded-full object-cover border-3 border-white/30 shadow" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFA000] text-2xl font-black text-[#212121] border-3 border-white/20 shadow">
                            {student.nombre.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/50">Perfil de Estudiante</p>
                        <h2 className="text-xl font-bold text-white">{student.nombre}</h2>
                        <p className="text-sm text-white/70">{student.email}</p>
                    </div>
                    <button onClick={onClose} id="btn-close-student-panel"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition font-bold text-lg">
                        ✕
                    </button>
                </div>

                {/* Stats rápidos */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-b bg-[#FAFAFA]">
                    {[
                        { label: "Cursos inscritos", value: loading ? "…" : inscripciones.length },
                        { label: "Teléfono", value: student.telefono || "—" },
                        { label: "Estado", value: "Activo" },
                    ].map(s => (
                        <div key={s.label} className="py-4 text-center">
                            <p className="text-lg font-black text-[#37474F]">{s.value}</p>
                            <p className="text-xs text-[#455A64]">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-4 pb-0">
                    {[
                        { key: "cursos",     label: "📚 Cursos" },
                        { key: "asistencia", label: "✅ Asistencia" },
                    ].map(t => (
                        <button key={t.key} id={`student-detail-tab-${t.key}`}
                            onClick={() => setActiveTab(t.key as "cursos" | "asistencia")}
                            className={`rounded-t-xl px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                                activeTab === t.key
                                    ? "border-[#FFA000] text-[#FFA000] bg-amber-50"
                                    : "border-transparent text-[#455A64] hover:text-[#37474F]"
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="p-6 pt-4 min-h-[200px]">
                    {/* Tab: Cursos */}
                    {activeTab === "cursos" && (
                        <div className="animate-fadeIn">
                            {loading ? (
                                <div className="space-y-3">
                                    {[1,2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
                                </div>
                            ) : inscripciones.length === 0 ? (
                                <div className="rounded-xl bg-gray-50 py-12 text-center">
                                    <p className="text-3xl mb-2">📭</p>
                                    <p className="text-sm font-medium text-[#455A64]">Este estudiante no tiene cursos inscritos.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {inscripciones.map((ins, i) => (
                                        <div key={`${ins.cursoId}-${i}`}
                                            className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow animate-fadeInUp"
                                            style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFA000]/15 text-xl">
                                                📚
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[#37474F] truncate">{ins.nombreCurso}</p>
                                                <p className="text-xs text-[#455A64]">
                                                    Instructor: {ins.nombreInstructor || "—"} ·
                                                    Inscrito: {ins.fechaInscripcion ? new Date(ins.fechaInscripcion + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#455A64]">
                                                    {ins.fechaInicioCurso && ins.fechaFinCurso
                                                        ? `${new Date(ins.fechaInicioCurso + "T00:00:00").toLocaleDateString("es-CL")} → ${new Date(ins.fechaFinCurso + "T00:00:00").toLocaleDateString("es-CL")}`
                                                        : ""}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                ins.estado === "INSCRITO" ? "bg-green-100 text-green-700" :
                                                ins.estado === "COMPLETADO" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-600"}`}>
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
                                <div className="rounded-xl bg-gray-50 py-12 text-center">
                                    <p className="text-sm text-[#455A64]">El estudiante no tiene cursos.</p>
                                </div>
                            ) : Object.keys(attendanceByCourse).length === 0 ? (
                                <div className="rounded-xl bg-gray-50 py-12 text-center">
                                    <p className="text-3xl mb-2">📋</p>
                                    <p className="text-sm font-medium text-[#455A64]">
                                        {loading ? "Cargando asistencia…" : "No hay registros de asistencia aún."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {Object.entries(attendanceByCourse).map(([curso, records]) => {
                                        const presentes = records.filter(r => r.presente).length;
                                        const pct = records.length > 0 ? Math.round((presentes / records.length) * 100) : 0;
                                        return (
                                            <div key={curso} className="rounded-xl border border-gray-100 p-4 animate-fadeInUp">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <p className="font-bold text-[#37474F]">{curso}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-[#455A64]">{presentes}/{records.length} presencias</span>
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
                                                            pct >= 75 ? "bg-green-100 text-green-700" :
                                                            pct >= 50 ? "bg-amber-100 text-amber-700" :
                                                            "bg-red-100 text-red-700"}`}>
                                                            {pct}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Barra de progreso */}
                                                <div className="mb-3 h-2 w-full rounded-full bg-gray-100">
                                                    <div className={`h-2 rounded-full transition-all ${pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                                                    {records.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((r, j) => (
                                                        <div key={j} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${
                                                            r.presente ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                                            <span>{r.presente ? "✓" : "✗"}</span>
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

// ── Página principal ───────────────────────────────────────────
const AdminStudentsPage = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<UsuarioBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<UsuarioBackend | null>(null);

    useEffect(() => {
        usuariosService.listarTodos()
            .then(data => {
                setStudents(data.filter(u => u.rol === "ESTUDIANTE"));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const filtered = students.filter(s =>
        s.nombre.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-4 py-10 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 animate-fadeInUp">
                    <p className="text-sm font-bold uppercase tracking-widest text-[#FFA000]">Administración</p>
                    <h1 className="mt-1 text-4xl font-black text-[#37474F]">Estudiantes</h1>
                    <p className="mt-1 text-[#455A64]">Consulta el perfil, cursos y asistencia de cada alumno.</p>
                </div>

                {/* Search */}
                <div className="mb-6 animate-fadeInUp" style={{ animationDelay: "80ms" }}>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#455A64]">🔍</span>
                        <input id="student-search" type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o correo…"
                            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm shadow-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/20 transition" />
                    </div>
                </div>

                {/* Student cards */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-200" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <p className="text-4xl mb-3">👤</p>
                        <p className="text-lg font-bold text-[#37474F]">
                            {search ? "Sin resultados" : "No hay estudiantes registrados"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((s, i) => {
                            const photo = localStorage.getItem(`profilePhoto_${s.id}`);
                            return (
                                <button key={s.id} id={`student-card-${s.id}`}
                                    onClick={() => setSelected(s)}
                                    className="group w-full rounded-2xl bg-white p-5 shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-xl hover:border-[#FFA000]/30 transition-all duration-200 animate-fadeInUp"
                                    style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="flex items-center gap-4">
                                        {photo ? (
                                            <img src={photo} alt={s.nombre}
                                                className="h-12 w-12 rounded-full object-cover border-2 border-[#FFA000]/30" />
                                        ) : (
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#37474F] to-[#455A64] text-xl font-black text-[#FFA000]">
                                                {s.nombre.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#37474F] truncate">{s.nombre}</p>
                                            <p className="text-xs text-[#455A64] truncate">{s.email}</p>
                                        </div>
                                    </div>
                                    {s.telefono && (
                                        <p className="mt-3 text-xs text-[#455A64] flex items-center gap-1.5">
                                            <span>📞</span> {s.telefono}
                                        </p>
                                    )}
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Estudiante</span>
                                        <span className="text-xs font-semibold text-[#FFA000] opacity-0 group-hover:opacity-100 transition-opacity">
                                            Ver detalle →
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Panel detalle */}
            {selected && (
                <StudentDetailPanel student={selected} onClose={() => setSelected(null)} />
            )}
        </main>
    );
};

export default AdminStudentsPage;
