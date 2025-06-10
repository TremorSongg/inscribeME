API_URL = "http://localhost:8080/api/usuarios/login";

function register() {
    const nombre = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    fetch("http://localhost:8080/api/usuarios/registrar", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nombre: nombre,
            email: email,
            password: password
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        return res.json();
    })
    .then(data => {
        // Mostrar mensaje de éxito
        alert(`Usuario registrado con ID: ${data.id}`);
        
        // Cambiar automáticamente al formulario de login después del registro
        document.getElementById('chk').checked = false;
        
        // Limpiar los campos del formulario de registro
        document.getElementById("regName").value = "";
        document.getElementById("regEmail").value = "";
        document.getElementById("regPassword").value = "";
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


