import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { ItemCarritoDTO } from "../../services/carritoService";
import type { AuthUser } from "../../context/AuthContext";

// ─── Datos Institucionales (coinciden con el Footer) ──────────────────────────
const INSTITUTION = {
  name:         "InscribeMe",
  subtitle:     "Academia Deportiva y Cultural",
  address:      "Av. Deportes 1234, Santiago, Chile",
  phone:        "+56 9 1234 5678",
  email:        "hola@inscribeme.cl",
  website:      "www.inscribeme.cl",
  cashierHours: "Lunes a Viernes  09:00 - 17:00 hrs",
};

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  dark:       [28,  43,  51]  as [number, number, number],
  slate:      [55,  71,  79]  as [number, number, number],
  mid:        [69,  90, 100]  as [number, number, number],
  amber:      [255, 160,   0] as [number, number, number],
  amberLight: [255, 243, 204] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  light:      [250, 250, 250] as [number, number, number],
  border:     [220, 225, 228] as [number, number, number],
  text:       [33,  33,  33]  as [number, number, number],
  muted:      [120, 135, 143] as [number, number, number],
  success:    [46,  125,  50] as [number, number, number],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  return price === 0 ? "Gratis" : `$${price.toLocaleString("es-CL")}`;
}

function generateFolio(): string {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `VCH-${Date.now()}-${rand}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ─── Generador Principal ──────────────────────────────────────────────────────
export async function generatePaymentVoucher(
  items: ItemCarritoDTO[],
  total: number,
  user: AuthUser
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 18;
  const CONT_W = PAGE_W - MARGIN * 2;

  const folio    = generateFolio();
  const issuedAt = new Date();

  // ── QR ──────────────────────────────────────────────────────────────────────
  const qrPayload = JSON.stringify({
    folio,
    institution: INSTITUTION.name,
    student: user.username,
    email: user.email,
    courses: items.map(i => i.nombreCurso),
    total: formatPrice(total),
    issuedAt: formatDateTime(issuedAt),
  });

  const qrDataUrl: string = await QRCode.toDataURL(qrPayload, {
    width: 220,
    margin: 1,
    color: { dark: "#1C2B33", light: "#FFFFFF" },
  });

  // ── FONDO ────────────────────────────────────────────────────────────────────
  doc.setFillColor(...C.light);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── HEADER ───────────────────────────────────────────────────────────────────
  const HDR_H = 54;
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PAGE_W, HDR_H, "F");

  // Banda ambar decorativa
  doc.setFillColor(...C.amber);
  doc.rect(0, HDR_H, PAGE_W, 4, "F");

  // Logo cuadrado
  const LX = MARGIN, LY = 11, LS = 28;
  doc.setFillColor(...C.amber);
  doc.roundedRect(LX, LY, LS, LS, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...C.dark);
  doc.text("I", LX + LS / 2, LY + LS / 2 + 5.5, { align: "center" });

  // Nombre y subtitulo
  const TX = LX + LS + 7;
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.text(INSTITUTION.name, TX, 23);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(180, 200, 210);
  doc.text(INSTITUTION.subtitle, TX, 30);

  // Contacto (derecha del header) — solo texto ASCII
  const RX = PAGE_W - MARGIN;
  doc.setFontSize(8.5);
  doc.setTextColor(160, 185, 200);
  doc.text(`Email:  ${INSTITUTION.email}`,   RX, 18, { align: "right" });
  doc.text(`Tel:    ${INSTITUTION.phone}`,    RX, 25, { align: "right" });
  doc.text(`Web:    ${INSTITUTION.website}`,  RX, 32, { align: "right" });
  doc.text(`Dir:    ${INSTITUTION.address}`,  RX, 39, { align: "right" });

  // ── TITULO + FOLIO ────────────────────────────────────────────────────────────
  let Y = HDR_H + 4 + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.slate);
  doc.text("VOUCHER DE PAGO", MARGIN, Y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`N. Folio: ${folio}`,                PAGE_W - MARGIN, Y - 4, { align: "right" });
  doc.text(`Emitido: ${formatDateTime(issuedAt)}`, PAGE_W - MARGIN, Y,   { align: "right" });

  Y += 10;

  // ── CARD ESTUDIANTE ───────────────────────────────────────────────────────────
  const STU_H = 28;
  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN, Y, CONT_W, STU_H, 3, 3, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, Y, CONT_W, STU_H, 3, 3, "S");

  // Acento ambar lateral
  doc.setFillColor(...C.amber);
  doc.roundedRect(MARGIN, Y, 4, STU_H, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text("ESTUDIANTE", MARGIN + 10, Y + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.slate);
  doc.text(user.username, MARGIN + 10, Y + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(user.email, MARGIN + 10, Y + 23);

  Y += STU_H + 10;

  // ── TABLA DE CURSOS ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.slate);
  doc.text("DETALLE DE CURSOS INSCRITOS", MARGIN, Y);
  Y += 5;

  const COL = {
    curso:    MARGIN,
    cantidad: MARGIN + 100,
    unitario: MARGIN + 120,
    subtotal: MARGIN + 153,
  };
  const ROW_H = 10;
  const HDR_R = 9;

  // Encabezado tabla
  doc.setFillColor(...C.dark);
  doc.roundedRect(MARGIN, Y, CONT_W, HDR_R, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("CURSO / ACTIVIDAD", COL.curso    + 3, Y + 6);
  doc.text("CANT.",             COL.cantidad,     Y + 6);
  doc.text("P. UNITARIO",       COL.unitario,     Y + 6);
  doc.text("SUBTOTAL",          COL.subtotal,     Y + 6);
  Y += HDR_R;

  // Filas
  items.forEach((item, idx) => {
    doc.setFillColor(...(idx % 2 === 0 ? C.white : C.light));
    doc.rect(MARGIN, Y, CONT_W, ROW_H, "F");

    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, Y + ROW_H, MARGIN + CONT_W, Y + ROW_H);

    const title = item.nombreCurso.length > 38
      ? item.nombreCurso.slice(0, 36) + "..."
      : item.nombreCurso;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.text);
    doc.text(title, COL.curso + 3, Y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    doc.text(String(item.cantidad),            COL.cantidad, Y + 6.5);
    doc.text(formatPrice(item.precioUnitario), COL.unitario, Y + 6.5);

    const isFree = item.subtotal === 0;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...(isFree ? C.success : C.slate));
    doc.text(formatPrice(item.subtotal), COL.subtotal, Y + 6.5);

    Y += ROW_H;
  });

  // ── TOTAL ─────────────────────────────────────────────────────────────────────
  Y += 3;
  const TOT_W = 72;
  const TOT_X = PAGE_W - MARGIN - TOT_W;

  doc.setFillColor(...C.dark);
  doc.roundedRect(TOT_X, Y, TOT_W, 16, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.amber);
  doc.text("TOTAL A PAGAR", TOT_X + 6, Y + 6.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  const totalStr = total === 0 ? "GRATIS" : `$${total.toLocaleString("es-CL")}`;
  doc.text(totalStr, TOT_X + TOT_W - 6, Y + 13, { align: "right" });

  Y += 22;

  // ── QR + INSTRUCCIONES ────────────────────────────────────────────────────────
  const QR_SIZE = 44;
  const CARD_H  = QR_SIZE + 12;
  const INFO_X  = MARGIN + QR_SIZE + 12;

  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN, Y, CONT_W, CARD_H, 3, 3, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, Y, CONT_W, CARD_H, 3, 3, "S");

  // QR
  doc.addImage(qrDataUrl, "PNG", MARGIN + 5, Y + 6, QR_SIZE, QR_SIZE);

  // Instrucciones — sin emojis
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.slate);
  doc.text("Instrucciones de Pago en Caja", INFO_X, Y + 13);

  const steps = [
    "1. Acercate a la caja con este documento impreso o en pantalla.",
    "2. Presenta tu cedula de identidad o indica tu nombre completo.",
    "3. El cajero escaneara el QR para verificar y registrar tu voucher.",
    "4. Realiza el pago por el monto total indicado arriba.",
    "5. Solicita y conserva tu comprobante de pago oficial.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.mid);
  steps.forEach((s, i) => doc.text(s, INFO_X, Y + 22 + i * 7.2));

  Y += CARD_H + 8;

  // ── HORARIO DE CAJA ───────────────────────────────────────────────────────────
  doc.setFillColor(...C.amberLight);
  doc.roundedRect(MARGIN, Y, CONT_W, 12, 3, 3, "F");
  doc.setDrawColor(255, 193, 7);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, Y, CONT_W, 12, 3, 3, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 77, 0);
  doc.text(
    `Horario de Caja: ${INSTITUTION.cashierHours}`,
    PAGE_W / 2, Y + 8, { align: "center" }
  );

  Y += 18;

  // ── NOTA LEGAL ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  const legal =
    `Este voucher tiene validez de 5 dias habiles desde su emision (${formatDateTime(issuedAt)}). ` +
    `Su presentacion no garantiza cupo hasta que el pago sea efectuado y registrado. ` +
    `Para consultas: ${INSTITUTION.phone} - ${INSTITUTION.email}.`;
  doc.text(doc.splitTextToSize(legal, CONT_W), MARGIN, Y);

  // ── FOOTER PDF ────────────────────────────────────────────────────────────────
  const FY = PAGE_H - 14;
  doc.setFillColor(...C.dark);
  doc.rect(0, FY, PAGE_W, 14, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 170, 185);
  doc.text(
    `${INSTITUTION.name}  |  ${INSTITUTION.address}  |  ${INSTITUTION.phone}`,
    PAGE_W / 2, FY + 6, { align: "center" }
  );
  doc.text(
    `Folio: ${folio}  |  Generado el ${formatDateTime(issuedAt)}`,
    PAGE_W / 2, FY + 11, { align: "center" }
  );

  // ── DESCARGA ──────────────────────────────────────────────────────────────────
  const safeName = user.username.replace(/\s+/g, "_").toLowerCase();
  doc.save(`voucher_${safeName}_${Date.now()}.pdf`);
}
