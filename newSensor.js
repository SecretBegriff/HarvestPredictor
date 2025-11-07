// newSensor.js - Lógica para el formulario de nuevo sensor
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

document.addEventListener('DOMContentLoaded', function() {
    // Generar ID automático para el sensor
    generateSensorId();
    setupSensorForm();
});

function generateSensorId() {
    // Generar un ID único basado en timestamp
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    document.getElementById('sensorId').value = `SENSOR_${timestamp}_${random}`;
}

function setupSensorForm() {
    const form = document.querySelector('form');
    form.addEventListener('submit', handleSensorSubmit);
}

async function handleSensorSubmit(event) {
    event.preventDefault();
    
    const formData = {
        sensor_id: document.getElementById('sensorId').value,
        sensor_type: document.getElementById('sensorType').value,
        status: document.getElementById('status').value
    };

    // Validación
    if (!formData.sensor_type || !formData.status) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    try {
        // Aquí puedes agregar un endpoint para sensores si lo necesitas
        // Por ahora solo mostramos un mensaje de éxito
        showAlert('Sensor configuration saved successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error saving sensor configuration', 'error');
    }
}

function showAlert(message, type) {
    // Misma función de alerta que en newPlant.js
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
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}