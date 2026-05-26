const Footer = () => {
    return (
        <footer className="w-full bg-[#37474F] text-[#FAFAFA]">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-sm md:flex-row">

                <div className="flex flex-col items-center gap-3 md:flex-row md:gap-5">
                    <div className="flex items-center gap-2">
                        <span className="text-[#FFA000]">✉</span>
                        <span className="font-medium">E-mail:</span>
                        <a
                            href="mailto:contacto@plataforma.cl"
                            className="transition hover:text-[#FFA000]"
                        >
                            contacto@plataforma.cl
                        </a>
                    </div>

                    <span className="hidden text-[#FAFAFA]/60 md:block">|</span>

                    <div className="flex items-center gap-2">
                        <span className="text-[#FFA000]">☎</span>
                        <span className="font-medium">Teléfono:</span>
                        <a
                            href="tel:+56912345678"
                            className="transition hover:text-[#FFA000]"
                        >
                            +56 9 1234 5678
                        </a>
                    </div>

                    <span className="hidden text-[#FAFAFA]/60 md:block">|</span>

                    <div className="flex items-center gap-2 text-center">
                        <span className="text-[#FFA000]">●</span>
                        <span className="font-medium">Dirección:</span>
                        <span>Av. Ficticia 1234, Santiago, Chile</span>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <a
                        href="#"
                        aria-label="Facebook"
                        className="font-semibold transition hover:text-[#FFA000]"
                    >
                        f
                    </a>

                    <a
                        href="#"
                        aria-label="Instagram"
                        className="font-semibold transition hover:text-[#FFA000]"
                    >
                        ◎
                    </a>

                    <a
                        href="#"
                        aria-label="LinkedIn"
                        className="font-semibold transition hover:text-[#FFA000]"
                    >
                        in
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;