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
    <section className="bg-white py-24 px-6">
        <div className="mx-auto max-w-7xl">
            {/* Heading */}
            <div className="mb-14 text-center animate-fadeInUp">
                <p className="section-label mb-3">¿Por qué elegirnos?</p>
                <h2 className="section-title">Todo lo que necesitas<br />para crecer.</h2>
                <p className="mt-4 text-[#455A64] max-w-lg mx-auto text-lg">
                    InscribeMe reúne las herramientas, el talento y la comunidad para que alcances tus metas.
                </p>
            </div>

            {/* Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f, i) => (
                    <div key={f.title}
                        className="group card p-7 animate-fadeInUp"
                        style={{ animationDelay: `${i * 90}ms` }}>
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#37474F] to-[#455A64] text-2xl shadow-md transition-transform group-hover:scale-110 duration-300">
                            {f.icon}
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-[#37474F]">{f.title}</h3>
                        <p className="text-sm leading-relaxed text-[#455A64]">{f.desc}</p>
                        <div className="mt-5 h-0.5 w-0 bg-[#FFA000] transition-all duration-500 group-hover:w-full rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Destacados;
