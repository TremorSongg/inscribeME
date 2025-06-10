const API_URL = '/api/cursos';

// ▼▼▼ 1. FUNCIÓN NUEVA PARA CARGAR LOS INSTRUCTORES ▼▼▼
async function cargarInstructores() {
    try {
        const response = await fetch('/api/usuarios/instructores');
        if (!response.ok) throw new Error('No se pudo cargar la lista de instructores.');

        const instructores = await response.json();
        const select = document.getElementById('instructor');
        
        select.innerHTML = '<option value="" disabled selected>Selecciona un instructor</option>'; // Opción por defecto
        
        instructores.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = instructor.nombre; // Asumiendo que el Usuario tiene un campo 'nombre'
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        const select = document.getElementById('instructor');
        select.innerHTML = '<option value="" disabled selected>Error al cargar instructores</option>';
    }
}


// ▼▼▼ 2. MODIFICACIÓN EN DOMCONTENTLOADED ▼▼▼
document.addEventListener('DOMContentLoaded', () => {
    cargarCursos();
    cargarInstructores(); // Se añade la llamada para llenar el menú de instructores

    const form = document.getElementById('curso-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Lectura de todos los campos del formulario
        const id = document.getElementById('curso-id').value;
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        const cupoTotal = parseInt(document.getElementById('cupoTotal').value);
        const fechaInicio = document.getElementById('fechaInicio').value;
        const fechaFin = document.getElementById('fechaFin').value;
        
        // ▼▼▼ 3. LÓGICA NUEVA PARA OBTENER Y ENVIAR EL INSTRUCTOR ▼▼▼
        const instructorId = document.getElementById('instructor').value;

        // Construimos el objeto curso completo
        const curso = { 
            nombre, 
            descripcion, 
            precio, 
            cupoTotal,
            cupoDisponible: id ? undefined : cupoTotal,
            fechaInicio,
            fechaFin,
            // Estructura clave para que Spring Boot asocie por ID
            instructor: {
                id: instructorId 
            }
        };

        try {
            if (id) {
                await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(curso)
                });
            } else {
                await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(curso)
                });
            }
            form.reset();
            document.getElementById('curso-id').value = '';
            cargarCursos();
        } catch (err) {
            console.error('Error al guardar curso:', err);
            alert('Error al guardar el curso. Revisa la consola para más detalles.');
        }
    });
});

async function cargarCursos() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Error al cargar cursos');
        const cursos = await res.json();
        const tabla = document.getElementById('tabla-cursos');
        tabla.innerHTML = '';

        cursos.forEach(curso => {
            const fila = document.createElement('tr');
            
            // Verificamos que esta plantilla genere una celda para el instructor
            fila.innerHTML = `
                <td>${curso.id}</td>
                <td>${curso.nombre}</td>
                <td>${curso.descripcion || '-'}</td>
                <td>$${curso.precio.toLocaleString()}</td>
                <td>${curso.cupoDisponible} / ${curso.cupoTotal}</td>
                <td>${curso.nombreInstructor || 'N/A'}</td>
                <td>
                    <button class="btn btn-editar btn-sm" onclick="editarCurso(${curso.id})">Editar</button>
                    <button class="btn btn-eliminar btn-sm" onclick="eliminarCurso(${curso.id})">Eliminar</button>
                </td>
            `;
            tabla.appendChild(fila);
        });
    } catch (err) {
        console.error('Error al cargar cursos:', err);
    }
}

async function editarCurso(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const curso = await res.json();

        document.getElementById('curso-id').value = curso.id;
        document.getElementById('nombre').value = curso.nombre;
        document.getElementById('descripcion').value = curso.descripcion || '';
        document.getElementById('precio').value = curso.precio;
        document.getElementById('cupoTotal').value = curso.cupoTotal;
        document.getElementById('fechaInicio').value = curso.fechaInicio;
        document.getElementById('fechaFin').value = curso.fechaFin;
        
        // También pre-seleccionamos el instructor al editar
        if (curso.instructor) {
            document.getElementById('instructor').value = curso.instructor.id;
        }

    } catch (err) {
        console.error('Error al obtener curso:', err);
    }
}

async function eliminarCurso(id) {
    if (!confirm('¿Estás seguro de eliminar este curso?')) return;
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        cargarCursos();
    } catch (err) {
        console.error('Error al eliminar curso:', err);
    }
}