API_URL = "http://localhost:8080/api/usuarios/login";

function register() {
    const nombre = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const telefono = document.getElementById("regTelefono").value;

    fetch("http://localhost:8080/api/usuarios/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre: nombre,
            email: email,
            password: password,
            telefono: telefono
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return res.json();
    })
    .then(data => {
        Swal.fire({
        icon: 'success',
        title: `¡Bienvenido, ${data.nombre}!`, // Usamos el nombre del usuario
        text: 'Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión.',
        timer: 2500,
        showConfirmButton: false,
        allowOutsideClick: false
    });
        
        // ▼▼▼ CORRECCIÓN AQUÍ ▼▼▼
        // Cambiamos 'chk' por el ID correcto del checkbox que controla el formulario: 'authToggle'
        document.getElementById('authToggle').checked = false;
        // ▲▲▲ FIN DE LA CORRECIÓN ▲▲▲
        
        // Limpiar todos los campos del formulario de registro
        document.getElementById("regName").value = "";
        document.getElementById("regEmail").value = "";
        document.getElementById("regPassword").value = "";
        document.getElementById("regTelefono").value = "";
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Error en el Registro',
            text: error.message
        });
        // Este bloque ya no debería ejecutarse por este motivo
        console.error('Error:', error);
        
    });
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(API_URL, { // API_URL es "http://localhost:8080/api/usuarios/login"
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => {
        // Primero, verificamos si la respuesta del servidor es exitosa (ej. status 200 OK)
        if (!response.ok) {
            // Si no es exitosa (ej. 401 Unauthorized), intentamos leer el mensaje de error del backend
            // y lo lanzamos como un error para que lo capture el .catch()
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Credenciales incorrectas.');
            });
        }
        // Si la respuesta es exitosa, la convertimos a JSON y continuamos
        return response.json();
    })
    .then(data => {
        // Si llegamos aquí, el login fue exitoso.
        
        // 1. Guardamos los datos del usuario en la sesión
        sessionStorage.setItem("nombreUsuario", data.nombre);
        sessionStorage.setItem("emailUsuario", data.email);
        sessionStorage.setItem("userId", data.id);

        // 2. Mostramos la alerta de bienvenida
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido de nuevo, ${data.nombre}!`,
            text: 'Serás redirigido en un momento.',
            timer: 2000, // 2 segundos
            showConfirmButton: false,
            allowOutsideClick: false
        }).then(() => {
            // 3. Redirigimos al index DESPUÉS de que la alerta se cierre
            window.location.href = "/index.html";
        });
    })
    .catch(error => {
        // Capturamos cualquier error, ya sea de red o el que lanzamos arriba
        console.error('Error en el login:', error);
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: error.message // Mostramos el mensaje de error específico
        });
    });
}


