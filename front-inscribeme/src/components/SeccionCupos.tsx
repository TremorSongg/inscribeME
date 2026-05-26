type SeccionCupo = {
    id: number;
    name: string;
    date: string;
    icon: string;
};

const cursosConCupos: SeccionCupo[] = [
    {
        id: 1,
        name: "Fútbol infantil",
        date: "Julio 2025",
        icon: "⚽",
    },
    {
        id: 2,
        name: "Zumba femenino",
        date: "Agosto 2025",
        icon: "🎵",
    },
    {
        id: 3,
        name: "Escalada grupal",
        date: "Septiembre 2025",
        icon: "⛰️",
    },
];

export default function SeccionCupos() {
    return (
        <section className="w-full bg-[#FAFAFA] px-6 py-16 text-[#212121] md:px-12 lg:px-20">
            <div className="mx-auto max-w-7xl">
                <div className="overflow-hidden rounded-3xl border border-[#455A64]/10 bg-white shadow-lg">
                    <div className="grid items-center gap-8 p-6 md:grid-cols-2 md:p-10 lg:p-12">
                        {/* Imagen */}
                        <div className="relative">
                            <div className="absolute -left-4 -top-4 h-28 w-28 rounded-full bg-[#FFA000]/20 blur-2xl" />

                            <img
                                src="/images/upcoming-courses.jpg"
                                alt="Estudiante participando en una clase online"
                                className="relative h-65 w-full rounded-2xl object-cover shadow-md md:h-80"
                            />
                        </div>

                        {/* Contenido */}
                        <div className="flex flex-col justify-center">
                            <span className="mb-3 w-fit rounded-full bg-[#FFA000]/15 px-4 py-2 text-sm font-semibold text-[#37474F]">
                                Inscripciones abiertas
                            </span>

                            <h2 className="mb-6 text-3xl font-extrabold tracking-wide text-[#37474F] md:text-4xl">
                                ¡Quedan pocos cupos!
                            </h2>

                            <p className="mb-8 max-w-xl text-base leading-relaxed text-[#455A64]">
                                Revisa los cursos con alta demanda y asegura tu inscripción
                                antes de que se completen los cupos disponibles.
                            </p>

                            <div className="space-y-4">
                                {cursosConCupos.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-4 rounded-2xl border border-[#455A64]/10 bg-[#FAFAFA] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#FFA000]/50 hover:shadow-md"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFA000]/20 text-2xl">
                                            {course.icon}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-[#37474F]">
                                                {course.name}
                                            </h3>

                                            <p className="text-sm font-medium text-[#455A64]">
                                                {course.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <a
                                href="/cursos"
                                className="mt-8 inline-flex w-fit items-center justify-center rounded-xl bg-[#FFA000] px-7 py-3 text-base font-semibold text-[#212121] shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#ffb300] hover:shadow-lg"
                            >
                                Ver cursos disponibles
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}