import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { ItemCarritoDTO } from "../../services/carritoService";
import type { AuthUser } from "../../context/AuthContext";
import { generatePaymentVoucher } from "./VoucherGenerator";

type Props = {
  items: ItemCarritoDTO[];
  total: number;
  user: AuthUser;
};

const VoucherPanel = ({ items, total, user }: Props) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const [ready, setReady]           = useState(false);
  const [generating, setGenerating] = useState(false);

  // Renderiza el QR en el canvas cada vez que cambia el carrito
  useEffect(() => {
    if (!canvasRef.current || items.length === 0) { setReady(false); return; }

    const payload = JSON.stringify({
      student: user.username,
      courses: items.map(i => i.nombreCurso),
      total: total === 0 ? "Gratis" : `$${total.toLocaleString("es-CL")}`,
    });

    QRCode.toCanvas(canvasRef.current, payload, {
      width: 148,
      margin: 1,
      color: { dark: "#1C2B33", light: "#FFFFFF" },
    })
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [items, total, user.username]);

  const handleDownload = async () => {
    if (generating || items.length === 0) return;
    setGenerating(true);
    try {
      await generatePaymentVoucher(items, total, user);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-6 border-t border-neutral-100 pt-6 space-y-5">

      {/* ── QR Preview ──────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-500 font-display">
          Código QR del Voucher
        </p>

        <div className="flex h-[160px] w-[160px] items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-inner">
          {items.length > 0 ? (
            <canvas
              ref={canvasRef}
              className="rounded-xl"
              aria-label="Código QR del voucher de pago"
            />
          ) : (
            <span className="text-4xl opacity-30">🛒</span>
          )}
        </div>

        {ready && (
          <p className="text-center text-[11px] font-medium leading-relaxed text-neutral-400">
            El cajero escaneará este código para verificar tu voucher.
          </p>
        )}
      </div>

      {/* ── Botón Descarga ───────────────────────────────────────── */}
      <button
        type="button"
        id="btn-download-voucher"
        onClick={handleDownload}
        disabled={generating || items.length === 0}
        aria-label="Descargar voucher de pago en PDF"
        className={`
          w-full flex items-center justify-center gap-2.5
          btn py-3.5 font-bold transition-all duration-200
          ${items.length === 0
            ? "cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-200"
            : generating
            ? "cursor-wait bg-neutral-800 text-white border-neutral-800"
            : "btn-primary shadow-sm"
          }
        `}
      >
        {generating ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generando PDF…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Descargar Voucher PDF
          </>
        )}
      </button>

      {/* ── Aviso validez ────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="rounded-[24px] border border-orange-200 bg-orange-50/50 p-4 text-left">
          <p className="text-xs font-bold text-orange-800 flex items-center gap-1">
            <span className="text-sm">⚠️</span> Importante
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-orange-700">
            El voucher es válido por <strong>5 días hábiles</strong>. Preséntalo
            impreso o en pantalla en horario de caja.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoucherPanel;
