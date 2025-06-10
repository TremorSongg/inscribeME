document.addEventListener("DOMContentLoaded", function () {
    fetchCursos();
});

function fetchCursos() {
    fetch("/api/cursos")
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener cursos');
            return response.json();
        })
        .then(cursos => mostrarCursos(cursos))
        .catch(error => {
            console.error("Error al obtener los cursos:", error);
            const lista = document.getElementById("lista-cursos");
            if (lista) {
                lista.innerHTML = `
                <div class="alert alert-danger">
                    Error al cargar los cursos: ${error.message}
                </div>
                `;
            }
        });
}

function mostrarCursos(cursos) {
    const lista = document.getElementById("lista-cursos");
    if (!lista) return;

    lista.innerHTML = "";

    cursos.forEach(curso => {
        const card = document.createElement("div");
        card.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
        
        // La plantilla ahora es más simple y segura
        card.innerHTML = `
            <div class="card shadow-sm h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${curso.nombre}</h5>
                    <p class="card-text flex-grow-1">${curso.descripcion}</p>
                    
                    <p class="card-text"><small class="text-muted"><strong>Instructor:</strong> ${curso.nombreInstructor}</small></p>
                    
                    <div class="mt-auto">
                        <p class="card-text fs-5 fw-bold text-primary mb-2">$${curso.precio.toLocaleString()}</p>
                        <p><strong>Cupos disponibles:</strong> ${curso.cupoDisponible}</p>
                        <button class="btn btn-outline-primary w-100" onclick="agregarAlCarrito(${curso.id})" ${curso.cupoDisponible === 0 ? "disabled" : ""}>
                            ${curso.cupoDisponible > 0 ? "Agregar al carrito" : "Sin cupos"}
                        </button>
                    </div>
                </div>
            </div>
        `;
        lista.appendChild(card);
    });
}

async function agregarAlCarrito(idCurso) {
    try {
        const usuarioId = sessionStorage.getItem("userId");
        if (!usuarioId) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('/api/carrito/agregar', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: parseInt(usuarioId),
                cursoId: idCurso
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "No se pudo agregar el curso al carrito");
        }

        await Swal.fire({
            title: '¡Éxito!',
            text: 'Curso agregado al carrito',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
        });

    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        await Swal.fire('Error', error.message, 'error');
    }
}