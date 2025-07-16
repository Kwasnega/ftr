// Financial Tracker - Professional Edition
// Optimized for Vercel Deployment

// Global State
let currentUser = null;
let currentCurrency = 'USD';
let transactions = [];
let investments = [];
let budgets = [];
let userLevel = 1;
let userXP = 0;

// Currency symbols
const currencySymbols = {
    'USD': '$',
    'GHS': '₵',
    'NGN': '₦'
};

// Currency conversion rates (demo rates)
const exchangeRates = {
    'USD': 1,
    'GHS': 12.5,
    'NGN': 460
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Financial Tracker loaded successfully!');
    loadUserData();

    // Set up form handlers
    setupFormHandlers();
});

// Setup Form Handlers
function setupFormHandlers() {
    // Transaction form handler
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTransactionSubmit();
        });
    }

    // Investment form handler
    const investmentForm = document.getElementById('investment-form');
    if (investmentForm) {
        investmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleInvestmentSubmit();
        });
    }

    // Budget form handler
    const budgetForm = document.getElementById('budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBudgetSubmit();
        });
    }
}

// Quick Login Function
function quickLogin(name, email, avatar) {
    console.log(`Logging in user: ${name}`);
    
    currentUser = {
        name: name,
        email: email,
        avatar: avatar
    };
    
    // Update UI
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-avatar').textContent = avatar;
    
    // Hide login screen and show main app
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Load user-specific data
    loadUserData();
    
    // Add welcome activity
    addActivity(`Welcome back, ${name}! 👋`);
    
    // Show success message
    showSuccess(`Welcome back, ${name}!`);
    
    console.log('✅ Login successful');
}

// Logout Function
function logout() {
    console.log('Logging out user');
    
    currentUser = null;
    transactions = [];
    investments = [];
    
    // Reset UI
    document.getElementById('login-screen').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
    
    // Reset to dashboard tab
    showTab('dashboard');
    
    showSuccess('Logged out successfully!');
}

// Tab Navigation
function showTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
    
    // Update tab-specific content
    if (tabName === 'transactions') {
        updateTransactionsList();
    } else if (tabName === 'investments') {
        updateInvestmentsList();
    } else if (tabName === 'budgets') {
        updateBudgetsList();
    }
}

// Currency Change
function changeCurrency() {
    const selector = document.getElementById('currency-selector');
    currentCurrency = selector.value;
    
    console.log(`Currency changed to: ${currentCurrency}`);
    
    // Update all displayed amounts
    updateDashboard();
    updateTransactionsList();
    updateInvestmentsList();
    
    showSuccess(`Currency changed to ${currentCurrency}`);
}

// Add Transaction Modal
function showAddTransactionModal(type = '') {
    console.log(`Opening add transaction modal for type: ${type}`);

    const modal = document.getElementById('transaction-modal');
    const typeSelect = document.getElementById('transaction-type');
    const dateInput = document.getElementById('transaction-date');

    // Set default type if provided
    if (type) {
        typeSelect.value = type;
    }

    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];

    // Show modal
    modal.style.display = 'flex';
}

// Add Investment Modal
function showAddInvestmentModal() {
    console.log('Opening add investment modal');

    const modal = document.getElementById('investment-modal');
    const dateInput = document.getElementById('investment-date');

    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];

    // Show modal
    modal.style.display = 'flex';
}

// Add Budget Modal
function showAddBudgetModal() {
    console.log('Opening add budget modal');

    const modal = document.getElementById('budget-modal');
    const dateInput = document.getElementById('budget-start-date');

    // Set today's date as default
    dateInput.value = new Date().toISOString().split('T')[0];

    // Show modal
    modal.style.display = 'flex';
}

// Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';

    // Reset forms
    if (modalId === 'transaction-modal') {
        document.getElementById('transaction-form').reset();
    } else if (modalId === 'investment-modal') {
        document.getElementById('investment-form').reset();
    } else if (modalId === 'budget-modal') {
        document.getElementById('budget-form').reset();
    }
}

// Handle Transaction Form Submission
function handleTransactionSubmit() {
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const category = document.getElementById('transaction-category').value;
    const description = document.getElementById('transaction-description').value;
    const date = document.getElementById('transaction-date').value;

    // Validate inputs
    if (!type || !amount || !category || !description || !date) {
        showSuccess('Please fill in all fields!');
        return;
    }

    if (amount <= 0) {
        showSuccess('Amount must be greater than 0!');
        return;
    }

    // Add transaction
    const transaction = {
        id: Date.now(),
        type: type,
        amount: amount,
        category: category,
        description: description,
        date: date,
        user: currentUser.email
    };

    transactions.push(transaction);

    // Update UI
    updateDashboard();
    updateTransactionsList();
    updateBudgetsList();
    addActivity(`Added ${type}: ${formatCurrency(amount)} - ${description}`);
    showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);

    // Close modal
    closeModal('transaction-modal');

    console.log('Transaction added:', transaction);
}

// Handle Investment Form Submission
function handleInvestmentSubmit() {
    const symbol = document.getElementById('investment-symbol').value;
    const quantity = parseFloat(document.getElementById('investment-quantity').value);
    const price = parseFloat(document.getElementById('investment-price').value);
    const date = document.getElementById('investment-date').value;

    // Validate inputs
    if (!symbol || !quantity || !price || !date) {
        showSuccess('Please fill in all fields!');
        return;
    }

    if (quantity <= 0 || price <= 0) {
        showSuccess('Quantity and price must be greater than 0!');
        return;
    }

    // Get asset name
    const assetNames = {
        'AAPL': 'Apple Inc.',
        'GOOGL': 'Alphabet Inc.',
        'TSLA': 'Tesla Inc.',
        'MSFT': 'Microsoft Corp.',
        'AMZN': 'Amazon.com Inc.',
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'BNB': 'Binance Coin',
        'ADA': 'Cardano',
        'SOL': 'Solana'
    };

    // Add investment
    const investment = {
        id: Date.now(),
        symbol: symbol,
        name: assetNames[symbol] || symbol,
        quantity: quantity,
        price: price,
        purchaseDate: date,
        user: currentUser.email
    };

    investments.push(investment);

    // Update UI
    updateDashboard();
    updateInvestmentsList();
    addActivity(`Added investment: ${symbol} (${quantity} units at ${formatCurrency(price)})`);
    showSuccess(`Investment in ${symbol} added successfully!`);

    // Close modal
    closeModal('investment-modal');

    console.log('Investment added:', investment);
}

// Handle Budget Form Submission
function handleBudgetSubmit() {
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const period = document.getElementById('budget-period').value;
    const threshold = parseInt(document.getElementById('budget-threshold').value);
    const startDate = document.getElementById('budget-start-date').value;

    // Validate inputs
    if (!category || !amount || !period || !startDate) {
        showSuccess('Please fill in all fields!');
        return;
    }

    if (amount <= 0) {
        showSuccess('Budget amount must be greater than 0!');
        return;
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => b.category === category && b.user === currentUser.email);
    if (existingBudget) {
        showSuccess('Budget already exists for this category! Edit the existing one.');
        return;
    }

    // Add budget
    const budget = {
        id: Date.now(),
        category: category,
        amount: amount,
        period: period,
        threshold: threshold,
        startDate: startDate,
        user: currentUser.email,
        spent: 0
    };

    budgets.push(budget);

    // Update UI
    updateBudgetsList();
    addActivity(`Created budget: ${category} - ${formatCurrency(amount)} ${period}`);
    showSuccess(`Budget for ${category} created successfully!`);

    // Close modal
    closeModal('budget-modal');

    console.log('Budget added:', budget);
}

// AI Assistant
function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    console.log(`AI query: ${message}`);
    
    // Add user message
    addAIMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Generate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage(response, 'ai');
    }, 1000);
}

function handleAIKeyPress(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

function addAIMessage(message, sender) {
    const messagesContainer = document.getElementById('ai-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-message';
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="ai-avatar">👤</div>
            <div class="ai-text">${message}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-text">${message}</div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateAIResponse(query) {
    const responses = [
        "Based on your spending patterns, I recommend setting aside 20% of your income for savings.",
        "Your investment portfolio is well-diversified! Consider adding some bonds for stability.",
        "I notice you've been spending more on entertainment lately. Would you like to set a budget?",
        "Great job on tracking your expenses! You're 15% under budget this month.",
        "Consider investing in index funds for long-term growth with lower risk.",
        "Your financial health score is improving! Keep up the good work.",
        "I recommend building an emergency fund of 3-6 months of expenses.",
        "You might want to review your subscription services - some seem unused."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Update Functions
function updateDashboard() {
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const portfolioValue = investments
        .reduce((sum, inv) => sum + (inv.price * inv.quantity), 0);
    
    // Update UI
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    document.getElementById('portfolio-value').textContent = formatCurrency(portfolioValue);
    document.getElementById('current-balance').textContent = formatCurrency(totalIncome - totalExpenses);
    document.getElementById('user-level').textContent = `Level ${userLevel}`;
}

function updateTransactionsList() {
    const container = document.getElementById('transactions-list');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-receipt"></i>
                <h3>No transactions yet</h3>
                <p>Add your first transaction to start tracking your finances!</p>
                <button class="btn btn-primary" onclick="showAddTransactionModal()">
                    <i class="fas fa-plus"></i> Add First Transaction
                </button>
            </div>
        `;
        return;
    }
    
    // Show recent transactions (last 10)
    const recentTransactions = transactions.slice(-10).reverse();

    container.innerHTML = recentTransactions.map(transaction => `
        <div class="transaction-item">
            <div class="transaction-icon ${transaction.type}">
                ${transaction.type === 'income' ? '💰' : '💸'}
            </div>
            <div class="transaction-details">
                <div class="transaction-category">${transaction.category}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${new Date(transaction.date).toLocaleDateString()}</div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button class="delete-btn" onclick="deleteTransaction(${transaction.id})" title="Delete Transaction">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateInvestmentsList() {
    const container = document.getElementById('investments-content');
    
    if (investments.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-chart-line"></i>
                <h3>No investments yet</h3>
                <p>Start building your investment portfolio!</p>
                <div class="investment-options">
                    <p><strong>Available:</strong> AAPL, GOOGL, TSLA, MSFT, AMZN, BTC, ETH, BNB, ADA, SOL</p>
                </div>
                <button class="btn btn-primary" onclick="showAddInvestmentModal()">
                    <i class="fas fa-plus"></i> Add First Investment
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="investments-grid">
            ${investments.map(investment => `
                <div class="investment-item">
                    <div class="investment-header">
                        <div class="investment-symbol">${investment.symbol}</div>
                        <button class="delete-btn" onclick="deleteInvestment(${investment.id})" title="Delete Investment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="investment-name">${investment.name}</div>
                    <div class="investment-details">
                        <div>Quantity: ${investment.quantity}</div>
                        <div>Price: ${formatCurrency(investment.price)}</div>
                        <div>Value: ${formatCurrency(investment.price * investment.quantity)}</div>
                        <div>Date: ${new Date(investment.purchaseDate).toLocaleDateString()}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function updateBudgetsList() {
    const container = document.getElementById('budgets-list');
    const totalBudgetEl = document.getElementById('total-budget');
    const budgetSpentEl = document.getElementById('budget-spent');
    const budgetRemainingEl = document.getElementById('budget-remaining');
    const budgetStatusEl = document.getElementById('budget-status');

    // Filter budgets for current user
    const userBudgets = budgets.filter(b => b.user === currentUser.email);

    if (userBudgets.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-wallet"></i>
                <h3>No budgets set</h3>
                <p>Create your first budget to start managing your spending!</p>
                <div class="budget-tips">
                    <p><strong>Popular Categories:</strong> Food, Transport, Entertainment, Shopping, Bills</p>
                </div>
                <button class="btn btn-primary" onclick="showAddBudgetModal()">
                    <i class="fas fa-plus"></i> Create First Budget
                </button>
            </div>
        `;

        // Reset stats
        totalBudgetEl.textContent = formatCurrency(0);
        budgetSpentEl.textContent = formatCurrency(0);
        budgetRemainingEl.textContent = formatCurrency(0);
        budgetStatusEl.textContent = 'No Budgets';
        return;
    }

    // Calculate spending for each budget
    userBudgets.forEach(budget => {
        const categorySpending = transactions
            .filter(t => t.user === currentUser.email && t.type === 'expense' && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
        budget.spent = categorySpending;
    });

    // Calculate totals
    const totalBudget = userBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = userBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Update stats
    totalBudgetEl.textContent = formatCurrency(totalBudget);
    budgetSpentEl.textContent = formatCurrency(totalSpent);
    budgetRemainingEl.textContent = formatCurrency(totalRemaining);

    // Update status
    if (overallProgress <= 75) {
        budgetStatusEl.textContent = 'On Track';
        budgetStatusEl.className = 'stat-value';
    } else if (overallProgress <= 90) {
        budgetStatusEl.textContent = 'Warning';
        budgetStatusEl.className = 'stat-value warning';
    } else {
        budgetStatusEl.textContent = 'Over Budget';
        budgetStatusEl.className = 'stat-value danger';
    }

    // Display budgets
    container.innerHTML = userBudgets.map(budget => {
        const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        const remaining = budget.amount - budget.spent;

        let statusClass = 'on-track';
        let statusText = 'On Track';
        let statusIcon = '✅';

        if (progress >= 100) {
            statusClass = 'over-budget';
            statusText = 'Over Budget';
            statusIcon = '🚨';
        } else if (progress >= budget.threshold) {
            statusClass = 'warning';
            statusText = 'Warning';
            statusIcon = '⚠️';
        }

        return `
            <div class="budget-item">
                <div class="budget-header">
                    <div class="budget-category">${getCategoryIcon(budget.category)} ${budget.category}</div>
                    <div class="budget-header-right">
                        <div class="budget-amount">${formatCurrency(budget.amount)} / ${budget.period}</div>
                        <button class="delete-btn" onclick="deleteBudget(${budget.id})" title="Delete Budget">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${progress >= 100 ? 'danger' : progress >= budget.threshold ? 'warning' : ''}"
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="budget-progress-text">
                        <span>Spent: ${formatCurrency(budget.spent)}</span>
                        <span>Remaining: ${formatCurrency(remaining)}</span>
                    </div>
                </div>
                <div class="budget-status ${statusClass}">
                    <span>${statusIcon}</span>
                    <span>${statusText} (${progress.toFixed(1)}%)</span>
                </div>
            </div>
        `;
    }).join('');
}

function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Bills': '📄',
        'Entertainment': '🎮',
        'Health': '🏥',
        'Education': '📚',
        'Travel': '✈️',
        'Savings': '💰',
        'Other': '📝'
    };
    return icons[category] || '📝';
}

// Delete Functions
function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== transactionId);

        // Update UI
        updateDashboard();
        updateTransactionsList();
        updateBudgetsList();
        addActivity('Transaction deleted');
        showSuccess('Transaction deleted successfully!');

        // Save data
        saveUserData();

        console.log('Transaction deleted:', transactionId);
    }
}

function deleteInvestment(investmentId) {
    if (confirm('Are you sure you want to delete this investment?')) {
        investments = investments.filter(inv => inv.id !== investmentId);

        // Update UI
        updateDashboard();
        updateInvestmentsList();
        addActivity('Investment deleted');
        showSuccess('Investment deleted successfully!');

        // Save data
        saveUserData();

        console.log('Investment deleted:', investmentId);
    }
}

function deleteBudget(budgetId) {
    if (confirm('Are you sure you want to delete this budget?')) {
        budgets = budgets.filter(b => b.id !== budgetId);

        // Update UI
        updateBudgetsList();
        addActivity('Budget deleted');
        showSuccess('Budget deleted successfully!');

        // Save data
        saveUserData();

        console.log('Budget deleted:', budgetId);
    }
}

function clearAllData() {
    const confirmMessage = `⚠️ WARNING: This will permanently delete ALL data for ${currentUser.name}:\n\n` +
                          `• All transactions\n` +
                          `• All investments\n` +
                          `• All budgets\n` +
                          `• User progress\n\n` +
                          `This action cannot be undone. Are you sure?`;

    if (confirm(confirmMessage)) {
        // Clear all data arrays
        transactions = [];
        investments = [];
        budgets = [];
        userLevel = 1;
        userXP = 0;

        // Update UI
        updateDashboard();
        updateTransactionsList();
        updateInvestmentsList();
        updateBudgetsList();

        // Clear activity
        const activityContainer = document.getElementById('recent-activity');
        activityContainer.innerHTML = `
            <div class="activity-item">
                <i class="fas fa-broom activity-icon"></i>
                <span>All data cleared. Start fresh by adding your first transaction!</span>
            </div>
        `;

        // Save cleared data
        saveUserData();

        showSuccess('All data cleared successfully! Starting fresh.');

        console.log('All data cleared for user:', currentUser.email);
    }
}

// Utility Functions
function formatCurrency(amount) {
    const convertedAmount = amount * exchangeRates[currentCurrency];
    const symbol = currencySymbols[currentCurrency];
    return `${symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function addActivity(message) {
    const container = document.getElementById('recent-activity');
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <i class="fas fa-info-circle activity-icon"></i>
        <span>${message}</span>
    `;
    
    container.insertBefore(activityItem, container.firstChild);
    
    // Keep only last 5 activities
    const activities = container.querySelectorAll('.activity-item');
    if (activities.length > 5) {
        activities[activities.length - 1].remove();
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    const textSpan = document.getElementById('success-text');
    
    textSpan.textContent = message;
    successDiv.style.display = 'flex';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function loadUserData() {
    if (!currentUser) return;
    
    // Load user-specific data from localStorage
    const userData = localStorage.getItem(`financial_tracker_${currentUser.email}`);
    
    if (userData) {
        const data = JSON.parse(userData);
        transactions = data.transactions || [];
        investments = data.investments || [];
        budgets = data.budgets || [];
        userLevel = data.userLevel || 1;
        userXP = data.userXP || 0;
    }
    
    updateDashboard();
}

function saveUserData() {
    if (!currentUser) return;
    
    const userData = {
        transactions,
        investments,
        budgets,
        userLevel,
        userXP,
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(`financial_tracker_${currentUser.email}`, JSON.stringify(userData));
    console.log('💾 User data saved');
}

// Auto-save every 30 seconds
setInterval(() => {
    if (currentUser) {
        saveUserData();
    }
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', saveUserData);

console.log('✅ Financial Tracker initialized successfully!');
