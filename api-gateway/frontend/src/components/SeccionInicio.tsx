import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const SeccionInicio = () => {
    const { isAuthenticated } = useAuth();

    return (
        <section className="relative overflow-hidden px-6 py-24 md:px-12 lg:px-20 w-full flex flex-col items-center" style={{background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 40%, #F8FAFF 100%)'}}>
            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, #BAE6FD 1px, transparent 1px)', backgroundSize: '30px 30px'}} />

            <div className="relative z-10 w-full max-w-7xl mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
                
                {/* Contenido izquierdo */}
                <div className="flex flex-col items-start animate-fadeInUp">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center p-1 rounded-full border border-sky-200 bg-white mb-6 shadow-sm">
                        <span className="px-3 py-1 text-[11px] font-bold font-figtree text-sky-800 uppercase tracking-wide">
                            🏅 Plataforma de inscripciones
                        </span>
                        <div className="bg-sky-500 inline-flex items-center py-1 px-3 rounded-full gap-1">
                            <span className="text-white font-bold text-[11px] uppercase tracking-wide">
                                Nuevo
                            </span>
                        </div>
                    </div>

                    <h1 className="mb-6 max-w-xl text-4xl font-extrabold leading-tight text-neutral-900 md:text-5xl font-display">
                        InscribeMe: tu portal de inscripciones
                    </h1>

                    <p className="mb-8 max-w-xl text-base leading-relaxed text-neutral-600">
                        Descubre. Aprende. Inscríbete. Una plataforma diseñada para
                        encontrar actividades, talleres y cursos de forma simple, rápida y
                        moderna.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
                        <Link
                            to="/cursos"
                            id="btn-explorar-cursos"
                            className="btn btn-primary text-center px-8 py-4 rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                        >
                            Visita la oferta de cursos
                        </Link>

                        {!isAuthenticated && (
                            <Link
                                to="/registro"
                                id="btn-registrarse-hero"
                                className="btn btn-outline-primary text-center px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                            >
                                Registrarse gratis
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-8 border-t border-sky-200 pt-8 w-full max-w-md">
                        {[
                            { value: "6+", label: "Actividades" },
                            { value: "120+", label: "Inscritos" },
                            { value: "4.9★", label: "Valoración" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-left">
                                <p className="text-3xl font-extrabold text-sky-700 font-display leading-tight">{stat.value}</p>
                                <p className="text-xs font-semibold text-neutral-500 mt-1 uppercase tracking-wide">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Imagen / Ilustración derecha */}
                <div className="relative hidden lg:block">
                    <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
                    <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-blue-400/15 blur-3xl" />

                    <div className="relative grid grid-cols-2 gap-5">
                        {[
                            { icon: "⚽", label: "Fútbol Infantil", slots: "12 cupos" },
                            { icon: "🎵", label: "Zumba Femenino", slots: "18 cupos" },
                            { icon: "⛰️", label: "Escalada Grupal", slots: "8 cupos" },
                            { icon: "🧘", label: "Yoga Inicial", slots: "15 cupos" },
                        ].map((act) => (
                            <div
                                key={act.label}
                                className="group rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,99,151,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,99,151,0.12)] hover:border-sky-300"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-3xl shadow-inner group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                    {act.icon}
                                </div>
                                <p className="text-sm font-bold text-neutral-900 font-display">{act.label}</p>
                                <span className="mt-2 inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-600 border border-sky-100">
                                    {act.slots}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SeccionInicio;
