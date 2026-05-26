import AuthForm from "../components/Login/AuthForm";

const LoginPage = () => {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-[#37474F] via-[#455A64] to-[#FAFAFA] px-4 py-12">
            {/* Decoración de fondo */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#FFA000]/10 blur-3xl" />
                <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#263238]/40 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fadeInUp">
                <AuthForm />
            </div>
        </div>
    );
};

export default LoginPage;
