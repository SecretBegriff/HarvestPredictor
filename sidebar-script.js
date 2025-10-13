// --- Tu código para el menú hamburguesa (déjalo como está) ---
const hamBurger = document.querySelector(".toggle-btn");

hamBurger.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
    
    const icon = document.querySelector("#icon");
    if (icon.classList.contains('bx-chevrons-right')) {
        icon.classList.remove('bx-chevrons-right');
        icon.classList.add('bx-chevrons-left');
    } else {
        icon.classList.remove('bx-chevrons-left');
        icon.classList.add('bx-chevrons-right');
    }
});


document.addEventListener("DOMContentLoaded", function() {
    let currentPage = window.location.pathname.split('/').pop();

    if (currentPage === "") {
        currentPage = "index.html";
    }

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach(link => {
        link.classList.remove("active");

        const linkPage = link.getAttribute("href").split('/').pop();
        
        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
});