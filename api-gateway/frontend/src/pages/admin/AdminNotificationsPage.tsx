import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { notificacionesService, type NotificacionDTO } from "../../services/notificacionesService";
import { usuariosService, type UsuarioBackend } from "../../services/authService";

type SendForm = { target: "all" | "user"; userId: string; message: string };

const AdminNotificationsPage = () => {
    const { user } = useAuth();
    const [notifs, setNotifs] = useState<NotificacionDTO[]>([]);
    const [users, setUsers] = useState<UsuarioBackend[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSendForm, setShowSendForm] = useState(false);
    const [sendForm, setSendForm] = useState<SendForm>({ target: "all", userId: "", message: "" });
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!user) return;
        Promise.all([
            notificacionesService.listarTodas(),
            usuariosService.listarTodos(),
        ]).then(([n, u]) => {
            setNotifs(n);
            setUsers(u.filter((u) => u.rol !== "ADMIN"));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [user]);

    const unread = notifs.filter((n) => !n.leido).length;

    const markRead = async (notif: NotificacionDTO) => {
        try {
            await notificacionesService.marcarLeida(notif.id, { ...notif, leido: true });
            setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, leido: true } : n));
        } catch {
            setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, leido: true } : n));
        }
    };

    const markAllRead = () => {
        notifs.filter((n) => !n.leido).forEach((n) => markRead(n).catch(() => {}));
        setNotifs((prev) => prev.map((n) => ({ ...n, leido: true })));
    };

    const handleSend = async () => {
        if (!sendForm.message.trim()) return;
        setSending(true);
        try {
            const targets = sendForm.target === "all"
                ? users
                : users.filter((u) => u.id === Number(sendForm.userId));

            for (const u of targets) {
                const newNotif = await notificacionesService.crear(u.id, sendForm.message);
                setNotifs((prev) => [newNotif, ...prev]);
            }
            setSendForm({ target: "all", userId: "", message: "" });
            setSendSuccess(true);
            setShowSendForm(false);
            setTimeout(() => setSendSuccess(false), 4000);
        } catch {
            // Silenciar
        } finally {
            setSending(false);
        }
    };

    const getUserName = (usuarioId: number) =>
        users.find((u) => u.id === usuarioId)?.nombre ?? `Usuario #${usuarioId}`;

    {/* ── TARJETA DE NOTIFICACIÓN FORMATEADA ────────────────────────────────── */}
    const NotifCard = ({ n }: { n: NotificacionDTO }) => (
        <div className={`rounded-xl border !px-5 !p-3 !py-2 transition-all duration-300 ${
            !n.leido 
                ? "border-sky-300 bg-sky-50 shadow-md hover:shadow-lg" 
                : "border-neutral-200 bg-white shadow-sm hover:shadow-md"
        }`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                        {!n.leido && <span className="h-2 w-2 rounded-full bg-sky-600 inline-block animate-pulse" />}
                        <p className="text-sm font-bold text-neutral-900">
                            Para: <span className="text-neutral-800">{getUserName(n.usuarioId)}</span>
                        </p>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-700 ml-4">{n.mensaje}</p>
                    {n.fechaCreacion && (
                        <p className="mt-2 ml-4 text-xs font-semibold text-neutral-500">
                            🕒 {new Date(n.fechaCreacion).toLocaleString("es-CL")}
                        </p>
                    )}
                </div>
                {!n.leido && (
                    <button
                        type="button"
                        onClick={() => markRead(n)}
                        className="shrink-0 rounded-2xl bg-sky-200 border border-sky-300 !px-4 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-all cursor-pointer shadow-sm"
                    >
                        Marcar leído
                    </button>
                )}
            </div>
        </div>
    );

    if (!user) return null;

    return (
        /* CAMBIO CLAVE: Ajustamos pt-14 pb-28 y agregamos flex flex-col items-center 
           para inyectar un centrado geométrico impecable en Ultra-Wides */
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 pt-14 pb-28 text-neutral-800 w-full flex flex-col items-center">
            <section className="w-full max-w-5xl mx-auto">
                
                {/* ── HEADER DE LA SECCIÓN ─────────────────────────────────────── */}
                <div className="mb-14 flex flex-wrap items-center justify-between gap-6 animate-fadeInUp">
                    <div className="text-left">
                        {/* Escalamos la etiqueta superior en sintonía con las demás vistas */}
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
                            Administración
                        </p>
                        <h1 className="mt-2 text-5xl font-black text-neutral-900 md:text-6xl tracking-tight flex items-center gap-3">
                            Notificaciones
                            {unread > 0 && (
                                <span className="rounded-full bg-red-500 !px-3 !py-1 text-base font-black text-white shadow-md animate-pulse">
                                    {unread}
                                </span>
                            )}
                        </h1>
                    </div>
                    {/* Botones de acción principales con estilos corregidos */}
                    <div className="flex gap-3">
                        {unread > 0 && (
                            <button 
                                id="btn-mark-all-read" 
                                type="button"
                                onClick={markAllRead} 
                                className="rounded-xl border-2 border-sky-600 !px-5 py-2.5 text-sm font-bold text-sky-600 hover:bg-neutral-50 hover:border-neutral-400 transition-all cursor-pointer shadow-sm"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                        <button 
                            id="btn-send-notif" 
                            type="button"
                            onClick={() => setShowSendForm(!showSendForm)} 
                            className="rounded-xl bg-sky-600 !px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            {showSendForm ? "Cancelar" : "＋ Enviar Notificación"}
                        </button>
                    </div>
                </div>

                {sendSuccess && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm font-semibold text-green-700 animate-fadeIn shadow-sm">
                        ✅ Notificación enviada correctamente al canal.
                    </div>
                )}

                {/* ── FORMULARIO DE ENVÍO PREMIUM ────────────────────────────────── */}
                {showSendForm && (
                    <div className="mb-10 rounded-xl bg-white p-8 shadow-xl border border-neutral-200 animate-fadeIn text-left">
                        <h2 className="mb-5 text-2xl font-black text-neutral-900">Enviar Notificación</h2>
                        <div className="mb-5 grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky-600">Destinatario</label>
                                <select id="send-notif-target" value={sendForm.target} onChange={(e) => setSendForm({ ...sendForm, target: e.target.value as SendForm["target"], userId: "" })} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all">
                                    <option value="all">Todos los usuarios</option>
                                    <option value="user">Usuario específico</option>
                                </select>
                            </div>
                            {sendForm.target === "user" && (
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-neutral-600">Seleccionar Usuario</label>
                                    <select id="send-notif-user" value={sendForm.userId} onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all">
                                        <option value="">Seleccionar</option>
                                        {users.map((u) => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mb-6">
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sky-600">Cuerpo del Mensaje</label>
                            <textarea id="send-notif-message" rows={4} value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} placeholder="Escribe tu mensaje institucional aquí..." className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all" />
                        </div>
                        <button id="btn-confirm-send-notif" type="button" onClick={handleSend} disabled={!sendForm.message.trim() || sending || (sendForm.target === "user" && !sendForm.userId)} className="rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none cursor-pointer">
                            {sending ? "Enviando…" : "Enviar Notificación →"}
                        </button>
                    </div>
                )}

                {/* ── LISTADO DE REGISTROS ────────────────────────────────────────── */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-200" />)}
                    </div>
                ) : notifs.length === 0 ? (
                    <div className="rounded-xl bg-white p-14 text-center shadow-md border border-neutral-200">
                        <p className="text-5xl mb-3">📭</p>
                        <p className="text-xl font-bold text-neutral-900">Sin notificaciones aún.</p>
                        <p className="mt-2 text-sm text-neutral-600">Usa el botón superior para emitir un aviso al canal.</p>
                    </div>
                ) : (
                    <div className="!py-4 space-y-4 text-left">
                        {/* Indicador superior formateado */}
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-800 mb-3">
                            {notifs.length} registros totales · {unread} pendientes
                        </p>
                        <div className="flex flex-col gap-4">
                            {notifs.map((n) => <NotifCard key={n.id} n={n} />)}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminNotificationsPage;