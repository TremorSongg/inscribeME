type Course = {
    id: number;
    title: string;
    description: string;
    icon: string;
};

const courses: Course[] = [
    {
        id: 1,
        title: "Talleres de Arte",
        description: "Para todos los niveles, desde iniciación hasta avanzado.",
        icon: "🎨",
    },
    {
        id: 2,
        title: "Karate Tradicional",
        description: "Fortalece cuerpo y mente, ideal para niños y adultos.",
        icon: "📈",
    },
    {
        id: 3,
        title: "Escalada Indoor",
        description: "Supera tus límites en un entorno seguro y desafiante.",
        icon: "🏆",
    },
];

export default function Destacados() {
    return (
        <section className="w-full bg-[#FAFAFA] px-6 py-16 text-[#212121] md:px-12 lg:px-20">
            <div className="mx-auto max-w-7xl">
                {/* Título */}
                <div className="mb-10 text-center">
                    <span className="mb-3 inline-block text-3xl">✨</span>

                    <h2 className="text-3xl font-extrabold tracking-wide text-[#37474F] md:text-4xl">
                        Lo más popular
                    </h2>

                    <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-[#FFA000]" />
                </div>

                {/* Cards */}
                <div className="grid gap-8 md:grid-cols-3">
                    {courses.map((course) => (
                        <article
                            key={course.id}
                            className="group rounded-2xl border border-[#455A64]/10 bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                        >
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFA000]/15 text-4xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FFA000]/25">
                                {course.icon}
                            </div>

                            <h3 className="mb-4 text-2xl font-bold text-[#37474F]">
                                {course.title}
                            </h3>

                            <p className="mx-auto max-w-sm text-base leading-relaxed text-[#455A64]">
                                {course.description}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}