import { Link } from "react-router-dom";

type AuthUser = {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
};

const ProfilePage = () => {
    const storedUser = localStorage.getItem("authUser");

    const user: AuthUser | null = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-6 py-12">
                <section className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-md">
                    <h1 className="text-3xl font-bold text-red-700">
                        No estás autenticado
                    </h1>

                    <p className="mt-4 text-red-600">
                        Para ver tu perfil necesitas iniciar sesión primero.
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 inline-block rounded-xl bg-[#37474F] px-6 py-3 font-semibold text-white transition hover:bg-[#455A64]"
                    >
                        Ir al login
                    </Link>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] px-6 py-12 text-[#212121]">
            <section className="mx-auto max-w-5xl">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#FFA000]">
                        Mi cuenta
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-[#37474F]">
                        Perfil de usuario
                    </h1>

                    <p className="mt-3 text-[#455A64]">
                        Aquí puedes revisar la información asociada a tu cuenta.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[280px_1fr]">
                    <aside className="rounded-2xl bg-white p-6 text-center shadow-md">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#37474F] text-4xl font-bold text-[#FFA000]">
                            {user.name.charAt(0).toUpperCase()}
                        </div>

                        <h2 className="mt-4 text-2xl font-bold text-[#37474F]">
                            {user.name}
                        </h2>

                        <p className="mt-1 text-sm text-[#455A64]">{user.email}</p>

                        <span className="mt-4 inline-block rounded-full bg-[#FFA000]/20 px-4 py-2 text-sm font-semibold text-[#37474F]">
                            {user.role === "ADMIN" ? "Administrador" : "Usuario"}
                        </span>
                    </aside>

                    <section className="rounded-2xl bg-white p-6 shadow-md">
                        <h3 className="mb-6 text-2xl font-bold text-[#37474F]">
                            Información personal
                        </h3>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-semibold text-[#455A64]">Nombre</p>
                                <p className="mt-1 text-lg font-bold text-[#212121]">
                                    {user.name}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-semibold text-[#455A64]">Correo</p>
                                <p className="mt-1 text-lg font-bold text-[#212121]">
                                    {user.email}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-semibold text-[#455A64]">Rol</p>
                                <p className="mt-1 text-lg font-bold text-[#212121]">
                                    {user.role}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm font-semibold text-[#455A64]">Estado</p>
                                <p className="mt-1 text-lg font-bold text-green-600">
                                    Autenticado
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
};

export default ProfilePage;