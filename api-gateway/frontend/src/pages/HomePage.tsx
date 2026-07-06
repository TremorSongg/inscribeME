import { Link } from "react-router-dom";
import SeccionCupos from "../components/SeccionCupos";
import Destacados from "../components/Destacados";
import Testimonios from "../components/Testimonios";

// ── Mini floating stat badge ───────────────────────────────────
const FloatBadge = ({ icon, text, delay }: { icon: string; text: string; delay: string }) => (
    <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 animate-fadeInUp shadow-lg"
        style={{ animationDelay: delay }}>
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-bold text-white">{text}</span>
    </div>
);

const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA] w-full flex flex-col items-center">

            {/* ── HERO ─────────────────────────────────────────── */}
            {/* CAMBIO CLAVE: Reemplazamos 'items-center' por 'items-start pt-16 md:pt-24' 
                para empujar el contenido hacia arriba de forma controlada y natural */}
            <section className="hero-bg min-h-[65vh] flex justify-center items-start pt-16 md:pt-24 relative w-full">
                {/* Decorative circles */}
                <div className="absolute top-16 right-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-24 left-8 h-48 w-48 rounded-full bg-sky-600/10 blur-2xl pointer-events-none" />

                {/* Alivianamos el padding vertical interno reduciendo 'py-24' a 'pb-24 pt-6' */}
                <div className="w-full max-w-7xl px-6 pt-6 pb-24 mx-auto">
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">

                        {/* Left — copy */}
                        <div className="transform translate-y-20">
                            <p className="section-label mb-4 animate-fadeInUp" style={{ animationDelay: "0ms" }}>
                                ✦ Academia Deportiva InscribeMe
                            </p>
                            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl animate-fadeInUp" style={{ animationDelay: "80ms" }}>
                                Transforma tu
                                <span className="block text-gradient mt-1">energía en logros.</span>
                            </h1>
                            <p className="mt-6 text-lg leading-relaxed text-white/65 max-w-lg animate-fadeInUp" style={{ animationDelay: "160ms" }}>
                                Descubre cursos deportivos y culturales diseñados para todos los niveles. Instructores certificados, horarios flexibles y seguimiento personalizado.
                            </p>
                            <div className="mt-10 flex flex-wrap gap-4 animate-fadeInUp" style={{ animationDelay: "240ms" }}>
                                <Link to="/cursos" id="hero-btn-cursos"
                                    className="btn-primary text-base px-8 py-4 rounded-2xl">
                                    Ver cursos disponibles →
                                </Link>
                                <Link to="/nosotros" id="hero-btn-nosotros"
                                    className="btn-ghost text-base px-8 py-4 rounded-2xl">
                                    Conocer más
                                </Link>
                            </div>
                        </div>

                        {/* Right — floating badges */}
                        <div className="hidden lg:flex flex-col gap-4 transform lg:translate-y-22">
                            <FloatBadge icon="📚" text="7 cursos disponibles" delay="300ms" />
                            <FloatBadge icon="🏅" text="Instructores certificados" delay="420ms" />
                            <FloatBadge icon="📅" text="Horarios flexibles" delay="540ms" />
                            <FloatBadge icon="👥" text="+50 alumnos inscritos" delay="660ms" />
                            <FloatBadge icon="🎯" text="Seguimiento personalizado" delay="780ms" />
                        </div>
                    </div>
                </div>

                {/* Wave bottom */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ display: "block" }}>
                        <path d="M0 80L1440 80L1440 30C1200 70 800 0 400 50C200 75 0 30 0 30Z" fill="#FAFAFA" />
                    </svg>
                </div>
            </section>

            {/* ── RESTO DE SECCIONES CORREGIDAS ─────────────────────────── */}
            
            {/* 1. Destacados: Le aplicamos separador-hero-contenido (da aire con el Hero) y espaciado-secciones */}
            <div id="destacados" className="w-full flex justify-center separador-hero-contenido espaciado-secciones">
                <Destacados />
            </div>
            
            {/* 2. Cursos: Sección del medio, solo lleva el espaciado de secciones estándar */}
            <div id="cursos" className="w-full flex justify-center espaciado-secciones py-20 px-6">
                <SeccionCupos />
            </div>
            
            {/* 3. Testimonios: Última sección, lleva el espaciado-secciones y el separador-contenido-footer para empujar el Footer global */}
            <div id="testimonios" className="w-full flex justify-center espaciado-secciones separador-contenido-footer">
                <Testimonios />
            </div>
        </div>
    );
};

export default HomePage;