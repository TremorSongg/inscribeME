/**
 * URL de la API para el endpoint de login.
 */
const API_URL = "http://localhost:8080/api/usuarios/login";

/**
 * Función de Registro.
 * Toma los datos del formulario de registro y los envía al backend.
 */
function register() {
    // Corregimos los IDs para que coincidan con el HTML del búho.
    const nombre = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const telefono = document.getElementById("reg-tel").value;
    const password = document.getElementById("reg-password").value;

    fetch("http://localhost:8080/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, telefono, password })
    })
    .then(res => {
        if (!res.ok) {
            // Intenta leer un mensaje de error más específico del backend.
            return res.json().then(err => { throw new Error(err.message || 'Error en el registro.') });
        }
        return res.json();
    })
    .then(data => {
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido, ${data.nombre}!`,
            text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
            timer: 2500,
            showConfirmButton: false
        });
        
        // Regresa al formulario de login después de un registro exitoso.
        const toggle = document.getElementById('authToggle');
        toggle.checked = false;
        // Disparamos el evento 'change' manualmente para que el texto del label se actualice.
        toggle.dispatchEvent(new Event('change'));
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error en el Registro',
            text: error.message
        });
        console.error("Error en registro:", error);
    });
}

/**
 * Función de Login.
 * Toma las credenciales del formulario de login y las envía al backend.
 */
function login() {
    // Corregimos los IDs para que coincidan con el HTML del búho.
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.message || 'Credenciales inválidas') });
        }
        return response.json();
    })
    .then(data => {
        // Guarda los datos del usuario en la sesión del navegador.
        sessionStorage.setItem("nombreUsuario", data.nombre);
        sessionStorage.setItem("emailUsuario", data.email);
        sessionStorage.setItem("userId", data.id);
        
        // Muestra una alerta de bienvenida y redirige.
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido de nuevo, ${data.nombre}!`,
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false
        }).then(() => {
            window.location.href = "/index.html"; // Redirige a la página principal.
        });
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: error.message
        });
        console.error("Error en login:", error);
    });
}