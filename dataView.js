document.addEventListener('DOMContentLoaded', function() {
    const openModalBtn = document.getElementById('openLocationModal');
    const closeModalBtn = document.getElementById('closeLocationModal');
    const locationModal = document.getElementById('locationModal');
            

    openModalBtn.addEventListener('click', function() {
        locationModal.classList.add('show');
    });
            

    closeModalBtn.addEventListener('click', function() {
        locationModal.classList.remove('show');
    });
            
});

// Espera a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DE PAGINACIÓN ---

    // 1. Define cuántas filas quieres por página
    const filasPorPagina = 5;

    // 2. Encuentra los elementos que necesitamos
    // (Buscamos .data-row que sea HIJO DIRECTO de .data-body)
    const dataBody = document.querySelector(".data-container .data-body");
    const todasLasFilas = Array.from(dataBody.querySelectorAll(":scope > .data-row"));
    const totalFilas = todasLasFilas.length;

    // Si no hay suficientes filas para paginar, no hacemos nada
    if (totalFilas <= filasPorPagina) {
        // Muestra las únicas filas que hay y termina
        todasLasFilas.forEach(fila => fila.classList.add('visible'));
        return;
    }

    // 3. Calcula el número total de páginas
    const totalPaginas = Math.ceil(totalFilas / filasPorPagina);

    // 4. Crea el contenedor para los botones de paginación
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination-controls");
    
    // Inserta el contenedor justo después del .data-body
    dataBody.after(paginationContainer);

    // 5. Función para mostrar una página específica
    function mostrarPagina(pagina) {
        // Calcula las filas de inicio y fin
        const startIndex = (pagina - 1) * filasPorPagina;
        const endIndex = startIndex + filasPorPagina;

        // Oculta todas las filas
        todasLasFilas.forEach(fila => fila.classList.remove('visible'));

        // Muestra solo las filas para la página actual
        todasLasFilas.slice(startIndex, endIndex).forEach(fila => {
            fila.classList.add('visible');
        });

        // Actualiza el botón "activo"
        paginationContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.page) === pagina) {
                btn.classList.add('active');
            }
        });
    }

    // 6. Crea los botones para cada página
    for (let i = 1; i <= totalPaginas; i++) {
        const pageButton = document.createElement("button");
        pageButton.innerText = i;
        pageButton.dataset.page = i;
        // Usamos las clases de Bootstrap que ya tienes
        pageButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm'); 

        // Añade el evento de clic
        pageButton.addEventListener('click', () => {
            mostrarPagina(i);
        });

        paginationContainer.appendChild(pageButton);
    }

    // 7. Muestra la primera página por defecto
    mostrarPagina(1);
});