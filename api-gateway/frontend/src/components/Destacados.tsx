const features = [
    {
        icon: "🏅",
        title: "Instructores certificados",
        desc: "Nuestro equipo docente cuenta con formación profesional y años de experiencia práctica.",
    },
    {
        icon: "📅",
        title: "Horarios flexibles",
        desc: "Elige la frecuencia y modalidad que mejor se adapte a tu agenda y ritmo de vida.",
    },
    {
        icon: "📊",
        title: "Seguimiento personalizado",
        desc: "Registro de asistencia, historial de cursos y retroalimentación continua del instructor.",
    },
    {
        icon: "🎯",
        title: "Cursos para todos",
        desc: "Desde actividades gratuitas hasta talleres especializados para adultos, jóvenes y niños.",
    },
];

const Destacados = () => (
    <section className="bg-white py-29 px-6 w-full flex justify-center border-t border-sky-50 font-sans text-neutral-800">
        <div className="w-full max-w-7xl mx-auto">
            
            {/* Heading */}
            <div className="mb-16 text-center animate-fadeInUp flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-xs font-bold text-sky-600 uppercase tracking-wide mb-4">
                    ✨ ¿Por qué elegirnos?
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl font-display">
                    Todo lo que necesitas para crecer
                </h2>
                <p className="mt-3 text-neutral-700 max-w-xl mx-auto text-sm">
                    InscribeMe reúne las herramientas, el talento y la comunidad para que alcances tus metas.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f, i) => (
                    <article key={f.title}
                        className="group relative rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-[0_2px_16px_rgba(0,99,151,0.06)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,99,151,0.12)] hover:border-sky-300"
                        style={{ animationDelay: `${i * 90}ms` }}>
                        
                        {/* Icon Container */}
                        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white shadow-inner">
                            {f.icon}
                        </div>
                        
                        {/* Text Content */}
                        <h3 className="mb-3 text-lg font-bold text-neutral-900 font-display">
                            {f.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-neutral-700">
                            {f.desc}
                        </p>
                        
                        {/* Decorative Bottom Bar on Hover */}
                        <div className="absolute bottom-0 inset-x-0 h-1 rounded-b-3xl bg-gradient-to-r from-sky-500 to-blue-500 scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export default Destacados;