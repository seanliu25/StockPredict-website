document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("stockChart").getContext("2d");
    const accuracyDisplay = document.getElementById("accuracyRate");
    let stockChart;

    // Fetch data for selected stock
    const fetchData = async (stock) => {
        const response = await fetch(`/api/data?stock=${stock}`);
        const data = await response.json();
        return data;
    };

    // Render chart with actual and predicted data
    const renderChart = (actualData, predictedData, accuracy) => {
        const dates = actualData.map(item => item.Date);
        const actualPrices = actualData.map(item => item.Close);
        const predictedPrices = predictedData.map(item => item.Close);

        if (stockChart) stockChart.destroy(); // Clear previous chart

        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Actual Prices',
                        data: actualPrices,
                        borderColor: 'rgba(192, 75, 75, 1)',
                        borderWidth: 2,
                        fill: false,
                        hidden: !document.getElementById("toggleActual").checked
                    },
                    {
                        label: 'Predicted Prices',
                        data: predictedPrices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false,
                        hidden: !document.getElementById("togglePredicted").checked
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: { 
                        title: { display: true, text: 'Date' },
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    },
                    y: {
                        title: { display: true, text: 'Stock Price' },
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: 'white' } }
                }
            }
        });

        // Display accuracy rate
        accuracyDisplay.textContent = `Accuracy Rate: ${accuracy}%`;
    };

    // Load chart for selected stock
    const loadChart = async () => {
        const stock = document.getElementById("stockSelect").value;
        const { actual, predicted, accuracy } = await fetchData(stock);
        renderChart(actual, predicted, accuracy);
    };

    // Event listeners for stock selection and checkbox toggling
    document.getElementById("stockSelect").addEventListener("change", loadChart);

    document.getElementById("togglePredicted").addEventListener("change", () => {
        stockChart.data.datasets[1].hidden = !document.getElementById("togglePredicted").checked;
        stockChart.update();
    });

    document.getElementById("toggleActual").addEventListener("change", () => {
        stockChart.data.datasets[0].hidden = !document.getElementById("toggleActual").checked;
        stockChart.update();
    });

    // Initial load for default stock
    loadChart();
});
