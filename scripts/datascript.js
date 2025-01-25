// URL de la hoja de cálculo
const URL_HOJA = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRuJJvaYFIAMYl3T8DK_hXCc7qb_Zz63o4uvqBHR0sfAArtsExFKtcxVKvmr4WbXLQsgI1TVniuVHy/pubhtml';

// Procesar celdas del historial
function procesarCeldaHistorial(celda, indice, celdas) {
    if (!celda.textContent.trim()) return '';
    
    let contenido = celda.outerHTML
        .replace(/<td[^>]*>/g, '')
        .replace(/<\/td>/g, '')
        .replace(/style="/g, 'style="display: inline; ');
    
    // Verificar si el contenido de la celda comienza con un "-"
    if (indice === 2 || indice === 3) {
        const valor = contenido.trim();
        if (!valor.startsWith('-') && !valor.startsWith('+')) {
            contenido = `+${valor}`;
        }
    }
    
    if (indice !== 1) contenido = `<span class="bold">${contenido}</span>`;
    if (indice === 2) contenido += `<span class="bold"> EXP</span>`;
    if (indice === 3) contenido += `<span class="bold">G</span>`;
    if (indice === 4) contenido += `<span class="bold"> CO</span>`;
    if (indice === 5) contenido += `<span class="bold"> PR</span>`;
    
    const indicesConContenido = Array.from(celdas)
        .map((c, i) => c.textContent.trim() ? i : -1)
        .filter(i => i !== -1);
    
    if (indice >= 2 && indice !== indicesConContenido[indicesConContenido.length - 1]) {
        contenido += indice === indicesConContenido[indicesConContenido.length - 2] ? ' y ' : ', ';
    }
    
    return contenido;
}

// Procesar celdas de datos básicos
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

// Cargar historial
async function cargarHistorial() {
    try {
        const respuesta = await fetch(`${URL_HOJA}?timestamp=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
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

// Cargar datos básicos
async function cargarDatosBasicos() {
    try {
        const respuesta = await fetch(`${URL_HOJA}?timestamp=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (!respuesta.ok) throw new Error(`Error HTTP, estado: ${respuesta.status}`);
        
        const documento = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
        const tablas = documento.querySelectorAll('table');
        
        if (tablas && tablas.length > 2) {
            const tablaDatosBasicos = tablas[1];
            const tablaExperiencia = tablas[2];
            
            // Procesar experiencia y galeones
            const filasExp = Array.from(tablaExperiencia.querySelectorAll('tr')).slice(1);
            const experiencias = [];
            const galeones = [];
            
            filasExp.forEach(fila => {
                const celdas = fila.querySelectorAll('td');
                if (celdas[0] && celdas[0].textContent.trim()) {
                    experiencias.push(celdas[0].textContent.trim());
                }
                if (celdas[1] && celdas[1].textContent.trim()) {
                    galeones.push(celdas[1].textContent.trim());
                }
            });

            // Procesar datos básicos (filas después de la primera)
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

            // Añadir spans de experiencia y galeones
            const expGalHTML = `
                <span><b>Experiencia:</b> ${experiencias.join(' / ')}</span>
                <span><b>Galeones:</b> ${galeones.join(' / ')}</span>
            `;

            const dataContainer = document.querySelector('.informacion-basica .data');
            const statsDiv = document.querySelector('.informacion-basica .stats');
            
            if (dataContainer) {
                const isShowingStats = statsDiv && getComputedStyle(statsDiv).display === 'flex';
                
                if (statsDiv) {
                    dataContainer.innerHTML = contenidoHTML + expGalHTML;
                    dataContainer.appendChild(statsDiv);
                } else {
                    dataContainer.innerHTML = contenidoHTML + expGalHTML;
                }
                
                // Actualizar stats
                const filaStats = tablaDatosBasicos.querySelectorAll('tr')[1];
                if (filaStats) {
                    const celdas = filaStats.querySelectorAll('td');
                    const stats = {
                        'stat-vit': 3,
                        'stat-en': 4,
                        'stat-pm': 5,
                        'stat-vel': 6,
                        'stat-vol': 7
                    };

                    Object.entries(stats).forEach(([id, index]) => {
                        const elemento = document.getElementById(id);
                        if (elemento && celdas[index]) {
                            const valor = celdas[index].textContent.trim();
                            if (valor) elemento.textContent = valor;
                        }
                    });
                }
                
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

// Cargar habilidades
async function cargarHabilidades() {
    try {
        const respuesta = await fetch(`${URL_HOJA}?timestamp=${new Date().getTime()}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        if (!respuesta.ok) throw new Error(`Error HTTP, estado: ${respuesta.status}`);
        
        const documento = new DOMParser().parseFromString(await respuesta.text(), 'text/html');
        const tablas = documento.querySelectorAll('table');
        
        if (tablas && tablas.length > 3) {
            const tablaHabilidades = tablas[3];
            const filas = Array.from(tablaHabilidades.querySelectorAll('tr'));
            
            // Extraer encabezados (primera celda de la segunda fila)
            const encabezados = Array.from(filas[1].querySelectorAll('td')).map(celda => celda.textContent.trim());
            
            // Transponer filas a columnas
            const columnas = encabezados.map((_, colIndex) => 
                filas.slice(2).map(fila => {
                    const celda = fila.querySelectorAll('td')[colIndex];
                    return celda ? celda.textContent.trim() : null;
                }).filter(valor => valor) // Filtrar celdas vacías
            );
            
            // Generar HTML dinámico
            let contenidoHTML = '<h2>Bitácora</h2>';
            columnas.forEach((valoresColumna, colIndex) => {
                contenidoHTML += `<h3>${encabezados[colIndex]}</h3>`;
                contenidoHTML += '<ul>';
                valoresColumna.forEach(valor => {
                    contenidoHTML += `<li>${valor}</li>`;
                });
                contenidoHTML += '</ul>';
            });
            
            // Insertar el contenido generado en #bitacora-data
            const bitacoraData = document.querySelector('.bitacora-data');
            if (bitacoraData) {
                bitacoraData.innerHTML = contenidoHTML;
            }
        }
    } catch (error) {
        console.error('Error al cargar habilidades:', error);
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
    cargarHabilidades();
};
