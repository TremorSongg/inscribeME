import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext, type UserRole } from "../../context/AuthContext";

type RegisterFields = {
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
};

type FieldErrors = Partial<Record<keyof RegisterFields, string>>;

const RegisterForm = () => {
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const [form, setForm] = useState<RegisterFields>({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "ESTUDIANTE",
    });

    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof RegisterFields, boolean>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backendError, setBackendError] = useState("");

    // ── Validaciones ─────────────────────────────────────────────
    const validate = (data: RegisterFields): FieldErrors => {
        const errs: FieldErrors = {};
        if (data.username.trim().length < 3)
            errs.username = "El nombre de usuario debe tener al menos 3 caracteres.";
        if (!data.email.includes("@") || data.email.trim().length < 5)
            errs.email = "Ingresa un correo electrónico válido (debe contener @).";
        const phoneDigits = data.phone.replace(/\D/g, "");
        if (phoneDigits.length < 9)
            errs.phone = "El teléfono debe tener al menos 9 dígitos.";
        if (data.password.length < 6)
            errs.password = "La contraseña debe tener al menos 6 caracteres.";
        if (data.confirmPassword !== data.password)
            errs.confirmPassword = "Las contraseñas no coinciden.";
        return errs;
    };

    const handleChange = (field: keyof RegisterFields, value: string) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        if (touched[field]) setErrors(validate(updated));
    };

    const handleBlur = (field: keyof RegisterFields) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        setErrors(validate(form));
    };

    const fieldClass = (field: keyof RegisterFields) => {
        const base = "w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2";
        if (!touched[field]) return `${base} border-gray-300 focus:border-[#FFA000] focus:ring-[#FFA000]/30`;
        if (errors[field]) return `${base} input-error focus:ring-red-200`;
        return `${base} input-valid focus:ring-green-200`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const allTouched: Partial<Record<keyof RegisterFields, boolean>> = {};
        (Object.keys(form) as (keyof RegisterFields)[]).forEach((k) => { allTouched[k] = true; });
        setTouched(allTouched);

        const errs = validate(form);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        setBackendError("");

        try {
            await register({
                nombre: form.username,
                email: form.email.toLowerCase(),
                password: form.password,
                telefono: form.phone,
                rol: form.role,
            });
            // register() hace auto-login internamente y actualiza localStorage
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
            setBackendError(
                err instanceof Error
                    ? err.message.includes("email")
                        ? "Este correo ya está registrado. Intenta con otro."
                        : err.message
                    : "Error al registrar. Intenta de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    const roleOptions: { value: UserRole; label: string; emoji: string }[] = [
        { value: "ESTUDIANTE", label: "Estudiante", emoji: "🎒" },
        { value: "INSTRUCTOR", label: "Instructor", emoji: "🏫" },
    ];

    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h1 className="mb-2 text-center text-3xl font-bold text-[#37474F]">
                Crear cuenta
            </h1>
            <p className="mb-6 text-center text-sm text-[#455A64]">
                Únete a InscribeMe y empieza a inscribirte
            </p>

            {/* Selector de rol */}
            <div className="mb-6 grid grid-cols-2 gap-3">
                {roleOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        id={`btn-role-${opt.value.toLowerCase()}`}
                        onClick={() => handleChange("role", opt.value)}
                        className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                            form.role === opt.value
                                ? "border-[#FFA000] bg-[#FFA000]/10 text-[#37474F]"
                                : "border-gray-200 text-[#455A64] hover:border-[#FFA000]/50"
                        }`}
                    >
                        <div className="text-xl mb-1">{opt.emoji}</div>
                        {opt.label}
                    </button>
                ))}
            </div>

            {backendError && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fadeIn">
                    ⚠️ {backendError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Username */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#37474F]">Nombre completo</label>
                    <input
                        id="input-username-register"
                        type="text"
                        value={form.username}
                        onChange={(e) => handleChange("username", e.target.value)}
                        onBlur={() => handleBlur("username")}
                        placeholder="Mínimo 3 caracteres"
                        className={fieldClass("username")}
                    />
                    {touched.username && errors.username && <p className="field-error-msg">⚠ {errors.username}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#37474F]">Correo electrónico</label>
                    <input
                        id="input-email-register"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="ejemplo@correo.cl"
                        className={fieldClass("email")}
                    />
                    {touched.email && errors.email && <p className="field-error-msg">⚠ {errors.email}</p>}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#37474F]">Teléfono</label>
                    <input
                        id="input-phone-register"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder="Mínimo 9 dígitos — ej: 912345678"
                        className={fieldClass("phone")}
                    />
                    {touched.phone && errors.phone && <p className="field-error-msg">⚠ {errors.phone}</p>}
                </div>

                {/* Contraseña */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#37474F]">Contraseña</label>
                    <div className="relative">
                        <input
                            id="input-password-register"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onBlur={() => handleBlur("password")}
                            placeholder="Mínimo 6 caracteres"
                            className={`${fieldClass("password")} pr-12`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#455A64]"
                            aria-label="Ver contraseña"
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {touched.password && errors.password && <p className="field-error-msg">⚠ {errors.password}</p>}
                </div>

                {/* Confirmar contraseña */}
                <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[#37474F]">Confirmar contraseña</label>
                    <div className="relative">
                        <input
                            id="input-confirm-password-register"
                            type={showConfirm ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            onBlur={() => handleBlur("confirmPassword")}
                            placeholder="Repite tu contraseña"
                            className={`${fieldClass("confirmPassword")} pr-12`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#455A64]"
                            aria-label="Ver confirmación"
                        >
                            {showConfirm ? "🙈" : "👁️"}
                        </button>
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                        <p className="field-error-msg">⚠ {errors.confirmPassword}</p>
                    )}
                </div>

                <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-[#FFA000] px-6 py-3 font-bold text-[#212121] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ffb300] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Creando cuenta..." : "Crear cuenta →"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#455A64]">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" id="link-to-login" className="font-semibold text-[#FFA000] hover:underline">
                    Iniciar sesión
                </Link>
            </p>
        </div>
    );
};

export default RegisterForm;
