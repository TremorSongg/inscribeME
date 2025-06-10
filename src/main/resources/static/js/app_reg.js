function registrar() {
    fetch("http://localhost:8080/api/usuarios/registrar",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            nombre: document.getElementById("nombre").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    }).then(res => res.json())
        .then(data => alert("usuario registrado con un ID"+ data.id));
}
