import Footer from "../components/Footer";

type Product = {
    id: number;
    name: string;
    category: string;
    description: string;
    date: string;
    availableSlots: number;
    price: string;
    icon: string;
};

const products: Product[] = [
    {
        id: 1,
        name: "Fútbol Infantil",
        category: "Deporte",
        description:
            "Actividad deportiva orientada a niños y niñas que buscan aprender fundamentos del fútbol en un ambiente seguro y entretenido.",
        date: "Julio 2025",
        availableSlots: 12,
        price: "Gratis",
        icon: "⚽",
    },
    {
        id: 2,
        name: "Zumba Femenino",
        category: "Fitness",
        description:
            "Clases grupales de zumba para mejorar la condición física mediante baile, música y entrenamiento dinámico.",
        date: "Agosto 2025",
        availableSlots: 18,
        price: "$5.000",
        icon: "🎵",
    },
    {
        id: 3,
        name: "Escalada Grupal",
        category: "Aventura",
        description:
            "Experiencia grupal de escalada guiada para principiantes, enfocada en trabajo en equipo, seguridad y superación personal.",
        date: "Septiembre 2025",
        availableSlots: 8,
        price: "$12.000",
        icon: "⛰️",
    },
    {
        id: 4,
        name: "Taller de Natación",
        category: "Deporte",
        description:
            "Taller práctico para aprender y mejorar técnicas básicas de natación, respiración y seguridad en el agua.",
        date: "Octubre 2025",
        availableSlots: 10,
        price: "$8.000",
        icon: "🏊",
    },
    {
        id: 5,
        name: "Yoga Inicial",
        category: "Bienestar",
        description:
            "Sesiones de yoga para principiantes, enfocadas en respiración, movilidad, equilibrio y relajación.",
        date: "Noviembre 2025",
        availableSlots: 15,
        price: "$6.000",
        icon: "🧘",
    },
    {
        id: 6,
        name: "Taller de Música",
        category: "Arte",
        description:
            "Actividad formativa para desarrollar habilidades musicales básicas mediante instrumentos, ritmo y expresión creativa.",
        date: "Diciembre 2025",
        availableSlots: 20,
        price: "$7.000",
        icon: "🎸",
    },
];

const Products = () => {
    return (
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#212121]">
            <main className="flex-1">
                <section className="bg-[#37474F] px-6 py-20 text-[#FAFAFA] md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#FFA000]">
                                Actividades disponibles
                            </p>

                            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                                Explora nuestras actividades e inscríbete fácilmente.
                            </h1>

                            <p className="text-lg leading-8 text-[#FAFAFA]/90">
                                Encuentra talleres, deportes y actividades recreativas
                                disponibles para inscripción. Revisa los cupos, fechas y detalles
                                antes de participar.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                            <div>
                                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                                    Catálogo
                                </p>

                                <h2 className="text-3xl font-bold text-[#37474F]">
                                    Nuestros productos y actividades
                                </h2>
                            </div>

                            <p className="max-w-xl text-[#455A64]">
                                Selecciona la actividad que más se ajuste a tus intereses y
                                revisa los cupos disponibles.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <article
                                    key={product.id}
                                    className="group flex h-full flex-col rounded-2xl border border-[#455A64]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(33,33,33,0.15)]"
                                >
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFA000]/20 text-3xl">
                                            {product.icon}
                                        </div>

                                        <span className="rounded-full bg-[#37474F] px-3 py-1 text-xs font-semibold text-[#FAFAFA]">
                                            {product.category}
                                        </span>
                                    </div>

                                    <h3 className="mb-3 text-xl font-bold text-[#37474F]">
                                        {product.name}
                                    </h3>

                                    <p className="mb-5 flex-1 leading-7 text-[#455A64]">
                                        {product.description}
                                    </p>

                                    <div className="mb-5 space-y-2 border-t border-[#455A64]/10 pt-5 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="font-medium text-[#455A64]">Fecha</span>
                                            <span className="font-semibold text-[#212121]">
                                                {product.date}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="font-medium text-[#455A64]">Cupos</span>
                                            <span className="font-semibold text-[#212121]">
                                                {product.availableSlots}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="font-medium text-[#455A64]">Valor</span>
                                            <span className="font-semibold text-[#212121]">
                                                {product.price}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="mt-auto rounded-lg bg-[#37474F] px-5 py-3 font-semibold text-[#FAFAFA] transition hover:bg-[#455A64] focus:outline-none focus:ring-2 focus:ring-[#FFA000] focus:ring-offset-2"
                                    >
                                        Ver detalle
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto max-w-5xl rounded-2xl bg-[#FAFAFA] p-8 text-center shadow-[0_8px_24px_rgba(33,33,33,0.10)] md:p-12">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                            InscribeMe
                        </p>

                        <h2 className="mb-5 text-3xl font-bold text-[#37474F]">
                            Encuentra tu próxima actividad.
                        </h2>

                        <p className="mx-auto mb-8 max-w-3xl leading-7 text-[#455A64]">
                            Nuestro objetivo es que puedas revisar, comparar e inscribirte en
                            actividades de forma simple, rápida y ordenada.
                        </p>

                        <button
                            type="button"
                            className="rounded-lg bg-[#FFA000] px-8 py-3 font-bold text-[#212121] transition hover:bg-[#e69500] focus:outline-none focus:ring-2 focus:ring-[#37474F] focus:ring-offset-2"
                        >
                            Explorar actividades
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Products;