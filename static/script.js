document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("stockChart").getContext("2d");
    const residualCtx = document.getElementById("residualChart").getContext("2d");
    const accuracyDisplay = document.getElementById("accuracyRate");
    const residualChartCanvas = document.getElementById("residualChart");
    let stockChart, residualChart;

    let residualData = { dates: [], values: [] }; // Placeholder to store residuals
    let residualVisible = false; // Track residual visibility state

    const fetchData = async (stock) => {
        const response = await fetch(`/api/data?stock=${stock}`);
        return await response.json();
    };

    const renderChart = (actualData, predictedData, accuracy) => {
        const dates = actualData.map(item => item.Date);
        const actualPrices = actualData.map(item => item.Close);
        const predictedPrices = predictedData.map(item => item.Close);

        if (stockChart) stockChart.destroy();

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
                        fill: false
                    },
                    {
                        label: 'Predicted Prices',
                        data: predictedPrices,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x' // Pan horizontally
                        },
                        zoom: {
                            wheel: { enabled: true }, // Zoom with mouse wheel
                            pinch: { enabled: true }, // Zoom with pinch on touch devices
                            mode: 'x' // Zoom horizontally
                        }
                    },
                    legend: { labels: { color: 'white' } }
                },
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
                }
            }
        });

        accuracyDisplay.textContent = `Accuracy Rate: ${accuracy}%`;
    };

    const renderResidualChart = (dates, residuals) => {
        if (residualChart) residualChart.destroy();

        residualChart = new Chart(residualCtx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Residuals',
                    data: residuals,
                    backgroundColor: 'rgba(255, 165, 0, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Date' }
                    },
                    y: {
                        title: { display: true, text: 'Residual Value' }
                    }
                }
            }
        });

        residualChartCanvas.style.display = 'block'; // Show residual chart
    };

    togglePredicted.addEventListener("change", () => {
        if (stockChart) {
            stockChart.data.datasets[1].hidden = !togglePredicted.checked;
            stockChart.update();
        }
    });
   
    toggleActual.addEventListener("change", () => {
        if (stockChart) {
            stockChart.data.datasets[0].hidden = !toggleActual.checked;
            stockChart.update();
        }
    });
   
    const loadChart = async () => {
        const stock = document.getElementById("stockSelect").value;
        const { actual, predicted, residuals, accuracy } = await fetchData(stock);

        // Store residual data globally
        residualData.dates = residuals.dates;
        residualData.values = residuals.values;

        renderChart(actual, predicted, accuracy);
        residualChartCanvas.style.display = 'none'; // Hide residual chart initially
        residualVisible = false; // Reset visibility state
        document.getElementById("showResiduals").textContent = "Show Residuals";
        hidden: !toggleActual.checked // For the actual data dataset
        hidden: !togglePredicted.checked // For the predicted data dataset
    };

    // Toggle Residuals chart visibility
    document.getElementById("showResiduals").addEventListener("click", () => {
        if (!residualVisible) {
            if (residualData.dates.length > 0) {
                renderResidualChart(residualData.dates, residualData.values);
                document.getElementById("showResiduals").textContent = "Hide Residuals";
                residualVisible = true;
            } else {
                alert("No residual data available yet. Please reload the stock data.");
            }
        } else {
            residualChartCanvas.style.display = 'none';
            document.getElementById("showResiduals").textContent = "Show Residuals";
            residualVisible = false;
        }
    });

    // Reset Zoom Button
    document.getElementById("resetZoom").addEventListener("click", () => {
        if (stockChart) {
            stockChart.resetZoom();
        }
    });

    // Event listener for stock selection
    document.getElementById("stockSelect").addEventListener("change", loadChart);

    loadChart(); // Initial load
});
