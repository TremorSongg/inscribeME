import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="w-full flex flex-col items-center">
            <section className="mt-16 bg-gradient-to-b from-sky-50 to-white border-t-2 border-sky-100 py-16 px-6 md:px-12 lg:px-20 font-sans text-neutral-800 w-full flex flex-col items-center">
                <div className="w-full max-w-7xl">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12">
                        
                        {/* Brand Column */}
                        <div className="flex flex-col gap-4 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white text-sm shadow-md transition-transform hover:scale-105 duration-200" style={{background: 'linear-gradient(135deg, #006397, #0EA5E9)'}}>
                                    IM
                                </div>
                                <span className="text-xl font-bold tracking-tight text-neutral-900 font-display">
                                    Inscribe<span className="text-sky-600">Me</span>
                                </span>
                            </Link>
                            <p className="text-sm text-neutral-700 max-w-sm leading-relaxed">
                                Academia deportiva y cultural que conecta estudiantes con instructores de excelencia. Transformamos energía en logros.
                            </p>
                            <span className="text-xs font-bold text-neutral-600">v1.0.0</span>
                        </div>

                        {/* Navigation Column */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-display">Navegación</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link to="/" className="text-neutral-800 hover:text-sky-600 font-medium transition-all duration-300">Inicio</Link></li>
                                <li><Link to="/cursos" className="text-neutral-800 hover:text-sky-600 font-medium transition-all duration-300">Cursos</Link></li>
                                <li><Link to="/nosotros" className="text-neutral-800 hover:text-sky-600 font-medium transition-all duration-300">Nosotros</Link></li>
                                <li><Link to="/login" className="text-neutral-800 hover:text-sky-600 font-medium transition-all duration-300">Iniciar sesión</Link></li>
                                <li><Link to="/registro" className="text-neutral-800 hover:text-sky-600 font-medium transition-all duration-300">Registrarse</Link></li>
                            </ul>
                        </div>

                        {/* Contact Column */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-display">Contacto</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2 text-neutral-800">
                                    <i className="ti ti-map-pin text-lg text-sky-600 mt-0.5"></i>
                                    <span>Av. Deportes 1234,<br />Santiago, Chile</span>
                                </li>
                                <li className="flex items-center gap-2 text-neutral-800">
                                    <i className="ti ti-phone text-lg text-sky-600"></i>
                                    <a href="tel:+56912345678" className="hover:text-sky-600 transition-all duration-300 font-medium">+56 9 1234 5678</a>
                                </li>
                                <li className="flex items-center gap-2 text-neutral-800">
                                    <i className="ti ti-mail text-lg text-sky-600"></i>
                                    <a href="mailto:hola@inscribeme.cl" className="hover:text-sky-600 transition-all duration-300 font-medium">hola@inscribeme.cl</a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Bottom section with copyright and social links */}
                    <div className="bg-sky-50 rounded-3xl sm:rounded-[32px] border border-sky-100 mt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:py-4 sm:px-8">
                            <span className="text-xs font-semibold text-neutral-700">
                                Copyright © {new Date().getFullYear()} <span className="font-bold text-sky-600">InscribeMe</span>. Todos los derechos reservados.
                            </span>
                            
                            {/* Social icons using Tabler icons */}
                            <div className="flex gap-2 text-xl">
                                <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl text-sky-600 hover:bg-sky-100 transition-all duration-300" aria-label="LinkedIn"><i className="ti ti-brand-linkedin"></i></a>
                                <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl text-sky-600 hover:bg-sky-100 transition-all duration-300" aria-label="Facebook"><i className="ti ti-brand-facebook"></i></a>
                                <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl text-sky-600 hover:bg-sky-100 transition-all duration-300" aria-label="Instagram"><i className="ti ti-brand-instagram"></i></a>
                                <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl text-sky-600 hover:bg-sky-100 transition-all duration-300" aria-label="GitHub"><i className="ti ti-brand-github"></i></a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </footer>
    );
};

export default Footer;