
        // JavaScript para el modal de Plant Type
        document.addEventListener('DOMContentLoaded', function() {
            const openPlantTypeModalBtn = document.getElementById('openPlantTypeModal');
            const closePlantTypeModalBtn = document.getElementById('closePlantTypeModal');
            const plantTypeModal = document.getElementById('plantTypeModal');
                    
            openPlantTypeModalBtn.addEventListener('click', function() {
                plantTypeModal.classList.add('show');
            });
                    
            closePlantTypeModalBtn.addEventListener('click', function() {
                plantTypeModal.classList.remove('show');
            });
        });
