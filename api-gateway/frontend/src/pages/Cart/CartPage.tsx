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

    if (!user) {
        return (
            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-6 py-12">
                <section className="w-full max-w-md rounded-2xl border border-[#455A64]/20 bg-white p-10 text-center shadow-md">
                    <div className="mb-4 text-5xl">🔒</div>
                    <h1 className="text-2xl font-bold text-[#37474F]">Acceso restringido</h1>
                    <p className="mt-3 text-[#455A64]">Debes iniciar sesión para ver tu carrito.</p>
                    <Link to="/login" className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-semibold text-[#212121] hover:bg-[#ffb300] transition">
                        Iniciar sesión
                    </Link>
                </section>
            </main>
        );
    }

    if (purchased) {
        return (
            <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] px-6 py-12">
                <section className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-md animate-fadeIn">
                    <div className="mb-4 text-6xl">🎉</div>
                    <h1 className="text-2xl font-bold text-[#37474F]">¡Inscripción exitosa!</h1>
                    <p className="mt-3 text-[#455A64]">
                        Te inscribiste correctamente en tus cursos. Puedes verlos en tu perfil.
                    </p>
                    <Link to="/perfil" id="btn-go-to-profile"
                        className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-semibold text-[#212121] hover:bg-[#ffb300] transition">
                        Ver mi perfil →
                    </Link>
                </section>
            </main>
        );
    }

    const formatPrice = (price: number) =>
        price === 0 ? "Gratis" : `$${price.toLocaleString("es-CL")}`;

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 py-12 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">InscribeMe</p>
                    <h1 className="mt-1 text-4xl font-bold text-[#37474F]">Carrito de cursos</h1>
                    <p className="mt-2 text-[#455A64]">Revisa los cursos antes de confirmar tu inscripción.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <div className="mb-4 text-5xl">🛒</div>
                        <h2 className="text-xl font-bold text-[#37474F]">Tu carrito está vacío</h2>
                        <p className="mt-2 text-[#455A64]">Agrega actividades desde el catálogo.</p>
                        <Link to="/cursos" className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-semibold text-[#212121] hover:bg-[#ffb300] transition">
                            Ver cursos →
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                        {/* Lista de items */}
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.cursoId} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm border border-[#455A64]/10">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FFA000]/20 text-3xl shrink-0">
                                        📚
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-[#37474F]">{item.nombreCurso}</h3>
                                            <span className="shrink-0 text-sm font-bold text-[#37474F]">
                                                {formatPrice(item.precioUnitario)}
                                            </span>
                                        </div>
                                        {item.cantidad > 1 && (
                                            <p className="mt-1 text-xs text-[#455A64]">Cantidad: {item.cantidad}</p>
                                        )}
                                        <button
                                            onClick={() => handleRemove(item.cursoId)}
                                            id={`btn-remove-${item.cursoId}`}
                                            className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700 transition">
                                            ✕ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumen */}
                        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm border border-[#455A64]/10">
                            <h2 className="mb-5 text-lg font-bold text-[#37474F]">Resumen</h2>
                            <div className="space-y-3 text-sm">
                                {items.map((i) => (
                                    <div key={i.cursoId} className="flex justify-between">
                                        <span className="text-[#455A64] truncate max-w-[160px]">{i.nombreCurso}</span>
                                        <span className="font-semibold">{formatPrice(i.precioUnitario)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 border-t pt-4">
                                <div className="flex justify-between text-base font-bold text-[#37474F]">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                                    ⚠️ {error}
                                </div>
                            )}

                            <button
                                id="btn-checkout"
                                onClick={handleCheckout}
                                className="mt-6 w-full rounded-xl bg-[#FFA000] py-3 font-bold text-[#212121] shadow-md hover:bg-[#ffb300] hover:-translate-y-0.5 transition-all">
                                Confirmar inscripción →
                            </button>
                            <p className="mt-3 text-center text-xs text-[#455A64]">
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
