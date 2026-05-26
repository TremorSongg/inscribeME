import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

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

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
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
                                    {/* Placeholder — notificaciones del instructor */}
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
                                        <p className="text-8xl font-black text-[#37474F]">404</p>
                                        <p className="mt-4 text-xl font-bold text-[#455A64]">Página no encontrada</p>
                                        <a
                                            href="/"
                                            className="mt-6 inline-block rounded-xl bg-[#FFA000] px-6 py-3 font-bold text-[#212121] hover:bg-[#ffb300] transition"
                                        >
                                            Volver al inicio
                                        </a>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
