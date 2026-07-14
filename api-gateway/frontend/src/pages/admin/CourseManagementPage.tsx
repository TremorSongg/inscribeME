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
    const [formErr, setFormErr] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Asignar alumno a curso
    const [assignCourse, setAssignCourse] = useState<CursoDTO | null>(null);
    const [assignUserId, setAssignUserId] = useState<number | "">("");
    const [assigning, setAssigning] = useState(false);
    const [assignErr, setAssignErr] = useState<string | null>(null);

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
        setFormErr(null);
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
        } catch (err: any) {
            setFormErr(err?.response?.data?.message || err?.message || "Error al guardar el curso. Intenta nuevamente.");
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
        setFormErr(null);
    };

    const handleDelete = async (id: number) => {
        try {
            await cursosService.eliminar(id);
            setCourses((prev) => prev.filter((c) => c.id !== id));
            setDeleteConfirm(null);
            showSuccess("Curso eliminado.");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || "Error al eliminar el curso.";
            setDeleteError(msg);
        }
    };

    const handleAssign = async () => {
        if (!assignCourse || assignUserId === "") return;
        setAssignErr(null);
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
            showSuccess(`${student?.nombre ?? "Estudiante"} inscrito en «${assignCourse.nombre}»`);
            setAssignCourse(null);
            setAssignUserId("");
        } catch (err: any) {
            setAssignErr(err?.response?.data?.message || err?.message || "No se pudo inscribir al estudiante. Intenta de nuevo.");
        } finally {
            setAssigning(false);
        }
    };

    const fieldClass = (field: keyof CourseForm) =>
        `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
            errors[field] ? "input-error focus:ring-red-200" : "border-gray-300 bg-white focus:border-sky-500 focus:ring-sky-500/30"
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
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-neutral-800 w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-14 flex flex-wrap items-center justify-between gap-6 animate-fadeInUp">
                    <div className="text-left">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">Administración</p>
                        <h1 className="mt-2 text-5xl font-black text-sky-900 md:text-6xl tracking-tight">Gestión de Cursos</h1>
                    </div>
                    <button
                        id="btn-add-course"
                        type="button"
                        onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); setFormErr(null); }}
                        className="rounded-xl bg-sky-600 !px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all hover:-translate-y-0.5 cursor-pointer animate-scaleIn"
                    >
                        ＋ Nuevo Curso
                    </button>
                </div>

                {successMsg && (
                    <div className="mb-6 rounded-xl border bg-green-50 border-green-200 text-green-700 px-5 py-3 text-sm font-bold shadow-sm animate-fadeIn">
                        ✅ {successMsg}
                    </div>
                )}

                {/* ── MODAL FORMULARIO DE CURSO ────────────────────────────────── */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto border border-neutral-100 text-left animate-slideUp overflow-hidden">

                            {/* Header coloreado */}
                            <div className="bg-gradient-to-r from-sky-900 to-sky-950 px-8 py-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Gestión de Cursos</p>
                                    <h2 className="mt-1 text-2xl font-black text-white">
                                        {editingId !== null ? "Editar Curso" : "Nuevo Curso"}
                                    </h2>
                                </div>
                                <button type="button" onClick={() => { setShowForm(false); setErrors({}); setFormErr(null); }}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition font-bold text-sm cursor-pointer">
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="bg-neutral-50 px-8 py-7">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Nombre *</label>
                                        <input id="form-course-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={fieldClass("nombre")} placeholder="Ej. Escalada Deportiva Avanzada" />
                                        {errors.nombre && <p className="field-error-msg">⚠ {errors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Instructor *</label>
                                        <select id="form-course-instructor" value={form.instructorId} onChange={(e) => handleInstructorChange(e.target.value)} className={fieldClass("nombreInstructor")}>
                                            <option value="">Seleccionar instructor</option>
                                            {instructors.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                        </select>
                                        {errors.nombreInstructor && <p className="field-error-msg">⚠ {errors.nombreInstructor}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Precio ($)</label>
                                        <input id="form-course-price" type="number" min={0} value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} className={fieldClass("precio")} placeholder="0 para asignar como Gratis" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Cupo total</label>
                                        <input id="form-course-slots" type="number" min={1} value={form.cupoTotal} onChange={(e) => setForm({ ...form, cupoTotal: parseInt(e.target.value) || 1, cupoDisponible: parseInt(e.target.value) || 1 })} className={fieldClass("cupoTotal")} />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Fecha inicio *</label>
                                        <input id="form-course-date" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className={fieldClass("fechaInicio")} />
                                        {errors.fechaInicio && <p className="field-error-msg">⚠ {errors.fechaInicio}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Fecha término *</label>
                                        <input id="form-course-end-date" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className={fieldClass("fechaFin")} />
                                        {errors.fechaFin && <p className="field-error-msg">⚠ {errors.fechaFin}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Descripción *</label>
                                        <textarea id="form-course-description" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={`${fieldClass("descripcion")} resize-none`} placeholder="Describe detalladamente los alcances del taller..." />
                                        {errors.descripcion && <p className="field-error-msg">⚠ {errors.descripcion}</p>}
                                    </div>
                                </div>

                                {formErr && (
                                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                        ⚠️ {formErr}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => { setShowForm(false); setErrors({}); setFormErr(null); }} className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-all cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button id="btn-save-course" type="button" onClick={handleSave} disabled={saving} className="rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/10 hover:bg-sky-700 transition-all disabled:opacity-60 cursor-pointer">
                                        {saving ? "Guardando…" : editingId !== null ? "Actualizar Curso" : "Crear Curso →"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL: ERROR AL ELIMINAR CURSO ────────────────────────────── */}
                {deleteError && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100 text-center animate-scaleIn overflow-hidden">
                            <div className="bg-red-600 px-6 py-5 text-white">
                                <div className="mb-2 text-3xl">🚫</div>
                                <h2 className="text-lg font-black">No se puede eliminar el curso</h2>
                            </div>
                            <div className="px-6 py-6">
                                <p className="text-sm leading-relaxed text-neutral-700">{deleteError}</p>
                                <button
                                    type="button"
                                    onClick={() => setDeleteError(null)}
                                    className="mt-6 w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-lg shadow-red-600/20"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MODAL: CONFIRMACIÓN DE ELIMINACIÓN ─────────────────────────── */}
                {deleteConfirm !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-neutral-100 text-center animate-scaleIn overflow-hidden">
                            <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-5 text-white">
                                <div className="mb-2 text-3xl">⚠️</div>
                                <h2 className="text-xl font-black">¿Eliminar curso?</h2>
                            </div>
                            <div className="px-6 py-6">
                                <p className="text-sm leading-relaxed text-neutral-600">Esta acción dará de baja la materia del sistema y no puede deshacerse.</p>
                                <div className="mt-6 flex gap-3">
                                    <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition cursor-pointer">Cancelar</button>
                                    <button id="btn-confirm-delete" type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition cursor-pointer">Eliminar de raíz</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TABLA DE CURSOS REGISTRADOS ────────────────────────────────── */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-200" />)}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-tl-lg bg-white shadow-md border border-neutral-100 animate-fadeIn">
                        <div className="overflow-x-auto !py-4">
                            <table className="w-full text-center">
                                <thead>
                                    <tr className="bg-sky-800 text-white text-start font-bold uppercase tracking-[0.15em] border-b border-sky-950">
                                        <th className="px-6 py-5 text-center">Curso</th>
                                        <th className="px-6 py-5 text-center">Instructor</th>
                                        <th className="px-6 py-5 text-center">Fechas</th>
                                        <th className="px-6 py-5 text-center">Precio</th>
                                        <th className="px-6 py-5 text-center">Cupos</th>
                                        <th className="px-6 py-5 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center font-semibold text-neutral-500">
                                                📭 No hay cursos registrados en el sistema. Crea el primero arriba.
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((c, idx) => (
                                            <tr key={c.id} className={`transition duration-150 hover:bg-sky-50/10 ${idx % 2 === 0 ? "bg-white" : "bg-sky-50/20"}`}>
                                                <td className="px-6 py-5.5">
                                                    <span className="font-bold text-neutral-900 text-lg">{c.nombre}</span>
                                                </td>
                                                <td className="px-6 py-5.5 font-semibold text-neutral-700">{c.nombreInstructor || "—"}</td>
                                                <td className="px-6 py-5.5 text-neutral-600 font-medium text-xs leading-relaxed">
                                                    📅 {c.fechaInicio ? new Date(c.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : "—"}<br />
                                                    🏁 {c.fechaFin ? new Date(c.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                </td>
                                                <td className="px-6 py-5.5 font-bold text-neutral-900 text-base">
                                                    {c.precio === 0 ? (
                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Gratis</span>
                                                    ) : (
                                                        `$${c.precio.toLocaleString("es-CL")}`
                                                    )}
                                                </td>
                                                <td className="!px-6 !py-5.5">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                                                        c.cupoDisponible <= 5 ? "bg-red-50 text-red-600 animate-pulse" : "bg-green-50 text-green-700"
                                                    }`}>
                                                        {c.cupoDisponible} / {c.cupoTotal} disponibles
                                                    </span>
                                                </td>
                                                <td className="!px-1 py-5.5">
                                                    <div className="flex flex-wrap gap-3 justify-center">
                                                        <button id={`btn-edit-${c.id}`} type="button" onClick={() => handleEdit(c)} className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-sm">Editar</button>
                                                        <button id={`btn-assign-${c.id}`} type="button" onClick={() => { setAssignCourse(c); setAssignUserId(""); setAssignErr(null); }} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer shadow-sm">＋ Alumno</button>
                                                        <button id={`btn-delete-${c.id}`} type="button" onClick={() => setDeleteConfirm(c.id)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-all cursor-pointer shadow-sm">Eliminar</button>
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

                {/* ── MODAL: ASIGNAR ALUMNO A CURSO ─────────────────────────────── */}
                {assignCourse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
                        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-neutral-100 text-left animate-scaleIn overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-7 py-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Inscripción Manual</p>
                                    <h2 className="mt-1 text-xl font-black text-white">Asignar alumno</h2>
                                    <p className="text-sm text-white/70 mt-0.5 truncate max-w-xs">«{assignCourse.nombre}»</p>
                                </div>
                                <button type="button" onClick={() => setAssignCourse(null)}
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition font-bold text-sm cursor-pointer">
                                    ✕
                                </button>
                            </div>
                            <div className="px-7 py-6">
                                <div className="mb-5">
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-500">Seleccionar estudiante</label>
                                    <select id="assign-student-select"
                                        value={assignUserId}
                                        onChange={e => setAssignUserId(e.target.value === "" ? "" : Number(e.target.value))}
                                        disabled={assignCourse.cupoDisponible === 0}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all disabled:bg-neutral-100 disabled:text-neutral-400">
                                        <option value="">Selecciona un estudiante de la lista…</option>
                                        {allUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                                {assignCourse.cupoDisponible === 0 && (
                                    <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-bold text-red-700">
                                        ⚠️ El curso seleccionado se encuentra completo (sin cupos disponibles).
                                    </div>
                                )}
                                {assignErr && (
                                    <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
                                        ⚠️ {assignErr}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setAssignCourse(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-bold text-neutral-600 hover:bg-gray-50 transition cursor-pointer">Cancelar</button>
                                    <button id="btn-confirm-assign" type="button" onClick={handleAssign} disabled={assignUserId === "" || assigning || assignCourse.cupoDisponible === 0}
                                        className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 transition disabled:opacity-60 cursor-pointer">
                                        {assigning ? "Inscribiendo…" : "Confirmar Inscripción"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
};

export default CourseManagementPage;
