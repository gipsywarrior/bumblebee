const URL_HOJA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRuJJvaYFIAMYl3T8DK_hXCc7qb_Zz63o4uvqBHR0sfAArtsExFKtcxVKvmr4WbXLQsgI1TVniuVHy/pubhtml';

// Función para procesar celdas del historial
function procesarCeldaHistorial(celda, indice, celdas) {
    if (!celda.textContent.trim()) return '';
    
    let contenido = celda.outerHTML
        .replace(/<td[^>]*>/g, '')
        .replace(/<\/td>/g, '')
        .replace(/style="/g, 'style="display: inline; ');
    
    if (indice !== 1) contenido = `<span class="bold">${contenido}</span>`;
    if (indice === 2) contenido += `<span class="bold"> EXP</span>`;
    if (indice === 3) contenido += `<span class="bold">G</span>`;
    
    const indicesConContenido = Array.from(celdas)
        .map((c, i) => c.textContent.trim() ? i : -1)
        .filter(i => i !== -1);
    
    if (indice >= 2 && indice !== indicesConContenido[indicesConContenido.length - 1]) {
        contenido += indice === indicesConContenido[indicesConContenido.length - 2] ? ' y ' : ', ';
    }
    
    return contenido;
}

// Función para procesar celdas de datos básicos
function procesarCeldaDatosBasicos(celda, indice) {
    if (!celda.textContent.trim()) return '';
    
    const contenido = celda.textContent.trim();
    if (indice === 0) {
        return `<span><b>${contenido}:</b> `;
    } else if (indice === 1) {
        return `${contenido}</span>`;
    }
    return '';
}

// Función para cargar historial
async function cargarHistorial() {
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
                        .map((celda, indice) => procesarCeldaHistorial(celda, indice, celdas))
                        .filter(Boolean)
                        .join(' ');
                    
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
        console.error('Error al cargar historial:', error);
    }
}

// Función para cargar datos básicos
async function cargarDatosBasicos() {
    try {
        const respuesta = await fetch(`${URL_HOJA}?timestamp=${new Date().getTime()}`);
        if (!respuesta.ok) throw new Error(`Error HTTP, estado: ${respuesta.status}`);
        
        const documento = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
        const tablas = documento.querySelectorAll('table');
        
        if (tablas && tablas.length > 1) {
            const tablaDatosBasicos = tablas[1];
            
            // Actualizar stats primero
            const filaStats = tablaDatosBasicos.querySelectorAll('tr')[1];
            if (filaStats) {
                const celdas = filaStats.querySelectorAll('td');
                const stats = {
                    'stat-vit': 3,
                    'stat-en': 4,
                    'stat-pm': 5,
                    'stat-vol': 6,
                    'stat-vel': 7
                };

                Object.entries(stats).forEach(([id, index]) => {
                    const elemento = document.getElementById(id);
                    if (elemento && celdas[index]) {
                        const valor = celdas[index].textContent.trim();
                        if (valor) elemento.textContent = valor;
                    }
                });
            }
            
            // Procesar datos básicos
            const contenidoHTML = Array.from(tablaDatosBasicos.querySelectorAll('tr'))
                .slice(1)
                .map(fila => {
                    const celdas = fila.querySelectorAll('td');
                    return Array.from(celdas)
                        .map((celda, indice) => procesarCeldaDatosBasicos(celda, indice))
                        .join('');
                })
                .filter(Boolean)
                .join('');

            const dataContainer = document.querySelector('.informacion-basica .data');
            const statsDiv = document.querySelector('.informacion-basica .stats');
            
            if (dataContainer) {
                // Preservar el div de stats y su estado
                const isShowingStats = statsDiv && getComputedStyle(statsDiv).display === 'flex';
                
                // Mantener el div de stats existente
                if (statsDiv) {
                    dataContainer.innerHTML = contenidoHTML;
                    dataContainer.appendChild(statsDiv);
                } else {
                    dataContainer.innerHTML = contenidoHTML;
                }
                
                // Restaurar el estado de visualización
                const spans = dataContainer.querySelectorAll('span:not(.stats)');
                if (isShowingStats) {
                    if (statsDiv) statsDiv.style.display = 'flex';
                    spans.forEach(span => span.style.display = 'none');
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar datos básicos:', error);
    }
}

// Switch datos/stats
document.addEventListener('DOMContentLoaded', () => {
    const switchButton = document.querySelector('.switch');
    
    if (switchButton) {
        switchButton.addEventListener('click', () => {
            switchSound.currentTime = 0;
            switchSound.play();
            
            const statsElement = document.querySelector('.informacion-basica .stats');
            const dataSpans = document.querySelectorAll('.informacion-basica .data span:not(.stats)');
            
            const isShowingStats = statsElement && getComputedStyle(statsElement).display === 'flex';
            
            if (isShowingStats) {
                if (statsElement) statsElement.style.display = 'none';
                dataSpans.forEach(span => span.style.display = 'block');
                switchButton.textContent = 'Stats';
            } else {
                if (statsElement) statsElement.style.display = 'flex';
                dataSpans.forEach(span => span.style.display = 'none');
                switchButton.textContent = 'Datos';
            }
        });
    }
});

// Inicialización
window.onload = () => {
    cargarHistorial();
    cargarDatosBasicos();
};
