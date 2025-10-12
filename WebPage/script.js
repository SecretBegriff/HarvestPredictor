// script.js

document.addEventListener('DOMContentLoaded', () => {
  // --- Tarjeta 1: Predicción Principal ---
  document.getElementById('harvest-day').textContent = dashboardData.mainPrediction.nextHarvestDay;
  document.getElementById('countdown').textContent = dashboardData.mainPrediction.countdown;
  document.getElementById('error-percentage').textContent = dashboardData.mainPrediction.errorPercentage;

  // --- Tarjeta 2: Lista de Plantas ---
  const plantList = document.getElementById('plant-list');
  // Limpiamos la lista por si acaso
  plantList.innerHTML = ''; 
  
  // Recorremos la lista de plantas en los datos y creamos un elemento por cada una
  dashboardData.plantStatus.forEach(plant => {
    const listItem = document.createElement('li'); // Crea un <li>
    listItem.className = 'plant-item'; // Le asigna una clase para estilos
    listItem.innerHTML = `<span>${plant.name}</span><strong>${plant.progress}</strong>`;
    plantList.appendChild(listItem); // Añade el <li> a la lista <ul>
  });

  // --- Tarjeta 3: Factores ---
  document.getElementById('temperature-factor').textContent = dashboardData.affectingFactors.temperature;
  document.getElementById('humidity-factor').textContent = dashboardData.affectingFactors.humidity;
});