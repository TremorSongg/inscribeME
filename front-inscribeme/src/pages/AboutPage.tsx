import Footer from "../components/Footer";

const Nosotros = () => {
    return (
        <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#212121]">
            <div className="flex-1">
                <section className="bg-[#37474F] px-6 py-20 text-[#FAFAFA] md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-3xl">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#FFA000]">
                                Sobre Nosotros
                            </p>

                            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
                                Conectamos personas con actividades, talleres y oportunidades.
                            </h1>

                            <p className="text-lg leading-8 text-[#FAFAFA]/90">
                                En InscribeMe buscamos facilitar la inscripción y gestión de
                                actividades deportivas, recreativas y formativas, entregando una
                                experiencia simple, ordenada y accesible para usuarios,
                                instructores y administradores.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
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
                                mejorar la comunicación y centralizar la información en un solo
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
                            <h3 className="mb-5 text-2xl font-bold text-[#37474F]">
                                Nuestro propósito
                            </h3>

                            <p className="mb-6 leading-7 text-[#455A64]">
                                Queremos que participar en una actividad sea un proceso claro,
                                rápido y confiable, eliminando barreras de inscripción y
                                ayudando a que más personas puedan acceder a nuevas experiencias.
                            </p>

                            <div className="rounded-xl border-l-4 border-[#FFA000] bg-[#FAFAFA] p-5">
                                <p className="font-semibold text-[#212121]">
                                    “Organizar mejor para participar más.”
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 text-center">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                                Lo que nos mueve
                            </p>

                            <h2 className="text-3xl font-bold text-[#37474F]">
                                Nuestros valores
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <article className="rounded-2xl border border-[#455A64]/10 bg-[#FAFAFA] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA000] text-xl font-bold text-[#37474F]">
                                    1
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-[#37474F]">
                                    Simplicidad
                                </h3>

                                <p className="leading-7 text-[#455A64]">
                                    Creamos una experiencia fácil de usar, clara y directa para
                                    que cualquier persona pueda inscribirse sin complicaciones.
                                </p>
                            </article>

                            <article className="rounded-2xl border border-[#455A64]/10 bg-[#FAFAFA] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA000] text-xl font-bold text-[#37474F]">
                                    2
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-[#37474F]">
                                    Organización
                                </h3>

                                <p className="leading-7 text-[#455A64]">
                                    Ayudamos a centralizar la información de actividades,
                                    participantes, cupos y fechas en una plataforma ordenada.
                                </p>
                            </article>

                            <article className="rounded-2xl border border-[#455A64]/10 bg-[#FAFAFA] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFA000] text-xl font-bold text-[#37474F]">
                                    3
                                </div>

                                <h3 className="mb-3 text-xl font-bold text-[#37474F]">
                                    Confianza
                                </h3>

                                <p className="leading-7 text-[#455A64]">
                                    Buscamos entregar información clara y actualizada para que los
                                    usuarios puedan tomar mejores decisiones al momento de
                                    inscribirse.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
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

                <section className="bg-[#FAFAFA] px-6 py-16 md:px-12 lg:px-20">
                    <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 text-center shadow-[0_8px_24px_rgba(33,33,33,0.12)] md:p-12">
                        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFA000]">
                            InscribeMe
                        </p>

                        <h2 className="mb-5 text-3xl font-bold text-[#37474F]">
                            Una forma más simple de participar.
                        </h2>

                        <p className="mx-auto max-w-3xl leading-7 text-[#455A64]">
                            Nuestro compromiso es construir una plataforma clara, útil y
                            moderna, que ayude a las personas a encontrar actividades y a las
                            organizaciones a gestionarlas de mejor manera.
                        </p>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default Nosotros;