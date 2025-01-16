const URL_HOJA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRuJJvaYFIAMYl3T8DK_hXCc7qb_Zz63o4uvqBHR0sfAArtsExFKtcxVKvmr4WbXLQsgI1TVniuVHy/pubhtml';

function procesarContenidoCelda(celda, indice, celdas) {
    if (!celda.textContent.trim()) return '';
    
    let contenido = celda.outerHTML
        .replace(/<td[^>]*>/g, '')
        .replace(/<\/td>/g, '')
        .replace(/style="/g, 'style="display: inline; ');
    
    // negrita y sufijos
    if (indice !== 1) contenido = `<span class="bold">${contenido}</span>`;
    if (indice === 2) contenido += `<span class="bold"> EXP</span>`;
    if (indice === 3) contenido += `<span class="bold">G</span>`;
    
    // puntuación
    const indicesConContenido = Array.from(celdas)
        .map((c, i) => c.textContent.trim() ? i : -1)
        .filter(i => i !== -1);
    
    if (indice >= 2 && indice !== indicesConContenido[indicesConContenido.length - 1]) {
        contenido += indice === indicesConContenido[indicesConContenido.length - 2] ? ' y ' : ', ';
    }
    
    return contenido;
}

async function cargarDatosHoja() {
    try {
        const respuesta = await fetch(`${URL_HOJA}?timestamp=${new Date().getTime()}`);
        if (!respuesta.ok) throw new Error(`Error HTTP, estado: ${respuesta.status}`);
        
        const documento = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
        const tabla = documento.querySelector('table');
        
        if (tabla) {
            const contenidoHTML = Array.from(tabla.querySelectorAll('tr'))
                .map(fila => {
                    const celdas = fila.querySelectorAll('td');
                    const contenidoFila = Array.from(celdas)
                        .map((celda, indice) => procesarContenidoCelda(celda, indice, celdas))
                        .filter(Boolean)
                        .join(' ');
                    
                    // punto final
                    const tieneContenidoDespuesSegundaColumna = Array.from(celdas)
                        .slice(2)
                        .some(celda => celda.textContent.trim() !== '');
                    
                    return contenidoFila ? `<p>${contenidoFila.trim()}${tieneContenidoDespuesSegundaColumna ? '.' : ''}</p>` : '';
                })
                .join('');
            
            document.getElementById('sheet-data').innerHTML = 
                `<div class="sheet-content">${contenidoHTML}</div>`;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

window.onload = cargarDatosHoja;
setInterval(cargarDatosHoja, 30000);
