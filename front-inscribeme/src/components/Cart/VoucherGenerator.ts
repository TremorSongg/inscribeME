import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import type { CartCourse } from "../../pages/Cart/Cartpage";

// ─── Datos Institucionales ────────────────────────────────────────────────────
const INSTITUTION = {
  name: "InscribeMe",
  subtitle: "Centro Comunitario de Actividades",
  address: "Av. Ficticia 1234, Santiago, Chile",
  phone: "+56 9 1234 5678",
  email: "contacto@plataforma.cl",
  website: "www.inscribeme.cl",
  cashierHours: "Lunes a Viernes  09:00 – 17:00 hrs",
};

// ─── Paleta de colores ────────────────────────────────────────────────────────
const C = {
  dark: [55, 71, 79] as [number, number, number],     // #37474F
  mid: [69, 90, 100] as [number, number, number],      // #455A64
  amber: [255, 160, 0] as [number, number, number],    // #FFA000
  amberLight: [255, 243, 204] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  light: [250, 250, 250] as [number, number, number],  // #FAFAFA
  border: [220, 225, 228] as [number, number, number],
  text: [33, 33, 33] as [number, number, number],      // #212121
  muted: [120, 135, 143] as [number, number, number],
  success: [46, 125, 50] as [number, number, number],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return `$${price.toLocaleString("es-CL")}`;
}

function generateFolio(): string {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `VCH-${now}-${rand}`;
}

function formatDateTime(date: Date): string {
  return date.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Generador principal ──────────────────────────────────────────────────────
export async function generatePaymentVoucher(
  courses: CartCourse[],
  studentName: string,
  studentEmail: string
): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 18;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const folio = generateFolio();
  const issuedAt = new Date();

  const total = courses.reduce((sum, c) => sum + c.price, 0);

  // ── QR ──────────────────────────────────────────────────────────────────────
  const qrData = JSON.stringify({
    folio,
    institution: INSTITUTION.name,
    student: studentName,
    email: studentEmail,
    courses: courses.map((c) => c.title),
    total: formatPrice(total),
    issuedAt: formatDateTime(issuedAt),
  });

  const qrDataUrl: string = await QRCode.toDataURL(qrData, {
    width: 200,
    margin: 1,
    color: { dark: "#37474F", light: "#FFFFFF" },
  });

  // ── FONDO DE PÁGINA ──────────────────────────────────────────────────────────
  doc.setFillColor(...C.light);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // ── BANDA SUPERIOR (header) ──────────────────────────────────────────────────
  const HEADER_H = 52;
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PAGE_W, HEADER_H, "F");

  // Acento ámbar bajo el header
  doc.setFillColor(...C.amber);
  doc.rect(0, HEADER_H, PAGE_W, 4, "F");

  // Logo placeholder (cuadrado con inicial)
  const LOGO_X = MARGIN;
  const LOGO_Y = 10;
  const LOGO_SIZE = 28;
  doc.setFillColor(...C.amber);
  doc.roundedRect(LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE, 4, 4, "F");
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("I", LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2 + 5, {
    align: "center",
  });

  // Nombre institución
  const TEXT_X = LOGO_X + LOGO_SIZE + 7;
  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(INSTITUTION.name, TEXT_X, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(220, 220, 220);
  doc.text(INSTITUTION.subtitle, TEXT_X, 29);

  // Datos de contacto en header (derecha)
  const RIGHT_X = PAGE_W - MARGIN;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 210, 215);
  doc.text(`✉ ${INSTITUTION.email}`, RIGHT_X, 20, { align: "right" });
  doc.text(`☎ ${INSTITUTION.phone}`, RIGHT_X, 27, { align: "right" });
  doc.text(`⊕ ${INSTITUTION.website}`, RIGHT_X, 34, { align: "right" });
  doc.text(`📍 ${INSTITUTION.address}`, RIGHT_X, 41, { align: "right" });

  // ── TÍTULO DEL DOCUMENTO ──────────────────────────────────────────────────────
  let curY = HEADER_H + 4 + 14; // debajo de la banda ámbar

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.dark);
  doc.text("VOUCHER DE PAGO", MARGIN, curY);

  // Folio a la derecha
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`N° Folio: ${folio}`, PAGE_W - MARGIN, curY - 4, {
    align: "right",
  });
  doc.text(`Emitido: ${formatDateTime(issuedAt)}`, PAGE_W - MARGIN, curY, {
    align: "right",
  });

  curY += 10;

  // ── SECCIÓN DATOS DEL ESTUDIANTE ──────────────────────────────────────────────
  const STUDENT_CARD_H = 28;
  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN, curY, CONTENT_W, STUDENT_CARD_H, 3, 3, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, curY, CONTENT_W, STUDENT_CARD_H, 3, 3, "S");

  // Línea lateral ámbar
  doc.setFillColor(...C.amber);
  doc.roundedRect(MARGIN, curY, 4, STUDENT_CARD_H, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("ESTUDIANTE", MARGIN + 10, curY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.dark);
  doc.text(studentName, MARGIN + 10, curY + 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(studentEmail, MARGIN + 10, curY + 23);

  curY += STUDENT_CARD_H + 10;

  // ── TABLA DE CURSOS ───────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text("DETALLE DE CURSOS INSCRITOS", MARGIN, curY);

  curY += 5;

  // Encabezado de tabla
  const COL = {
    curso: MARGIN,
    instructor: MARGIN + 60,
    inicio: MARGIN + 115,
    termino: MARGIN + 143,
    valor: MARGIN + 170,
  };
  const TABLE_ROW_H = 10;
  const HEADER_ROW_H = 9;

  doc.setFillColor(...C.dark);
  doc.roundedRect(MARGIN, curY, CONTENT_W, HEADER_ROW_H, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.white);
  doc.text("CURSO / ACTIVIDAD", COL.curso + 3, curY + 6);
  doc.text("INSTRUCTOR", COL.instructor, curY + 6);
  doc.text("F. INICIO", COL.inicio, curY + 6);
  doc.text("F. TÉRMINO", COL.termino, curY + 6);
  doc.text("VALOR", COL.valor, curY + 6);

  curY += HEADER_ROW_H;

  // Filas
  courses.forEach((course, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(...(isEven ? C.white : C.light));
    doc.rect(MARGIN, curY, CONTENT_W, TABLE_ROW_H, "F");

    // Borde inferior suave
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, curY + TABLE_ROW_H, MARGIN + CONTENT_W, curY + TABLE_ROW_H);

    const isFree = course.price === 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.text);
    // Truncar título si es muy largo
    const title =
      course.title.length > 30
        ? course.title.slice(0, 28) + "…"
        : course.title;
    doc.text(title, COL.curso + 3, curY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.muted);
    const instructor =
      course.instructor.length > 20
        ? course.instructor.slice(0, 18) + "…"
        : course.instructor;
    doc.text(instructor, COL.instructor, curY + 6.5);
    doc.text(course.startDate ?? "—", COL.inicio, curY + 6.5);
    doc.text(course.endDate ?? "—", COL.termino, curY + 6.5);

    // Precio con color
    if (isFree) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.success);
    } else {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...C.dark);
    }
    doc.setFontSize(8);
    doc.text(formatPrice(course.price), COL.valor, curY + 6.5);

    curY += TABLE_ROW_H;
  });

  // ── TOTAL ─────────────────────────────────────────────────────────────────────
  curY += 2;
  const TOTAL_W = 72;
  const TOTAL_X = PAGE_W - MARGIN - TOTAL_W;
  const TOTAL_H = 16;

  doc.setFillColor(...C.dark);
  doc.roundedRect(TOTAL_X, curY, TOTAL_W, TOTAL_H, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.amber);
  doc.text("TOTAL A PAGAR", TOTAL_X + 6, curY + 6.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.white);
  const totalStr =
    total === 0 ? "GRATIS" : `$${total.toLocaleString("es-CL")}`;
  doc.text(totalStr, TOTAL_X + TOTAL_W - 6, curY + 13, { align: "right" });

  curY += TOTAL_H + 14;

  // ── QR + INSTRUCCIONES (columnas) ─────────────────────────────────────────────
  const QR_SIZE = 42;
  const INFO_X = MARGIN + QR_SIZE + 10;
  const INFO_W = CONTENT_W - QR_SIZE - 10;

  // Card contenedora
  const CARD_H = QR_SIZE + 10;
  doc.setFillColor(...C.white);
  doc.roundedRect(MARGIN, curY, CONTENT_W, CARD_H, 3, 3, "F");
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, curY, CONTENT_W, CARD_H, 3, 3, "S");

  // QR image
  doc.addImage(qrDataUrl, "PNG", MARGIN + 5, curY + 5, QR_SIZE, QR_SIZE);

  // Instrucciones
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.dark);
  doc.text("📋 Instrucciones de Pago en Caja", INFO_X, curY + 12);

  const instructions = [
    "1. Acércate a la caja con este documento impreso.",
    "2. Presenta tu cédula de identidad o nombre completo.",
    "3. El cajero escaneará el código QR para verificar tu voucher.",
    "4. Realiza el pago según el total indicado.",
    "5. Conserva tu comprobante de pago una vez cancelado.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.mid);
  instructions.forEach((line, i) => {
    doc.text(line, INFO_X, curY + 21 + i * 7);
  });

  curY += CARD_H + 8;

  // ── HORARIO DE CAJA ───────────────────────────────────────────────────────────
  doc.setFillColor(...C.amberLight);
  doc.roundedRect(MARGIN, curY, CONTENT_W, 12, 3, 3, "F");
  doc.setDrawColor(255, 193, 7);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, curY, CONTENT_W, 12, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(120, 77, 0);
  doc.text(
    `⏰  Horario de Caja: ${INSTITUTION.cashierHours}`,
    PAGE_W / 2,
    curY + 8,
    { align: "center" }
  );

  curY += 18;

  // ── NOTA LEGAL ────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  const legalNote =
    "Este voucher es válido por 5 días hábiles desde su emisión. Su presentación no garantiza la reserva del cupo " +
    "hasta que el pago haya sido efectuado y registrado. Para consultas, comunícate al " +
    `${INSTITUTION.phone} o escríbenos a ${INSTITUTION.email}.`;
  const noteLines = doc.splitTextToSize(legalNote, CONTENT_W);
  doc.text(noteLines, MARGIN, curY);

  // ── FOOTER DEL PDF ────────────────────────────────────────────────────────────
  const FOOTER_Y = PAGE_H - 14;
  doc.setFillColor(...C.dark);
  doc.rect(0, FOOTER_Y, PAGE_W, 14, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 195, 200);
  doc.text(
    `${INSTITUTION.name} · ${INSTITUTION.address} · ${INSTITUTION.phone}`,
    PAGE_W / 2,
    FOOTER_Y + 6,
    { align: "center" }
  );
  doc.text(
    `Folio: ${folio} · Documento generado el ${formatDateTime(issuedAt)}`,
    PAGE_W / 2,
    FOOTER_Y + 11,
    { align: "center" }
  );

  // ── DESCARGA ──────────────────────────────────────────────────────────────────
  const safeName = studentName.replace(/\s+/g, "_").toLowerCase();
  doc.save(`voucher_${safeName}_${Date.now()}.pdf`);
}
