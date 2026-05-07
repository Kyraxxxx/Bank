// State
let isBalanceVisible = true;
let currentPass = "";
let transferData = {
    value: "0,00",
    numericValue: 0,
    key: "",
    receiverName: "João Silva",
    receiverCpf: "***.123.456-**"
};

// Data structure
let appData = {
    userName: "Usuário",
    balance: "2456.78",
    invoice: "845.32",
    loan: "5000.00"
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    setupInputs();
});

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('nubankCloneData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Format numbers to BRL string
function formatMoney(value) {
    let num = parseFloat(value);
    if(isNaN(num)) num = 0;
    return "R$ " + num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Update UI with current data
function updateUI() {
    document.getElementById('user-name-display').innerText = `Olá, ${appData.userName}`;
    
    document.getElementById('balance-display').innerText = formatMoney(appData.balance);
    document.getElementById('invoice-display').innerText = formatMoney(appData.invoice);
    document.getElementById('loan-display').innerText = formatMoney(appData.loan);
    
    const transferBalance = document.getElementById('transfer-balance');
    if(transferBalance) transferBalance.innerText = formatMoney(appData.balance);
    
    if (!isBalanceVisible) {
        applyBlur();
    }
}

// Input setups
function setupInputs() {
    const valInput = document.getElementById('transfer-input-val');
    if(valInput) {
        // Simple mask for iOS (doesn't block typing but auto-formats if we wanted. For now just standard inputmode=decimal)
        valInput.addEventListener('input', (e) => {
            const btn = document.querySelector('#transfer-view .fab-btn');
            if(e.target.value.length > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const keyInput = document.getElementById('pix-key-input');
    if(keyInput) {
        keyInput.addEventListener('input', (e) => {
            const btn = document.querySelector('#pix-key-view .fab-btn');
            if(e.target.value.length > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// View Navigation
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'home-view' || viewId === 'investments-view' || viewId === 'shopping-view') {
        document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const items = document.querySelectorAll('.bottom-nav .nav-item');
        if(viewId === 'home-view') items[0].classList.add('active');
        if(viewId === 'investments-view') items[1].classList.add('active');
        if(viewId === 'shopping-view') items[2].classList.add('active');
    }
}

// Eye Toggle Logic
const eyeOpenPath = "M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z";
const eyeClosedPath = "M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15ZM11.83 2.12C11.89 2.12 11.95 2.12 12 2.12C17 2.12 21.27 5.23 23 9.62C22.61 10.62 22.09 11.55 21.46 12.38L19.86 10.78C20.36 10.11 20.76 9.38 21.05 8.62C19.5 4.88 15.93 2.5 12 2.5C11.41 2.5 10.83 2.58 10.28 2.72L8.63 1.07C9.64 0.44 10.72 0 11.83 2.12ZM2.71 3.16L1.3 4.57L3.13 6.4C1.94 7.6 1.05 9.01 0.5 10.62C2.23 15.01 6.5 18.12 11.5 18.12C12.59 18.12 13.65 17.96 14.65 17.65L18.43 21.43L19.84 20.02L2.71 3.16ZM11.5 16.12C7.57 16.12 4 13.74 2.45 10.62C2.9 9.44 3.59 8.35 4.45 7.42L7.26 10.23C7.09 10.78 7 11.38 7 12C7 14.76 9.24 17 12 17C12.62 17 13.22 16.91 13.77 16.74L14.64 17.61C13.66 17.94 12.6 18.12 11.5 18.12V16.12Z";

function toggleBalance() {
    isBalanceVisible = !isBalanceVisible;
    const eyeIcon = document.querySelector('#eye-icon path');
    
    if (isBalanceVisible) {
        eyeIcon.setAttribute('d', eyeOpenPath);
        document.querySelectorAll('.money-value').forEach(el => el.classList.remove('blur-text'));
        updateUI(); 
    } else {
        eyeIcon.setAttribute('d', eyeClosedPath);
        applyBlur();
    }
}

function applyBlur() {
    document.querySelectorAll('.money-value').forEach(el => {
        el.innerText = '••••';
        el.classList.add('blur-text');
    });
}

// PIX FLOW
function goToPixKey() {
    const valInput = document.getElementById('transfer-input-val').value;
    if(!valInput) return;
    
    // Parse value replacing comma with dot for math
    let cleanVal = valInput.replace(',', '.');
    transferData.numericValue = parseFloat(cleanVal);
    
    if(isNaN(transferData.numericValue)) transferData.numericValue = 0;
    
    transferData.value = transferData.numericValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    document.getElementById('display-val-key').innerText = `R$ ${transferData.value}`;
    navigateTo('pix-key-view');
}

function goToConfirm() {
    const keyInput = document.getElementById('pix-key-input').value;
    if(!keyInput) return;
    
    transferData.key = keyInput;
    
    let fakeNames = ["Maria Alice Cardoso", "João Pedro Silva", "Ana Clara Sousa", "Lucas Almeida Ferreira"];
    transferData.receiverName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    
    document.getElementById('confirm-val').innerText = `R$ ${transferData.value}`;
    document.getElementById('confirm-name').innerText = transferData.receiverName;
    
    navigateTo('pix-confirm-view');
}

function goToPassword() {
    currentPass = "";
    updatePassDots();
    navigateTo('password-view');
}

// Keypad Logic
function pressKey(num) {
    if(currentPass.length < 4) {
        currentPass += num;
        updatePassDots();
        
        if(currentPass.length === 4) {
            setTimeout(() => {
                generateReceipt();
            }, 300);
        }
    }
}

function deleteKey() {
    if(currentPass.length > 0) {
        currentPass = currentPass.slice(0, -1);
        updatePassDots();
    }
}

function updatePassDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        if(idx < currentPass.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// Generate Receipt
function generateReceipt() {
    // Populate Receipt Data
    document.getElementById('receipt-val').innerText = `R$ ${transferData.value}`;
    document.getElementById('receipt-name').innerText = transferData.receiverName;
    document.getElementById('receipt-origin-name').innerText = appData.userName;
    
    // Generate current Date and Time
    const now = new Date();
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    document.getElementById('receipt-datetime').innerText = dateStr;
    
    // Generate Random Transaction ID matching real Nubank format
    const randomHex = Array.from({length: 22}, () => Math.floor(Math.random() * 16).toString(16)).join('').toLowerCase();
    const idStr = `E18236120${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${randomHex}`;
    document.getElementById('receipt-id').innerText = idStr;

    // DEDUCT BALANCE!
    let currentBalanceNum = parseFloat(appData.balance);
    if(isNaN(currentBalanceNum)) currentBalanceNum = 0;
    
    currentBalanceNum -= transferData.numericValue;
    if(currentBalanceNum < 0) currentBalanceNum = 0; // Prevent negative
    
    appData.balance = currentBalanceNum.toString();
    localStorage.setItem('nubankCloneData', JSON.stringify(appData));
    updateUI();

    // Show Receipt View
    navigateTo('receipt-view');
}

function finishPix() {
    // Clear inputs
    document.getElementById('transfer-input-val').value = '';
    document.getElementById('pix-key-input').value = '';
    document.querySelector('#transfer-view .fab-btn').classList.remove('active');
    document.querySelector('#pix-key-view .fab-btn').classList.remove('active');
    
    navigateTo('home-view');
}

// Admin Panel Logic
function openAdmin() {
    document.getElementById('admin-name').value = appData.userName;
    document.getElementById('admin-balance').value = appData.balance;
    document.getElementById('admin-invoice').value = appData.invoice;
    document.getElementById('admin-loan').value = appData.loan;
    
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdmin() {
    document.getElementById('admin-modal').style.display = 'none';
}

function saveAdminData() {
    appData.userName = document.getElementById('admin-name').value;
    
    // Ensure inputs are using dots for math, replace comma if user typed it
    appData.balance = document.getElementById('admin-balance').value.replace(',', '.');
    appData.invoice = document.getElementById('admin-invoice').value.replace(',', '.');
    appData.loan = document.getElementById('admin-loan').value.replace(',', '.');
    
    localStorage.setItem('nubankCloneData', JSON.stringify(appData));
    
    updateUI();
    closeAdmin();
}

window.onclick = function(event) {
    const modal = document.getElementById('admin-modal');
    if (event.target == modal) {
        closeAdmin();
    }
}
