// JavaScript para el modal de Plant Type
document.addEventListener('DOMContentLoaded', function() {
    const openPlantTypeModalBtn = document.getElementById('openPlantTypeModal');
    const closePlantTypeModalBtn = document.getElementById('closePlantTypeModal');
    const savePlantTypeBtn = document.getElementById('savePlantType');
    const plantTypeModal = document.getElementById('plantTypeModal');
    
    // URL base del backend Python
    const PYTHON_BACKEND = 'http://localhost:5000/api/python';

    openPlantTypeModalBtn.addEventListener('click', function() {
        plantTypeModal.classList.add('show');
        resetPlantTypeForm();
    });
    
    closePlantTypeModalBtn.addEventListener('click', function() {
        plantTypeModal.classList.remove('show');
        resetPlantTypeForm();
    });

    savePlantTypeBtn.addEventListener('click', function() {
        createPlantType();
    });

    // Función para crear nuevo tipo de planta
    async function createPlantType() {
        try {
            const plantTypeData = {
                name: document.getElementById('plantTypeName').value,
                optimal_temp_min: parseFloat(document.getElementById('optimalTempMin').value),
                optimal_temp_max: parseFloat(document.getElementById('optimalTempMax').value),
                optimal_humidity_min: parseFloat(document.getElementById('optimalHumidityMin').value),
                optimal_humidity_max: parseFloat(document.getElementById('optimalHumidityMax').value),
                harvest_days: parseInt(document.getElementById('harvestDays').value)
            };

            // Validaciones básicas
            if (!plantTypeData.name) {
                alert('Please enter a plant type name');
                return;
            }

            if (plantTypeData.optimal_temp_min >= plantTypeData.optimal_temp_max) {
                alert('Minimum temperature must be less than maximum temperature');
                return;
            }

            if (plantTypeData.optimal_humidity_min >= plantTypeData.optimal_humidity_max) {
                alert('Minimum humidity must be less than maximum humidity');
                return;
            }

            if (plantTypeData.harvest_days <= 0) {
                alert('Harvest days must be greater than 0');
                return;
            }

            const response = await fetch(`${PYTHON_BACKEND}/plant-types`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(plantTypeData)
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Plant type created successfully!');
                plantTypeModal.classList.remove('show');
                resetPlantTypeForm();
                // Recargar los tipos de planta en el formulario principal
                loadPlantTypes();
            } else {
                alert('Error creating plant type: ' + result.message);
            }
        } catch (error) {
            console.error('Error creating plant type:', error);
            alert('Error creating plant type');
        }
    }

    // Función para resetear el formulario
    function resetPlantTypeForm() {
        document.getElementById('plantTypeName').value = '';
        document.getElementById('optimalTempMin').value = '';
        document.getElementById('optimalTempMax').value = '';
        document.getElementById('optimalHumidityMin').value = '';
        document.getElementById('optimalHumidityMax').value = '';
        document.getElementById('harvestDays').value = '';
    }

    // Función para cargar tipos de planta en el select principal
    async function loadPlantTypes() {
        try {
            const response = await fetch(`${PYTHON_BACKEND}/plant-types`);
            const result = await response.json();
            
            if (result.status === 'success') {
                updatePlantTypesSelect(result.data);
            }
        } catch (error) {
            console.error('Error loading plant types:', error);
        }
    }

    // Función para actualizar el select de tipos de planta
    function updatePlantTypesSelect(plantTypes) {
        const plantTypeSelect = document.getElementById('plantType');
        if (!plantTypeSelect) return;

        // Guardar la selección actual
        const currentSelection = plantTypeSelect.value;
        
        // Limpiar opciones existentes (excepto la primera opción por defecto)
        while (plantTypeSelect.options.length > 1) {
            plantTypeSelect.remove(1);
        }

        // Agregar nuevas opciones
        plantTypes.forEach(plantType => {
            const option = document.createElement('option');
            option.value = plantType.id;
            option.textContent = plantType.name;
            plantTypeSelect.appendChild(option);
        });

        // Restaurar selección anterior si existe
        if (currentSelection && plantTypeSelect.querySelector(`option[value="${currentSelection}"]`)) {
            plantTypeSelect.value = currentSelection;
        }
    }

    // Cargar tipos de planta al iniciar
    loadPlantTypes();
});