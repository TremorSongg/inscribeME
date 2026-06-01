import { Link } from "react-router-dom";

const UnauthenticatedMessage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-[#FFA000]/30 bg-white p-10 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFA000]/10 text-4xl">
          🔐
        </div>

        <h1 className="text-3xl font-bold text-[#37474F]">
          Inicia sesión para continuar
        </h1>

        <p className="mt-4 text-[#455A64]">
          Para ver y gestionar tu carrito de cursos necesitas estar autenticado
          en tu cuenta.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/login"
            className="w-full rounded-xl bg-[#37474F] px-8 py-3 font-bold text-white shadow-md transition hover:bg-[#455A64] hover:shadow-lg sm:w-auto"
          >
            Iniciar sesión
          </Link>

          <Link
            to="/cursos"
            className="w-full rounded-xl border border-[#455A64]/30 px-8 py-3 font-semibold text-[#37474F] transition hover:border-[#FFA000] hover:text-[#FFA000] sm:w-auto"
          >
            Ver cursos
          </Link>
        </div>
      </section>
    </main>
  );
};

export default UnauthenticatedMessage;
