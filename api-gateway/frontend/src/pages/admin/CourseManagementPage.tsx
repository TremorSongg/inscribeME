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
        `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
            errors[field] ? "input-error focus:ring-red-200" : "border-gray-300 focus:border-[#FFA000] focus:ring-[#FFA000]/30"
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
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 py-10 text-[#212121]">
            <section className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">Administración</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#37474F]">Gestión de Cursos</h1>
                    </div>
                    <button
                        id="btn-add-course"
                        onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }}
                        className="rounded-xl bg-[#FFA000] px-5 py-2.5 font-bold text-[#212121] shadow-md hover:bg-[#ffb300] transition-all hover:-translate-y-0.5"
                    >
                        + Nuevo Curso
                    </button>
                </div>

                {successMsg && (
                    <div className={`mb-6 rounded-xl border px-5 py-3 text-sm font-semibold animate-fadeIn ${
                        successMsg.startsWith("Error")
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-green-50 border-green-200 text-green-700"
                    }`}>
                        {successMsg.startsWith("Error") ? "⚠️" : "✅"} {successMsg}
                    </div>
                )}

                {/* Modal formulario */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
                        <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="mb-5 text-xl font-bold text-[#37474F]">
                                {editingId !== null ? "Editar Curso" : "Crear Nuevo Curso"}
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Nombre *</label>
                                    <input id="form-course-name" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={fieldClass("nombre")} placeholder="Nombre del curso" />
                                    {errors.nombre && <p className="field-error-msg">⚠ {errors.nombre}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Instructor *</label>
                                    <select id="form-course-instructor" value={form.instructorId} onChange={(e) => handleInstructorChange(e.target.value)} className={fieldClass("nombreInstructor")}>
                                        <option value="">Seleccionar instructor</option>
                                        {instructors.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                                    </select>
                                    {errors.nombreInstructor && <p className="field-error-msg">⚠ {errors.nombreInstructor}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Precio ($)</label>
                                    <input id="form-course-price" type="number" min={0} value={form.precio} onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })} className={fieldClass("precio")} placeholder="0 para Gratis" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Cupo total</label>
                                    <input id="form-course-slots" type="number" min={1} value={form.cupoTotal} onChange={(e) => setForm({ ...form, cupoTotal: parseInt(e.target.value) || 1, cupoDisponible: parseInt(e.target.value) || 1 })} className={fieldClass("cupoTotal")} />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Fecha inicio *</label>
                                    <input id="form-course-date" type="date" value={form.fechaInicio} onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })} className={fieldClass("fechaInicio")} />
                                    {errors.fechaInicio && <p className="field-error-msg">⚠ {errors.fechaInicio}</p>}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Fecha término *</label>
                                    <input id="form-course-end-date" type="date" value={form.fechaFin} onChange={(e) => setForm({ ...form, fechaFin: e.target.value })} className={fieldClass("fechaFin")} />
                                    {errors.fechaFin && <p className="field-error-msg">⚠ {errors.fechaFin}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Descripción *</label>
                                    <textarea id="form-course-description" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className={`${fieldClass("descripcion")} resize-none`} placeholder="Descripción del curso..." />
                                    {errors.descripcion && <p className="field-error-msg">⚠ {errors.descripcion}</p>}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => { setShowForm(false); setErrors({}); }} className="rounded-xl border border-[#455A64] px-5 py-2.5 text-sm font-semibold text-[#455A64] hover:bg-[#ECEFF1] transition">
                                    Cancelar
                                </button>
                                <button id="btn-save-course" onClick={handleSave} disabled={saving} className="rounded-xl bg-[#FFA000] px-5 py-2.5 text-sm font-bold text-[#212121] hover:bg-[#ffb300] transition disabled:opacity-60">
                                    {saving ? "Guardando…" : editingId !== null ? "Actualizar" : "Crear curso"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Delete */}
                {deleteConfirm !== null && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
                        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
                            <div className="mb-4 text-4xl">⚠️</div>
                            <h2 className="text-lg font-bold text-[#37474F]">¿Eliminar curso?</h2>
                            <p className="mt-2 text-sm text-[#455A64]">Esta acción no se puede deshacer.</p>
                            <div className="mt-5 flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold hover:bg-gray-50 transition">Cancelar</button>
                                <button id="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm)} className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 transition">Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-gray-200" />)}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#37474F] text-white text-xs uppercase tracking-wider">
                                        <th className="px-5 py-4 text-left">Curso</th>
                                        <th className="px-5 py-4 text-left">Instructor</th>
                                        <th className="px-5 py-4 text-left">Fechas</th>
                                        <th className="px-5 py-4 text-left">Precio</th>
                                        <th className="px-5 py-4 text-left">Cupos</th>
                                        <th className="px-5 py-4 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-10 text-center text-[#455A64]">
                                                No hay cursos registrados. Crea el primero.
                                            </td>
                                        </tr>
                                    ) : (
                                        courses.map((c, idx) => (
                                            <tr key={c.id} className={`border-b border-[#455A64]/10 transition hover:bg-[#FAFAFA] ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-[#37474F]">{c.nombre}</span>
                                                </td>
                                                <td className="px-5 py-4 text-[#455A64]">{c.nombreInstructor || "—"}</td>
                                                 <td className="px-5 py-4 text-[#455A64] text-xs">
                                                     {c.fechaInicio ? new Date(c.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : "—"} →<br />
                                                     {c.fechaFin ? new Date(c.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                 </td>
                                                <td className="px-5 py-4 font-semibold text-[#37474F]">
                                                    {c.precio === 0 ? "Gratis" : `$${c.precio.toLocaleString("es-CL")}`}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`font-bold ${c.cupoDisponible <= 5 ? "text-red-600" : "text-green-600"}`}>
                                                        {c.cupoDisponible}/{c.cupoTotal}
                                                    </span>
                                                </td>
                                                 <td className="px-5 py-4">
                                                     <div className="flex flex-wrap gap-2">
                                                         <button id={`btn-edit-${c.id}`} onClick={() => handleEdit(c)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition">Editar</button>
                                                         <button id={`btn-assign-${c.id}`} onClick={() => { setAssignCourse(c); setAssignUserId(""); }} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition">+ Alumno</button>
                                                         <button id={`btn-delete-${c.id}`} onClick={() => setDeleteConfirm(c.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition">Eliminar</button>
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

                {/* Modal: Asignar alumno a curso */}
                {assignCourse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                            <h2 className="mb-2 text-xl font-bold text-[#37474F]">Asignar alumno</h2>
                            <p className="mb-5 text-sm text-[#455A64]">Inscribir directamente en <strong>{assignCourse.nombre}</strong></p>
                            <div className="mb-4">
                                <label className="mb-1 block text-xs font-bold text-[#455A64]">Seleccionar estudiante</label>
                                <select id="assign-student-select"
                                    value={assignUserId}
                                    onChange={e => setAssignUserId(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition">
                                    <option value="">Selecciona un estudiante…</option>
                                    {allUsers.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre} — {u.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setAssignCourse(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold hover:bg-gray-50 transition">Cancelar</button>
                                <button id="btn-confirm-assign" onClick={handleAssign} disabled={assignUserId === "" || assigning}
                                    className="flex-1 rounded-xl bg-[#FFA000] py-2.5 text-sm font-bold text-[#212121] hover:bg-[#ffb300] transition disabled:opacity-60">
                                    {assigning ? "Inscribiendo…" : "Inscribir"}
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
