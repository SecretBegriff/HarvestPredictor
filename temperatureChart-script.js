// temperatureChart-script.js - Versión actualizada
let temperatureChart = null;

function initializeTemperatureChart(initialData = null) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Datos por defecto (se actualizarán con datos reales)
    const defaultData = {
        labels: ['01/09', '02/09', '03/09', '04/09', '05/09', '06/09', '07/09'],
        datasets: [{
            label: '°C',
            data: [34, 42, 41, 39, 36, 38, 37],
            backgroundColor: '#E99449',
            borderRadius: 6,
            barPercentage: 0.9,
            categoryPercentage: 0.5,
        }]
    };

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: initialData || defaultData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Degrees Celsius'
                    },
                    grid: {
                        color: '#DCE8F2'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Función para actualizar el gráfico con datos reales
function updateChartWithRealData(sensorData) {
    if (!sensorData || sensorData.length === 0) return;
    
    // Procesar datos para el gráfico (últimos 7 días como ejemplo)
    const last7Readings = sensorData.slice(0, 7);
    const labels = last7Readings.map(reading => {
        const date = new Date(reading.reading_timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    }).reverse();
    
    const temperatures = last7Readings.map(reading => reading.temperature).reverse();
    
    const chartData = {
        labels: labels,
        datasets: [{
            label: '°C',
            data: temperatures,
            backgroundColor: '#E99449',
            borderRadius: 6,
            barPercentage: 0.9,
            categoryPercentage: 0.5,
        }]
    };
    
    if (temperatureChart) {
        temperatureChart.data = chartData;
        temperatureChart.update();
    } else {
        initializeTemperatureChart(chartData);
    }
}

// Inicializar el gráfico cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    initializeTemperatureChart();
});

// Hacer la función global para que pueda ser llamada desde otros scripts
window.updateTemperatureChart = updateChartWithRealData;