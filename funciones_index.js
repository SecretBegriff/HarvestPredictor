// URL base del backend Python
const PYTHON_BACKEND = 'http://localhost:5000/api/python';
const VERTEX_AI_URL = 'https://mint-predictor-541521882439.us-central1.run.app';

// Función para cargar datos en tiempo real del dashboard
async function loadDashboardData() {
    try {
        const response = await fetch(`${PYTHON_BACKEND}/dashboard-data`);       
        const result = await response.json();
        
        if (result.status === 'success') {
            updateDashboardCards(result.data);
            loadPredictions(result.data);
        } else {
            console.error('Error en la respuesta del servidor:', result.message);
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Mostrar datos por defecto si hay error
        showDefaultData();
    }
}

// Función para cargar predicciones usando Cloud Run
async function loadPredictions(dashboardData) {
    try {
        if (!dashboardData || dashboardData.length === 0) {
            showDefaultPredictions();
            return;
        }

        // Tomar los datos más recientes del dashboard
        const latestData = dashboardData[0];
        
        // Preparar payload para Vertex AI (similar a generatePredictions.js)
        const temperature = Number(latestData.temperature) || 20;
        const humidity = Number(latestData.humidity) || 60;
        const plantName = latestData.plant_type_name || "mint";

        const now = new Date();
        const readingTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

        const vertexPayload = {
            plant_id: latestData.plant_id?.toString() || "1",
            crop_type: plantName,
            reading_timestamp: readingTimestamp,
            temperature_c: temperature,
            humidity_pct: humidity,
            day_of_cycle: 10
        };

        // Llamar a Cloud Run para obtener predicciones
        const vertexResponse = await fetch(VERTEX_AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vertexPayload)
        });

        if (!vertexResponse.ok) {
            throw new Error('Error en servicio de Vertex/Cloud Run');
        }

        const vertexData = await vertexResponse.json();

        // Actualizar la tarjeta de predicciones con los datos de Vertex AI
        updatePredictionCard(vertexData, plantName);

    } catch (error) {
        console.error('Error cargando predicciones:', error);
        // En caso de error, usar datos por defecto basados en la planta
        loadFallbackPredictions(dashboardData);
    }
}

// Función de respaldo si Cloud Run falla
async function loadFallbackPredictions(dashboardData) {
    try {
        const latestData = dashboardData[0];
        const plantName = latestData.plant_type_name || "mint";
        
        // Llamar al endpoint local para predicciones básicas
        const response = await fetch(`${PYTHON_BACKEND}/fallback-predictions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                plant: plantName,
                temperature: latestData.temperature,
                humidity: latestData.humidity
            })
        });

        if (response.ok) {
            const fallbackData = await response.json();
            updatePredictionCard(fallbackData, plantName);
        } else {
            showDefaultPredictions();
        }
    } catch (error) {
        console.error('Error cargando predicciones de respaldo:', error);
        showDefaultPredictions();
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

// Función para actualizar la tarjeta de predicciones con datos reales
function updatePredictionCard(predictionData, plantName) {
    const nextHarvestElement = document.querySelector('#dash_next_harvest strong');
    const countdownElement = document.querySelector('#dash_countdown strong');

    if (!nextHarvestElement || !countdownElement) {
        console.error('Elementos de predicción no encontrados en el DOM');
        return;
    }
    
    if (predictionData && predictionData.days_to_harvest !== undefined) {
        const daysToHarvest = parseFloat(predictionData.days_to_harvest);
        
        // Calcular fecha de cosecha
        const harvestDate = new Date();
        harvestDate.setDate(harvestDate.getDate() + daysToHarvest);
        
        // Actualizar next harvest day
        if (nextHarvestElement) {
            nextHarvestElement.textContent = formatDate(harvestDate);
        }
        
        // Actualizar countdown
        if (countdownElement) {
            if (daysToHarvest === 1) {
                countdownElement.textContent = '1 day';
            } else if (daysToHarvest > 1) {
                countdownElement.textContent = `${Math.ceil(daysToHarvest)} days`;
            } else if (daysToHarvest === 0) {
                countdownElement.textContent = 'Today!';
            } else {
                countdownElement.textContent = 'Ready to harvest!';
            }
        }
        
        console.log(`Predicción actualizada: ${daysToHarvest} días para cosecha de ${plantName}`);
        
    } else {
        // Si no hay datos de predicción, mostrar valores por defecto
        showDefaultPredictions();
    }
}

// Función para mostrar predicciones por defecto
function showDefaultPredictions() {
    const nextHarvestElement = document.querySelector('#dash_next_harvest strong');
    const countdownElement = document.querySelector('#dash_countdown strong');
    
    // Fecha por defecto: 25 días desde hoy
    const defaultHarvestDate = new Date();
    defaultHarvestDate.setDate(defaultHarvestDate.getDate() + 25);
    
    if (nextHarvestElement) nextHarvestElement.textContent = formatDate(defaultHarvestDate);
    if (countdownElement) countdownElement.textContent = '25 days';
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
        day: 'numeric',
        year: 'numeric'
    });
}

// Cargar datos cuando la página se abra
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cargando datos del dashboard...');
    loadDashboardData();
    
    // Actualizar cada 30 segundos
    setInterval(loadDashboardData, 30000);
});

async function downloadReport() {
    try {
        // Mostrar indicador de carga
        const downloadBtn = document.querySelector('a[href="#"].btn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generating report...';
        
        const response = await fetch(`${PYTHON_BACKEND}/generate-report`);
        
        if (!response.ok) {
            throw new Error('Error generating report');
        }
        
        // Crear blob y descargar
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `harvest_report_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Restaurar botón
        downloadBtn.innerHTML = originalText;
        
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Error generating report: ' + error.message);
        
        // Restaurar botón en caso de error
        const downloadBtn = document.querySelector('a[href="#"].btn');
        downloadBtn.innerHTML = '<i class="bx bxs-report"></i> Download report';
    }
}

// Agregar event listener al botón
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('a[href="#"].btn');
    if (downloadBtn && downloadBtn.innerHTML.includes('bxs-report')) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            downloadReport();
        });
    }
});