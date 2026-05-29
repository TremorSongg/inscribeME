import { Link } from "react-router-dom";

const SeccionCupos = () => (
    /* CAMBIO CLAVE: Ajustamos py-20 (el aire exterior lo maneja el CSS global) 
       y añadimos flex justify-center w-full para centrarlo en Ultra-Wides */
    <section className="relative overflow-hidden py-10 px-6 w-full flex justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#263238] via-[#37474F] to-[#455A64]" />
        <div className="absolute inset-0 pointer-events-none">
            {/* Agrandamos los círculos blur de fondo para monitores gigantes */}
            <div className="absolute -top-36 -right-24 h-[500px] w-[500px] rounded-full bg-[#FFA000]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* CAMBIO CLAVE: Cambiamos max-w-4xl por max-w-7xl y w-full para estirar la sección en armonía con el resto */}
        <div className="relative w-full max-w-7xl mx-auto text-center flex flex-col items-center">
            
            <p className="section-label mb-5 animate-fadeInUp">Cupos limitados</p>
            
            
            {/* Escalamos tipografía para pantallas grandes */}
            <h2 className="text-5xl font-black text-white sm:text-6xl lg:text-7xl animate-fadeInUp delay-100 leading-tight">
                Inscríbete <span className="text-gradient">hoy mismo.</span>
            </h2>
            
            <p className="mt-6 text-lg md:text-xl leading-relaxed text-white/70 max-w-3xl mx-auto animate-fadeInUp delay-200">
                Los cupos son limitados. Asegura tu lugar en el curso que más te apasione y comienza tu transformación esta semana.
            </p>

            {/* ── Stats row ────────────────────────────────────────── */}
            {/* CAMBIO CLAVE: max-w-4xl para la fila de stats asegura que no se dispersen al infinito, 
                pero gap-x-8 y py-6 les da mucho más aire interno para que no estén amontonadas */}
            <div className="separador-stats-botones separador-hero-contenido2 mt-14 grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-6 w-full max-w-4xl mb-24 animate-fadeInUp delay-300">
                {[
                    { label: "Cursos activos", value: "7" },
                    { label: "Instructores", value: "3" },
                    { label: "Alumnos inscritos", value: "50+" },
                ].map(s => (
                    /* Aumentamos py y px para hacer las tarjetas más robustas e imponentes */
                    <div key={s.label} className="glass rounded-2xl py-6 px-6 transition-transform hover:scale-105 duration-300">
                        <p className="text-4xl md:text-5xl font-black text-[#FFA000] tracking-tight">{s.value}</p>
                        <p className="mt-2 text-xs md:text-sm text-white/60 font-bold uppercase tracking-wider">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Botones de acción */}
            <div className="separador-contenido-footer2 mt-14 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 w-full max-w-4xl mb-24 animate-fadeInUp delay-400">
                <Link to="/cursos" id="cupos-btn-cursos"
                    className="btn-primary text-base px-10 py-4 rounded-2x1 shadow-xl shadow-[#FFA000]/20">
                    Ver cursos disponibles →
                </Link>
                <Link to="/registro" id="cupos-btn-registro"
                    className="btn-ghost text-base px-10 py-4 rounded-2xl">
                    Crear cuenta gratis
                </Link>
            </div>
        </div>
    </section>
);

export default SeccionCupos;