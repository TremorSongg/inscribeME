import Footer from "../components/Footer";
import SeccionCupos from "../components/SeccionCupos";
import SeccionInicio from "../components/SeccionInicio";
import Destacados from "../components/Destacados";
import Testimonios from "../components/Testimonios";


const HomePage = () => {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div id="inicio">
                <SeccionInicio />
            </div>
            <div id="destacados">
                <Destacados />
            </div>
            <div id="cursos">
                <SeccionCupos />
            </div>
            <div id="contacto">
                <Testimonios/>
            </div>
            <Footer />
        </div>


    );
    
}

export default HomePage;