// 1. Añadimos la URL del backend, tal como lo hizo tu compañera.
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

// --- Funciones para cargar datos ---

/**
 * Carga los datos de monitoreo en la tabla superior.
 */
async function loadMonitoringData() {
    const dataBody = document.querySelector(".data-container .data-body");
    
    try {
        // 2. Reemplazamos apiFetch() con el 'fetch' completo
        const response = await fetch(`${PYTHON_BACKEND}/dashboard-data`);
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message); // Lanza un error si la API falló
        }

        const data = result.data; // Obtenemos los datos
        
        // Limpia la tabla antes de llenarla
        dataBody.innerHTML = ''; 
        
        if (!data || data.length === 0) {
            dataBody.innerHTML = '<p>No hay lecturas de sensor disponibles.</p>';
            return;
        }

        // Crea el HTML para cada fila de datos
        data.forEach(row => {
            const rowHTML = `
                <div class="data-row visible">
                    <p>${row.plant_type_name}</p>
                    <p>${row.location}</p>
                    <p>${row.humidity.toFixed(1)}%</p>
                    <p>${row.temperature.toFixed(1)}°C</p>
                    <p>${formatApiTimestamp(row.reading_timestamp)}</p>
                    <p>${row.sensor_status}</p>
                </div>
            `;
            dataBody.insertAdjacentHTML('beforeend', rowHTML);
        });
        
        // Vuelve a ejecutar la lógica de paginación después de cargar los datos
        initializePagination();

    } catch (error) {
        console.error("Error cargando datos de monitoreo:", error);
        dataBody.innerHTML = `<p style="color: red;">Error al cargar datos: ${error.message}</p>`;
    }
}

/**
 * Carga la lista de plantas en la tabla inferior.
 */
async function loadPlantList() {
    const plantBody = document.querySelector(".data-container .plant-body");
    
    try {
        // 3. Hacemos lo mismo para la lista de plantas
        const response = await fetch(`${PYTHON_BACKEND}/plants`);
        const result = await response.json();

        if (result.status !== 'success') {
            throw new Error(result.message);
        }

        const plants = result.data;
        
        plantBody.innerHTML = ''; // Limpia la lista

        if (!plants || plants.length === 0) {
            plantBody.innerHTML = '<p>No hay plantas registradas.</p>';
            return;
        }
        
        plants.forEach(plant => {
            plantBody.insertAdjacentHTML('beforeend', `<div class="data-row"><p>${plant.plant_name}</p></div>`);
            plantBody.insertAdjacentHTML('beforeend', `<div class="data-row"><p>${plant.planting_date}</p></div>`);
            plantBody.insertAdjacentHTML('beforeend', `
                <div class="data-row edit-plant-btn" data-plant-id="${plant.id}">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c-1.4-.413-1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                </div>
            `);
        });

    } catch (error) {
        console.error("Error cargando lista de plantas:", error);
        plantBody.innerHTML = `<p style="color: red;">Error al cargar plantas: ${error.message}</p>`;
    }
}

/**
 * Formatea un timestamp de la API (ISO) a un formato legible.
 */
function formatApiTimestamp(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const time = date.toLocaleTimeString('en-GB'); // HH:MM:SS
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${time} <br> ${day}/${month}/${year}`;
}


// --- Lógica del Modal (Tu lógica, pero convertida en función) ---

function initializeModal() {
    const plantBody = document.querySelector(".plant-body");
    const closeModalBtn = document.getElementById('closeLocationModal');
    const locationModal = document.getElementById('locationModal');
    const saveButton = document.getElementById('saveLocation');

    // Escucha clics en el *contenedor* de las plantas
    plantBody.addEventListener('click', function(event) {
        // Busca si el clic fue en un botón de editar
        const editButton = event.target.closest('.edit-plant-btn');
        if (editButton) {
            const plantId = editButton.dataset.plantId;
            console.log("Abriendo modal para editar planta ID:", plantId);
            locationModal.classList.add('show');
        }
    });
            
    closeModalBtn.addEventListener('click', function() {
        locationModal.classList.remove('show');
    });

    saveButton.addEventListener('click', async function() {
        // Lógica de guardar:
        // const data = { ... };
        // await fetch(`${PYTHON_BACKEND}/plants/ID_DE_PLANTA`, { method: 'PUT', body: JSON.stringify(data), ... });
        
        console.log("Guardando cambios... (lógica no implementada)");
        locationModal.classList.remove('show');
    });
}

// --- Lógica de Paginación (Tu lógica, pero convertida en función) ---

function initializePagination() {
    const filasPorPagina = 5;
    const dataBody = document.querySelector(".data-container .data-body");
    const todasLasFilas = Array.from(dataBody.querySelectorAll(":scope > .data-row"));
    const totalFilas = todasLasFilas.length;

    // Limpia controles de paginación viejos
    const oldControls = document.querySelector(".pagination-controls");
    if (oldControls) {
        oldControls.remove();
    }

    if (totalFilas <= filasPorPagina) {
        todasLasFilas.forEach(fila => fila.classList.add('visible'));
        return;
    }

    const totalPaginas = Math.ceil(totalFilas / filasPorPagina);
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-controls");
    dataBody.after(paginationContainer);

    function mostrarPagina(pagina) {
        const startIndex = (pagina - 1) * filasPorPagina;
        const endIndex = startIndex + filasPorPagina;
        todasLasFilas.forEach(fila => fila.classList.remove('visible'));
        todasLasFilas.slice(startIndex, endIndex).forEach(fila => {
            fila.classList.add('visible');
        });
        paginationContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.page) === pagina) {
                btn.classList.add('active');
            }
        });
    }

    for (let i = 1; i <= totalPaginas; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.dataset.page = i;
        pageButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm'); 
        pageButton.addEventListener('click', () => {
            mostrarPagina(i);
        });
        paginationContainer.appendChild(pageButton);
    }

    mostrarPagina(1);
}

// --- Punto de Entrada Principal ---

// Espera a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // Carga los datos de las tablas
    loadMonitoringData(); // Esto AHORA llama a la API y LUEGO llama a initializePagination
    loadPlantList();

    // Configura los botones del modal
    initializeModal();
});