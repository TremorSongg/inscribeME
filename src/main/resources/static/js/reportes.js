document.getElementById('form-reporte').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Obtenemos el ID del usuario desde la sesión del navegador
    const usuarioId = sessionStorage.getItem('userId');
    
    // Verificamos si el usuario ha iniciado sesión
    if (!usuarioId) {
        Swal.fire('Error', 'Debes iniciar sesión para poder enviar un reporte.', 'error');
        return; // Detenemos la función si no hay sesión
    }
    
    const mensaje = document.getElementById('mensaje').value;

    // Verificamos que el mensaje no esté vacío
    if (!mensaje.trim()) {
        Swal.fire('Atención', 'Por favor, escribe el detalle de tu reporte.', 'warning');
        return;
    }

    const datos = {
        usuarioId: parseInt(usuarioId),
        mensaje: mensaje
    };

    try {
        Swal.fire({
            title: 'Enviando reporte',
            html: 'Por favor espera...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch('/api/reportes/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Reporte enviado!',
                text: 'Gracias por tu ayuda. Tu reporte ha sido enviado correctamente.',
                showConfirmButton: true
            }).then(() => {
                // Redirigimos al usuario a la página de notificaciones para que vea la confirmación
                window.location.href = "notificaciones.html";
            });
        } else {
            const error = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: error || 'Ocurrió un error al enviar el reporte',
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor. Inténtalo más tarde.',
        });
    }
});