import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas públicas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import ProductPage from "./pages/ProductPage";

// Carrito
import CartPage from "./pages/Cart/CartPage";

// Estudiante
import StudentProfilePage from "./pages/student/StudentProfilePage";

// Instructor
import InstructorProfilePage from "./pages/instructor/InstructorProfilePage";

// Admin
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import CourseManagementPage from "./pages/admin/CourseManagementPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";

function AppContent() {
    const location = useLocation();
    
    // Rutas donde NO queremos mostrar el Navbar ni el Footer
    const hideLayout = ["/login", "/registro"].includes(location.pathname);

    return (
        <div className="App flex flex-col min-h-screen w-full items-stretch">
            {!hideLayout && <Navbar />}
            
            {/* El contenedor de las rutas crecerá (flex-1) para empujar el footer siempre al fondo */}
            <main className="flex-1 w-full">
                <Routes>
                    {/* ── Rutas públicas ───────────────────── */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/registro" element={<RegisterPage />} />
                            <Route path="/nosotros" element={<AboutPage />} />
                            <Route path="/cursos" element={<ProductPage />} />

                            {/* ── Carrito (estudiante) ─────────────── */}
                            <Route
                                path="/carrito"
                                element={
                                    <ProtectedRoute allowedRoles={["ESTUDIANTE"]}>
                                        <CartPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ── Perfil estudiante ────────────────── */}
                            <Route
                                path="/perfil"
                                element={
                                    <ProtectedRoute allowedRoles={["ESTUDIANTE"]}>
                                        <StudentProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ── Instructor ───────────────────────── */}
                            <Route
                                path="/instructor/perfil"
                                element={
                                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                                        <InstructorProfilePage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/instructor/notificaciones"
                                element={
                                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                                        <InstructorProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ── Admin ────────────────────────────── */}
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                                        <AdminDashboardPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/cursos"
                                element={
                                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                                        <CourseManagementPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/notificaciones"
                                element={
                                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                                        <AdminNotificationsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/estudiantes"
                                element={
                                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                                        <AdminStudentsPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* ── Ruta antigua de admin login (redirect) ── */}
                            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

                            {/* ── 404 ──────────────────────────────── */}
                            <Route
                                path="*"
                                element={
                                    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#FAFAFA] text-center px-6">
                                        <div>
                                            <p className="text-8xl font-black text-neutral-900">404</p>
                                            <p className="mt-4 text-xl font-bold text-neutral-600">Página no encontrada</p>
                                            <a
                                                href="/"
                                                className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 font-bold text-white hover:bg-sky-700 transition shadow-md shadow-sky-600/10"
                                            >
                                                Volver al inicio
                                            </a>
                                        </div>
                                    </div>
                                }
                            />
                </Routes>
            </main>

            {!hideLayout && <Footer />}
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;