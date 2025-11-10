// temperatureChart-script.js - Versión actualizada con datos reales
let temperatureChart = null;
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

// Inicializar gráfica
function initializeTemperatureChart() {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    // Datos por defecto (se actualizarán con datos reales)
    const defaultData = {
        labels: ['Loading...'],
        datasets: [{
            label: 'Temperature (°C)',
            data: [0],
            backgroundColor: '#E99449',
            borderColor: '#D17A29',
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.8,
            categoryPercentage: 0.9,
        }]
    };

    if (temperatureChart) {
        temperatureChart.destroy();
    }

    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: defaultData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#DCE8F2'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Last 7 Days',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Temperature: ${context.parsed.y}°C`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Average Daily Temperature',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Cargar datos reales inmediatamente
    loadHistoricalData();
}

// Cargar datos históricos desde el backend
async function loadHistoricalData() {
    try {
        console.log('Cargando datos históricos...');
        
        const response = await fetch(`${PYTHON_BACKEND}/historical-data`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            updateChartWithHistoricalData(result.data);
            console.log('Datos históricos cargados:', result.data);
        } else {
            console.error('Error en datos históricos:', result.message);
            showDefaultChartData();
        }
    } catch (error) {
        console.error('Error cargando datos históricos:', error);
        showDefaultChartData();
    }
}

// Actualizar gráfica con datos históricos reales
function updateChartWithHistoricalData(historicalData) {
    if (!historicalData || historicalData.length === 0) {
        showDefaultChartData();
        return;
    }

    // Procesar datos para la gráfica
    const labels = historicalData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    });

    const temperatures = historicalData.map(item => item.avg_temperature);
    const humidities = historicalData.map(item => item.avg_humidity);

    // Crear dataset para temperatura (barras)
    const temperatureDataset = {
        label: 'Temperature (°C)',
        data: temperatures,
        backgroundColor: '#E99449',
        borderColor: '#D17A29',
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        yAxisID: 'y',
    };

    // Crear dataset para humedad (línea)
    const humidityDataset = {
        label: 'Humidity (%)',
        data: humidities,
        type: 'line',
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#4A90E2',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        yAxisID: 'y1',
        fill: false
    };

    const chartData = {
        labels: labels,
        datasets: [temperatureDataset, humidityDataset]
    };

    if (temperatureChart) {
        // Actualizar datos
        temperatureChart.data = chartData;
        
        // Actualizar opciones para eje dual
        temperatureChart.options.scales.y1 = {
            beginAtZero: false,
            position: 'right',
            title: {
                display: true,
                text: 'Humidity (%)',
                font: {
                    weight: 'bold'
                }
            },
            grid: {
                drawOnChartArea: false,
            },
            ticks: {
                callback: function(value) {
                    return value + '%';
                }
            }
        };

        // Actualizar tooltips
        temperatureChart.options.plugins.tooltip = {
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        if (context.datasetIndex === 0) {
                            label += `: ${context.parsed.y}°C`;
                        } else {
                            label += `: ${context.parsed.y}%`;
                        }
                    }
                    return label;
                }
            }
        };

        temperatureChart.update();
        
        // Actualizar título de la gráfica
        updateChartTitle(`Temperature & Humidity Trends (Last ${historicalData.length} Days)`);
        
    } else {
        initializeTemperatureChartWithData(chartData);
    }
}

// Mostrar datos por defecto si hay error
function showDefaultChartData() {
    console.log('Mostrando datos de ejemplo para la gráfica...');
    
    // Generar datos de ejemplo para los últimos 7 días
    const labels = [];
    const temperatures = [];
    const baseTemp = 25;
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }));
        
        // Temperatura con variación aleatoria
        temperatures.push(Number((baseTemp + (Math.random() * 8 - 4)).toFixed(1)));
    }

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Temperature (°C) - Example Data',
            data: temperatures,
            backgroundColor: '#E99449',
            borderColor: '#D17A29',
            borderWidth: 2,
            borderRadius: 6,
            barPercentage: 0.8,
            categoryPercentage: 0.9,
        }]
    };

    if (temperatureChart) {
        temperatureChart.data = chartData;
        temperatureChart.update();
        updateChartTitle('Temperature Trend - Example Data');
    }
}

// Función para inicializar gráfica con datos específicos
function initializeTemperatureChartWithData(chartData) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    temperatureChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Temperature (°C)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: '#DCE8F2'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '°C';
                        }
                    }
                },
                y1: {
                    beginAtZero: false,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                if (context.datasetIndex === 0) {
                                    label += `: ${context.parsed.y}°C`;
                                } else {
                                    label += `: ${context.parsed.y}%`;
                                }
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// Actualizar título de la gráfica
function updateChartTitle(title) {
    if (temperatureChart) {
        temperatureChart.options.plugins.title = {
            display: true,
            text: title,
            font: {
                size: 16,
                weight: 'bold'
            },
            padding: 20
        };
        temperatureChart.update();
    }
}

// Función para actualizar datos en tiempo real
function updateChartWithRealTimeData(sensorData) {
    // Esta función puede ser llamada cuando lleguen nuevos datos del sensor
    console.log('Actualizando gráfica con datos en tiempo real:', sensorData);
    
    // Aquí puedes implementar la lógica para agregar puntos en tiempo real
    // Por ahora, recargamos todos los datos históricos
    loadHistoricalData();
}

// Función para forzar actualización de la gráfica
window.refreshTemperatureChart = function() {
    console.log('Actualizando gráfica de temperatura...');
    loadHistoricalData();
};

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando gráfica de temperatura...');
    initializeTemperatureChart();
    
    // Actualizar cada 5 minutos
    setInterval(loadHistoricalData, 300000);
});

// Hacer funciones globales para acceso externo
window.updateChartWithRealData = updateChartWithHistoricalData;
window.loadHistoricalData = loadHistoricalData;