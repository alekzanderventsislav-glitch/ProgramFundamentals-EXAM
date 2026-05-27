const els = {
    revenue: document.getElementById('revenue'),
    revenueSlider: document.getElementById('revenue-slider'),
    aov: document.getElementById('aov'),
    aovSlider: document.getElementById('aov-slider'),
    leadRate: document.getElementById('lead-rate'),
    prospectRate: document.getElementById('prospect-rate'),
    
    currSelected: document.getElementById('curr-selected'),
    revenueCurrency: document.getElementById('revenue-currency'),
    aovCurrency: document.getElementById('aov-currency'),
    
    prospectsVal: document.getElementById('prospects-val'),
    leadsVal: document.getElementById('leads-val'),
    customersVal: document.getElementById('customers-val'),
    
    prospectsPct: document.getElementById('prospects-pct'),
    leadsPct: document.getElementById('leads-pct'),
    customersPct: document.getElementById('customers-pct'),
    
    barLeads: document.getElementById('bar-leads'),
    barCustomers: document.getElementById('bar-customers'),
    
    leadRateDisp: document.getElementById('lead-rate-disp'),
    prospectRateDisp: document.getElementById('prospect-rate-disp'),
    
    chartContainer: document.getElementById('chart-container')
};

function calculateMetrics() {
    const rev = parseFloat(els.revenue.value) || 0;
    const aov = parseFloat(els.aov.value) || 1;
    
    const lRate = parseFloat(els.leadRate.value);
    const pRate = parseFloat(els.prospectRate.value);
    
    els.leadRateDisp.textContent = lRate.toFixed(2) + '%';
    els.prospectRateDisp.textContent = pRate.toFixed(2) + '%';
    
    // Formula 01: Revenue / Avg Order Value
    const customers = Math.ceil(rev / aov);
    
    // Formula 02: Customers * 100 / Lead Response Rate
    const leads = Math.ceil((customers * 100) / lRate);
    
    // Formula 03: Leads * 100 / Prospect Response Rate
    const prospects = Math.ceil((leads * 100) / pRate);
    
    els.customersVal.textContent = customers;
    els.leadsVal.textContent = leads;
    els.prospectsVal.textContent = prospects;
    
    const custPct = prospects > 0 ? (customers / prospects * 100).toFixed(0) : 0;
    const leadsPct = prospects > 0 ? (leads / prospects * 100).toFixed(0) : 0;
    
    els.customersPct.textContent = custPct + '%';
    els.leadsPct.textContent = leadsPct + '%';
    
    els.barCustomers.style.width = custPct + '%';
    els.barLeads.style.width = leadsPct + '%';
    
    renderChart(prospects, leads, customers);
}

function renderChart(totalP, totalL, totalC) {
    els.chartContainer.innerHTML = '';
    
    // Y-axis uses 6 months
    const months = 6;
    
    for (let i = 1; i <= months; i++) {
        // Linearly distribute values over 6 months
        const p = Math.round(totalP * (i / months));
        const l = Math.round(totalL * (i / months));
        const c = Math.round(totalC * (i / months));
        
        const row = document.createElement('div');
        row.className = 'chart-row';
        
        const pWidth = totalP > 0 ? (p / totalP * 100) : 0;
        const lWidth = totalP > 0 ? (l / totalP * 100) : 0;
        const cWidth = totalP > 0 ? (c / totalP * 100) : 0;

        row.innerHTML = `
            <div class="y-label">${i}</div>
            <div class="bar-wrapper">
                <div class="bar bar-prospects" style="width: ${pWidth}%;"></div>
                <div class="bar bar-leads" style="width: ${lWidth}%;"></div>
                <div class="bar bar-customers" style="width: ${cWidth}%;"></div>
                
                <div class="tooltip" style="left: ${pWidth / 2}%">
                    Month #${i}<br>
                    Prospects: ${p}<br>
                    Leads: ${l}<br>
                    Customers: ${c}
                </div>
            </div>
        `;
        els.chartContainer.appendChild(row);
    }
    
    // Add X-axis labels
    const xLabels = document.createElement('div');
    xLabels.className = 'x-labels';
    xLabels.innerHTML = `
        <span style="left: 0%">0 people</span>
        <span style="left: 20%">${Math.round(totalP*0.2)} people</span>
        <span style="left: 40%">${Math.round(totalP*0.4)} people</span>
        <span style="left: 60%">${Math.round(totalP*0.6)} people</span>
        <span style="left: 80%">${Math.round(totalP*0.8)} people</span>
        <span style="left: 100%">${totalP} people</span>
    `;
    els.chartContainer.appendChild(xLabels);
}

[els.revenue, els.aov, els.leadRate, els.prospectRate].forEach(input => {
    input.addEventListener('input', calculateMetrics);
});

// Sync sliders and number inputs
els.revenue.addEventListener('input', (e) => els.revenueSlider.value = e.target.value);
els.revenueSlider.addEventListener('input', (e) => {
    els.revenue.value = e.target.value;
    calculateMetrics();
});

els.aov.addEventListener('input', (e) => els.aovSlider.value = e.target.value);
els.aovSlider.addEventListener('input', (e) => {
    els.aov.value = e.target.value;
    calculateMetrics();
});

// Custom dropdown logic
const langDropdown = document.getElementById('lang-dropdown');
const langSelected = document.getElementById('lang-selected');
const langOptions = document.getElementById('lang-options');

const currDropdown = document.getElementById('curr-dropdown');
const currOptions = document.getElementById('curr-options');

langSelected.addEventListener('click', () => {
    langOptions.classList.toggle('show');
    currOptions.classList.remove('show');
});

els.currSelected.addEventListener('click', () => {
    currOptions.classList.toggle('show');
    langOptions.classList.remove('show');
});

document.querySelectorAll('.dropdown-option:not(.curr-option)').forEach(option => {
    option.addEventListener('click', (e) => {
        const lang = option.getAttribute('data-value');
        langSelected.innerHTML = option.innerHTML;
        langOptions.classList.remove('show');
        
        let newCurr = 'USD';
        if (lang !== 'en') {
            newCurr = 'EUR';
        }
        updateCurrencySelection(newCurr);
    });
});

document.querySelectorAll('.curr-option').forEach(option => {
    option.addEventListener('click', (e) => {
        const curr = option.getAttribute('data-value');
        updateCurrencySelection(curr);
        currOptions.classList.remove('show');
    });
});

document.addEventListener('click', (e) => {
    if (!langDropdown.contains(e.target)) {
        langOptions.classList.remove('show');
    }
    if (!currDropdown.contains(e.target)) {
        currOptions.classList.remove('show');
    }
});

function updateCurrencySelection(currValue) {
    if (currValue === 'USD') {
        els.currSelected.innerHTML = '$ US Dollar';
        els.currSelected.setAttribute('data-value', 'USD');
    } else {
        els.currSelected.innerHTML = '€ Euro';
        els.currSelected.setAttribute('data-value', 'EUR');
    }
    updateCurrencySymbols();
}

function updateCurrencySymbols() {
    const curr = els.currSelected.getAttribute('data-value');
    const symbol = curr === 'USD' ? '$' : '€';
    els.revenueCurrency.textContent = symbol;
    els.aovCurrency.textContent = symbol;
}

// Initial calculate
updateCurrencySymbols();
calculateMetrics();