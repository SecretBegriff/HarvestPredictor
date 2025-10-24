// Este script maneja la funcionalidad de expandir y contraer la barra lateral.
document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.querySelector("#sidebar");
    const toggleBtn = document.querySelector(".toggle-btn");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", function () {
            // Alterna la clase 'expand' en la barra lateral
            sidebar.classList.toggle("expand");

            // Busca el ícono dentro del botón
            const icon = toggleBtn.querySelector("i");
            if (icon) {
                // Cambia el ícono dependiendo del estado de la barra lateral
                if (sidebar.classList.contains("expand")) {
                    icon.classList.remove('bx-chevrons-right');
                    icon.classList.add('bx-chevrons-left');
                } else {
                    icon.classList.remove('bx-chevrons-left');
                    icon.classList.add('bx-chevrons-right');
                }
            }
        });
    }
});