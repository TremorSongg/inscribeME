import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { carritoService, type ItemCarritoDTO } from "../../services/carritoService";
import { notificacionesService } from "../../services/notificacionesService";

const CartPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<ItemCarritoDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [purchased, setPurchased] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        carritoService.obtener(user.id)
            .then((data) => {
                setItems(data.items ?? []);
                setTotal(data.total ?? 0);
                setLoading(false);
            })
            .catch(() => { setItems([]); setTotal(0); setLoading(false); });
    }, [user]);

    const handleRemove = async (cursoId: number) => {
        if (!user) return;
        try {
            await carritoService.eliminarItem(user.id, cursoId);
        } catch {
            // Si falla el API, igual removemos del estado local
        }
        const remaining = items.filter(i => i.cursoId !== cursoId);
        setItems(remaining);
        setTotal(remaining.reduce((acc, i) => acc + i.subtotal, 0));
    };

    const handleCheckout = async () => {
        if (!user) return;
        setError(null);
        try {
            await carritoService.checkout(user.id);
            // Notificar al admin
            for (const item of items) {
                await notificacionesService.crear(
                    1,
                    `Nueva inscripción: ${user.username} se inscribió en "${item.nombreCurso}"`
                ).catch(() => {});
            }
            setItems([]);
            setTotal(0);
            setPurchased(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al procesar la compra.");
        }
    };

    const formatPrice = (price: number) =>
        price === 0 ? "Gratis" : `$${price.toLocaleString("es-CL")}`;

    // ── 1. VISTA: ACCESO RESTRINGIDO (SIN LOGUEAR) ──────────────────────────────────
    if (!user) {
        return (
            <main className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-[#FAFAFA] px-6 py-12">
                <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-xl animate-scaleIn">
                    <div className="mb-4 text-5xl">🔒</div>
                    <h1 className="text-2xl font-black text-[#37474F] tracking-tight">Acceso restringido</h1>
                    <p className="mt-3 text-sm font-semibold text-[#455A64]">Debes iniciar sesión para ver tu carrito.</p>
                    <Link to="/login" className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-black text-[#212121] shadow-lg shadow-[#FFA000]/25 hover:bg-[#ffb300] hover:-translate-y-0.5 transition-all">
                        Iniciar sesión
                    </Link>
                </section>
            </main>
        );
    }

    // ── 2. VISTA: INSCRIPCIÓN EXITOSA ───────────────────────────────────────────────
    if (purchased) {
        return (
            <main className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-[#FAFAFA] px-6 py-12">
                <section className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl border border-gray-100 animate-fadeIn">
                    <div className="mb-4 text-6xl">🎉</div>
                    <h1 className="text-2xl font-black text-[#37474F] tracking-tight">¡Inscripción exitosa!</h1>
                    <p className="mt-3 text-sm font-semibold text-[#455A64] leading-relaxed">
                        Te inscribiste correctamente en tus cursos. Puedes verlos en tu perfil.
                    </p>
                    <Link to="/perfil" id="btn-go-to-profile"
                        className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-black text-[#212121] shadow-lg shadow-[#FFA000]/25 hover:bg-[#ffb300] hover:-translate-y-0.5 transition-all">
                        Ver mi perfil →
                    </Link>
                </section>
            </main>
        );
    }

    // ── 3. VISTA PRINCIPAL DEL CARRITO (CON CENTRADO PREMIUM) ────────────────────────
    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para centrar perfectamente en pantallas Ultra-Wide */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-[#212121] w-full flex flex-col items-center">
            <section className="w-full max-w-7xl mx-auto">
                
                {/* Encabezado de la página */}
                <div className="mb-14 text-left animate-fadeInUp">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FFA000]">InscribeMe</p>
                    <h1 className="mt-2 text-5xl font-black text-[#37474F] md:text-6xl tracking-tight">Carrito de cursos</h1>
                    <p className="mt-3 text-lg text-[#455A64]">Revisa los cursos antes de confirmar tu inscripción.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />)}
                    </div>
                ) : items.length === 0 ? (
                    /* Carrito vacío */
                    <div className="rounded-2xl bg-white p-14 text-center shadow-md border border-gray-100 animate-fadeIn">
                        <div className="mb-4 text-5xl">🛒</div>
                        <h2 className="text-2xl font-black text-[#37474F]">Tu carrito está vacío</h2>
                        <p className="mt-2 text-sm font-semibold text-[#455A64]">Agrega actividades desde el catálogo.</p>
                        <Link to="/cursos" className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-black text-[#212121] shadow-lg shadow-[#FFA000]/20 hover:bg-[#ffb300] hover:-translate-y-0.5 transition-all">
                            Ver cursos →
                        </Link>
                    </div>
                ) : (
                    /* Layout de dos columnas: Rejilla estirada a max-w-7xl con gap horizontal de 10 */
                    <div className="grid gap-10 lg:grid-cols-[1fr_360px] text-left items-start">
                        
                        {/* Lista de items (Columna Izquierda) */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.cursoId} className="flex gap-5 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-fadeInUp">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFA000]/15 text-3xl shrink-0 shadow-inner">
                                        📚
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-bold text-[#37474F] text-base md:text-lg truncate">{item.nombreCurso}</h3>
                                            <span className="shrink-0 text-base font-black text-[#37474F]">
                                                {formatPrice(item.precioUnitario)}
                                            </span>
                                        </div>
                                        
                                        {/* RESPETADO: Mantiene estrictamente tu variable item.cantidad original */}
                                        {item.cantidad > 1 && (
                                            <p className="mt-1 text-xs font-bold text-[#455A64]">Cantidad: {item.cantidad}</p>
                                        )}
                                        
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.cursoId)}
                                            id={`btn-remove-${item.cursoId}`}
                                            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer">
                                            ✕ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Panel de Resumen (Columna Derecha) */}
                        <aside className="h-fit rounded-2xl bg-white p-6 shadow-md border border-gray-100 animate-fadeIn sticky top-24">
                            <h2 className="mb-5 text-xl font-black text-[#37474F] border-b border-gray-50 pb-3">Resumen</h2>
                            <div className="space-y-4 text-sm max-h-[220px] overflow-y-auto pr-1">
                                {items.map((i) => (
                                    <div key={i.cursoId} className="flex justify-between items-center gap-3">
                                        <span className="text-[#455A64] font-semibold truncate max-w-[180px]">{i.nombreCurso}</span>
                                        <span className="font-bold text-[#37474F] text-right shrink-0">{formatPrice(i.precioUnitario)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <div className="flex justify-between items-center text-lg font-black text-[#37474F]">
                                    <span>Total</span>
                                    <span className="text-xl text-[#263238]">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs font-bold text-red-700 animate-fadeIn">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                id="btn-checkout"
                                type="button"
                                onClick={handleCheckout}
                                className="mt-6 w-full rounded-xl bg-[#FFA000] py-3.5 font-black text-[#212121] shadow-lg shadow-[#FFA000]/25 hover:bg-[#ffb300] hover:-translate-y-0.5 transition-all cursor-pointer">
                                Confirmar inscripción →
                            </button>
                            <p className="mt-4 text-center text-[11px] font-medium leading-relaxed text-[#455A64]/80">
                                Al confirmar serás inscrito automáticamente en cada curso.
                            </p>
                        </aside>

                    </div>
                )}
            </section>
        </main>
    );
};

export default CartPage;