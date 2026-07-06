import AuthForm from "../components/Login/AuthForm";

const LoginPage = () => {
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
                
            </div>

            {/* Formulario contenedor */}
            <div className="relative z-10 w-full max-w-sm mt-12 animate-fadeInUp">
                <AuthForm />
            </div>
        </div>
    );
};

export default LoginPage;