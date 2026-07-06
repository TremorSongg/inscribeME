import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

type FieldError = {
    email?: string;
    password?: string;
};

const AuthForm = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldError>({});
    const [touched, setTouched] = useState({ email: false, password: false });
    const [loginError, setLoginError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // ── CAMBIO CLAVE: Agregamos el estado de control de la animación del búho ──
    const [isBlind, setIsBlind] = useState(false);

    // ── Validaciones ─────────────────────────────────────────────
    const validate = (): FieldError => {
        const errs: FieldError = {};
        if (!email.includes("@") || email.trim().length < 5) {
            errs.email = "Ingresa un correo electrónico válido (debe contener @).";
        }
        if (password.length < 6) {
            errs.password = "La contraseña debe tener al menos 6 caracteres.";
        }
        return errs;
    };

    const handleBlur = (field: "email" | "password") => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate());
        // Desactiva el búho si el usuario sale del input de contraseña
        if (field === "password") setIsBlind(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        setLoginError("");

        try {
            await login(email.trim().toLowerCase(), password);
            const stored = localStorage.getItem("authUser");
            if (stored) {
                const u = JSON.parse(stored) as { role: string };
                if (u.role === "ADMIN") navigate("/admin", { replace: true });
                else if (u.role === "INSTRUCTOR") navigate("/instructor/perfil", { replace: true });
                else navigate("/perfil", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setLoginError(
                err instanceof Error
                    ? "Correo o contraseña incorrectos. Verifica tus datos."
                    : "Error al iniciar sesión. Intenta de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        /* CAMBIO CLAVE: Agregamos la clase 'relative' a la tarjeta para que sirva de anclaje posicional al búho */
        <div className="relative w-full max-w-5xl mx-auto rounded-[14px] border border-neutral-200 bg-white p-8 shadow-xl">
            
            {/* ── COMPONENTE BÚHO INTERACTIVO ────────────────────────────── */}
            {/* Se monta en el borde superior y se activa dinámicamente con la clase owl-blind */}
            <div className={`owl-wrapper ${isBlind ? "owl-blind" : ""}`}>
                <div className="owl-hand" />
                <div className="owl-hand hand-r" />
                <div className="owl-arms">
                    <div className="owl-arm" />
                    <div className="owl-arm arm-r" />
                </div>
            </div>

            <h1 className="mb-2 text-center text-3xl font-extrabold text-primary-600 font-display">
                Iniciar Sesión
            </h1>
            <p className="mb-6 text-center text-lg text-[#497a96] ">
                Bienvenido a InscribeMe
            </p>

            {loginError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fadeIn">
                    ⚠️ {loginError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email */}
                <div className="text-center">
                    <label className="mb-2 block text-center text-sm font-semibold text-[#497a96]">
                        Correo electrónico
                    </label>
                    <input
                        id="input-email-login"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="ejemplo@correo.cl"
                        className={`w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:ring-2 ${
                            touched.email && errors.email
                                ? "input-error focus:ring-red-200"
                                : touched.email && !errors.email
                                ? "input-valid focus:ring-green-200"
                                : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30"
                        }`}
                    />
                    {touched.email && errors.email && (
                        <p className="field-error-msg">⚠ {errors.email}</p>
                    )}
                </div>

                {/* Contraseña */}
                <div className="text-left">
                    <label className="mb-2 text-center block text-sm font-semibold text-[#497a96]">
                        Contraseña
                    </label>
                    <div className="relative">
                        <input
                            id="input-password-login"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            
                            /* CAMBIO CLAVE: Manejadores de foco integrados para gatillar la animación */
                            onFocus={() => setIsBlind(true)}
                            onBlur={() => handleBlur("password")}
                            
                            placeholder="Mínimo 6 caracteres"
                            className={`w-full rounded-2xl border px-4 py-3.5 pr-12 outline-none transition focus:ring-2 ${
                                touched.password && errors.password
                                    ? "input-error focus:ring-red-200"
                                    : touched.password && !errors.password
                                    ? "input-valid focus:ring-green-200"
                                    : "border-neutral-300 focus:border-primary-500 focus:ring-primary-500/30"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            aria-label="Mostrar/ocultar contraseña"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {touched.password && errors.password && (
                        <p className="field-error-msg">⚠ {errors.password}</p>
                    )}
                </div>

                <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary !py-3.5 font-bold transition-all duration-200 disabled:opacity-60 disabled:transform-none cursor-pointer"
                >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión →"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#e08917] font-medium">
                ¿No tienes cuenta?{" "}

                <Link
                    to="/registro"
                    id="link-to-register"
                    className="font-bold text-primary-500 hover:underline"
                >
                    Regístrate aquí
                </Link>
            </p>

            {/* Credenciales de demo */}
            <div className="mt-5 rounded-2xl bg-primary-50 border border-primary-100 p-4 text-left">
                <p className="text-xs font-bold text-primary-600 mb-2">🔑 Usuarios de prueba:</p>
                <div className="space-y-1 text-xs text-primary-600/80">
                    <p>Admin: <span className="font-mono font-bold">admin@inscribeme.cl</span> / <span className="font-mono">admin123</span></p>
                    <p>Instructor: <span className="font-mono font-bold">carlos@inscribeme.cl</span> / <span className="font-mono">instructor1</span></p>
                    <p>Estudiante: <span className="font-mono font-bold">juan@inscribeme.cl</span> / <span className="font-mono">estudiante1</span></p>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;