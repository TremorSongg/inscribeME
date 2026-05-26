import { Link } from "react-router-dom";
import SeccionCupos from "../components/SeccionCupos";
import Destacados from "../components/Destacados";
import Testimonios from "../components/Testimonios";
import Footer from "../components/Footer";

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
        <div className="min-h-screen bg-[#FAFAFA]">

            {/* ── HERO ─────────────────────────────────────────── */}
            <section className="hero-bg min-h-[92vh] flex items-center relative">
                {/* Decorative circles */}
                <div className="absolute top-16 right-12 h-64 w-64 rounded-full bg-[#FFA000]/6 blur-3xl pointer-events-none" />
                <div className="absolute bottom-24 left-8 h-48 w-48 rounded-full bg-[#455A64]/20 blur-2xl pointer-events-none" />

                <div className="mx-auto w-full max-w-7xl px-6 py-24">
                    <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">

                        {/* Left — copy */}
                        <div>
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
                        <div className="hidden lg:flex flex-col gap-4">
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

            {/* ── RESTO DE SECCIONES ─────────────────────────── */}
            <div id="destacados"><Destacados /></div>
            <div id="cursos"><SeccionCupos /></div>
            <div id="testimonios"><Testimonios /></div>
            <Footer />
        </div>
    );
};

export default HomePage;
