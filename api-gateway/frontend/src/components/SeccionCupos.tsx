import { Link } from "react-router-dom";

const SeccionCupos = () => (
    <section className="relative overflow-hidden py-28 px-6">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#263238] via-[#37474F] to-[#455A64]" />
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#FFA000]/8 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-white/4 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
            <p className="section-label mb-5 animate-fadeInUp">Cupos limitados</p>
            <h2 className="text-5xl font-black text-white sm:text-6xl animate-fadeInUp delay-100">
                Inscríbete <span className="text-gradient">hoy mismo.</span>
            </h2>
            <p className="mt-6 text-lg text-white/65 max-w-2xl mx-auto animate-fadeInUp delay-200">
                Los cupos son limitados. Asegura tu lugar en el curso que más te apasione y comienza tu transformación esta semana.
            </p>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-3 gap-4 mb-12 animate-fadeInUp delay-300">
                {[
                    { label: "Cursos activos", value: "7" },
                    { label: "Instructores", value: "3" },
                    { label: "Alumnos inscritos", value: "50+" },
                ].map(s => (
                    <div key={s.label} className="glass rounded-2xl py-4 px-3">
                        <p className="text-3xl font-black text-[#FFA000]">{s.value}</p>
                        <p className="mt-1 text-xs text-white/60 font-semibold">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp delay-400">
                <Link to="/cursos" id="cupos-btn-cursos"
                    className="btn-primary text-base px-10 py-4 rounded-2xl">
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
