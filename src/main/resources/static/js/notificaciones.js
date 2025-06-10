document.addEventListener('DOMContentLoaded', async () => {
    const usuarioId = 1; 
    
    try {
        //se obtienen los reportes con un fetch a la ruta
        const response = await fetch(`/api/reportes/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Error al cargar reportes");
        
        const reportes = await response.json();
        //llama  a la función y si hay error muestra mensaje de error
        renderizarNotificaciones(reportes);
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('tabla-notificaciones').innerHTML = `
            <tr><td colspan="4" class="text-center text-danger">Error al cargar notificaciones.</td></tr>
        `;
    }
});
//obtiene el cuerpo de la tabla tbody
function renderizarNotificaciones(reportes = []) {
    const tbody = document.getElementById('tabla-notificaciones');
    const filaVacia = document.getElementById('sin-notificaciones');
    
    // Limpia tabla exepto las filas vacias
    tbody.innerHTML = ''; // Limpia el contenido del tbody

    // agrega lso reportes a medida que se van generando
    reportes.forEach(reporte => {
        const tr = document.createElement('tr');

        // Formatear fecha
        const fechaFormateada = reporte.fechaCreacion 
            ? new Date(reporte.fechaCreacion).toLocaleString('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
            : "Fecha no disponible";

        const tipoBadge = document.createElement('span');
        tipoBadge.className = 'badge bg-primary'; // actualmente no esta en uso ya que el estado solicitud tiene solo dos valores y bg-primary apunta a un tercer valor
        tipoBadge.textContent = `Reporte #${reporte.id}`;

        const estadoBadge = document.createElement('span');
        estadoBadge.className = reporte.estado === 'PENDIENTE' ? 'badge bg-warning' : 'badge bg-success';
        estadoBadge.textContent = reporte.estado;

        tr.innerHTML = `
            <td>${tipoBadge.outerHTML}</td>
            <td>${reporte.mensaje || "Sin descripción"}</td>
            <td>${fechaFormateada}</td>
            <td>${estadoBadge.outerHTML}</td>
        `;

        tbody.appendChild(tr);
    });

    // Mostrar esta fila y mensaje si no hay reportes por ahora
    if (reportes.length === 0 && filaVacia) {
        filaVacia.style.display = '';
    } else if (filaVacia) {
        // oculta la fila vacia si hay reportes
        filaVacia.style.display = 'none';
    }
}
