import { useState, useEffect } from "react";
import { cursosService, type CursoDTO, type CursoPayload } from "../../services/cursosService";
import { usuariosService, type UsuarioBackend } from "../../services/authService";
import { inscripcionesService } from "../../services/inscripcionesService";

type CourseForm = Omit<CursoPayload, "instructorId"> & { instructorId: number | "" };

const EMPTY_FORM: CourseForm = {
    nombre: "", descripcion: "", precio: 0, cupoTotal: 30, cupoDisponible: 30,
    fechaInicio: "", fechaFin: "", nombreInstructor: "", instructorId: "",
};

const CourseManagementPage = () => {
    const [courses, setCourses] = useState<CursoDTO[]>([]);
    const [instructors, setInstructors] = useState<UsuarioBackend[]>([]);
    const [allUsers, setAllUsers] = useState<UsuarioBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<CourseForm>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof CourseForm, string>>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Asignar alumno a curso
    const [assignCourse, setAssignCourse] = useState<CursoDTO | null>(null);
    const [assignUserId, setAssignUserId] = useState<number | "">("");
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        Promise.all([
            cursosService.listar(),
            usuariosService.listarInstructores(),
            usuariosService.listarTodos(),
        ])
            .then(([c, instructorList, users]) => {
                setCourses(c); setInstructors(instructorList);
                setAllUsers(users.filter(u => u.rol === "ESTUDIANTE"));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const validateForm = (): boolean => {
        const errs: Partial<Record<keyof CourseForm, string>> = {};
        if (!form.nombre.trim()) errs.nombre = "Requerido";
        if (!form.nombreInstructor) errs.nombreInstructor = "Selecciona un instructor";
        if (!form.fechaInicio) errs.fechaInicio = "Requerido";
        if (!form.fechaFin) errs.fechaFin = "Requerido";
        if (!form.descripcion.trim()) errs.descripcion = "Requerido";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSaving(true);
        const payload: CursoPayload = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            precio: form.precio,
            cupoTotal: form.cupoTotal,
            cupoDisponible: form.cupoDisponible,
            fechaInicio: form.fechaInicio,
            fechaFin: form.fechaFin,
            nombreInstructor: form.nombreInstructor,
            instructorId: form.instructorId !== "" ? Number(form.instructorId) : undefined,
        };

        try {
            if (editingId !== null) {
                const updated = await cursosService.actualizar(editingId, payload);
                setCourses((prev) => prev.map((c) => c.id === editingId ? updated : c));
                showSuccess("Curso actualizado correctamente.");
            } else {
                const created = await cursosService.crear(payload);
                setCourses((prev) => [...prev, created]);
                showSuccess("Curso creado correctamente.");
            }
            setShowForm(false);
            setForm(EMPTY_FORM);
            setEditingId(null);
        } catch (err) {
            showSuccess(`Error: ${err instanceof Error ? err.message : "Intenta de nuevo."}`);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (c: CursoDTO) => {
        setForm({
            nombre: c.nombre,
            descripcion: c.descripcion,
            precio: c.precio,
            cupoTotal: c.cupoTotal,
            cupoDisponible: c.cupoDisponible,
            fechaInicio: c.fechaInicio,
            fechaFin: c.fechaFin,
            nombreInstructor: c.nombreInstructor,
            instructorId: "",
        });
        setEditingId(c.id);
        setShowForm(true);
        setErrors({});
    };

    const handleDelete = async (id: number) => {
        try {
            await cursosService.eliminar(id);
            setCourses((prev) => prev.filter((c) => c.id !== id));
            showSuccess("Curso eliminado.");
        } catch {
            showSuccess("Error al eliminar el curso.");
        }
        setDeleteConfirm(null);
    };

    const handleAssign = async () => {
        if (!assignCourse || assignUserId === "") return;
        setAssigning(true);
        const student = allUsers.find(u => u.id === assignUserId);
        try {
            await inscripcionesService.crear({
                usuarioId: Number(assignUserId),
                cursoId: assignCourse.id,
                nombreCurso: assignCourse.nombre,
                nombreUsuario: student?.nombre,
                descripcionCurso: assignCourse.descripcion,
                fechaInicioCurso: assignCourse.fechaInicio,
                fechaFinCurso: assignCourse.fechaFin,
                nombreInstructor: assignCourse.nombreInstructor,
                estado: "INSCRITO",
            });
            showSuccess(`✅ ${student?.nombre ?? "Estudiante"} inscrito en «${assignCourse.nombre}»`);
            setAssignCourse(null);
            setAssignUserId("");
        } catch (err) {
            showSuccess(`Error: ${err instanceof Error ? err.message : "Intenta de nuevo."}`);
        } finally {
            setAssigning(false);
        }
    };

    const fieldClass = (field: keyof CourseForm) =>
        `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
            errors[field] ? "input-error focus:ring-red-200" : "border-gray-300 bg-white focus:border-[#FFA000] focus:ring-[#FFA000]/30"
        }`;

    const handleInstructorChange = (instructorId: string) => {
        const found = instructors.find((i) => i.id === Number(instructorId));
        setForm((prev) => ({
            ...prev,
            instructorId: instructorId === "" ? "" : Number(instructorId),
            nombreInstructor: found ? found.nombre : prev.nombreInstructor,
        }));
    };

    return (
        /* CAMBIO CLAVE: Ajustamos pt-14 pb-28 y flex flex-col items-center para forzar alineación central */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-[#212121] w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Header Integrado */}
                <div className="mb-14 flex flex-wrap items-center justify-between gap-6 animate-fadeInUp">
                    <div className="text-left">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFA000]">Administración</p>
                        <h1 className="mt-2 text-5xl font-black text-[#37474F] md:text-6xl tracking-tight">Gestión de Cursos</h1>
                    </div>
                    <button
                        id="btn-add-course"
                        type="button"
                        onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }}
                        className="rounded-xl bg-[#FFA000] px-5 py-3 font-black text-[#212121] shadow-lg shadow-[#FFA000]/20 hover:bg-[#ffb300] transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                        ＋ Nuevo Curso
                    </button>
                </div>

                {successMsg && (
                    <div className={`mb-6 rounded-xl border px-5 py-3 text-sm font-bold shadow-sm animate-fadeIn ${
                        successMsg.startsWith("Error")
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                        {successMsg.startsWith("Error") ? "⚠️" : "✅"} {successMsg}
                    </div>
                )}

                {/* ── MODAL FORMULARIO DE CURSO ────────────────────────────────── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 text-left animate-slideUp">
                            <h2 className="mb-6 text-2xl font-black text-[#37474F]">
                                {editingId !== null ? "📝 Editar Curso" : "🚀 Crear Nuevo Curso"}
                            </h2>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Nombre *</label>
                                    <input id="form-course-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={fieldClass("nombre")} placeholder="Ej. Escalada Deportiva Avanzada" />
                                    {errors.nombre && <p className="field-error-msg">⚠ {errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Instructor *</label>
                                    <select id="form-course-instructor" value={form.instructorId} onChange={(e) => handleInstructorChange(e.target.value)} className={fieldClass("nombreInstructor")}>
                                        <option value="">Seleccionar instructor</option>
                                        {instructors.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                    </select>
                                    {errors.nombreInstructor && <p className="field-error-msg">⚠ {errors.nombreInstructor}</p>}
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Precio ($)</label>
                                    <input id="form-course-price" type="number" min={0} value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} className={fieldClass("precio")} placeholder="0 para asignar como Gratis" />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Cupo total</label>
                                    <input id="form-course-slots" type="number" min={1} value={form.cupoTotal} onChange={(e) => setForm({ ...form, cupoTotal: parseInt(e.target.value) || 1, cupoDisponible: parseInt(e.target.value) || 1 })} className={fieldClass("cupoTotal")} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Fecha inicio *</label>
                                    <input id="form-course-date" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className={fieldClass("fechaInicio")} />
                                    {errors.fechaInicio && <p className="field-error-msg">⚠ {errors.fechaInicio}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Fecha término *</label>
                                    <input id="form-course-end-date" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className={fieldClass("fechaFin")} />
                                    {errors.fechaFin && <p className="field-error-msg">⚠ {errors.fechaFin}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Descripción *</label>
                                    <textarea id="form-course-description" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={`${fieldClass("descripcion")} resize-none`} placeholder="Describe detalladamente los alcances del taller..." />
                                    {errors.descripcion && <p className="field-error-msg">⚠ {errors.descripcion}</p>}
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => { setShowForm(false); setErrors({}); }} className="rounded-xl border border-[#455A64]/30 px-5 py-2.5 text-sm font-bold text-[#455A64] hover:bg-[#ECEFF1] transition-all cursor-pointer">
                                    Cancelar
                                </button>
                                <button id="btn-save-course" type="button" onClick={handleSave} disabled={saving} className="rounded-xl bg-[#FFA000] px-6 py-2.5 text-sm font-black text-[#212121] shadow-lg shadow-[#FFA000]/10 hover:bg-[#ffb300] transition-all disabled:opacity-60 cursor-pointer">
                                    {saving ? "Guardando…" : editingId !== null ? "Actualizar Curso" : "Crear Curso →"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL: CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────────── */}
                {deleteConfirm !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 text-center animate-scaleIn">
                            <div className="mb-4 text-4xl">⚠️</div>
                            <h2 className="text-xl font-black text-[#37474F]">¿Eliminar curso?</h2>
                            <p className="mt-2 text-sm leading-relaxed text-[#455A64]">Esta acción dará de baja la materia y no se puede deshacer de ninguna forma.</p>
                            <div className="mt-6 flex gap-3">
                                <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-[#455A64] hover:bg-gray-50 transition cursor-pointer">Cancelar</button>
                                <button id="btn-confirm-delete" type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition cursor-pointer">Eliminar de raíz</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TABLA DE CURSOS REGISTRADOS ────────────────────────────────── */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />)}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 animate-fadeIn">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-[#37474F] text-white text-xs font-bold uppercase tracking-[0.15em] border-b border-[#263238]">
                                        <th className="px-6 py-4 text-left">Curso</th>
                                        <th className="px-6 py-4 text-left">Instructor</th>
                                        <th className="px-6 py-4 text-left">Fechas</th>
                                        <th className="px-6 py-4 text-left">Precio</th>
                                        <th className="px-6 py-4 text-left">Cupos</th>
                                        <th className="px-6 py-4 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center font-semibold text-[#455A64]">
                                                📭 No hay cursos registrados en el sistema. Crea el primero arriba.
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((c, idx) => (
                                            <tr key={c.id} className={`transition duration-150 hover:bg-[#FAFAFA] ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                                                <td className="px-6 py-4.5">
                                                    <span className="font-bold text-[#37474F] text-base">{c.nombre}</span>
                                                </td>
                                                <td className="px-6 py-4.5 font-semibold text-[#455A64]">{c.nombreInstructor || "—"}</td>
                                                <td className="px-6 py-4.5 text-[#455A64] font-medium text-xs leading-relaxed">
                                                    📅 {c.fechaInicio ? new Date(c.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : "—"}<br />
                                                    🏁 {c.fechaFin ? new Date(c.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                </td>
                                                <td className="px-6 py-4.5 font-bold text-[#37474F]">
                                                    {c.precio === 0 ? (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Gratis</span>
                                                    ) : (
                                                        `$${c.precio.toLocaleString("es-CL")}`
                                                    )}
                                                </td>
                                                <td className="px-6 py-4.5">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                                                        c.cupoDisponible <= 5 ? "bg-red-50 text-red-600 animate-pulse" : "bg-green-50 text-green-700"
                                                    }`}>
                                                        {c.cupoDisponible} / {c.cupoTotal} disponibles
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4.5">
                                                    <div className="flex flex-wrap gap-2">
                                                        <button id={`btn-edit-${c.id}`} type="button" onClick={() => handleEdit(c)} className="rounded-xl border border-blue-200 bg-blue-50/50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-sm">Editar</button>
                                                        <button id={`btn-assign-${c.id}`} type="button" onClick={() => { setAssignCourse(c); setAssignUserId(""); }} className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-sm">＋ Alumno</button>
                                                        <button id={`btn-delete-${c.id}`} type="button" onClick={() => setDeleteConfirm(c.id)} className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm">Eliminar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── MODAL: ASIGNAR ALUMNO A CURSO DIRECTAMENTE ─────────────────────── */}
                {assignCourse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl border border-gray-100 text-left animate-scaleIn">
                            <h2 className="text-2xl font-black text-[#37474F]">Asignar alumno</h2>
                            <p className="mt-1 text-sm text-[#455A64]">Inscribir de forma manual en el curso: <strong className="text-[#37474F]">«{assignCourse.nombre}»</strong></p>
                            <div className="mt-5 mb-6">
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#455A64]">Seleccionar estudiante</label>
                                <select id="assign-student-select"
                                    value={assignUserId}
                                    onChange={e => setAssignUserId(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition-all">
                                    <option value="">Selecciona un estudiante de la lista…</option>
                                    {allUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setAssignCourse(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-[#455A64] hover:bg-gray-50 transition cursor-pointer">Cancelar</button>
                                <button id="btn-confirm-assign" type="button" onClick={handleAssign} disabled={assignUserId === "" || assigning}
                                    className="flex-1 rounded-xl bg-[#FFA000] py-2.5 text-sm font-black text-[#212121] shadow-lg shadow-[#FFA000]/10 hover:bg-[#ffb300] transition disabled:opacity-60 cursor-pointer">
                                    {assigning ? "Inscribiendo…" : "Confirmar Inscripción"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
};

export default CourseManagementPage;