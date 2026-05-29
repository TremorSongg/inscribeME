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
    <section className="bg-white py-16 px-6 w-full flex justify-center">
        <div className="w-full max-w-7xl mx-auto">
            
            {/* Heading — Formateado en sintonía con las demás secciones */}
            <div className="mb-16 text-center animate-fadeInUp flex flex-col items-center">
                {/* Escalamos la etiqueta superior a text-sm e incrementamos el tracking */}
                <p className="section-label mb-4 text-sm tracking-[0.2em]">
                    ¿Por qué elegirnos?
                </p>
                {/* Agrandamos el título a text-4xl y md:text-6xl para igualar el impacto del Hero */}
                <h2 className="text-4xl font-black leading-tight text-[#37474F] md:text-6xl">
                    Todo lo que necesitas<br />
                    <span className="text-gradient">para crecer.</span>
                </h2>
                {/* Subimos a text-lg/md:text-xl y aseguramos el centrado exacto con mx-auto */}
                <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#455A64] max-w-2xl mx-auto">
                    InscribeMe reúne las herramientas, el talento y la comunidad para que alcances tus metas.
                </p>
            </div>

            {/* Cards — Mantienen el espaciado premium y balanceado */}
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((f, i) => (
                    <div key={f.title}
                        className="group card p-8 animate-fadeInUp flex flex-col justify-between"
                        style={{ animationDelay: `${i * 90}ms` }}>
                        
                        <div>
                            {/* El icono del feature */}
                            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#37474F] to-[#455A64] text-2xl shadow-md transition-transform group-hover:scale-110 duration-300">
                                {f.icon}
                            </div>
                            
                            {/* Textos de la tarjeta */}
                            <h3 className="mb-3 text-xl font-bold text-[#37474F]">{f.title}</h3>
                            <p className="text-sm leading-relaxed text-[#455A64]">{f.desc}</p>
                        </div>
                        
                        {/* Línea decorativa animada amarilla al hacer hover */}
                        <div className="mt-6 h-0.5 w-0 bg-[#FFA000] transition-all duration-500 group-hover:w-full rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Destacados;