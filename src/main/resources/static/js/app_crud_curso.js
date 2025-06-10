// Aqui se define la lógica para manejar el CRUD de cursos
// src/main/resources/static/js/app_crud_curso.js
const API_URL = '/api/cursos';

// Esta funcion sirve para cargar los cursos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarCursos();

  const form = document.getElementById('curso-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('curso-id').value;
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const cupos = parseInt(document.getElementById('cupos').value);

    const curso = { nombre, descripcion, precio, cupos };

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
      alert('Error al guardar el curso. Revisa la consola.');
    }
  });
});

// Esta función carga los cursos desde la API y los muestra en una tabla (td)
async function cargarCursos() {
  try {
    const res = await fetch(API_URL);
    const cursos = await res.json();
    const tabla = document.getElementById('tabla-cursos');
    tabla.innerHTML = '';

    cursos.forEach(curso => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${curso.id}</td>
        <td>${curso.nombre}</td>
        <td>${curso.descripcion || '-'}</td>
        <td>$${curso.precio.toLocaleString()}</td>
        <td>${curso.cupos}</td>
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

// Esta función edita un curso específico al hacer clic en el botón "Editar",
// toma los datos del curso y los coloca en el formulario para que el usuario pueda modificarlos
async function editarCurso(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const curso = await res.json();

    document.getElementById('curso-id').value = curso.id;
    document.getElementById('nombre').value = curso.nombre;
    document.getElementById('descripcion').value = curso.descripcion || '';
    document.getElementById('precio').value = curso.precio;
    document.getElementById('cupos').value = curso.cupos;
  } catch (err) {
    console.error('Error al obtener curso:', err);
  }
}

// Esta función elimina un curso específico al hacer clic en el botón "Eliminar", muestra una confirmación antes de eliminarlos
async function eliminarCurso(id) {
  if (!confirm('¿Estás seguro de eliminar este curso?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarCursos();
  } catch (err) {
    console.error('Error al eliminar curso:', err);
  }
}
