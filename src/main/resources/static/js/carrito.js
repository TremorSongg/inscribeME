// Función principal para cargar el carrito
async function loadCarrito() {
    const container = document.getElementById("carrito-container");
    const usuarioId = sessionStorage.getItem("userId");

    if (!usuarioId) {
        container.innerHTML = `<div class="alert alert-warning">Debes <a href="login.html">iniciar sesión</a> para ver tu carrito.</div>`;
        return;
    }

    try {
        // URL ajustada a la nueva API
        const response = await fetch(`/api/carrito/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Error al cargar el carrito del servidor.");

        const carrito = await response.json(); // Ahora esperamos un CarritoDTO
        const items = carrito.items || [];
        const total = carrito.total || 0;
        
        // ... (el resto del código para mostrar el carrito vacío o lleno es idéntico al que ya tenías, solo asegúrate de que los campos coincidan con el DTO)
        // Ejemplo de un item:
        // <h5>${item.nombreCurso}</h5>
        // <p>Precio unitario: $${item.precioUnitario.toFixed(2)}</p>
        // <p>Subtotal: $${item.subtotal.toFixed(2)}</p>
        // Y los botones:
        // onclick="removeFromCart(${item.cursoId})"

        // COPIA Y PEGA TODO TU CÓDIGO HTML DE RENDERIZADO AQUÍ, ESTÁ BIEN.
        // SOLO ASEGÚRATE DE USAR `item.nombreCurso` en vez de `item.nombre`, etc.
        // Aquí te dejo el renderizado ajustado por si acaso:
        
        if (items.length === 0) {
             container.innerHTML = `
               <div class="alert alert-info text-center">
                 <h4 class="alert-heading">Tu carrito está vacío</h4>
                 <p>Agrega cursos desde nuestra tienda para comenzar.</p>
                 <a href="cursos.html" class="btn btn-primary">Ver Cursos</a>
               </div>
             `;
             return;
        }

        let itemsHTML = items.map(item => `
            <div class="carrito-item border p-3 mb-3 rounded shadow-sm">
                <h5>${item.nombreCurso}</h5>
                <p class="mb-1">Precio: $${item.precioUnitario.toLocaleString()}</p>
                <div class="text-end">
                    <button onclick="removeFromCart(${item.cursoId})" class="btn btn-outline-danger btn-sm">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML + `
            <div class="total-section border-top pt-3 mt-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0">Total:</h4>
                    <h4 class="mb-0">$${total.toLocaleString()}</h4>
                </div>
                <div class="d-flex justify-content-between">
                    <button onclick="clearCart()" class="btn btn-danger">Vaciar Carrito</button>
                    <button onclick="checkout()" class="btn btn-success btn-lg">Finalizar Compra</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

// Remover un curso del carrito
async function removeFromCart(cursoId) {
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) return;

    // URL ajustada a la nueva API
    try {
        const response = await fetch(`/api/carrito/item/${cursoId}?usuarioId=${usuarioId}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error('Error al eliminar el item.');
        await loadCarrito();
    } catch(error) {
        Swal.fire("Error", error.message, "error");
    }
}

// Vaciar todo el carrito
async function clearCart() {
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) return;
    
    // ... (El Swal de confirmación que tenías está bien)
    const { isConfirmed } = await Swal.fire({
        title: '¿Vaciar todo el carrito?',
        icon: 'warning', showCancelButton: true,
        confirmButtonText: 'Sí, vaciar', cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    try {
        // URL ajustada a la nueva API
        const response = await fetch(`/api/carrito/vaciar?usuarioId=${usuarioId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al vaciar el carrito.');
        await loadCarrito();
        Swal.fire('Vaciado', 'Tu carrito ha sido vaciado.', 'success');
    } catch(error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Finalizar compra (checkout)
async function checkout() {
    const usuarioId = sessionStorage.getItem("userId");
    if (!usuarioId) return;

    // ... (El Swal de confirmación que tenías está perfecto)
    const { isConfirmed } = await Swal.fire({
        title: '¿Finalizar compra?', icon: 'question',
        showCancelButton: true, confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    try {
        // URL ajustada a la nueva API
        const response = await fetch(`/api/carrito/comprar?usuarioId=${usuarioId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Error al procesar la compra.');
        }
        await Swal.fire('¡Compra exitosa!', 'Gracias por tu compra. Tus cursos han sido inscritos.', 'success');
        await loadCarrito();
    } catch (error) {
        Swal.fire('Error en la compra', error.message, 'error');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Solo ejecuta la función si estamos en la página que tiene el contenedor del carrito
    if (document.getElementById("carrito-container")) {
        loadCarrito();
    }
});