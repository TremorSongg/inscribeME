import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import AboutPage from './pages/AboutPage'
import Navbar from './components/Navbar'
import ProductPage from './pages/ProductPage'
import LoginAdmin from './pages/Admin/LoginAdminPage'
import ProfilePage from './pages/ProfilePage'






function App() {

  return (
    <Router>
      <main className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/cursos" element={<ProductPage />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
      </main>
    </Router>
      
  )
} 

export default App
