import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
    const navItems = [
        { name: "Inicio", path: "/" },
        { name: "Cursos", path: "/cursos" },
        { name: "Nosotros", path: "/nosotros" },
        { name: "Notificaciones", path: "/notificaciones" },
        { name: "Carrito", path: "/carrito" },
        { name: "Perfil", path: "/perfil" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full bg-[#37474F] shadow-md">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo + nombre */}
                <Link
                    to="/"
                    className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
                >
                    <img
                        src="/course_favicon.svg"
                        alt="Logo Inscríbeme"
                        className="h-10 w-10"
                    />

                    <span className="text-2xl font-bold tracking-wide text-white">
                        Inscríbeme
                    </span>
                </Link>

                {/* Links */}
                <div className="hidden items-center gap-3 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                                    ? "bg-[#FFA000] text-[#212121] shadow-md"
                                    : "text-white hover:bg-[#455A64] hover:text-[#FFA000]"
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;