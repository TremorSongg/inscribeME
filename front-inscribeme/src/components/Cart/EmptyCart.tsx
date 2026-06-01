import { Link } from "react-router-dom";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#455A64]/30 bg-white px-8 py-20 text-center shadow-sm">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#FFA000]/10 text-5xl">
        🛒
      </div>

      <h2 className="text-2xl font-bold text-[#37474F]">
        Tu carrito está vacío
      </h2>

      <p className="mt-3 max-w-sm text-[#455A64]">
        Aún no has agregado ningún curso a tu carrito. Explora nuestro catálogo
        y elige las actividades que más te interesen.
      </p>

      <Link
        to="/cursos"
        className="mt-8 inline-block rounded-xl bg-[#FFA000] px-8 py-3 font-bold text-[#212121] shadow-md transition hover:bg-[#e69500] hover:shadow-lg active:scale-95"
      >
        Ver catálogo de cursos
      </Link>
    </div>
  );
};

export default EmptyCart;
