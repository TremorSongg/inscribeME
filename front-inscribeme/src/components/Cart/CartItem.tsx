import type { CartCourse } from "../../pages/Cart/Cartpage";

type Props = {
  course: CartCourse;
  onRemove: (id: number) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Deporte: "bg-blue-100 text-blue-700",
  Fitness: "bg-pink-100 text-pink-700",
  Aventura: "bg-green-100 text-green-700",
  Bienestar: "bg-purple-100 text-purple-700",
  Arte: "bg-orange-100 text-orange-700",
};

const CartItem = ({ course, onRemove }: Props) => {
  const categoryStyle =
    CATEGORY_COLORS[course.category] ?? "bg-gray-100 text-gray-600";

  const priceDisplay =
    course.price === 0
      ? "Gratis"
      : `$${course.price.toLocaleString("es-CL")}`;

  return (
    <article className="group flex items-start gap-5 rounded-2xl border border-[#455A64]/10 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Ícono / inicial */}
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#37474F] text-3xl">
        {course.icon ?? "📚"}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-[#37474F]">{course.title}</h3>

          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${categoryStyle}`}
          >
            {course.category}
          </span>
        </div>

        <p className="text-sm text-[#455A64]">
          <span className="font-medium">Instructor:</span> {course.instructor}
        </p>

        <div className="mt-1 flex flex-wrap gap-4 text-sm text-[#455A64]">
          <span>
            <span className="font-medium">Inicio:</span>{" "}
            {course.startDate ?? "—"}
          </span>
          <span>
            <span className="font-medium">Término:</span>{" "}
            {course.endDate ?? "—"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <span className="text-lg font-bold text-[#212121]">{priceDisplay}</span>

        <button
          type="button"
          onClick={() => onRemove(course.id)}
          aria-label={`Eliminar ${course.title} del carrito`}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:border-red-400 hover:text-red-700 active:scale-95"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};

export default CartItem;
