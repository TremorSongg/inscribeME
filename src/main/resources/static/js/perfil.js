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

// Función para renderizar el perfil a la izquierda
function renderizarPerfilCompleto() {
  const nombre = sessionStorage.getItem("nombreUsuario");
  const email = sessionStorage.getItem("emailUsuario");
  const userId = sessionStorage.getItem("userId");

  if (nombre && email) {
    const perfilContainer = document.getElementById("perfil-container");
    if (!perfilContainer) return;

    perfilContainer.innerHTML = `
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
  }
}

// Función para cargar historial
async function cargarHistorial() {
  try {
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) throw new Error("Debes iniciar sesión");

    const response = await fetch(`/api/historial/usuario/${usuarioId}`);
    if (!response.ok) throw new Error("Error al cargar historial");

    const historial = await response.json();
    renderizarHistorial(historial);
  } catch (error) {
    console.error("Error:", error);
    Swal.fire('Error', error.message, 'error');
  }
}

// Renderizar historial en la columna central
function renderizarHistorial(compras) {
  const container = document.getElementById("historial-container");
  if (!container) return;

  if (compras.length === 0) {
    container.innerHTML = `<div class="alert alert-info">No hay compras registradas</div>`;
    return;
  }

  container.innerHTML = compras.map(compra => `
    <div class="card mb-3">
      <div class="card-header">
        ${new Date(compra.fechaCompra).toLocaleDateString()} - ${compra.nombreCurso}
      </div>
      <div class="card-body">
        <p>Cantidad: ${compra.cantidad}</p>
        <p>Total: $${compra.subtotal.toFixed(2)}</p>
      </div>
    </div>
  `).join('');
}

// Ejecución principal
document.addEventListener("DOMContentLoaded", async () => {
  renderizarPerfilCompleto();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('compra_exitosa') === 'true') {
    await Swal.fire('¡Compra exitosa!', 'Tu historial ha sido actualizado', 'success');
  }

  await cargarHistorial();
});
