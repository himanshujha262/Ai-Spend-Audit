// State Management
let auditState = {
    tools: [], // { name: 'Cursor', plan: 'Business', spend: 0, seats: 0 }
    teamSize: 0,
    useCase: '',
    selectedTools: [] // Names of selected tools
};

// Tool Pricing Rules & Logic (Audit Engine)
function runAudit(state) {
    let totalSpend = 0;
    let totalSavings = 0;
    let inefficiencies = [];

    // Calculate total spend
    state.tools.forEach(tool => {
        totalSpend += tool.spend || 0;
        
        // Rule 1: Seat mismatch
        if (tool.seats > state.teamSize && state.teamSize > 0) {
            const perSeatCost = tool.spend / tool.seats;
            const savings = (tool.seats - state.teamSize) * perSeatCost;
            totalSavings += savings;
            inefficiencies.push({
                name: "Zombie Seats (Idle)",
                value: `${tool.seats - state.teamSize} Seats`,
                savings: savings,
                tool: tool.name,
                action: `Reduce to ${state.teamSize} seats`
            });
        }

        // Rule 2: Sub-optimal Tiers
        if (tool.name === "Copilot" && tool.plan.includes("Business") && state.teamSize <= 2) {
            const currentCost = tool.spend;
            const individualCost = tool.seats * 10;
            if (currentCost > individualCost) {
                totalSavings += (currentCost - individualCost);
                inefficiencies.push({
                    name: "Sub-Optimal Tiers",
                    value: `${tool.seats} Users`,
                    savings: (currentCost - individualCost),
                    tool: tool.name,
                    action: "Downgrade to Individual"
                });
            }
        }
    });

    // Rule 3: Overlapping/Duplicate Licenses
    const codingTools = state.tools.filter(t => ['Cursor', 'Copilot'].includes(t.name));
    if (codingTools.length > 1) {
        const toCancel = codingTools.find(t => t.name !== 'Cursor') || codingTools[1];
        totalSavings += toCancel.spend;
        inefficiencies.push({
            name: "Duplicate Licenses",
            value: `${toCancel.seats} Seats`,
            savings: toCancel.spend,
            tool: toCancel.name,
            action: `Consolidate to ${codingTools[0].name}`
        });
    }

    return { totalSpend, totalSavings, inefficiencies };
}

// Initialization is handled at the bottom of the file

function setupIndexPage() {
    const toolButtons = document.querySelectorAll('button[class*="flex flex-col items-center"]');
    const planSelect = document.querySelector('select');
    const spendInput = document.querySelector('input[placeholder="e.g. 12500"]');
    const seatsInput = document.querySelector('input[placeholder="50"]');
    const teamSizeInput = document.querySelector('input[placeholder="120"]');
    const useCaseRadios = document.querySelectorAll('input[type="radio"][name="usecase"]');
    const generateBtn = document.querySelector('button:has(span[data-icon="analytics"])');

    // UI Updates
    const savingsAmountDisplay = document.querySelector('.font-display-xl.text-primary-fixed');
    const inefficienciesContainer = document.querySelector('.bg-surface-container-lowest.border-outline-variant.p-lg .space-y-md');

    // Initialize state
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.querySelector('span:nth-child(2)').innerText;
            // Toggle selection
            if (auditState.selectedTools.includes(name)) {
                auditState.selectedTools = auditState.selectedTools.filter(t => t !== name);
                btn.classList.remove('border-primary', 'bg-surface-container-high');
                btn.classList.add('border-outline-variant');
            } else {
                auditState.selectedTools.push(name);
                btn.classList.add('border-primary', 'bg-surface-container-high');
                btn.classList.remove('border-outline-variant');
            }
            updatePreview();
        });
    });

    [planSelect, spendInput, seatsInput, teamSizeInput].forEach(el => {
        if(el) el.addEventListener('input', updatePreview);
    });

    function updatePreview() {
        auditState.teamSize = parseInt(teamSizeInput?.value || '0', 10);
        const spend = parseFloat(spendInput?.value || '0');
        const seats = parseInt(seatsInput?.value || '0', 10);
        const plan = planSelect?.value || '';

        // For simplicity in the UI preview, we apply the inputs to ALL selected tools.
        auditState.tools = auditState.selectedTools.map(name => ({
            name, plan, spend: spend / auditState.selectedTools.length || 0, seats
        }));

        const result = runAudit(auditState);
        
        // Update Live UI
        if(savingsAmountDisplay) {
            savingsAmountDisplay.innerText = `$${(result.totalSavings * 12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }

        if(inefficienciesContainer) {
            inefficienciesContainer.innerHTML = '';
            if (result.inefficiencies.length === 0) {
                inefficienciesContainer.innerHTML = `<div class="py-sm"><span class="font-body-md text-body-md text-on-surface-variant">No inefficiencies found yet. Fill out the configuration.</span></div>`;
            } else {
                result.inefficiencies.forEach(ineff => {
                    let colorClass = "text-error";
                    if (ineff.name === "Sub-Optimal Tiers") colorClass = "text-on-secondary-container";
                    
                    inefficienciesContainer.innerHTML += `
                    <div class="flex justify-between items-center py-sm border-b border-outline-variant last:border-0">
                        <span class="font-body-md text-body-md">${ineff.name}</span>
                        <span class="font-data-mono text-data-mono ${colorClass}">${ineff.value}</span>
                    </div>
                    `;
                });
            }
        }
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            // Get selected usecase
            useCaseRadios.forEach(radio => {
                if (radio.checked) auditState.useCase = radio.nextElementSibling.innerText;
            });
            
            localStorage.setItem('auditState', JSON.stringify(auditState));
            window.location.href = 'results.html';
        });
    }
}

function setupResultsPage() {
    const savedState = localStorage.getItem('auditState');
    if (!savedState) return;
    
    const state = JSON.parse(savedState);
    const result = runAudit(state);

    // Update Hero
    const totalSavingsMonthlyDisplay = document.querySelector('.font-display-xl.text-secondary');
    const totalSavingsAnnualDisplay = document.querySelector('.font-display-xl.text-secondary-fixed');
    
    if(totalSavingsMonthlyDisplay) totalSavingsMonthlyDisplay.innerText = `$${result.totalSavings.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    if(totalSavingsAnnualDisplay) totalSavingsAnnualDisplay.innerText = `$${(result.totalSavings * 12).toLocaleString(undefined, {minimumFractionDigits: 2})}`;

    // Update Cards
    const cardsContainer = document.querySelector('.lg\\:col-span-8.space-y-md');
    // We want to replace the hardcoded cards starting from the 3rd child
    if(cardsContainer && result.inefficiencies.length > 0) {
        // Keep title and date
        const titleDiv = cardsContainer.children[0];
        cardsContainer.innerHTML = '';
        cardsContainer.appendChild(titleDiv);

        result.inefficiencies.forEach(ineff => {
            // Find the tool object
            const toolObj = state.tools.find(t => t.name === ineff.tool);
            
            const cardHTML = `
            <div class="bg-surface-container-lowest border border-outline-variant p-lg grid grid-cols-1 md:grid-cols-4 gap-md items-center">
                <div class="md:col-span-1">
                    <span class="font-label-sm text-label-sm text-secondary uppercase block mb-xs">Tool Name</span>
                    <h3 class="font-headline-md text-headline-md">${ineff.tool}</h3>
                </div>
                <div class="md:col-span-1 border-l border-outline-variant pl-md">
                    <div class="mb-sm">
                        <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase">Current Plan</span>
                        <span class="font-data-mono text-data-mono">${toolObj ? toolObj.plan : 'N/A'}</span>
                    </div>
                    <div>
                        <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase">Current Spend</span>
                        <span class="font-data-mono text-data-mono">$${toolObj ? toolObj.spend.toLocaleString() : 0}/mo</span>
                    </div>
                </div>
                <div class="md:col-span-1 border-l border-outline-variant pl-md">
                    <span class="font-label-sm text-label-sm text-on-surface-variant block uppercase mb-xs">Recommended Action</span>
                    <span class="text-secondary font-bold font-body-md">${ineff.action}</span>
                    <p class="font-label-sm text-label-sm mt-xs leading-tight">${ineff.name}: ${ineff.value}</p>
                </div>
                <div class="md:col-span-1 flex flex-col items-end">
                    <span class="font-label-sm text-label-sm text-secondary uppercase">Savings Amount</span>
                    <span class="font-headline-md text-headline-md text-secondary">-$${ineff.savings.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
            </div>
            `;
            cardsContainer.innerHTML += cardHTML;
        });
    } else if (cardsContainer) {
        const titleDiv = cardsContainer.children[0];
        cardsContainer.innerHTML = '';
        cardsContainer.appendChild(titleDiv);
        cardsContainer.innerHTML += `<div class="p-lg bg-surface-container-lowest border border-outline-variant text-center">No inefficiencies found. Your stack is fully optimized!</div>`;
    }

    // Modal/Form submit logic
    const emailForm = document.querySelector('form');
    if (emailForm) {
        const btn = emailForm.querySelector('button');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            btn.innerText = "Sending Report...";
            setTimeout(() => {
                btn.innerText = "Report Sent!";
                btn.classList.replace('bg-primary', 'bg-secondary');
                setTimeout(() => window.location.href = 'report.html', 500);
            }, 1000);
        });
    }
}

function setupReportPage() {
    const savedState = localStorage.getItem('auditState');
    if (!savedState) return;
    
    const state = JSON.parse(savedState);
    const result = runAudit(state);

    // Update Hero Savings
    const totalSavingsAnnualDisplay = document.querySelector('.font-display-xl.text-primary');
    if(totalSavingsAnnualDisplay) {
        totalSavingsAnnualDisplay.innerText = `$${(result.totalSavings * 12).toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    }

    // Replace table data with actual tools
    const tbody = document.querySelector('tbody');
    if (tbody && state.tools.length > 0) {
        tbody.innerHTML = '';
        state.tools.forEach(tool => {
            const ineff = result.inefficiencies.find(i => i.tool === tool.name);
            const savings = ineff ? ineff.savings * 12 : 0;
            const savingsText = savings > 0 
                ? `<td class="px-lg py-md font-data-mono text-right text-error font-bold">$${savings.toLocaleString()}/yr</td>`
                : `<td class="px-lg py-md font-data-mono text-right text-on-surface-variant">$0/yr</td>`;
            
            const html = `
            <tr>
                <td class="px-lg py-md font-body-md">${state.useCase || 'General'}</td>
                <td class="px-lg py-md font-data-mono">${tool.name} (${tool.plan})</td>
                <td class="px-lg py-md">
                    <div class="w-32 h-2 bg-surface-container border border-outline-variant">
                        <div class="bg-secondary h-full" style="width: ${savings > 0 ? '45%' : '95%'}"></div>
                    </div>
                </td>
                ${savingsText}
            </tr>`;
            tbody.innerHTML += html;
        });
    }

    // Run your own audit button
    const runAuditBtn = document.querySelector('button:has(span.material-symbols-outlined)');
    if (runAuditBtn) {
        runAuditBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Update DOMContentLoaded to trigger report page setup
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) {
        setupIndexPage();
    } else if (path.endsWith('results.html')) {
        setupResultsPage();
    } else if (path.endsWith('report.html')) {
        setupReportPage();
    }
});
