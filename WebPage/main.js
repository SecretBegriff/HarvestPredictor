// main.js

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

});