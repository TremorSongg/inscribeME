import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { useAuth } from "../hooks/useAuth";
import { cursosService, getIcon, getCategory, type CursoDTO } from "../services/cursosService";
import { carritoService } from "../services/carritoService";

const CATEGORIES = ["Todos", "Deporte", "Fitness", "Aventura", "Bienestar", "Arte", "General"];

const ProductPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CursoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [cartIds, setCartIds] = useState<number[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    // Cargar cursos del backend
    useEffect(() => {
        cursosService.listar()
            .then((data) => { setCourses(data); setLoading(false); })
            .catch(() => { setError("No se pudo cargar los cursos."); setLoading(false); });
    }, []);

    const filtered = selectedCategory === "Todos"
        ? courses
        : courses.filter((c) => getCategory(c.nombre) === selectedCategory);

    const handleAddToCart = async (course: CursoDTO) => {
        if (cartIds.includes(course.id)) return;

        if (user) {
            // Llamar al backend
            try {
                await carritoService.agregar(
                    user.id,
                    course.id,
                    course.nombre,
                    course.precio
                );
            } catch {
                // Si falla el backend, aún actualizamos el estado visual
            }
        }

        setCartIds((prev) => [...prev, course.id]);
        setNotification(`✅ "${course.nombre}" agregado al carrito`);
        setTimeout(() => setNotification(null), 3000);
    };

    const canEnroll = !user || user.role === "ESTUDIANTE";

    const formatPrecio = (precio: number) =>
        precio === 0 ? "Gratis" : `$${precio.toLocaleString("es-CL")}`;

    return (
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#212121]">
            {/* Notificación flotante */}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#37474F] px-6 py-4 text-white shadow-2xl animate-fadeInUp">
                    {notification}
                </div>
            )}

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-[#37474F] px-6 py-20 text-[#FAFAFA] md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#FFA000]">
                                Actividades disponibles
                            </p>
                            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                                Explora nuestras actividades e inscríbete fácilmente.
                            </h1>
                            <p className="text-lg leading-8 text-[#FAFAFA]/90">
                                Encuentra talleres, deportes y actividades recreativas disponibles.
                                Revisa los cupos, fechas y detalles antes de participar.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Filtros */}
                <section className="sticky top-16 z-30 border-b border-[#455A64]/10 bg-white px-6 py-4 shadow-sm md:px-12 lg:px-20">
                    <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                id={`filter-${cat.toLowerCase()}`}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                        ? "bg-[#37474F] text-white shadow-md"
                                        : "bg-[#FAFAFA] text-[#455A64] hover:bg-[#ECEFF1]"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Grid de cursos */}
                <section className="px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        {loading && (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-80 animate-pulse rounded-2xl bg-gray-200" />
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="rounded-2xl bg-red-50 border border-red-200 p-10 text-center">
                                <p className="text-3xl mb-2">⚠️</p>
                                <p className="font-bold text-red-700">{error}</p>
                                <button
                                    onClick={() => { setLoading(true); setError(null); cursosService.listar().then(setCourses).finally(() => setLoading(false)); }}
                                    className="mt-4 rounded-xl bg-red-100 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 transition"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                <p className="mb-8 text-sm text-[#455A64]">
                                    Mostrando <strong>{filtered.length}</strong> actividades
                                    {selectedCategory !== "Todos" && ` en "${selectedCategory}"`}
                                </p>

                                {filtered.length === 0 ? (
                                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                                        <p className="text-4xl mb-3">📭</p>
                                        <p className="font-bold text-[#37474F]">Sin cursos en esta categoría</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {filtered.map((course) => {
                                            const inCart = cartIds.includes(course.id);
                                            const icon = getIcon(course.nombre);
                                            const category = getCategory(course.nombre);
                                            return (
                                                <article
                                                    key={course.id}
                                                    className="group flex h-full flex-col rounded-2xl border border-[#455A64]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(33,33,33,0.15)]"
                                                >
                                                    <div className="mb-5 flex items-center justify-between">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFA000]/20 text-3xl">
                                                            {icon}
                                                        </div>
                                                        <span className="rounded-full bg-[#37474F] px-3 py-1 text-xs font-semibold text-[#FAFAFA]">
                                                            {category}
                                                        </span>
                                                    </div>

                                                    <h3 className="mb-2 text-xl font-bold text-[#37474F]">
                                                        {course.nombre}
                                                    </h3>
                                                    <p className="mb-5 flex-1 text-sm leading-7 text-[#455A64]">
                                                        {course.descripcion}
                                                    </p>
                                                    <p className="mb-4 text-xs text-[#455A64]">
                                                        👨‍🏫 <span className="font-medium">{course.nombreInstructor}</span>
                                                    </p>

                                                    <div className="mb-5 space-y-2 border-t border-[#455A64]/10 pt-4 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-[#455A64]">Inicio</span>
                                                            <span className="font-semibold">
                                                                {course.fechaInicio ? new Date(course.fechaInicio).toLocaleDateString("es-CL") : "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[#455A64]">Término</span>
                                                            <span className="font-semibold">
                                                                {course.fechaFin ? new Date(course.fechaFin).toLocaleDateString("es-CL") : "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[#455A64]">Cupos</span>
                                                            <span className={`font-semibold ${course.cupoDisponible <= 5 ? "text-red-600" : "text-green-600"}`}>
                                                                {course.cupoDisponible}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[#455A64]">Valor</span>
                                                            <span className="font-bold text-[#37474F]">{formatPrecio(course.precio)}</span>
                                                        </div>
                                                    </div>

                                                    {canEnroll ? (
                                                        <button
                                                            id={`btn-add-cart-${course.id}`}
                                                            type="button"
                                                            onClick={() => handleAddToCart(course)}
                                                            disabled={inCart || course.cupoDisponible === 0}
                                                            className={`mt-auto rounded-xl px-5 py-3 text-sm font-semibold transition ${
                                                                inCart
                                                                    ? "bg-green-100 text-green-700 cursor-default"
                                                                    : course.cupoDisponible === 0
                                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    : "bg-[#FFA000] text-[#212121] hover:bg-[#ffb300] hover:-translate-y-0.5 shadow-md"
                                                            }`}
                                                        >
                                                            {inCart
                                                                ? "✓ En carrito"
                                                                : course.cupoDisponible === 0
                                                                ? "Sin cupos"
                                                                : "Agregar al carrito"}
                                                        </button>
                                                    ) : (
                                                        <div className="mt-auto rounded-xl bg-[#ECEFF1] px-5 py-3 text-center text-xs font-medium text-[#455A64]">
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

            <Footer />
        </div>
    );
};

export default ProductPage;
