const SeccionInicio = () => {
    return (
        <section className="w-full bg-[#FAFAFA] px-6 py-16 text-[#212121] md:px-12 lg:px-20">
            <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

                {/* Contenido izquierdo */}
                <div className="flex flex-col items-start">
                    <span className="mb-4 rounded-full bg-[#FFA000]/15 px-4 py-2 text-sm font-semibold text-[#37474F]">
                        Plataforma de inscripciones
                    </span>

                    <h1 className="mb-6 max-w-xl text-4xl font-extrabold leading-tight text-[#37474F] md:text-5xl">
                        InscribeMe: tu plataforma de inscripciones
                    </h1>

                    <p className="mb-8 max-w-2xl text-lg leading-relaxed text-[#455A64]">
                        Descubre. Aprende. Inscríbete. Bienvenido a InscribeMe, una
                        plataforma diseñada para encontrar cursos de forma simple, rápida y
                        moderna.
                    </p>

                    <div className="flex flex-col gap-4 sm:flex-row">
                        <a href="/cursos"
                            className="rounded-xl bg-[#FFA000] px-7 py-3 text-base font-semibold text-[#212121] shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-[#ffb300] hover:shadow-lg"
                        >
                            Visita la oferta de cursos
                        </a>

                        <a
                            href="/nosotros"
                            className="rounded-xl border border-[#37474F] px-7 py-3 text-base font-semibold text-[#37474F] transition-all duration-300 hover:bg-[#37474F] hover:text-[#FAFAFA]"
                        >
                            Conocer más
                        </a>
                    </div>
                </div>

                {/* Imagen derecha */}
                <div className="relative">
                    <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[#FFA000]/20 blur-2xl"></div>
                    <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-[#455A64]/20 blur-2xl"></div>

                    <img
                        src="/images/hero-courses.jpg"
                        alt="Persona usando computador con libros"
                        // className="relative h-[80px] w-full rounded-3xl object-cover shadow-2xl md:h-[360px] lg:h-[400px]"
                    />
                </div>
            </div>
        </section>
    );
};

export default SeccionInicio;