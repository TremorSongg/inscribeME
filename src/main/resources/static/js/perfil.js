let fp_instance = null; // Guardará la instancia del calendario Flatpickr
let todasMisInscripciones = []; // Guardará todas las inscripciones para poder restaurar el filtro

// Función para capitalizar nombres
function capitalizar(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Función para cerrar sesión
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = "/login.html";
}

// Devuelve el HTML de la tarjeta de perfil del usuario
function renderizarPerfilCompleto() {
    const nombre = sessionStorage.getItem("nombreUsuario");
    const email = sessionStorage.getItem("emailUsuario");
    const userId = sessionStorage.getItem("userId");

    if (nombre && email) {
        return `
            <div class="card shadow-sm border-0" style="background-color: #ffffff; border-radius: 15px;">
                <div class="card-body p-4 text-center">
                    <div class="mb-4">
                        <img src="/img/default-avatar.gif" alt="Avatar" 
                             class="rounded-circle img-thumbnail" 
                             style="width: 150px; height: 150px; object-fit: cover; border-color: #5b4b8a;">
                    </div>
                    <h2 class="mb-3" style="color: #5b4b8a;">${capitalizar(nombre)}</h2>
                    <div class="d-flex justify-content-center mb-4">
                        <div class="text-start">
                            <p class="mb-2"><i class="fas fa-envelope me-2" style="color: #5b4b8a;"></i> ${email}</p>
                            <p class="mb-0"><i class="fas fa-id-card me-2" style="color: #5b4b8a;"></i> ID: ${userId || 'N/A'}</p>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center gap-3">
                        <button onclick="cerrarSesion()" class="btn btn-outline-primary btn-animado">
                            <i class="fas fa-sign-out-alt me-2"></i>Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        window.location.href = "/login.html";
        return "";
    }
}

// Filtra el calendario para mostrar solo las fechas de un curso
function filtrarCalendarioPorCurso(cursoId) {
    const inscripcionSeleccionada = todasMisInscripciones.find(ins => ins.cursoId === cursoId);
    if (inscripcionSeleccionada) {
        // Llamamos a inicializar con un array de una sola inscripción y el segundo parámetro en 'true' para activar el filtro
        inicializarCalendario([inscripcionSeleccionada], true);
    }
}

// Inicializa o reinicia el calendario
function inicializarCalendario(inscripciones, isFiltered = false) {
    const contenedorCalendario = document.getElementById('calendario-cursos');
    if (!contenedorCalendario) return;

    if (fp_instance) {
        fp_instance.destroy();
    }

    const fechasInicio = new Set(inscripciones.map(ins => ins.fechaInicioCurso));
    const fechasFin = new Set(inscripciones.map(ins => ins.fechaFinCurso));
    
    // Configuramos las opciones base de Flatpickr
    const config = {
        inline: true, // Calendario siempre visible
        locale: 'es', // Opcional: para idioma español (requiere script de localización)
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const fecha = dayElem.dateObj.toISOString().slice(0, 10);
            if (fechasInicio.has(fecha)) {
                dayElem.classList.add('evento-inicio');
                dayElem.setAttribute('title', 'Inicio de curso');
            }
            if (fechasFin.has(fecha)) {
                dayElem.classList.add('evento-fin');
                dayElem.setAttribute('title', 'Fin de curso');
            }
        }
    };
    
    
    if (isFiltered) {
        const todasLasFechasFiltradas = [...fechasInicio, ...fechasFin];
        config.enable = todasLasFechasFiltradas.length > 0 ? todasLasFechasFiltradas : [""];
    }
    

    fp_instance = flatpickr(contenedorCalendario, config);
}


// Carga las inscripciones del usuario desde la API
async function cargarInscripciones() {
    try {
        const usuarioId = sessionStorage.getItem("userId");
        if (!usuarioId) throw new Error("Debes iniciar sesión");

        const response = await fetch(`/api/inscripciones/usuario/${usuarioId}`);
        
        let inscripciones = [];
        if (response.ok && response.status !== 204) {
            inscripciones = await response.json();
        }
        
        todasMisInscripciones = inscripciones; // Guardamos la lista completa
        renderizarInscripciones(inscripciones);
        
        
        // Esto crea el calendario en un estado neutral, sin fechas coloreadas.
        inicializarCalendario([]);
        // ▲▲▲ FIN DEL CAMBIO ▲▲▲

    } catch (error) {
        console.error("Error:", error);
        document.getElementById("historial-container").innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

// Renderiza la lista de cursos inscritos
function renderizarInscripciones(inscripciones) {
    const container = document.getElementById("historial-container");
    if (!container) return;

    container.innerHTML = '<h2 class="mb-4" style="color: #5b4b8a;">Mis Cursos Inscritos</h2>';

    if (inscripciones.length === 0) {
        container.innerHTML += `<div class="alert alert-info">Aún no te has inscrito a ningún curso.</div>`;
        return;
    }

    container.innerHTML += inscripciones.map(ins => `
        <div class="card mb-3 shadow-sm" 
             onclick='filtrarCalendarioPorCurso(${ins.cursoId})' 
             style="cursor: pointer;"
             title="Haz clic para ver este curso en el calendario">
            <div class="card-header d-flex justify-content-between align-items-center" style="background-color: #f8f9fa;">
                <h5 class="mb-0">${ins.nombreCurso}</h5>
                <span class="badge bg-success">${ins.estado}</span>
            </div>
            <div class="card-body">
                <p class="card-text">${ins.descripcionCurso}</p>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>Inscrito el:</b> ${new Date(ins.fechaInscripcion).toLocaleDateString()}</li>
                    <li class="list-group-item"><b>Inicio del curso:</b> ${new Date(ins.fechaInicioCurso + 'T00:00:00').toLocaleDateString()}</li>
                    <li class="list-group-item"><b>Fin del curso:</b> ${new Date(ins.fechaFinCurso + 'T00:00:00').toLocaleDateString()}</li>
                    <li class="list-group-item"><b>Instructor:</b> ${ins.nombreInstructor || 'No asignado'}</li>
                </ul>
            </div>
        </div>
    `).join('');
}

// Ejecución principal
document.addEventListener("DOMContentLoaded", async () => {
    const perfilContainer = document.getElementById("perfil-container");
    const perfilHtml = renderizarPerfilCompleto();
    if (perfilContainer && perfilHtml) {
        perfilContainer.innerHTML = perfilHtml;
    }

    const resetButton = document.getElementById('reset-calendario-btn');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // Llama a inicializar el calendario con la lista completa y sin filtro
            inicializarCalendario(todasMisInscripciones, false);
        });
    }
    
    await cargarInscripciones();
});