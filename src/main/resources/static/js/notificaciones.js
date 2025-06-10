document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = sessionStorage.getItem('userId');
    if (!usuarioId) {
        document.getElementById('tabla-notificaciones').innerHTML = `
            <tr><td colspan="3" class="text-center text-danger">Debes iniciar sesión para ver tus notificaciones.</td></tr>`;
        return;
    }
    
    try {
        const response = await fetch(`/api/notificaciones/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Error al cargar notificaciones");
        
        const notificaciones = await response.json();
        renderizarNotificaciones(notificaciones);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('tabla-notificaciones').innerHTML = `
            <tr><td colspan="3" class="text-center text-danger">Error al cargar notificaciones.</td></tr>
        `;
    }
});

function renderizarNotificaciones(notificaciones = []) {
    const tbody = document.getElementById('tabla-notificaciones');
    
    if (notificaciones.length === 0) {
        // La fila de "sin notificaciones" ya está en el HTML, solo nos aseguramos de que se vea
        document.getElementById('sin-notificaciones').style.display = '';
        tbody.innerHTML = ''; // Limpiamos por si acaso
        tbody.appendChild(document.getElementById('sin-notificaciones'));
        return;
    }

    // Ocultamos el mensaje de "sin notificaciones" y limpiamos la tabla
    document.getElementById('sin-notificaciones').style.display = 'none';
    tbody.innerHTML = ''; 

    notificaciones.forEach(notificacion => {
        const tr = document.createElement('tr');
        tr.className = notificacion.leido ? 'leido' : 'no-leido fw-bold'; // Clase para diferenciar leídas/no leídas

        const fechaFormateada = new Date(notificacion.fecha).toLocaleString('es-CL');

        tr.innerHTML = `
            <td><i class="fas fa-bell text-primary"></i></td>
            <td>${notificacion.mensaje}</td>
            <td>${fechaFormateada}</td>
            <td><span class="badge ${notificacion.leido ? 'bg-secondary' : 'bg-primary'}">${notificacion.leido ? 'Leída' : 'Nueva'}</span></td>
        `;
        tbody.appendChild(tr);
    });
}