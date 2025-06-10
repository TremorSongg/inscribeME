// Función principal para cargar el carrito
async function loadCarrito() {
  try {
    const container = document.getElementById("carrito-container");
    if (!container) throw new Error("No se encontró el contenedor del carrito");

    container.innerHTML = `
      <div class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando tu carrito...</p>
      </div>
    `;

    // Aquí sacamos usuarioId del sessionStorage
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) throw new Error("Usuario no identificado");

    const response = await fetch(`/api/v1/carrito?usuarioId=${usuarioId}`);
    if (!response.ok) throw new Error("Error al cargar el carrito");

    const data = await response.json();
    const items = data.items || [];
    const total = data.total || 0;

    // Carrito vacío
    if (items.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info" style="background-color:rgb(158, 119, 184); color:rgb(255, 255, 255);">
          <h4 class="alert-heading">Tu carrito está vacío</h4>
          <p>Agrega cursos desde nuestra tienda para comenzar.</p>
          <a href="cursos.html" class="btn btn-primary">Ver Cursos</a>
        </div>
      `;
      return;
    }

    // Generar HTML para items
    let itemsHTML = items.map(item => `
      <div class="carrito-item border p-3 mb-3 rounded shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h5>${item.nombre}</h5>
            <p class="mb-1">Cantidad: ${item.cantidad}</p>
            <p class="mb-1">Precio unitario: $${(item.precioUnitario ?? 0).toFixed(2)}</p>
            <p class="fw-bold">Subtotal: $${(item.subtotal ?? 0).toFixed(2)}</p>
          </div>
          <img src="${item.imagen || 'https://img.icons8.com/stickers/50/classroom.png'}" alt="${item.nombre}" 
               style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
        </div>
        <div class="item-actions d-flex gap-2 mt-3">
          <button onclick="updateQuantity(${item.cursoId}, ${item.cantidad - 1})" 
                  class="btn btn-outline-secondary" ${item.cantidad <= 1 ? 'disabled' : ''}>
            ➖
          </button>
          <button onclick="updateQuantity(${item.cursoId}, ${item.cantidad + 1})" 
                  class="btn btn-outline-secondary">
            ➕
          </button>
          <button onclick="removeFromCart(${item.cursoId})" 
                  class="btn btn-outline-danger ms-auto">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');

    // Total y botones acción
    container.innerHTML = itemsHTML + `
      <div class="total-section border-top pt-3 mt-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="mb-0">Total:</h4>
          <h4 class="mb-0">$${total.toFixed(2)}</h4>
        </div>
        <div class="d-flex justify-content-between">
          <button onclick="clearCart()" class="btn btn-outline-danger">
            Vaciar Carrito
          </button>
          <button onclick="checkout()" class="btn btn-success btn-lg">
            Finalizar Compra
          </button>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("carrito-container").innerHTML = `
      <div class="alert alert-danger">
        <h4 class="alert-heading">Error al cargar el carrito</h4>
        <p>${error.message}</p>
        <button onclick="loadCarrito()" class="btn btn-warning mt-2">
          Reintentar
        </button>
      </div>
    `;
  }
}

// Actualizar cantidad de un item en el carrito
async function updateQuantity(cursoId, newQuantity) {
  if (newQuantity < 1) return;

  try {
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) throw new Error("Usuario no identificado");

    const response = await fetch(`/api/carrito?usuarioId=${usuarioId}&cursoId=${cursoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: newQuantity })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al actualizar cantidad");
    }

    await loadCarrito();
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
}

// Remover un curso del carrito
async function removeFromCart(cursoId) {
  const usuarioId = sessionStorage.getItem("userId");
  if (!usuarioId) {
    Swal.fire("Error", "Usuario no identificado. Por favor inicia sesión.", "error");
    return;
  }

  const { isConfirmed } = await Swal.fire({
    title: "¿Eliminar este curso?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!isConfirmed) return;

  try {
    // Cambié la URL para que incluya usuarioId (depende de backend)
    const response = await fetch(`/api/carrito/eliminar/${cursoId}?usuarioId=${usuarioId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al eliminar el curso");
    }

    await loadCarrito();
    Swal.fire("Eliminado", "El curso fue removido del carrito", "success");
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
}

// Vaciar todo el carrito
async function removeFromCart(cursoId) {
  const usuarioId = sessionStorage.getItem("userId");
  if (!usuarioId) {
    Swal.fire("Error", "Usuario no identificado. Por favor inicia sesión.", "error");
    return;
  }

  const { isConfirmed } = await Swal.fire({
    title: "¿Eliminar este curso?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!isConfirmed) return;

  try {
    // Cambié la URL para que incluya usuarioId (depende de backend)
    const response = await fetch(`/api/carrito/eliminar/${cursoId}?usuarioId=${usuarioId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al eliminar el curso");
    }

    await loadCarrito();
    Swal.fire("Eliminado", "El curso fue removido del carrito", "success");
  } catch (error) {
    Swal.fire("Error", error.message, "error");
  }
}

// Finalizar compra (checkout)
async function checkout() {
  const usuarioId = sessionStorage.getItem("userId");
  if (!usuarioId) {
    Swal.fire("Error", "Usuario no identificado. Por favor inicia sesión.", "error");
    return;
  }

  const { isConfirmed } = await Swal.fire({
    title: "¿Finalizar compra?",
    html: `
      <p>Estás a punto de confirmar tu compra.</p>
      <p>Se descontarán los cursos de nuestro inventario.</p>
    `,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Confirmar compra",
    cancelButtonText: "Seguir comprando"
  });

  if (!isConfirmed) return;

  try {
    const response = await fetch(`/api/carrito/comprar?usuarioId=${usuarioId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al finalizar la compra");
    }

    await Swal.fire({
      title: "¡Compra exitosa!",
      html: `
        <div class="text-center">
          <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
          <h3>Gracias por tu compra</h3>
          <p class="mt-3">Los cursos han sido reservados para ti.</p>
          <p>Recibirás un correo con los detalles de tu compra.</p>
        </div>
      `,
      confirmButtonText: "Aceptar",
      customClass: { popup: 'border-success' }
    });

    await loadCarrito();
  } catch (error) {
    Swal.fire({
      title: "Error en la compra",
      text: error.message,
      icon: "error",
      confirmButtonText: "Entendido"
    });
  }
}

// Cargar el carrito cuando la página esté lista
document.addEventListener("DOMContentLoaded", loadCarrito);
