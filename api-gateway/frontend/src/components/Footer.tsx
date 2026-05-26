import { Link } from "react-router-dom";

const Footer = () => (
    <footer className="bg-[#1C2B33] text-white">
        {/* Main */}
        <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFA000] text-[#1C2B33] font-black text-lg">I</div>
                    <span className="text-xl font-black tracking-tight">InscribeMe</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                    Academia deportiva y cultural que conecta estudiantes con instructores de excelencia. Transformamos energía en logros.
                </p>
                <div className="mt-6 flex gap-3">
                    {["📸", "🐦", "📘", "📺"].map((icon, i) => (
                        <div key={i}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-sm hover:bg-[#FFA000]/20 hover:scale-110 transition-all cursor-pointer">
                            {icon}
                        </div>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div>
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#FFA000]">Navegación</p>
                <ul className="space-y-3 text-sm text-white/55">
                    {[
                        { to: "/", label: "Inicio" },
                        { to: "/cursos", label: "Cursos" },
                        { to: "/nosotros", label: "Nosotros" },
                        { to: "/login", label: "Iniciar sesión" },
                        { to: "/registro", label: "Registrarse" },
                    ].map(l => (
                        <li key={l.to}>
                            <Link to={l.to} className="hover:text-[#FFA000] transition-colors">{l.label}</Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contact */}
            <div>
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#FFA000]">Contacto</p>
                <ul className="space-y-3 text-sm text-white/55">
                    <li className="flex items-start gap-2">
                        <span>📍</span>
                        <span>Av. Deportes 1234,<br />Santiago, Chile</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span>📞</span>
                        <span>+56 9 1234 5678</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span>✉️</span>
                        <span>hola@inscribeme.cl</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 px-6 py-5">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
                <p>© {new Date().getFullYear()} InscribeMe. Todos los derechos reservados.</p>
                <p>Hecho con ❤️ en Chile</p>
            </div>
        </div>
    </footer>
);

export default Footer;
