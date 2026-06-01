import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import type { CartCourse } from "../../pages/Cart/Cartpage";
import { generatePaymentVoucher } from "./VoucherGenerator";

type Props = {
  cartCourses: CartCourse[];
  studentName: string;
  studentEmail: string;
};

const CartSummary = ({ cartCourses, studentName, studentEmail }: Props) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const total = cartCourses.reduce((sum, c) => sum + c.price, 0);
  const hasPayable = cartCourses.some((c) => c.price > 0);

  // Genera el QR en el canvas cada vez que cambia el carrito
  useEffect(() => {
    if (!qrCanvasRef.current || cartCourses.length === 0) {
      setQrReady(false);
      return;
    }

    const qrContent = JSON.stringify({
      student: studentName,
      courses: cartCourses.map((c) => c.title),
      total: total === 0 ? "Gratis" : `$${total.toLocaleString("es-CL")}`,
    });

    QRCode.toCanvas(qrCanvasRef.current, qrContent, {
      width: 140,
      margin: 1,
      color: { dark: "#37474F", light: "#FFFFFF" },
    })
      .then(() => setQrReady(true))
      .catch(() => setQrReady(false));
  }, [cartCourses, studentName, total]);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      await generatePaymentVoucher(cartCourses, studentName, studentEmail);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalDisplay =
    total === 0 ? "Gratis" : `$${total.toLocaleString("es-CL")}`;

  return (
    <aside className="flex flex-col gap-5">
      {/* ── Resumen de precios ───────────────────────────────────────── */}
      <div className="rounded-2xl border border-[#455A64]/10 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#37474F]">
          Resumen de inscripción
        </h2>

        <ul className="mb-4 space-y-3">
          {cartCourses.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate text-[#455A64]">{c.title}</span>
              <span className="shrink-0 font-semibold text-[#212121]">
                {c.price === 0 ? "Gratis" : `$${c.price.toLocaleString("es-CL")}`}
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[#455A64]/10 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#37474F]">
              Total a pagar
            </span>
            <span className="text-xl font-bold text-[#37474F]">
              {totalDisplay}
            </span>
          </div>

          {hasPayable && (
            <p className="mt-2 text-xs text-[#455A64]">
              * El pago se realiza presencialmente en caja.
            </p>
          )}
        </div>
      </div>

      {/* ── QR Preview ──────────────────────────────────────────────── */}
      <div className="flex flex-col items-center rounded-2xl border border-[#455A64]/10 bg-white p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#FFA000]">
          Código QR del Voucher
        </h3>

        <div className="flex h-[152px] w-[152px] items-center justify-center rounded-xl border border-[#455A64]/10 bg-[#FAFAFA] p-1">
          {cartCourses.length > 0 ? (
            <canvas
              ref={qrCanvasRef}
              className="rounded-lg"
              aria-label="Código QR del voucher de pago"
            />
          ) : (
            <span className="text-4xl">🛒</span>
          )}
        </div>

        {qrReady && (
          <p className="mt-3 text-center text-xs text-[#455A64]">
            El cajero escaneará este código para verificar tu voucher.
          </p>
        )}
      </div>

      {/* ── Botón de descarga ────────────────────────────────────────── */}
      <button
        type="button"
        id="btn-download-voucher"
        onClick={handleDownload}
        disabled={isGenerating || cartCourses.length === 0}
        aria-label="Descargar voucher de pago en PDF"
        className={`
          flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4
          text-base font-bold shadow-lg transition-all duration-200
          ${
            cartCourses.length === 0
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : isGenerating
              ? "cursor-wait bg-[#37474F]/80 text-white"
              : "bg-[#37474F] text-white hover:-translate-y-0.5 hover:bg-[#455A64] hover:shadow-xl active:scale-95"
          }
        `}
      >
        {isGenerating ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generando PDF…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
              />
            </svg>
            Descargar Voucher PDF
          </>
        )}
      </button>

      {/* ── Aviso de validez ─────────────────────────────────────────── */}
      {cartCourses.length > 0 && (
        <div className="rounded-xl border border-[#FFA000]/30 bg-[#FFA000]/5 p-4 text-xs text-[#455A64]">
          <p className="font-semibold text-[#FFA000]">⚠ Importante</p>
          <p className="mt-1">
            El voucher es válido por <strong>5 días hábiles</strong> desde su
            emisión. Preséntalo impreso o en pantalla en horario de caja.
          </p>
        </div>
      )}
    </aside>
  );
};

export default CartSummary;
