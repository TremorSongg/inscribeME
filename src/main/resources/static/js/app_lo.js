API_URL = "http://localhost:8080/api/usuarios/login";

function register() {
    const nombre = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    // ▼▼▼ LÍNEA NUEVA A AGREGAR ▼▼▼
    const telefono = document.getElementById("regTelefono").value; 

    fetch("http://localhost:8080/api/usuarios/registrar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nombre: nombre,
            email: email,
            password: password,
            // ▼▼▼ LÍNEA NUEVA A AGREGAR ▼▼▼
            telefono: telefono 
        })
    })
    .then(res => {
        // ... (el resto de tu función sigue igual)
        if (!res.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return res.json();
    })
    .then(data => {
        alert(`Usuario registrado con ID: ${data.id}`);
        document.getElementById('chk').checked = false;
        
        // Limpiar todos los campos, incluyendo el nuevo
        document.getElementById("regName").value = "";
        document.getElementById("regEmail").value = "";
        document.getElementById("regPassword").value = "";
        // ▼▼▼ LÍNEA NUEVA A AGREGAR ▼▼▼
        document.getElementById("regTelefono").value = "";
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Error al registrar el usuario: " + error.message);
    });
}

function login(){
  fetch(API_URL,{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
  .then(Response => Response.json())
  .then(data => {
        if (data.result === "OK") {
            sessionStorage.setItem("nombreUsuario", data.nombre);
            sessionStorage.setItem("emailUsuario", data.email);
            sessionStorage.setItem("userId", data.id);
            window.location.href = "/index.html";
        } else {
            alert("Acceso denegado.");
        }
    });
}


