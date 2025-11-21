document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
});

function cargarDashboard() {
    // Llamamos a la ruta especial que creamos en Python para este dashboard
    fetch('http://127.0.0.1:5000/api/predictions-dashboard')
    .then(res => res.json())
    .then(data => {
        if(data.error) {
            console.error("Error del servidor:", data.error);
            document.getElementById('val-harvest-date').textContent = "Sin datos";
            return;
        }

        // ----------------------------------
        // 1. TARJETA: Main Prediction
        // ----------------------------------
        document.getElementById('val-harvest-date').textContent = data.harvest_date;
        document.getElementById('val-days-left').textContent = data.days_left + " días";
        
        const statusEl = document.getElementById('val-status');
        statusEl.textContent = data.status;
        // Si es riesgo = Rojo, Si es saludable = Verde
        statusEl.className = data.status === 'Riesgo' ? 'badge bg-danger' : 'badge bg-success';


        // ----------------------------------
        // 2. TARJETA: Plant Info
        // ----------------------------------
        document.getElementById('val-plant-name').textContent = data.plant_name;
        document.getElementById('val-total-days').textContent = data.total_cycle;
        
        // Cálculo visual de la barra de progreso
        const cycle = data.total_cycle || 90;
        // Días transcurridos = Total - Restantes
        const daysPassed = cycle - data.days_left;
        // Regla de 3 para porcentaje (limitado entre 0 y 100)
        const percent = Math.max(0, Math.min(100, (daysPassed / cycle) * 100));
        
        const bar = document.getElementById('val-progress');
        bar.style.width = percent + "%";
        bar.textContent = Math.round(percent) + "%";


        // ----------------------------------
        // 3. TARJETA: Factores
        // ----------------------------------
        document.getElementById('val-temp-curr').textContent = data.factors.current_temp;
        document.getElementById('val-hum-curr').textContent = data.factors.current_hum;
        document.getElementById('val-plant-date').textContent = data.planting_date;
        
        // Colores dinámicos para diferencias de temperatura
        const tDiff = document.getElementById('val-temp-diff');
        const tVal = data.factors.diff_temp;
        tDiff.textContent = (tVal > 0 ? '+' : '') + tVal + "°C";
        
        // Si la diferencia es mayor a 3 grados, advertencia (Amarillo), si no, verde.
        if (Math.abs(tVal) > 3) {
            tDiff.className = "badge bg-warning text-dark";
        } else {
            tDiff.className = "badge bg-success";
        }
        
        // Diferencia Humedad
        const hDiff = document.getElementById('val-hum-diff');
        const hVal = data.factors.diff_hum;
        hDiff.textContent = (hVal > 0 ? '+' : '') + hVal + "%";
        hDiff.className = "badge bg-secondary";


        // ----------------------------------
        // 4. TARJETA: Gráfico Circular
        // ----------------------------------
        renderDashChart(data.chart.labels, data.chart.values);
    })
    .catch(err => {
        console.error("Error conectando al backend:", err);
        alert("No se pudo conectar con el servidor. Revisa que generatePredictions.py esté corriendo.");
    });
}

function renderDashChart(labels, values) {
    const ctx = document.getElementById('predictionsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut', // Puedes cambiar a 'pie' si prefieres pastel completo
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#7ED957', // Tu verde claro
                    '#234625', // Tu verde oscuro
                    '#aacc00', 
                    '#004b23'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right' // Leyenda a la derecha
                }
            }
        }
    });
}