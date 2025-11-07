// URL base del backend Python
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

// Función para cargar datos en tiempo real del dashboard
async function loadDashboardData() {
    try {
        const response = await fetch(`${PYTHON_BACKEND}/dashboard-data`);
        const result = await response.json();
        
        if (result.status === 'success') {
            updateDashboardCards(result.data);
            updateTemperatureChart(result.data);
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Función para actualizar las tarjetas con datos reales
function updateDashboardCards(data) {
    if (data && data.length > 0) {
        // Tomar la última lectura de la primera planta como ejemplo
        const latestData = data[0];
        
        // Actualizar tarjeta de estado del campo
        document.querySelector('.card:nth-child(1) .info-fila:nth-child(1) strong').textContent = 
            `${latestData.temperature}°C`;
        document.querySelector('.card:nth-child(1) .info-fila:nth-child(2) strong').textContent = 
            `${latestData.humidity}%`;
        document.querySelector('.card:nth-child(1) .info-fila:nth-child(3) strong').textContent = 
            new Date().toLocaleTimeString();
        
        // Aquí puedes agregar la lógica para actualizar la predicción
        // cuando implementes el modelo de predicción
    }
}

// Función para actualizar el gráfico con datos reales
function updateTemperatureChart(data) {
    // Esta función se integrará con tu chart existente
    console.log('Datos para el gráfico:', data);
}

// Cargar datos cuando la página se abra
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    setInterval(loadDashboardData, 30000);
});