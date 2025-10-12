
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