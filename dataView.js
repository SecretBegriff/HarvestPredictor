// URL base del backend Python
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

document.addEventListener('DOMContentLoaded', function() {
    const closeModalBtn = document.getElementById('closeplantModal');
    const plantModal = document.getElementById('plantModal');
    const savePlantBtn = document.getElementById('saveplant');
       
    let currentEditingPlantId = null;

    // Cargar datos al iniciar
    loadRecentReadings();
    loadAllPlants();

    closeModalBtn.addEventListener('click', function() {
        plantModal.classList.remove('show');
        resetModal();
    });

    savePlantBtn.addEventListener('click', function() {
        if (currentEditingPlantId) {
            updatePlant(currentEditingPlantId);
        }
    });

    // Función para cargar lecturas recientes
    async function loadRecentReadings() {
        try {
            const response = await fetch(`${PYTHON_BACKEND}/recent-readings`);
            const result = await response.json();
            
            if (result.status === 'success') {
                updateReadingsTable(result.data);
            } else {
                console.error('Error loading readings:', result.message);
            }
        } catch (error) {
            console.error('Error loading readings:', error);
        }
    }

    // Función para cargar todas las plantas
    async function loadAllPlants() {
        try {
            const response = await fetch(`${PYTHON_BACKEND}/plants`);
            const result = await response.json();
            
            if (result.status === 'success') {
                updatePlantsTable(result.data);
            } else {
                console.error('Error loading plants:', result.message);
            }
        } catch (error) {
            console.error('Error loading plants:', error);
        }
    }

        // Función para actualizar la tabla de lecturas
    function updateReadingsTable(readings) {
        const dataBody = document.querySelector('.data-body');
        dataBody.innerHTML = ''; // Limpiar tabla

        readings.forEach(reading => {
            const row = document.createElement('div');
            row.className = 'data-row visible';
            
            const timestamp = new Date(reading.reading_timestamp);
            const formattedTime = timestamp.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false 
            });
            const formattedDate = timestamp.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            row.innerHTML = `
                <p>${reading.plant_name}</p>
                <p>${reading.humidity}%</p>
                <p>${reading.temperature}°C</p>
                <p>${formattedTime}<br>${formattedDate}</p>
                <p>${reading.sensor_status}</p>
            `;
            
            dataBody.appendChild(row);
        });

        // Aplicar paginación después de cargar los datos
        applyPagination();
    }

    // Función para actualizar la tabla de plantas
    function updatePlantsTable(plants) {
        const plantBody = document.querySelector('.plant-body');
        plantBody.innerHTML = ''; // Limpiar tabla

        plants.forEach(plant => {
            const row = document.createElement('div');
            row.className = 'data-row plant-row';
            
            const plantingDate = new Date(plant.planting_date);
            const formattedDate = plantingDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            row.innerHTML = `
                <p>${plant.plant_type_name}</p>
                <p>${formattedDate}</p>
                <div class="edit-btn" data-plant-id="${plant.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                        <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                    </svg>
                </div>
            `;
            
            plantBody.appendChild(row);
        });

        // Agregar event listeners a los botones de editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                openEditModal(plantId, plants);
            });
        });
    }

        // Función para abrir el modal de edición
    function openEditModal(plantId, plants) {
        const plant = plants.find(p => p.id == plantId);
        if (!plant) return;

        currentEditingPlantId = plantId;
        
        // Llenar el modal con los datos de la planta
        document.getElementById('plantName').value = plant.plant_type_name;
        document.getElementById('plantOptimalTempMin').value = plant.optimal_temp_min;
        document.getElementById('plantOptimalTempMax').value = plant.optimal_temp_max;
        document.getElementById('plantOptimalHumidityMin').value = plant.optimal_humidity_min;
        document.getElementById('plantOptimalHumidityMax').value = plant.optimal_humidity_max;
        document.getElementById('averageHarvestDays').value = plant.harvest_days;
        
        plantModal.classList.add('show');
    }

        // Función para actualizar una planta
    async function updatePlant(plantId) {
        try {
            const plantData = {
                name: document.getElementById('plantName').value,
                optimal_temp_min: Number(document.getElementById('plantOptimalTempMin').value),
                optimal_temp_max: Number(document.getElementById('plantOptimalTempMax').value),
                optimal_humidity_min: Number(document.getElementById('plantOptimalHumidityMin').value),
                optimal_humidity_max: Number(document.getElementById('plantOptimalHumidityMax').value),
                harvest_days: Number(document.getElementById('averageHarvestDays').value)
            };

            const response = await fetch(`${PYTHON_BACKEND}/update-plant/${plantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(plantData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Plant updated successfully!');
                plantModal.classList.remove('show');
                resetModal();
                // Recargar datos
                loadAllPlants();
                loadRecentReadings();
            } else {
                alert('Error updating plant: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating plant:', error);
            alert('Error updating plant');
        }
    }

    // Función para resetear el modal
    function resetModal() {
        currentEditingPlantId = null;
        document.getElementById('plantName').value = '';
        document.getElementById('plantOptimalTempMin').value = '';
        document.getElementById('plantOptimalTempMax').value = '';
        document.getElementById('plantOptimalHumidityMin').value = '';
        document.getElementById('plantOptimalHumidityMax').value = '';
        document.getElementById('averageHarvestDays').value = '';
    }

    function applyPagination() {
        const filasPorPagina = 5;
        const dataBody = document.querySelector(".data-container .data-body");
        const todasLasFilas = Array.from(dataBody.querySelectorAll(":scope > .data-row"));
        const totalFilas = todasLasFilas.length;

        // Remover paginación existente
        const existingPagination = document.querySelector('.pagination-controls');
        if (existingPagination) {
            existingPagination.remove();
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

    // Actualizar datos cada 60 segundos
    setInterval(() => {
        loadRecentReadings();
        loadAllPlants();
    }, 60000);
            
});