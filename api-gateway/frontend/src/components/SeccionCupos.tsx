import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cursosService } from "../services/cursosService";
import { usuariosService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

const SeccionCupos = () => {
    const { isAuthenticated } = useAuth();
    const [cursos, setCursos] = useState<number | null>(null);
    const [instructores, setInstructores] = useState<number | null>(null);
    const [alumnos, setAlumnos] = useState<number | null>(null);

    useEffect(() => {
        cursosService.listar()
            .then(r => {
                const activos = (r ?? []).filter((c: any) => !c.eliminado);
                setCursos(activos.length);
                // Alumnos inscritos = suma de cupos ocupados (no requiere auth)
                const totalInscritos = activos.reduce(
                    (acc: number, c: any) => acc + Math.max(0, (c.cupoTotal ?? 0) - (c.cupoDisponible ?? 0)),
                    0
                );
                setAlumnos(totalInscritos);
            })
            .catch(() => { setCursos(null); setAlumnos(null); });

        usuariosService.listarInstructores()
            .then(r => setInstructores((r ?? []).length))
            .catch(() => setInstructores(null));
    }, []);


    const fmt = (n: number | null) => n === null ? "…" : String(n);

    const stats = [
        { label: "Cursos activos",    value: fmt(cursos) },
        { label: "Instructores",      value: fmt(instructores) },
        { label: "Alumnos inscritos", value: fmt(alumnos) },
    ];

    return (
        <section
            className="relative overflow-hidden rounded-[24px] md:rounded-[40px] py-14 sm:py-20 md:py-28 lg:py-36 px-4 md:px-6 w-full flex justify-center shadow-2xl font-sans text-white my-6 md:my-10 max-w-7xl mx-auto min-h-[300px]"
            style={{ background: 'linear-gradient(135deg, #00395C 0%, #006397 45%, #0284C7 100%)' }}
        >
            {/* Decorative background shapes */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[40px]">
                <div className="absolute -top-36 -right-24 h-[500px] w-[500px] rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-sky-300/15 blur-3xl" />
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center space-y-8 sm:space-y-10">

                <span className="inline-flex items-center !px-4 !py-2 rounded-full bg-white/15 text-xs font-bold text-sky-200 uppercase tracking-wide mb-8 border border-white/10">
                    Cupos limitados
                </span>

                <h2 className="text-2xl font-extrabold text-white sm:text-4xl lg:text-6xl font-display leading-tight py-2 md:py-3 animate-fadeInUp delay-100">
                    Inscríbete <span className="text-sky-200">hoy mismo.</span>
                </h2>

                <p className="mt-4 text-sm md:text-base leading-relaxed text-sky-100 max-w-2xl mx-auto py-3 animate-fadeInUp delay-200">
                    Los cupos son limitados. Asegura tu lugar en el curso que más te apasione y comienza tu transformación esta semana.
                </p>

                {/* ── Stats row ────────────────────────────────────────── */}
                <div className="mt-14 !py-6 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl mb-12 animate-fadeInUp delay-300">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white/10 border border-white/15 rounded-3xl py-8 px-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-white/15 duration-300">
                            <p className="text-3xl md:text-4xl font-extrabold text-white font-display leading-none">{s.value}</p>
                            <p className="mt-2 text-[10px] md:text-[11px] text-sky-200 font-bold uppercase tracking-wider">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Botones de acción */}
                <div className="mt-10 flex flex-col sm:flex-row !py-6 gap-8 justify-center w-full max-w-md animate-fadeInUp delay-400">
                    <Link to="/cursos" id="cupos-btn-cursos"
                        className="bg-white text-sky-800 font-bold text-center !px-6 py-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
                        Ver cursos disponibles
                    </Link>
                    {!isAuthenticated && (
                        <Link to="/registro" id="cupos-btn-registro"
                            className="bg-transparent border-2 border-white text-white font-bold text-center !px-6 py-5 rounded-full hover:bg-white hover:text-sky-800 transition-all cursor-pointer">
                            Crear cuenta gratis
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SeccionCupos;
