const AboutPage = () => {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-800 font-sans w-full items-center">
            <div className="flex-1 w-full flex flex-col items-center">
                
                {/* ── 1. HERO ───────────────────────────────────────────── */}
                <section className="relative overflow-hidden px-6 py-24 text-white w-full flex justify-center" style={{background: 'linear-gradient(135deg, #00395C 0%, #006397 50%, #0284C7 100%)'}}>
                    {/* Background decoration */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)'}} />
                    
                    
                    <div className="relative z-10 w-full max-w-7xl mx-auto flex justify-center">
                        <div className="max-w-3xl text-center mx-auto">
                            <span className="inline-flex items-center px-3 !py-2 rounded-full bg-white/15 text-xs font-bold text-sky-200 uppercase tracking-wide mb-4 border border-white/10">
                                Sobre Nosotros
                            </span>

                            <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl text-sky-200 font-display">
                                Conectamos personas con actividades, talleres y oportunidades.
                            </h1>

                            <p className="text-lg !py-4 leading-relaxed text-sky-100">
                                En InscribeMe buscamos facilitar la inscripción y gestión de
                                actividades deportivas, recreativas y formativas, entregando una
                                experiencia simple, ordenada y accesible para usuarios,
                                instructores y administradores.
                            </p>
                            
                        </div>
                    </div>
                </section>

                {/* ── 2. QUIÉNES SOMOS ───────────────────────────────── */}
                <section className="separador-hero-contenido !py-6 pt-24 pb-16 md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto grid gap-x-16 gap-y-10 md:grid-cols-2 items-stretch">
                        <div className="text-center h-full flex flex-col">
                            <span className="inline-flex items-center text-center !px-3 !py-2 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide mb-4">
                                Quiénes somos
                            </span>

                            <h2 className="mb-5 text-3xl !py-3 font-extrabold text-sky-700 font-display">
                                Una plataforma pensada para simplificar la organización.
                            </h2>

                            <p className="mb-4 text-sm leading-relaxed text-neutral-700">
                                Somos una solución digital orientada a mejorar la forma en que
                                las personas descubren, seleccionan e ingresan a distintas
                                actividades. Nuestro objetivo es reducir procesos manuales,
                                mejorar la comunicación y centralizar la información en un solo
                                lugar.
                            </p>

                            <p className="text-sm leading-relaxed text-neutral-700">
                                La plataforma permite que los usuarios puedan revisar cupos,
                                fechas y detalles importantes, mientras que los administradores
                                pueden gestionar actividades, inscripciones y participantes de
                                manera más eficiente.
                            </p>
                        </div>

                        <div className="text-center h-full flex flex-col">
                            <div className="text-center h-full flex flex-col">
                            <span className="inline-flex items-center text-center !px-3 !py-2 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide mb-4">
                                Organización y propósito
                            </span>
                            <h2 className="mb-5 text-3xl !py-3 font-extrabold text-sky-700 font-display">
                                Nuestro propósito
                            </h2>

                            <p className="mb-6 text-sm !py-8 leading-relaxed text-neutral-700">
                                Queremos que participar en una actividad sea un proceso claro,
                                rápido y confiable, eliminando barreras de inscripción y
                                ayudando a que más personas puedan acceder a nuevas experiencias.
                            </p>
                            <p className="mb-6 text-sm leading-relaxed text-neutral-700">
                                Buscamos ser un puente entre las personas y las oportunidades de
                                crecimiento, aprendizaje y diversión que existen en sus comunidades,
                                facilitando la conexión y el acceso a través de una plataforma
                                digital intuitiva y eficiente.
                            </p>
                            
                        </div>
                        </div>
                    </div>
                </section>

                {/* ── 3. VALORES ───────────────────────────────────── */}
                <section className="espaciado-secciones bg-white px-6 py-20 md:px-12 lg:px-20 w-full flex justify-center border-y border-neutral-200">
                    <div className="w-full max-w-7xl mx-auto text-center">
                        <div className="mb-14 text-center">
                            <span className="inline-flex items-center !px-3 !py-2 rounded-full bg-primary-100 text-xs font-bold text-primary-600 uppercase tracking-wide mb-3">
                                Lo que nos mueve
                            </span>

                            <h2 className="text-3xl font-extrabold text-sky-700 font-display">
                                Nuestros valores
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                { n: 1, title: "Simplicidad", desc: "Creamos una experiencia fácil de usar, clara y directa para que cualquier persona pueda inscribirse sin complicaciones." },
                                { n: 2, title: "Organización", desc: "Ayudamos a centralizar la información de actividades, participantes, cupos y fechas en una plataforma ordenada." },
                                { n: 3, title: "Confianza", desc: "Buscamos entregar información clara y actualizada para que los usuarios puedan tomar mejores decisiones." },
                            ].map((v) => (
                                <article key={v.n} className="group relative rounded-3xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white hover:border-primary-500/20 text-left">
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 shadow-inner">
                                        {v.n}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-sky-700 font-display">{v.title}</h3>
                                    <p className="text-sm leading-relaxed text-neutral-700">{v.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 4. MISIÓN Y VISIÓN ───────────────────────────── */}
                <section className="separador-contenido-footer px-6 pt-20 pb-28 md:px-12 lg:px-20 w-full flex justify-center">
                    <div className="w-full max-w-7xl mx-auto grid gap-x-12 gap-y-8 md:grid-cols-2 text-left">
                        {/* Misión */}
                        <div className="rounded-3xl border border-neutral-200 bg-sky-100 p-8 text-white shadow-md relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-sky-500/100 blur-xl"></div>
                            <h2 className="mb-4 text-2xl !px-4 font-bold font-display text-primary-400">Misión</h2>
                            <p className="text-sm !px-4 !py-8 leading-relaxed text-neutral-800">
                                Facilitar la inscripción y gestión de actividades mediante una
                                plataforma digital intuitiva, eficiente y accesible, que mejore
                                la experiencia de usuarios y administradores.
                            </p>
                        </div>

                        {/* Visión */}
                        <div className="rounded-3xl border border-neutral-200 bg-sky-100 p-8 text-white shadow-md relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-sky-500/100 blur-xl"></div>
                            <h2 className="mb-4 text-2xl !px-4 font-bold font-display text-primary-400">Visión</h2>
                            <p className="text-sm !px-4 !py-8 leading-relaxed text-neutral-800">
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