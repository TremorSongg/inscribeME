import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { cursosService, getIcon, getCategory, type CursoDTO } from "../services/cursosService";
import { carritoService } from "../services/carritoService";
import { inscripcionesService } from "../services/inscripcionesService";

const CATEGORIES = ["Todos", "Deporte", "Fitness", "Aventura", "Bienestar", "Arte", "General"];

const ProductPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CursoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [cartIds, setCartIds] = useState<number[]>([]);
    const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    // Cargar cursos del backend
    useEffect(() => {
        cursosService.listar()
            .then((data) => { setCourses(data); setLoading(false); })
            .catch(() => { setError("No se pudo cargar los cursos."); setLoading(false); });
    }, []);

    // Cargar carrito e inscripciones si está logueado
    useEffect(() => {
        if (!user) {
            setCartIds([]);
            setEnrolledIds([]);
            return;
        }

        // Cargar el carrito
        carritoService.obtener(user.id)
            .then((data) => {
                setCartIds((data.items ?? []).map(item => item.cursoId));
            })
            .catch(() => setCartIds([]));

        // Cargar inscripciones
        inscripcionesService.listarPorUsuario(user.id)
            .then((data) => {
                setEnrolledIds((data ?? [])
                    .filter(ins => ins.estado === "INSCRITO" || ins.estado === "COMPLETADO")
                    .map(ins => ins.cursoId)
                );
            })
            .catch(() => setEnrolledIds([]));
    }, [user]);

    const filtered = selectedCategory === "Todos"
        ? courses
        : courses.filter((c) => getCategory(c.nombre) === selectedCategory);

    const handleAddToCart = async (course: CursoDTO) => {
        if (cartIds.includes(course.id) || enrolledIds.includes(course.id)) return;

        if (user) {
            try {
                await carritoService.agregar(
                    user.id,
                    course.id,
                    course.nombre,
                    course.precio
                );
                setCartIds((prev) => [...prev, course.id]);
                setNotification(`✅ "${course.nombre}" agregado al carrito`);
                setTimeout(() => setNotification(null), 3000);
            } catch (err) {
                setNotification(`⚠️ Ya estás inscrito en este curso o ya se encuentra en tu carrito`);
                setTimeout(() => setNotification(null), 4000);
            }
        } else {
            setCartIds((prev) => [...prev, course.id]);
            setNotification(`✅ "${course.nombre}" agregado al carrito`);
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const canEnroll = !user || user.role === "ESTUDIANTE";

    const formatPrecio = (precio: number) =>
        precio === 0 ? "Gratis" : `$${precio.toLocaleString("es-CL")}`;

    return (
        <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-800 font-sans w-full items-center">
            {/* Notificación flotante */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-neutral-900 border border-neutral-800 px-6 py-4 text-white shadow-2xl animate-fadeInUp flex items-center gap-2">
                    {notification}
                </div>
            )}

            <main className="flex-1 w-full flex flex-col items-center">
                
                {/* Hero Banner */}
                <section className="relative overflow-hidden px-4 md:px-6 py-14 md:py-24 text-white w-full flex justify-center" style={{background: 'linear-gradient(135deg, #00395C 0%, #006397 50%, #0284C7 100%)'}}>
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(14,165,233,0.2) 0%, transparent 50%)'}} />

                    <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center">
                        <div className="max-w-3xl text-center mx-auto">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-sky-200 uppercase tracking-wide mb-4 border border-white/10">
                                Actividades disponibles
                            </span>

                            <h1 className="mb-4 md:mb-6 text-3xl md:text-4xl lg:text-5xl font-extrabold text-sky-200 leading-tight font-display">
                                Explora nuestras actividades e inscríbete fácilmente.
                            </h1>

                            <p className="text-lg leading-relaxed text-sky-100">
                                Encuentra talleres, deportes y actividades recreativas disponibles. Revisa los cupos, fechas y detalles antes de participar.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filtros Sticky */}
                <section className="sticky top-16 md:top-20 lg:top-28 z-30 border-b border-sky-100 bg-white/95 backdrop-blur-md px-4 md:px-6 !py-3 md:!py-4 shadow-sm w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto flex justify-start md:justify-center gap-2 md:gap-6 lg:gap-10 overflow-x-auto pb-1 scrollbar-none text-sm">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                id={`filter-${cat.toLowerCase()}`}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-full px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                    selectedCategory === cat
                                        ? "bg-sky-600 text-white shadow-sm"
                                        : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Grid de cursos */}
                <section className="px-6 py-16 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto">
                        
                        {loading && (
                            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-96 animate-pulse rounded-3xl bg-neutral-200" />
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="rounded-3xl border border-red-200 bg-red-50/50 p-10 text-center max-w-md mx-auto shadow-sm">
                                <p className="text-3xl mb-2">⚠️</p>
                                <p className="font-bold text-red-700 font-display">{error}</p>
                                <button
                                    onClick={() => { setLoading(true); setError(null); cursosService.listar().then(setCourses).finally(() => setLoading(false)); }}
                                    className="mt-4 rounded-full bg-red-100 px-6 py-2.5 text-sm font-bold text-red-700 hover:bg-red-200 transition cursor-pointer"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <p className="mb-8 text-sm text-neutral-700 font-medium pl-1">
                                    Mostrando <strong className="text-neutral-800">{filtered.length}</strong> actividades
                                    {selectedCategory !== "Todos" && ` en "${selectedCategory}"`}
                                </p>

                                {filtered.length === 0 ? (
                                    <div className="rounded-3xl border border-neutral-200 bg-white p-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)] max-w-md mx-auto">
                                        <div className="text-4xl mb-4">📭</div>
                                        <h3 className="text-lg font-bold text-neutral-900 font-display">Sin cursos en esta categoría</h3>
                                    </div>
                                ) : (
                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        {filtered.map((course) => {
                                            const inCart = cartIds.includes(course.id);
                                            const enrolled = enrolledIds.includes(course.id);
                                            const icon = getIcon(course.nombre);
                                            const category = getCategory(course.nombre);
                                            const isFull = course.cupoDisponible === 0;

                                            return (
                                                <article
                                                    key={course.id}
                                                    className={`group flex h-full flex-col rounded-3xl border p-7 overflow-hidden transition-all duration-300 ${
                                                        isFull
                                                            ? "border-red-200 bg-red-50/5 opacity-90 shadow-sm"
                                                            : "border-neutral-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] hover:border-primary-500/20"
                                                    }`}
                                                >
                                                    <div className="mb-6 flex items-center justify-between">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-3xl shadow-inner">
                                                            {icon}
                                                        </div>
                                                        {isFull ? (
                                                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
                                                                🔴 Sin cupos
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-600">
                                                                {category}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="mb-2 text-xl font-bold text-neutral-900 font-display">
                                                        {course.nombre}
                                                    </h3>

                                                    <p className="mb-5 text-sm leading-relaxed text-neutral-700 flex-1">
                                                        {course.descripcion}
                                                    </p>

                                                    <p className="mb-5 text-xs font-medium text-neutral-700 flex items-center gap-1.5">
                                                        <i className="ti ti-school text-primary-500 text-base"></i>
                                                        <span>Instructor: <strong className="text-neutral-800 font-semibold">{course.nombreInstructor}</strong></span>
                                                    </p>

                                                    {/* Detalles */}
                                                    <div className="mb-6 space-y-2.5 border-t border-neutral-100 pt-4 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-neutral-700">Inicio</span>
                                                            <span className="font-semibold text-neutral-800">
                                                                {course.fechaInicio ? new Date(course.fechaInicio + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-neutral-700">Término</span>
                                                            <span className="font-semibold text-neutral-800">
                                                                {course.fechaFin ? new Date(course.fechaFin + "T00:00:00").toLocaleDateString("es-CL") : "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-neutral-700">Cupos</span>
                                                            <span className={`font-bold ${isFull ? "text-red-600" : course.cupoDisponible <= 5 ? "text-amber-600" : "text-green-600"}`}>
                                                                {isFull ? "Agotados (0)" : `${course.cupoDisponible} disponibles`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-neutral-700">Valor</span>
                                                            <span className="font-bold text-neutral-900 text-sm">{formatPrecio(course.precio)}</span>
                                                        </div>
                                                    </div>

                                                    {canEnroll ? (
                                                        <button
                                                            id={`btn-add-cart-${course.id}`}
                                                            type="button"
                                                            onClick={() => handleAddToCart(course)}
                                                            disabled={inCart || enrolled || isFull}
                                                            className={`mt-auto rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 cursor-pointer text-center ${
                                                                enrolled
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed shadow-none"
                                                                    : inCart
                                                                        ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                                                                        : isFull
                                                                            ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed shadow-none"
                                                                            : "btn btn-primary shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                            }`}
                                                        >
                                                            {enrolled
                                                                ? "Ya inscrito"
                                                                : inCart
                                                                    ? "✓ En carrito"
                                                                    : isFull
                                                                        ? "Sin cupos"
                                                                        : "Agregar al carrito"}
                                                        </button>
                                                    ) : (
                                                        <div className="mt-auto rounded-xl bg-neutral-100 border border-neutral-200 py-2.5 text-center text-xs font-semibold text-neutral-500">
                                                            Vista de {user?.role === "INSTRUCTOR" ? "instructor" : "administrador"}
                                                        </div>
                                                    )}
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductPage;