import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SeccionInicio = () => {
    const { isAuthenticated } = useAuth();

    return (
        <section className="w-full bg-[#FAFAFA] px-6 py-16 text-[#212121] md:px-12 lg:px-20">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                {/* Contenido izquierdo */}
                <div className="flex flex-col items-start animate-fadeInUp">
                    <span className="mb-4 rounded-full bg-[#FFA000]/15 px-4 py-2 text-sm font-semibold text-[#37474F]">
                        🏅 Plataforma de inscripciones
                    </span>

                    <h1 className="mb-6 max-w-xl text-4xl font-extrabold leading-tight text-[#37474F] md:text-5xl">
                        InscribeMe: tu plataforma de inscripciones
                    </h1>

                    <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#455A64]">
                        Descubre. Aprende. Inscríbete. Una plataforma diseñada para
                        encontrar actividades, talleres y cursos de forma simple, rápida y
                        moderna.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <Link
                            to="/cursos"
                            id="btn-explorar-cursos"
                            className="rounded-xl bg-[#FFA000] px-7 py-3 text-base font-semibold text-[#212121] shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#ffb300] hover:shadow-lg"
                        >
                            Visita la oferta de cursos
                        </Link>

                        {!isAuthenticated && (
                            <Link
                                to="/registro"
                                id="btn-registrarse-hero"
                                className="rounded-xl border border-[#37474F] px-7 py-3 text-base font-semibold text-[#37474F] transition-all duration-300 hover:bg-[#37474F] hover:text-[#FAFAFA]"
                            >
                                Registrarse gratis
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[
                            { value: "6+", label: "Actividades" },
                            { value: "120+", label: "Inscritos" },
                            { value: "4.9★", label: "Valoración" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-2xl font-black text-[#37474F]">{stat.value}</p>
                                <p className="text-xs font-medium text-[#455A64]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Imagen / Ilustración derecha */}
                <div className="relative hidden lg:block">
                    <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-[#FFA000]/20 blur-3xl" />
                    <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-[#455A64]/20 blur-3xl" />

                    <div className="relative grid grid-cols-2 gap-4">
                        {[
                            { icon: "⚽", label: "Fútbol Infantil", slots: "12 cupos" },
                            { icon: "🎵", label: "Zumba Femenino", slots: "18 cupos" },
                            { icon: "⛰️", label: "Escalada Grupal", slots: "8 cupos" },
                            { icon: "🧘", label: "Yoga Inicial", slots: "15 cupos" },
                        ].map((act) => (
                            <div
                                key={act.label}
                                className="rounded-2xl border border-[#455A64]/10 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="mb-3 text-3xl">{act.icon}</div>
                                <p className="text-sm font-bold text-[#37474F]">{act.label}</p>
                                <p className="text-xs text-[#FFA000] font-semibold">{act.slots}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SeccionInicio;
