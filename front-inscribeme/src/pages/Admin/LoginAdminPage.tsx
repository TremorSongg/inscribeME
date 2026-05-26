
import AuthForm from "../../components/Login/AuthForm";


const AdminLoginPage = () => {
    const handleAdminLogin = (email: string, password: string) => {
        console.log("Login admin:", {
            email,
            password,
        });
    };
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#263238] px-6 py-12">
            <section className="w-full max-w-md">
                <AuthForm
                    title="Login Admin"
                    subtitle="Ingresa tus credenciales de administrador"
                    buttonText="Ingresar al panel"
                    variant="admin"
                    onSubmit={handleAdminLogin}
                />
            </section>
        </div>
    );
};

export default AdminLoginPage;