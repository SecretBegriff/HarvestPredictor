// Espera a que el DOM (Document Object Model) esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // CAJA 1: Main prediction of the field
    // ----------------------------------------------------

    document.getElementById('next-harvest-day').textContent =
        'Próxima Cosecha: ' + dashboardData.mainPrediction.nextHarvestDay;

    document.getElementById('countdown').textContent =
        'Tiempo restante: ' + dashboardData.mainPrediction.countdown;

    document.getElementById('error-percentage').textContent =
        'Margen de Error: ' + dashboardData.mainPrediction.errorPercentage;


    // ----------------------------------------------------
    // CAJA 2: Plant / Estimated days (Lista Dinámica)
    // ----------------------------------------------------

    const plantList = document.getElementById('plant-list');

    // Recorremos el array de estados de las plantas
    dashboardData.plantStatus.forEach(plant => {
        // Creamos un nuevo elemento de lista (<li>)
        const listItem = document.createElement('li');

        // Asignamos el contenido, combinando el nombre y el progreso
        listItem.textContent = `${plant.name}: ${plant.progress} días estimados`;

        // Agregamos el nuevo elemento a la lista (<ul>) en el HTML
        plantList.appendChild(listItem);
    });

    // ----------------------------------------------------
    // CAJA 3: Factors affecting the predictions
    // ----------------------------------------------------

    document.getElementById('temp-factor').textContent =
        dashboardData.affectingFactors.temperature;

    document.getElementById('humidity-factor').textContent =
        dashboardData.affectingFactors.humidity;


// ----------------------------------------------------
// CAJA 4: Pie chart - Plant / Estimated days
// ----------------------------------------------------
const boxes = document.querySelectorAll('.caja');
const targetBox = boxes[boxes.length - 1];

if (targetBox && Array.isArray(dashboardData.plantStatus) && dashboardData.plantStatus.length) {
  const labels = dashboardData.plantStatus.map(p => p.name);

  // Toma el número antes de la barra si viene como "1 / 90"
  const data = dashboardData.plantStatus.map(p => {
    if (typeof p.progress === 'number') return p.progress;
    if (typeof p.progress === 'string') {
      const m = p.progress.match(/(\d+)\s*\/\s*(\d+)/); // "1 / 90"
      if (m) return parseInt(m[1], 10);                 // ← usa "1"
      const n = p.progress.match(/\d+/);                // fallback: primer número
      if (n) return parseInt(n[0], 10);
    }
    return 0;
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'plantsPie';
  canvas.style.width  = '100%';
  canvas.style.height = '420px';
  targetBox.innerHTML = '';
  targetBox.appendChild(canvas);

  new Chart(canvas.getContext('2d'), {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        borderWidth: 0,
        backgroundColor: ['#4dc9f6','#f67019','#f53794','#537bc4','#acc236']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 8, bottom: 8, left: 8, right: 8 } },
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 14 } },
        title:  { display: true, text: 'Progreso por planta (días)' }
      }
    }
  });
}




});
