function initSalesChart() {
  const ctx = document.getElementById('sales-chart').getContext('2d');
  
  // Sample data - in a real app, you would fetch this from your API
  const salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Sales',
        data: [1200, 1900, 1500, 2000, 2200, 2500, 2800, 2600, 2400, 3000, 3200, 3500],
        backgroundColor: 'rgba(67, 97, 238, 0.2)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          },
          ticks: {
            callback: function(value) {
              return '$' + value;
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  return salesChart;
}