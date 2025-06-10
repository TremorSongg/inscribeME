document.getElementById('form-reporte').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datos = {
        // no se le da un número directamente porque puede confundir,
        //  mejor asegurarse de que es un número con esta línea
        usuarioId: parseInt(document.getElementById('usuarioId').value),
        mensaje: document.getElementById('mensaje').value
    };

    try {
        // Mostrar alerta de carga mientras carga el reporte
        Swal.fire({
            title: 'Enviando reporte',
            html: 'Por favor espera...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        //hace petición POST en la ruta para crear y se define formato JSON
        const response = await fetch('/api/reportes/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Reporte enviado!',
                text: 'Tu reporte ha sido enviado correctamente',
                showConfirmButton: true,
                timer: 3000
            }).then(() => {
                // Redirigir después de cerrar la alerta
                window.location.href = "notificaciones.html";
            });
        } else {
            const error = await response.text();
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: error || 'Ocurrió un error al enviar el reporte',
                confirmButtonText: 'Entendido'
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor',
            confirmButtonText: 'Entendido'
        });
    }
});