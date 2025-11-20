document.getElementById('prediction-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const plantName = document.getElementById('plantName').value;
  if (!plantName) return alert('Por favor, ingresa el nombre de la planta.');

  // 1. Mostrar resultado y estados de carga
  const resultCard = document.getElementById('result');
  resultCard.style.display = 'block';

  const idsEnCarga = [
    'optimalTemp',
    'optimalHumidity',
    'currentTemp',
    'currentHumidity',
    'predictedDays',
    'predictedYield'
  ];

  idsEnCarga.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Calculando...';
  });

  // Helper para asignar valores de forma segura
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = (val !== null && val !== undefined && val !== '') ? val : 'N/A';
  };

  try {
    // ----------------------------------------------------
    // 2. PRIMERA LLAMADA: Flask local (127.0.0.1:5000)
    // ----------------------------------------------------
    const flaskResponse = await fetch('http://127.0.0.1:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plant: plantName })
    });

    if (!flaskResponse.ok) {
      throw new Error('Error del servidor Flask');
    }

    const flaskData = await flaskResponse.json();
    if (flaskData.error) {
      throw new Error(flaskData.error);
    }

    // 3. Actualizar parámetros que vienen de Flask
    setVal('optimalTemp', flaskData.optimal_temp);
    setVal('optimalHumidity', flaskData.optimal_humidity);
    setVal('currentTemp', flaskData.current_temp);
    setVal('currentHumidity', flaskData.current_humidity);

    // ----------------------------------------------------
    // 4. SEGUNDA LLAMADA: Cloud Run (Vertex AI)
    // ----------------------------------------------------
    // Usamos lo que tenemos de Flask como entrada del modelo.
    // Ajusta estos valores si quieres algo más específico.
    const temperature = Number(flaskData.current_temp) || 20;
    const humidity = Number(flaskData.current_humidity) || 60;

    // Formato simple de timestamp "YYYY-MM-DD HH:MM:SS"
    const now = new Date();
    const readingTimestamp = now.toISOString().slice(0, 19).replace('T', ' ');

    const vertexPayload = {
      plant_id: "1",
      crop_type: plantName || "mint",
      reading_timestamp: readingTimestamp,
      temperature_c: temperature,
      humidity_pct: humidity,
      day_of_cycle: 10
    };

    try {
      const vertexResponse = await fetch(
        'https://mint-predictor-541521882439.us-central1.run.app',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vertexPayload)
        }
      );

      if (!vertexResponse.ok) {
        throw new Error('Error en servicio de Vertex/Cloud Run');
      }

      const vertexData = await vertexResponse.json();

      // Tu función en Cloud Run devuelve algo como:
      // { days_to_harvest: ..., yield_g: ... }
      let daysToHarvest = vertexData.days_to_harvest;
      let yieldG = vertexData.yield_g;

      if (typeof daysToHarvest === 'number') {
        daysToHarvest = daysToHarvest.toFixed(2);
      }
      if (typeof yieldG === 'number') {
        yieldG = yieldG.toFixed(2);
      }

      setVal('predictedDays', daysToHarvest);
      setVal('predictedYield', yieldG);

    } catch (vertexErr) {
      console.error('Error llamando a Cloud Run / Vertex:', vertexErr);
      // Si falla Vertex, no rompemos la página, solo dejamos N/A
      setVal('predictedDays', 'N/A');
      setVal('predictedYield', 'N/A');
    }

  } catch (err) {
    console.error(err);
    alert('Error: ' + err.message);
    // En caso de error general, al menos dejamos algo visible
    setVal('predictedDays', 'N/A');
    setVal('predictedYield', 'N/A');
  }
});