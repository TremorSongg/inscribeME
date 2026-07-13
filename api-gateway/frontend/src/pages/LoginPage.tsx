import { useEffect } from "react";
import AuthForm from "../components/Login/AuthForm";

const LoginPage = () => {
    useEffect(() => {
        const html = document.documentElement;
        const prev = html.classList.contains("dark");
        html.classList.remove("dark");
        html.removeAttribute("data-theme");
        return () => {
            if (prev) {
                html.classList.add("dark");
                html.setAttribute("data-theme", "dark");
            }
        };
    }, []);

    return (
        /* CAMBIO CLAVE: Ajustamos min-h, fondo degradado premium e items-center para centrado absoluto en Ultra-Wide */
        <div className="flex min-h-[calc(100vh)] w-full items-center justify-center bg-gradient-to-b from-[#90CEF5] to-[#ACD0E6] px-6 py-12 relative overflow-hidden">
            
            {/* ── Fondo Animado de Nubes HTML/CSS ─────────────────────── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 w-full h-full opacity-70">
                <div className="absolute top-[12%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[80px_0_0_10px_#fff,40px_0_0_20px_#fff,110px_0_0_-5px_#fff] animate-cloud-1" />
                <div className="absolute top-[28%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[40px_-10px_0_20px_#fff,80px_-10px_0_10px_#fff,115px_-5px_0_-10px_#fff] animate-cloud-2" />
                <div className="absolute top-[48%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[40px_-10px_0_15px_#fff,90px_0px_0_15px_#fff] animate-cloud-3" />
                <div className="absolute top-[70%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[80px_0_0_10px_#fff,40px_0_0_20px_#fff,110px_0_0_-5px_#fff,80px_25px_0_10px_#fff,40px_25px_0_20px_#fff,0_40px_0_-5px_#fff] animate-cloud-4" />
                <div className="absolute top-[85%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[40px_-10px_0_20px_#fff,80px_-10px_0_10px_#fff,115px_-5px_0_-10px_#fff] animate-cloud-2" />
                <div className="absolute top-[90%] h-[50px] w-[200px] bg-white rounded-[30px] before:content-[''] before:absolute before:block before:w-[50px] before:h-[50px] before:-top-[20px] before:left-[20px] before:bg-white before:rounded-[30px] before:shadow-[40px_-30px_0_15px_#fff,60px_0px_0_15px_#fff] animate-cloud-1" />
                {/* Pájaros */}
                <div className="bird bird-lg bird-1" style={{ top: '16%' }} />
                <div className="bird bird-md bird-2" style={{ top: '21%', marginLeft: '40px' }} />
                <div className="bird bird-lg bird-3" style={{ top: '9%' }} />
                <div className="bird bird-md bird-4" style={{ top: '26%', marginLeft: '20px' }} />
                <div className="bird bird-lg bird-5" style={{ top: '13%', marginLeft: '70px' }} />
                <div className="bird bird-sm bird-6" style={{ top: '6%' }} />
                <div className="bird bird-md bird-7" style={{ top: '32%' }} />
                <div className="bird bird-sm bird-8" style={{ top: '19%', marginLeft: '90px' }} />
                <div className="bird bird-lg bird-9" style={{ top: '11%', marginLeft: '50px' }} />
                <div className="bird bird-md bird-10" style={{ top: '40%' }} />
            </div>

            {/* Formulario contenedor */}
            <div className="relative z-10 w-full max-w-sm mt-12 animate-fadeInUp">
                <AuthForm />
            </div>

            {/* Marca flotante */}
            <div className="fixed bottom-6 right-7 z-50 flex items-center gap-3 select-none pointer-events-none">
                <div className="brand-logo-box flex items-center justify-center rounded-xl bg-primary-500 font-black text-white shadow-md">
                    IM
                </div>
                <span className="brand-logo-text font-display"
                    style={{ textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}>
                    <span className="text-white">Inscribe</span><span className="text-primary-500">Me</span>
                </span>
            </div>
        </div>
    );
};

export default LoginPage;