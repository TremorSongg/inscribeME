import { useState } from "react";
import LoginBackground from "../components/Login/LoginBackground";
import MascotLogin from "../components/Login/MascotLogin";
import AuthForm from "../components/Login/AuthForm";



const LoginPage = () => {
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    return (
        <div className="relative w-full flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-[#37474F] via-[#455A64] to-[#FAFAFA] font-sans text-[#212121]">
            <LoginBackground />
            <section className="relative z-10 w-full max-w-[320px] px-4">
                <div className="relative w-full">
                    <MascotLogin isPasswordFocused={isPasswordFocused} />
                    <AuthForm
                        onPasswordFocus={() => setIsPasswordFocused(true)}
                        onPasswordBlur={() => setIsPasswordFocused(false)}
                    />
                </div>
            </section>
        </div>
    );
};

export default LoginPage;