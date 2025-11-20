document.getElementById('prediction-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const plantName = document.getElementById('plantName').value;
  if (!plantName) return alert('Por favor, ingresa el nombre de la planta.');

  // 1. Mostrar estado de carga
  const resultCard = document.getElementById('result');
  resultCard.style.display = 'block';
  
  // Poner "..." mientras carga
  ['optimalTemp', 'optimalHumidity', 'currentTemp', 'currentHumidity'].forEach(id => {
      document.getElementById(id).textContent = 'Calculando...';
  });

  // 2. Pedir datos a Python
  fetch('http://127.0.0.1:5000/api/predict', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ plant: plantName })
  })
  .then(response => {
    if (!response.ok) throw new Error('Error del servidor');
    return response.json();
  })
  .then(data => {
    if (data.error) throw new Error(data.error);

    // 3. Insertar datos en el HTML (DOM Update)
    // Usamos una función helper para manejar nulos limpiamente
    const setVal = (id, val) => {
        document.getElementById(id).textContent = (val !== null && val !== undefined) ? val : 'N/A';
    };

    setVal('optimalTemp', data.optimal_temp);
    setVal('optimalHumidity', data.optimal_humidity);
    
    // Ahora llenamos también los actuales
    setVal('currentTemp', data.current_temp);
    setVal('currentHumidity', data.current_humidity);
  })
  .catch(err => {
    console.error(err);
    alert('Error: ' + err.message);
  });
});