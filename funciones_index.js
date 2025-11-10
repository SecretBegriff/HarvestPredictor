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
        } else {
            console.error('Error en la respuesta del servidor:', result.message);
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Mostrar datos por defecto si hay error
        showDefaultData();
    }
}

// Función para actualizar las tarjetas con datos reales
function updateDashboardCards(data) {
    if (data && data.length > 0) {
        // Tomar la última lectura (primera en el array ya que está ordenado por timestamp DESC)
        const latestData = data[0];
        
        console.log('Datos recibidos para dashboard:', latestData);
        
        // Actualizar tarjeta de estado del campo usando los IDs
        const tempElement = document.querySelector('#dash_temp strong');
        const humidityElement = document.querySelector('#dash_humidity strong');
        const lastUpdateElement = document.querySelector('#dash_last_update strong');
        
        if (tempElement && latestData.temperature !== null) {
            tempElement.textContent = `${latestData.temperature}°C`;
        }
        
        if (humidityElement && latestData.humidity !== null) {
            humidityElement.textContent = `${latestData.humidity}%`;
        }
        
        if (lastUpdateElement) {
            let timestampText;
            if (latestData.reading_timestamp) {
                // Formatear el timestamp del sensor
                const sensorTime = new Date(latestData.reading_timestamp);
                timestampText = formatDateTime(sensorTime);
            } else {
                // Usar hora actual si no hay timestamp
                timestampText = formatDateTime(new Date());
            }
            lastUpdateElement.textContent = timestampText;
        }
        
        // Actualizar también la tarjeta de predicciones si hay datos
        updatePredictionCard(data);
        
    } else {
        // Si no hay datos, mostrar valores por defecto
        showDefaultData();
    }
}

// Función para actualizar la tarjeta de predicciones
function updatePredictionCard(data) {
    // Por ahora mostramos datos estáticos
    
    const nextHarvestElement = document.querySelector('#dash_next_harvest strong');
    const countdownElement = document.querySelector('#dash_countdown strong');
    const errorElement = document.querySelector('#dash_error strong');
    
    if (nextHarvestElement) {
        // Ejemplo: calcular fecha de cosecha basada en fecha de plantación + 90 días
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + 25);
        nextHarvestElement.textContent = formatDate(harvestDate);
    }
    
    if (countdownElement) {
        countdownElement.textContent = '25 days';
    }
    
    if (errorElement) {
        errorElement.textContent = '5.35%';
    }
}

// Función para mostrar datos por defecto cuando hay error
function showDefaultData() {
    const tempElement = document.querySelector('#dash_temp strong');
    const humidityElement = document.querySelector('#dash_humidity strong');
    const lastUpdateElement = document.querySelector('#dash_last_update strong');
    
    if (tempElement) tempElement.textContent = '25°C';
    if (humidityElement) humidityElement.textContent = '60%';
    if (lastUpdateElement) {
        lastUpdateElement.textContent = formatDateTime(new Date());
    }
}

// Función para formatear fecha y hora
function formatDateTime(date) {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        // Si es hoy, mostrar solo la hora
        return `Today ${date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        })}`;
    } else {
        // Si no es hoy, mostrar fecha completa
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    }
}

// Función para formatear fecha (para predicciones)
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Función para actualizar el gráfico con datos reales
function updateTemperatureChart(data) {
    // Esta función se integrará con tu chart existente
    console.log('Datos para el gráfico:', data);
    
    // Si tienes datos históricos, puedes actualizar el gráfico aquí
    if (data && data.length > 0 && window.updateChartWithRealData) {
        // Llamar a la función del gráfico si existe
        window.updateChartWithRealData(data);
    }
}

// Cargar datos cuando la página se abra
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cargando datos del dashboard...');
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    setInterval(loadDashboardData, 30000);
});