// newPlant.js - Lógica para el formulario de nueva planta
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

document.addEventListener('DOMContentLoaded', function() {
    loadPlantTypes();
    setupEventListeners();
});

function setupEventListeners() {
    // Formulario principal de planta
    const form = document.getElementById('formNewPlant');
    form.addEventListener('submit', handlePlantSubmit);

    // Modal de tipo de planta
    const openPlantTypeModalBtn = document.getElementById('openPlantTypeModal');
    const closePlantTypeModalBtn = document.getElementById('closePlantTypeModal');
    const savePlantTypeBtn = document.getElementById('savePlantType');
    const plantTypeModal = document.getElementById('plantTypeModal');

    openPlantTypeModalBtn.addEventListener('click', () => {
        plantTypeModal.classList.add('show');
    });

    closePlantTypeModalBtn.addEventListener('click', () => {
        plantTypeModal.classList.remove('show');
        clearPlantTypeForm();
    });

    savePlantTypeBtn.addEventListener('click', handlePlantTypeSubmit);
}

// Cargar tipos de planta en el select
async function loadPlantTypes() {
    try {
        const response = await fetch(`${PYTHON_BACKEND}/plant-types`);
        const result = await response.json();
        
        const select = document.getElementById('plantType');
        select.innerHTML = '<option value="" selected disabled>Select plant type</option>';
        
        if (result.status === 'success' && result.data) {
            result.data.forEach(plantType => {
                const option = document.createElement('option');
                option.value = plantType.id;
                option.textContent = plantType.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading plant types:', error);
        showAlert('Error loading plant types', 'error');
    }
}

// Manejar envío del formulario de planta
async function handlePlantSubmit(event) {
    event.preventDefault();
    
    const formData = {
        plant_type_id: document.getElementById('plantType').value,
        planting_date: document.getElementById('plantingDate').value
    };

    // Validación básica
    if (!formData.plant_type_id || !formData.planting_date) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${PYTHON_BACKEND}/plants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showAlert('Plant created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showAlert('Error creating plant: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error creating plant', 'error');
    }
}

// Manejar envío del formulario de tipo de planta
async function handlePlantTypeSubmit() {
    const formData = {
        name: document.getElementById('plantTypeName').value,
        optimal_temp: parseFloat(document.getElementById('optimalTemp').value),
        optimal_humidity: parseFloat(document.getElementById('optimalHumidity').value)
    };

    // Validación
    if (!formData.name || !formData.optimal_temp || !formData.optimal_humidity) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    try {
        const response = await fetch(`${PYTHON_BACKEND}/plant-types`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showAlert('Plant type created successfully!', 'success');
            clearPlantTypeForm();
            document.getElementById('plantTypeModal').classList.remove('show');
            loadPlantTypes(); // Recargar la lista
        } else {
            showAlert('Error creating plant type: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error creating plant type', 'error');
    }
}

function clearPlantTypeForm() {
    document.getElementById('plantTypeName').value = '';
    document.getElementById('optimalTemp').value = '';
    document.getElementById('optimalHumidity').value = '';
}

function showAlert(message, type) {
    // Crear alerta temporal
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}