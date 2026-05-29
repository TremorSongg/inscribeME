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
            <span key={i} className={`text-sm ${i < count ? "text-[#FFA000]" : "text-gray-200"}`}>★</span>
        ))}
    </div>
);

const Testimonios = () => (
    /* CAMBIO CLAVE: py-16 (el espaciado exterior lo maneja el CSS global), 
       y añadimos w-full + flex justify-center para centrar en ultra-wides */
    <section className="bg-[#F0F4F7] py-16 px-6 w-full flex justify-center">
        {/* CAMBIO CLAVE: w-full asegura el comportamiento correcto del max-w-7xl con el mx-auto */}
        <div className="w-full max-w-7xl mx-auto">
            
            {/* Heading */}
            <div className="mb-14 text-center animate-fadeInUp">
                <p className="section-label mb-3">Lo que dicen nuestros alumnos</p>
                <h2 className="section-title">Historias reales, resultados reales.</h2>
            </div>

            {/* Cards */}
            {/* CAMBIO CLAVE: Cambiamos gap-6 por gap-x-10 y gap-y-6 para dar más separación 
                horizontal a las tres columnas en pantallas anchas */}
            <div className="separador-hero-contenido2 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((t, i) => (
                    <div key={t.name}
                        className="card p-7 animate-fadeInUp flex flex-col justify-between"
                        style={{ animationDelay: `${i * 100}ms` }}>
                        
                        <div>
                            <Stars count={t.stars} />
                            <p className="my-5 text-[#37474F] leading-relaxed text-sm">
                                "{t.quote}"
                            </p>
                        </div>
                        
                        <div className="mt-auto flex items-center gap-3 pt-4 border-t border-gray-100">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.color} text-sm font-black text-white`}>
                                {t.init}
                            </div>
                            <div className="text-left"> {/* Asegura alineación limpia a la izquierda del texto del autor */}
                                <p className="text-sm font-bold text-[#37474F]">{t.name}</p>
                                <p className="text-xs text-[#455A64]">{t.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default Testimonios;