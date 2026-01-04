// Theme Toggle
const themeBtn = document.getElementById('theme-toggle');
const body = document.body;
let riskChart = null;

themeBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');
    const isDark = body.classList.contains('dark-mode');
    themeBtn.innerHTML = isDark ? "☀ Light Mode" : "☾ Dark Mode";
});

// Navigation
function showSection(sectionId) {
    document.getElementById('home-section').classList.add('hidden');
    document.getElementById('about-section').classList.add('hidden');
    document.getElementById('disclaimer-section').classList.add('hidden');
    
    document.getElementById(sectionId + '-section').classList.remove('hidden');
}

// Form Submission
document.getElementById('prediction-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Show Loader
    document.getElementById('placeholder-content').classList.add('hidden');
    document.getElementById('result-content').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');

    // Collect Data
    const formData = {
        age: document.getElementById('age').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        gender: document.getElementById('gender').value,
        ap_hi: document.getElementById('ap_hi').value,
        ap_lo: document.getElementById('ap_lo').value,
        cholesterol: document.getElementById('cholesterol').value,
        gluc: document.getElementById('gluc').value,
        smoke: document.getElementById('smoke').checked ? 1 : 0,
        alco: document.getElementById('alco').checked ? 1 : 0,
        active: document.getElementById('active').checked ? 1 : 0
    };

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            // Calculate BMI for display
            const heightM = formData.height / 100;
            const bmi = (formData.weight / (heightM * heightM)).toFixed(1);

            displayResults(result, bmi);
        } else {
            alert("Error: " + result.error);
        }

    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred connecting to the AI.");
    } finally {
        document.getElementById('loader').classList.add('hidden');
    }
});

function displayResults(data, bmi) {
    document.getElementById('result-content').classList.remove('hidden');

    const riskVal = document.getElementById('risk-value');
    const riskCat = document.getElementById('risk-category');
    
    riskVal.innerText = data.risk_score + "%";
    riskVal.style.color = data.color;
    riskCat.innerText = data.category;
    riskCat.style.color = data.color;

    document.getElementById('bmi-display').innerText = `Calculated BMI: ${bmi}`;

    renderChart(data.risk_score, data.color);
}

function renderChart(risk, color) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    const safe = 100 - risk;

    if (riskChart) riskChart.destroy();

    riskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Risk', 'Safe'],
            datasets: [{
                data: [risk, safe],
                backgroundColor: [color, 'rgba(255, 255, 255, 0.1)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { display: false }
            }
        }
    });
}