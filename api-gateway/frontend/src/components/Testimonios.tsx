const testimonials = [
    {
        name: "Valentina C.",
        role: "Estudiante · Zumba Femenino",
        quote: "Las clases de Zumba cambiaron mi rutina. María es una instructora increíble, cada sesión es energética y motivadora.",
        stars: 5,
        init: "V",
        color: "bg-pink-500",
    },
    {
        name: "Juan R.",
        role: "Estudiante · Fútbol Infantil",
        quote: "Mis hijos adoran las clases de fútbol. El ambiente es súper positivo y los instructores se preocupan de verdad por el avance de cada uno.",
        stars: 5,
        init: "J",
        color: "bg-blue-500",
    },
    {
        name: "Pedro S.",
        role: "Estudiante · Escalada Grupal",
        quote: "Nunca pensé que la escalada sería para mí. El grupo es genial, la instructora paciente y el progreso se nota sesión a sesión.",
        stars: 5,
        init: "P",
        color: "bg-emerald-500",
    },
];

const Stars = ({ count }: { count: number }) => (
    <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-base ${i < count ? "text-primary-500" : "text-neutral-200"}`}>★</span>
        ))}
    </div>
);

const Testimonios = () => (
    <section className="bg-neutral-50 py-20 px-6 w-full flex justify-center border-t border-neutral-100 font-sans text-neutral-800">
        <div className="w-full max-w-7xl mx-auto">
            
            {/* Heading */}
            <div className="mb-14 text-center animate-fadeInUp flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide mb-3">
                    💬 Testimonios
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl font-display">
                    Lo que dicen nuestros alumnos
                </h2>
                <p className="mt-3 text-neutral-700 max-w-xl mx-auto text-sm">
                    Historias reales, resultados reales. Descubre cómo impacta InscribeMe en nuestra comunidad.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t, i) => (
                    <article key={t.name}
                        className="group relative rounded-3xl border border-neutral-200 bg-white p-7 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)] hover:border-primary-500/20 flex flex-col justify-between"
                        style={{ animationDelay: `${i * 100}ms` }}>
                        
                        <div>
                            <Stars count={t.stars} />
                            <div className="relative mt-4">
                                <span className="absolute -top-3 -left-2 text-3xl text-primary-200/50 select-none font-serif">“</span>
                                <p className="text-sm leading-relaxed text-neutral-700 pl-4 italic">
                                    {t.quote}
                                </p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-3 pt-4 border-t border-neutral-100">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.color} text-xs font-bold text-white border border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                                {t.init}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-neutral-900 font-display">{t.name}</p>
                                <p className="text-xs text-neutral-600">{t.role}</p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

export default Testimonios;