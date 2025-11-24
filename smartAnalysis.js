// Configuración del Backend
const PYTHON_BACKEND = 'http://localhost:5000/api/python';

console.log("1. Script smartAnalysis.js cargado correctamente.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("2. DOM cargado. Buscando elementos...");

    const plantSelect = document.getElementById('plant-select');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingArea = document.getElementById('loading-area');
    const resultArea = document.getElementById('analysis-result');

    // Verificación de elementos
    if (!plantSelect) console.error("ERROR CRÍTICO: No se encontró 'plant-select' en el HTML");
    if (!analyzeBtn) console.error("ERROR CRÍTICO: No se encontró 'analyze-btn' en el HTML");

    if (plantSelect) {
        console.log("3. Elemento select encontrado. Iniciando carga de plantas...");
        loadPlants(plantSelect);
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            console.log("Botón Analizar presionado.");
            // ... (resto de la lógica del botón) ...
            const plantId = plantSelect.value;
            const plantName = plantSelect.options[plantSelect.selectedIndex].text;

            if (!plantId) {
                alert("Please select a plant first.");
                return;
            }

            analyzeBtn.disabled = true;
            loadingArea.classList.remove('d-none');
            resultArea.classList.add('d-none');

            try {
                console.log(`Consultando sensor para planta ID: ${plantId}`);
                const sensorResp = await fetch(`${PYTHON_BACKEND}/latest-reading/${plantId}`);
                
                if (!sensorResp.ok) {
                    throw new Error(`Error sensor: ${sensorResp.status}`);
                }
                const sensorData = await sensorResp.json();
                console.log("Datos sensor recibidos:", sensorData);
                
                console.log("Enviando a IA...");
                const aiResp = await fetch(`${PYTHON_BACKEND}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        temperature: sensorData.data.temperature,
                        humidity: sensorData.data.humidity,
                        plant_name: plantName
                    })
                });

                const aiResult = await aiResp.json();
                console.log("Respuesta IA:", aiResult);

                if (aiResult.status === 'success') {
                    renderResults(sensorData.data, aiResult);
                    loadingArea.classList.add('d-none');
                    resultArea.classList.remove('d-none');
                } else {
                    throw new Error(aiResult.message || "AI Analysis failed.");
                }

            } catch (error) {
                console.error("Error en proceso de análisis:", error);
                alert("Error: " + error.message);
                loadingArea.classList.add('d-none');
            } finally {
                analyzeBtn.disabled = false;
            }
        });
    }
});

// Función de carga con logs detallados
async function loadPlants(selectElement) {
    const url = `${PYTHON_BACKEND}/plants`;
    console.log(`4. Intentando conectar a: ${url}`);

    try {
        const response = await fetch(url);
        console.log(`5. Respuesta del servidor: ${response.status}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("6. Datos recibidos (JSON):", data);

        if (data.status === 'success') {
            selectElement.innerHTML = '<option value="" selected disabled>Select a crop...</option>';
            
            if (data.data.length === 0) {
                console.warn("7. La lista de plantas está vacía.");
                selectElement.innerHTML = '<option disabled>No plants found in DB</option>';
                return;
            }

            data.data.forEach(plant => {
                const option = document.createElement('option');
                option.value = plant.id;
                // Usamos 'plant_name' porque así lo definimos en tu repositorio SQL
                option.textContent = `${plant.plant_name} (ID: ${plant.id})`;
                selectElement.appendChild(option);
            });
            console.log(`8. Se cargaron ${data.data.length} plantas en el dropdown.`);
        } else {
            console.error("Error en status del JSON:", data);
            selectElement.innerHTML = '<option>Error: ' + data.message + '</option>';
        }

    } catch (e) {
        console.error("9. EXCEPCIÓN al cargar plantas:", e);
        selectElement.innerHTML = '<option>Connection Error</option>';
    }
}

function renderResults(sensorData, apiResponse) {
    // ... (tu función renderResults original) ...
    // Asegúrate de copiarla aquí si la borraste
    const pred = apiResponse.prediction;
    const weather = apiResponse.weather_forecast_used;
    const aiFull = apiResponse.ai_analysis_full;

    document.getElementById('res-temp').textContent = sensorData.temperature.toFixed(1) + "°C";
    document.getElementById('res-hum').textContent = sensorData.humidity.toFixed(1) + "%";
    document.getElementById('res-pred-hum').textContent = pred.formatted_val;
    document.getElementById('res-rain').textContent = weather.forecast_rain + "%";
    document.getElementById('res-wind').textContent = weather.forecast_wind + " km/h";

    const alertBox = document.getElementById('ai-alert-box');
    const icon = document.getElementById('ai-icon');
    
    alertBox.className = `alert d-flex align-items-center gap-3 alert-${pred.alert_level}`;
    
    if (pred.alert_level === 'CRITICAL') icon.className = 'bx bxs-error-alt fs-1';
    else if (pred.alert_level === 'WARNING') icon.className = 'bx bxs-flag-alt fs-1';
    else if (pred.alert_level === 'OPTIMAL') icon.className = 'bx bxs-check-circle fs-1';
    else icon.className = 'bx bxs-info-circle fs-1';

    document.getElementById('ai-title').textContent = aiFull.title || "Analysis Complete";
    document.getElementById('ai-message').textContent = aiFull.message || pred.status_message;
    document.getElementById('ai-action').textContent = aiFull.action || pred.recommendation;
}