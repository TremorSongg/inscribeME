const AboutPage = () => {
    return (
        /* Recuperamos la estructura raíz limpia que centra todo perfectamente */
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#212121] w-full items-center">
            <div className="flex-1 w-full flex flex-col items-center">
                
                {/* ── 1. HERO ─────────────────────────────────────── */}
                {/* Se mantiene pegado al Navbar de forma natural */}
                <section className="bg-[#37474F] px-6 py-20 text-[#FAFAFA] md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto flex justify-center">
                        <div className="max-w-3xl text-center mx-auto">
                            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                                Conectamos personas con actividades, talleres y oportunidades.
                            </h1>
                            <p className="text-lg leading-8 text-[#FAFAFA]/90">                        
                                En InscribeMe buscamos facilitar la inscripción y gestión de
                                actividades deportivas, recreativas y formativas, entregando una
                                experience simple, ordenada y accesible para usuarios,
                                instructores y administradores.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 2. QUIÉNES SOMOS (Separación exacta con el Hero) ───────────────── */}
                {/* SOLUCIÓN CLAVE: Usamos 'pt-32' en lugar de márgenes. El padding NO colapsa, 
                    por lo que creará un aire real, masivo y limpio exactamente debajo del Hero oscuro */}
                <section className="separador-hero-contenido px-6 pt-32 pb-16 md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto grid gap-x-16 gap-y-10 md:grid-cols-2 text-center">
                        <div>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                                Quiénes somos
                            </p>
                            <h2 className="mb-5 text-3xl font-bold text-[#37474F]">
                                Una plataforma pensada para simplificar la organización.
                            </h2>
                            <p className="mb-4 leading-7 text-[#455A64]">
                                Somos una solución digital orientada a mejorar la forma en que
                                las personas descubren, seleccionan e ingresan a distintas
                                actividades. Nuestro objetivo es reducir procesos manuales,
                                mejorar la comunicación y centralizar la información in un solo
                                lugar.
                            </p>
                            <p className="leading-7 text-[#455A64]">
                                La plataforma permite que los usuarios puedan revisar cupos,
                                fechas y detalles importantes, mientras que los administradores
                                pueden gestionar actividades, inscripciones y participantes de
                                manera más eficiente.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_rgba(33,33,33,0.12)]">
                            <h3 className="mb-5 text-2xl font-bold text-[#37474F]">Nuestro propósito</h3>
                            <p className="mb-6 leading-7 text-[#455A64]">
                                Queremos que participar en una activity sea un proceso claro,
                                rápido y confiable, eliminando barreras de inscripción y
                                ayudando a que más personas puedan acceder a nuevas experiencias.
                            </p>
                            <div className="rounded-xl border-l-4 border-[#FFA000] bg-[#FAFAFA] p-5">
                                <p className="font-semibold text-[#212121]">
                                    "Organizar mejor para participar más."
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3. VALORES (Espaciado interno normal) ───────────────────────────────────── */}
                <section className="espaciado-secciones bg-white px-6 py-20 md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto text-center">
                        <div className="mb-10 text-center">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                                Lo que nos mueve
                            </p>
                            <h2 className="text-3xl font-bold text-[#37474F]">Nuestros valores</h2>
                        </div>

                        <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
                            {[
                                { n: 1, title: "Simplicidad", desc: "Creamos una experiencia fácil de usar, clara y directa para que cualquier persona pueda inscribirse sin complicaciones." },
                                { n: 2, title: "Organización", desc: "Ayudamos a centralizar la información de actividades, participantes, cupos y fechas en una plataforma ordenada." },
                                { n: 3, title: "Confianza", desc: "Buscamos entregar información clara y actualizada para que los usuarios puedan tomar mejores decisiones." },
                            ].map((v) => (
                                <article key={v.n} className="rounded-2xl border border-[#455A64]/10 bg-[#FAFAFA] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA000] text-xl font-bold text-[#37474F] mx-auto">
                                        {v.n}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-[#37474F]">{v.title}</h3>
                                    <p className="leading-7 text-[#455A64]">{v.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 4. MISIÓN Y VISIÓN (Separación exacta con el Footer) ───────────── */}
                {/* SOLUCIÓN CLAVE: Usamos 'pb-40' para empujar el Footer hacia abajo de forma limpia 
                    y sin romper el flujo del resto de las páginas */}
                <section className="separador-contenido-footer px-6 pt-16 pb-40 md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto grid gap-x-12 gap-y-8 md:grid-cols-2 text-center">
                        <div className="rounded-2xl bg-[#37474F] p-8 text-[#FAFAFA]">
                            <h2 className="mb-4 text-2xl font-bold">Misión</h2>
                            <p className="leading-7 text-[#FAFAFA]/90">
                                Facilitar la inscripción y gestión de actividades mediante una
                                plataforma digital intuitiva, eficiente y accesible, que mejore
                                la experiencia de usuarios y administradores.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-[#455A64] p-8 text-[#FAFAFA]">
                            <h2 className="mb-4 text-2xl font-bold">Visión</h2>
                            <p className="leading-7 text-[#FAFAFA]/90">
                                Ser una plataforma reconocida por simplificar la participación
                                en actividades y fortalecer la organización de instituciones,
                                comunidades y espacios formativos.
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;