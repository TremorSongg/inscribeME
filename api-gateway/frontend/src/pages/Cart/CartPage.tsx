import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { carritoService, type ItemCarritoDTO } from "../../services/carritoService";
import { notificacionesService } from "../../services/notificacionesService";
import VoucherPanel from "../../components/cart/VoucherPanel";

const CartPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<ItemCarritoDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [purchased, setPurchased] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guardamos una copia de los items/total ANTES de limpiar el carrito,
    // para poder mostrar el voucher en la pantalla de éxito.
    const [purchasedItems, setPurchasedItems] = useState<ItemCarritoDTO[]>([]);
    const [purchasedTotal, setPurchasedTotal] = useState(0);

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
            // Guardamos copia antes de limpiar
            setPurchasedItems([...items]);
            setPurchasedTotal(total);
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
            <main className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-neutral-50 px-6 py-12">
                <section className="cart-card w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 md:p-10 text-center shadow-sm animate-scaleIn">
                    <div className="mb-4 text-5xl">🔒</div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-display">Acceso restringido</h1>
                    <p className="mt-3 text-sm text-neutral-500">Debes iniciar sesión para ver tu carrito.</p>
                    <Link to="/login" className="btn btn-primary mt-6 inline-block">
                        Iniciar sesión
                    </Link>
                </section>
            </main>
        );
    }

    // ── 2. VISTA: INSCRIPCIÓN EXITOSA + VOUCHER ─────────────────────────────────────
    if (purchased) {
        return (
            <main className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center bg-neutral-50 px-6 py-16">
                <section className="cart-card w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-neutral-200 animate-fadeIn">
                    <div className="mb-4 text-6xl">🎉</div>
                    <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight font-display">¡Inscripción exitosa!</h1>
                    <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
                        Te inscribiste correctamente en tus cursos. Descarga tu voucher para pagar en caja.
                    </p>

                    {/* Voucher QR + Descarga — aparece solo tras confirmar */}
                    <VoucherPanel items={purchasedItems} total={purchasedTotal} user={user} />

                    <Link
                        to="/perfil"
                        id="btn-go-to-profile"
                        className="mt-5 inline-block btn btn-outline-primary w-full text-center"
                    >
                        Ver mi perfil →
                    </Link>
                </section>
            </main>
        );
    }

    // ── 3. VISTA PRINCIPAL DEL CARRITO ───────────────────────────────────────────────
    return (
        /* CAMBIO CLAVE: pt-14 pb-28 y flex flex-col items-center para centrar perfectamente en pantallas Ultra-Wide */
        <main className="min-h-[calc(100vh-64px)] bg-neutral-50 px-4 md:px-6 pt-10 md:pt-14 pb-20 md:pb-28 text-neutral-800 w-full flex flex-col items-center">
            <section className="w-full max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="mb-10 text-left animate-fadeInUp">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide">
                        InscribeMe
                    </span>
                    <h1 className="mt-3 text-3xl font-extrabold text-sky-600 md:text-4xl font-display">Carrito de cursos</h1>
                    <p className="mt-1.5 text-sm text-neutral-500">Revisa los cursos antes de confirmar tu inscripción.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-200" />)}
                    </div>
                ) : items.length === 0 ? (
                    /* Carrito vacío */
                    <div className="cart-card rounded-2xl bg-white p-12 text-center border border-neutral-200 shadow-sm animate-fadeIn">
                        <div className="mb-5 text-5xl">🛒</div>
                        <h2 className="text-2xl font-extrabold text-neutral-900 font-display">Tu carrito está vacío</h2>
                        <p className="mt-2 text-sm text-neutral-500">Agrega actividades desde el catálogo.</p>
                        <Link to="/cursos" className="mt-7 btn btn-primary inline-block">
                            Ver cursos →
                        </Link>
                    </div>
                ) : (
                    /* Layout de dos columnas */
                    <div className="grid gap-6 lg:grid-cols-[1fr_420px] text-left items-start">

                        {/* ── Lista de items ── */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.cursoId}
                                    className="cart-card flex gap-5 rounded-2xl bg-white p-5 md:p-6 border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeInUp">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 text-2xl shrink-0">
                                        📚
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-neutral-900 font-display text-base leading-snug">{item.nombreCurso}</h3>
                                            <span className="shrink-0 text-base font-extrabold text-neutral-900 font-display">
                                                {formatPrice(item.precioUnitario)}
                                            </span>
                                        </div>
                                        {item.cantidad > 1 && (
                                            <p className="mt-1 text-xs font-semibold text-neutral-500">Cantidad: {item.cantidad}</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item.cursoId)}
                                            id={`btn-remove-${item.cursoId}`}
                                            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer">
                                            ✕ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Panel Resumen ── */}
                        <aside className="cart-card h-fit rounded-2xl bg-white border border-neutral-200 shadow-sm animate-fadeIn sticky top-24">
                            {/* Header del panel */}
                            <div className="px-8 py-6 border-b border-neutral-200 rounded-t-2xl">
                                <h2 className="text-xl font-bold text-neutral-900 font-display">Resumen del pedido</h2>
                                <p className="mt-1 text-sm text-neutral-500">{items.length} curso{items.length !== 1 ? "s" : ""} seleccionado{items.length !== 1 ? "s" : ""}</p>
                            </div>

                            {/* Lista de cursos */}
                            <div className="px-8 py-6 space-y-4 text-sm max-h-[260px] overflow-y-auto">
                                {items.map((i) => (
                                    <div key={i.cursoId} className="flex justify-between items-start gap-6">
                                        <span className="text-neutral-700 font-medium leading-snug">{i.nombreCurso}</span>
                                        <span className="font-bold text-neutral-900 shrink-0 pt-0.5">{formatPrice(i.precioUnitario)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="mx-6 mb-1 rounded-xl px-5 py-4 border border-neutral-200 bg-neutral-50">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-neutral-700">Total a pagar</span>
                                    <span className="text-2xl font-extrabold text-primary-600 font-display">{formatPrice(total)}</span>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="px-8 pb-8 pt-4 space-y-3">
                                {error && (
                                    <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-bold text-red-700 animate-fadeIn">
                                        ⚠️ {error}
                                    </div>
                                )}
                                <button
                                    id="btn-checkout"
                                    type="button"
                                    onClick={handleCheckout}
                                    className="w-full btn btn-primary py-3.5 font-bold transition-all cursor-pointer">
                                    Confirmar inscripción →
                                </button>
                                <p className="text-center text-[11px] font-medium leading-relaxed text-neutral-400">
                                    Al confirmar serás inscrito automáticamente en cada curso.
                                </p>
                            </div>
                        </aside>

                    </div>
                )}
            </section>
        </main>
    );
};

export default CartPage;