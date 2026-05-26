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

    const NotifCard = ({ n }: { n: NotificacionDTO }) => (
        <div className={`rounded-2xl border p-4 transition-all ${!n.leido ? "border-[#FFA000]/40 bg-[#FFF8E1] shadow-sm" : "border-[#455A64]/10 bg-white"}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {!n.leido && <span className="h-2 w-2 rounded-full bg-[#FFA000] inline-block" />}
                        <p className="text-sm font-semibold text-[#37474F]">
                            Para: <span className="font-bold">{getUserName(n.usuarioId)}</span>
                        </p>
                    </div>
                    <p className="text-sm text-[#212121] ml-4">{n.mensaje}</p>
                    {n.fechaCreacion && (
                        <p className="mt-1 ml-4 text-xs text-[#455A64]/70">
                            {new Date(n.fechaCreacion).toLocaleString("es-CL")}
                        </p>
                    )}
                </div>
                {!n.leido && (
                    <button
                        onClick={() => markRead(n)}
                        className="shrink-0 rounded-lg bg-white border border-[#455A64]/20 px-3 py-1 text-xs font-semibold text-[#455A64] hover:bg-[#ECEFF1] transition"
                    >
                        Marcar leído
                    </button>
                )}
            </div>
        </div>
    );

    if (!user) return null;

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#FAFAFA] px-6 py-10 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">Administración</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#37474F]">
                            Notificaciones
                            {unread > 0 && (
                                <span className="ml-3 rounded-full bg-red-500 px-3 py-0.5 text-sm font-black text-white align-middle">{unread}</span>
                            )}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        {unread > 0 && (
                            <button id="btn-mark-all-read" onClick={markAllRead} className="rounded-xl border border-[#455A64] px-4 py-2 text-sm font-semibold text-[#455A64] hover:bg-[#ECEFF1] transition">
                                Marcar todas leídas
                            </button>
                        )}
                        <button id="btn-send-notif" onClick={() => setShowSendForm(!showSendForm)} className="rounded-xl bg-[#FFA000] px-4 py-2 text-sm font-bold text-[#212121] hover:bg-[#ffb300] transition">
                            {showSendForm ? "Cancelar" : "+ Enviar Notificación"}
                        </button>
                    </div>
                </div>

                {sendSuccess && (
                    <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm text-green-700 animate-fadeIn">
                        ✅ Notificación enviada correctamente.
                    </div>
                )}

                {/* Formulario de envío */}
                {showSendForm && (
                    <div className="mb-6 rounded-2xl bg-white p-6 shadow-md border border-[#455A64]/10 animate-fadeIn">
                        <h2 className="mb-4 text-lg font-bold text-[#37474F]">Enviar Notificación</h2>
                        <div className="mb-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-[#455A64]">Destinatario</label>
                                <select id="send-notif-target" value={sendForm.target} onChange={(e) => setSendForm({ ...sendForm, target: e.target.value as SendForm["target"], userId: "" })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30">
                                    <option value="all">Todos los usuarios</option>
                                    <option value="user">Usuario específico</option>
                                </select>
                            </div>
                            {sendForm.target === "user" && (
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-[#455A64]">Usuario</label>
                                    <select id="send-notif-user" value={sendForm.userId} onChange={(e) => setSendForm({ ...sendForm, userId: e.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30">
                                        <option value="">Seleccionar</option>
                                        {users.map((u) => <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="mb-1 block text-xs font-bold text-[#455A64]">Mensaje</label>
                            <textarea id="send-notif-message" rows={4} value={sendForm.message} onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })} placeholder="Escribe tu mensaje..." className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30 transition" />
                        </div>
                        <button id="btn-confirm-send-notif" onClick={handleSend} disabled={!sendForm.message.trim() || sending || (sendForm.target === "user" && !sendForm.userId)} className="rounded-xl bg-[#FFA000] px-6 py-2.5 font-bold text-[#212121] hover:bg-[#ffb300] transition disabled:opacity-50">
                            {sending ? "Enviando…" : "Enviar"}
                        </button>
                    </div>
                )}

                {/* Lista de notificaciones */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-200" />)}
                    </div>
                ) : notifs.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="font-bold text-[#37474F]">Sin notificaciones aún.</p>
                        <p className="mt-1 text-sm text-[#455A64]">Usa el botón de arriba para enviar una.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#455A64] mb-2">
                            {notifs.length} notificaciones · {unread} sin leer
                        </p>
                        {notifs.map((n) => <NotifCard key={n.id} n={n} />)}
                    </div>
                )}
            </section>
        </main>
    );
};

export default AdminNotificationsPage;
