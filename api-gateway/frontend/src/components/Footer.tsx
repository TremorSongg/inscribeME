import { Link } from "react-router-dom";

const Footer = () => (
    /* CAMBIO CLAVE: Añadimos w-full flex flex-col items-center para que el footer 
       y todo lo que tenga dentro se centre matemáticamente en pantallas ultra-wide */
    <footer className="bg-[#1C2B33] text-white w-full flex flex-col items-center">
        
        {/* Main */}
        {/* CAMBIO CLAVE: Añadimos w-full para que el max-w-7xl funcione correctamente con mx-auto */}
        <div className="separador-hero-contenido2 separador-contenido-footer2 w-full max-w-7xl px-6 pt-40 pb-100 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 justify-items-center text-center sm:text-left">
            
            {/* Brand */}
            <div className="lg:col-span-2 flex flex-col items-center sm:items-start">
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
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sm hover:bg-[#FFA000]/20 hover:scale-110 transition-all cursor-pointer">
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
            <div className="flex flex-col items-center sm:items-start">
                <p className="mb-5 text-xs font-bold uppercase tracking-widest text-[#FFA000]">Contacto</p>
                <ul className="space-y-3 text-sm text-white/55 flex flex-col items-center sm:items-start">
                    <li className="flex items-start gap-2 text-center sm:text-left">
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
        {/* CAMBIO CLAVE: Añadimos 'flex justify-center' aquí para que el contenedor 
            exterior obligue a su contenido a posicionarse en el centro del monitor */}
        <div className="border-t border-white/8 px-6 py-5 w-full flex justify-center">
            
            {/* CAMBIO CLAVE: Cambiamos 'mx-auto' y añadimos 'justify-center' real con flex */}
            <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 text-xs text-white/30 text-center">
                <p>© {new Date().getFullYear()} InscribeMe. Todos los derechos reservados.</p>
                <p>Hecho con ❤️ en Chile</p>
            </div>
        </div>
    </footer>
);

export default Footer;