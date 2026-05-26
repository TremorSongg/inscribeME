import RegisterForm from "../components/Login/RegisterForm";

const RegisterPage = () => {
    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-[#263238] via-[#37474F] to-[#FAFAFA] px-4 py-12">
            {/* Decoración */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#FFA000]/15 blur-3xl" />
                <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-[#455A64]/30 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fadeInUp">
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;
