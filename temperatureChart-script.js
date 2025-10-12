const ctx = document.getElementById('temperatureChart').getContext('2d');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            '01/09/25',
            '02/09/25',
            '03/09/25',
            '04/09/25',
            '05/09/25',
            '06/09/25',
            '07/09/25',
            '08/09/25',
            '09/09/25',
            '10/09/25'
        ],
        datasets: [{
            label: '°C',
            data: [34, 42, 41, 39, 36, 38, 37, 35, 40, 43],
            backgroundColor: '#E99449',
            borderRadius: 6,
            barPercentage: 0.9,
            categoryPercentage: 0.5,
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Degrees Celsius'
                },
                grid: {
                    color: '#DCE8F2'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});