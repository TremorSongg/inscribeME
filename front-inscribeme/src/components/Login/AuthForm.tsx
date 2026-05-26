import { useState } from "react";

type AuthFormProps = {
    title: string;
    subtitle: string;
    buttonText: string;
    variant?: "user" | "admin";
    onSubmit?: (email: string, password: string) => void;
};

const AuthForm = ({
    title,
    subtitle,
    buttonText,
    variant = "user",
    onSubmit,
}: AuthFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (onSubmit) {
            onSubmit(email, password);
            return;
        }

        console.log(email, password);
    };

    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h1 className="mb-2 text-center text-3xl font-bold text-[#37474F]">
                {title}
            </h1>

            <p className="mb-6 text-center text-sm text-[#455A64]">
                {subtitle}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                        Correo electrónico
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-semibold text-[#37474F]">
                        Contraseña
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#FFA000] focus:ring-2 focus:ring-[#FFA000]/30"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={`w-full rounded-xl px-6 py-3 font-bold shadow-md transition ${variant === "admin"
                            ? "bg-[#263238] text-white hover:bg-[#37474F]"
                            : "bg-[#FFA000] text-[#212121] hover:bg-[#ffb300]"
                        }`}
                >
                    {buttonText}
                </button>
            </form>
        </div>
    );
};

export default AuthForm;