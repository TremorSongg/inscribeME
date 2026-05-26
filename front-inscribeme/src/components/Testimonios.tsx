type Testimonio = {
    id: number;
    nombre: string;
    edad: string;
    comentario: string;
    imagen: string;
};

const testimonios: Testimonio[] = [
    {
        id: 1,
        nombre: "Sofía Gálvez",
        edad: "22 años",
        comentario:
            "Gracias a InscribeMe descubrí mi pasión por el baile. La inscripción fue súper rápida y clara.",
        imagen: "/images/estudiante-1.jpg",
    },
    {
        id: 2,
        nombre: "Carlos Rojas",
        edad: "16 años",
        comentario:
            "Nunca pensé que iba a disfrutar tanto del karate. La plataforma es muy intuitiva.",
        imagen: "/images/estudiante-2.jpg",
    },
];

const TestimoniosEstudiantes = () => {
    return (
        <section className="w-full bg-[#FAFAFA] px-6 py-16 text-[#212121] md:px-12 lg:px-20">
            <div className="mx-auto max-w-7xl">
                {/* Título */}
                <div className="mb-12 text-center">
                    <span className="mb-3 inline-block rounded-2xl bg-[#FFA000]/15 px-4 py-3 text-3xl">
                        📚
                    </span>

                    <h2 className="text-3xl font-extrabold tracking-wide text-[#37474F] md:text-4xl">
                        Lo que dicen nuestros estudiantes
                    </h2>

                    <div className="mx-auto mt-4 h-1 w-28 rounded-full bg-[#FFA000]" />
                </div>

                {/* Cards */}
                <div className="grid gap-8 md:grid-cols-2">
                    {testimonios.map((testimonio) => (
                        <article
                            key={testimonio.id}
                            className="rounded-3xl border border-[#455A64]/10 bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                        >
                            <div className="mb-6 flex items-center gap-5">
                                <img
                                    src={testimonio.imagen}
                                    alt={`Foto de ${testimonio.nombre}`}
                                    className="h-20 w-20 rounded-full border-4 border-[#FFA000]/30 object-cover shadow-sm"
                                />

                                <div>
                                    <h3 className="text-xl font-bold text-[#37474F]">
                                        {testimonio.nombre}
                                    </h3>

                                    <p className="text-sm font-medium text-[#455A64]">
                                        {testimonio.edad}
                                    </p>
                                </div>
                            </div>

                            <p className="text-lg leading-relaxed text-[#212121]">
                                “{testimonio.comentario}”
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimoniosEstudiantes;