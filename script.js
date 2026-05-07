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
    loan: "5000.00",
    history: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateUI();
    setupInputs();
    renderHistory();
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
    if (isNaN(num)) num = 0;
    return "R$ " + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Update UI with current data
function updateUI() {
    document.getElementById('user-name-display').innerText = `Olá, ${appData.userName}`;

    document.getElementById('balance-display').innerText = formatMoney(appData.balance);
    document.getElementById('invoice-display').innerText = formatMoney(appData.invoice);
    document.getElementById('loan-display').innerText = formatMoney(appData.loan);

    const transferBalance = document.getElementById('transfer-balance');
    if (transferBalance) transferBalance.innerText = formatMoney(appData.balance);

    if (!isBalanceVisible) {
        applyBlur();
    }
}

// Input setups
function setupInputs() {
    const valInput = document.getElementById('transfer-input-val');
    if (valInput) {
        // Simple mask for iOS (doesn't block typing but auto-formats if we wanted. For now just standard inputmode=decimal)
        valInput.addEventListener('input', (e) => {
            const btn = document.querySelector('#transfer-view .fab-btn');
            if (e.target.value.length > 0) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const keyInput = document.getElementById('pix-key-input');
    if (keyInput) {
        keyInput.addEventListener('input', (e) => {
            const btn = document.querySelector('#pix-key-view .fab-btn');
            if (e.target.value.length > 0) {
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
        if (viewId === 'home-view') items[0].classList.add('active');
        if (viewId === 'investments-view') items[1].classList.add('active');
        if (viewId === 'shopping-view') items[2].classList.add('active');
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
    if (!valInput) return;

    // Parse value replacing comma with dot for math
    let cleanVal = valInput.replace(',', '.');
    transferData.numericValue = parseFloat(cleanVal);

    if (isNaN(transferData.numericValue)) transferData.numericValue = 0;

    transferData.value = transferData.numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById('display-val-key').innerText = `R$ ${transferData.value}`;
    navigateTo('pix-key-view');
}

function goToConfirm() {
    const keyInput = document.getElementById('pix-key-input').value;
    if (!keyInput) return;

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

function renderHistory() {
    const list = document.getElementById('history-list');
    const noHistory = document.getElementById('no-history');
    if(!list) return;

    list.innerHTML = '';
    
    if (appData.history.length === 0) {
        noHistory.style.display = 'block';
        return;
    }
    
    noHistory.style.display = 'none';
    
    // Mostra do mais recente para o mais antigo
    [...appData.history].reverse().forEach((item, index) => {
        const realIndex = appData.history.length - 1 - index;
        const div = document.createElement('div');
        div.className = 'history-item-ui';
        div.onclick = () => viewHistoryReceipt(realIndex);
        
        div.innerHTML = `
            <div class="history-item-info">
                <h4>Transferência enviada</h4>
                <p>${item.receiverName}</p>
                <p>${item.date}</p>
            </div>
            <div class="history-item-value">
                - ${formatMoney(item.numericValue.toString().replace('.', ','))}
            </div>
        `;
        list.appendChild(div);
    });
}

function viewHistoryReceipt(index) {
    const item = appData.history[index];
    const body = document.getElementById('history-receipt-body');
    
    // Reutiliza o estilo do corpo do comprovante branco
    body.innerHTML = `
        <!-- Nubank Logo -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 20px;">
            <path d="M7.2795 5.4336c-1.1815 0-2.1846.4628-2.9432 1.252h-.002c-.0541-.0022-.1074-.002-.162-.002-1.5436 0-2.9925.8835-3.699 2.2559-.3088.5996-.4234 1.2442-.459 1.9003-.0321.589 0 1.1863 0 1.7696v5.6523H3.184s.0022-2.784 0-5.1777c-.0014-1.6112-.0118-3.0471 0-3.3418.056-1.3937.4372-2.3053 1.1484-3.0508 2.3585.0018 3.8852 1.6091 3.9705 4.168.0196.5874.0254 3.7304.0254 3.7304v3.672h3.1678v-4.965c0-1.5007.0127-2.8006-.0918-3.6952-.292-2.5-1.821-4.168-4.1248-4.168zm8.3903.3008l-3.166.0039v4.9648c0 1.5009-.0127 2.8007.0919 3.6953.2921 2.5001 1.821 4.168 4.1248 4.168 1.1815 0 2.1846-.4628 2.9432-1.252.0003-.0003.0016.0004.002 0 .0542.0023.1093.002.164.002 1.5435 0 2.9905-.8835 3.6971-2.2558.3088-.5997.4233-1.2442.459-1.9004.032-.5889 0-1.1862 0-1.7695V5.7383H20.816s-.0022 2.784 0 5.1777c.0015 1.6113.0119 3.047 0 3.3418-.056 1.3935-.4372 2.3053-1.1483 3.0508-2.3586-.0018-3.8853-1.6091-3.9706-4.168-.0196-.5874-.0273-2.0437-.0273-3.7324Z" fill="#737373"/>
        </svg>

        <h1 class="receipt-title-white">Comprovante de<br>transferência</h1>
        <p class="receipt-date-white">${item.dateTimeFull}</p>
        
        <div class="receipt-row mt-30">
            <p class="receipt-label">Valor</p>
            <p class="receipt-val-white">R$ ${item.value}</p>
        </div>
        
        <div class="receipt-row">
            <p class="receipt-label">Tipo de transferência</p>
            <p class="receipt-val-gray">Pix</p>
        </div>

        <div class="receipt-divider-light"></div>

        <div class="receipt-section-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8ZM12 16L8 12H11V10H13V12H16L12 16Z" fill="#111111"/></svg>
            <span>Destino</span>
        </div>

        <div class="receipt-details">
            <div class="receipt-row-detail">
                <p class="receipt-label">Nome</p>
                <p class="receipt-value-bold">${item.receiverName}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">CPF/CNPJ</p>
                <p class="receipt-value-bold">${item.receiverCpf}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">Chave Pix</p>
                <p class="receipt-value-bold">${item.key}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">Instituição</p>
                <p class="receipt-value-bold">${item.institution}</p>
            </div>
        </div>

        <div class="receipt-divider-light"></div>
        
        <div class="receipt-section-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8ZM12 10L16 14H13V16H11V14H8L12 10Z" fill="#111111"/></svg>
            <span>Origem</span>
        </div>

        <div class="receipt-details">
            <div class="receipt-row-detail">
                <p class="receipt-label">Nome</p>
                <p class="receipt-value-bold">${appData.userName}</p>
            </div>
        </div>

        <div class="receipt-divider-light"></div>
        
        <div class="receipt-details">
            <div class="receipt-row-detail" style="flex-direction: column; align-items: flex-start;">
                <p class="receipt-label" style="margin-bottom: 8px;">ID da transação</p>
                <p class="receipt-value-bold transaction-id-white">${item.transactionId}</p>
            </div>
        </div>
    `;
    
    navigateTo('history-receipt-view');
}

// Keypad Logic
function pressKey(num) {
    if (currentPass.length < 4) {
        currentPass += num;
        updatePassDots();

        if (currentPass.length === 4) {
            setTimeout(() => {
                generateReceipt();
            }, 300);
        }
    }
}

function deleteKey() {
    if (currentPass.length > 0) {
        currentPass = currentPass.slice(0, -1);
        updatePassDots();
    }
}

function updatePassDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        if (idx < currentPass.length) {
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
    document.getElementById('receipt-key').innerText = transferData.key; // Chave automática!

    // Generate current Date and Time
    const now = new Date();
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dateStrShort = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]}`;
    const dateStrFull = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    document.getElementById('receipt-datetime').innerText = dateStrFull;

    // Generate Random Transaction ID matching real Nubank format
    const randomHex = Array.from({ length: 22 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toLowerCase();
    const idStr = `E18236120${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${randomHex}`;
    document.getElementById('receipt-id').innerText = idStr;

    // Salva no Histórico
    const historyItem = {
        value: transferData.value,
        numericValue: transferData.numericValue,
        receiverName: transferData.receiverName,
        receiverCpf: transferData.receiverCpf,
        key: transferData.key,
        date: dateStrShort,
        dateTimeFull: dateStrFull,
        transactionId: idStr,
        institution: "BCO SANTANDER (BRASIL) S.A."
    };
    if(!appData.history) appData.history = [];
    appData.history.push(historyItem);

    // DEDUCT BALANCE!
    let currentBalanceNum = parseFloat(appData.balance);
    if (isNaN(currentBalanceNum)) currentBalanceNum = 0;

    currentBalanceNum -= transferData.numericValue;
    if (currentBalanceNum < 0) currentBalanceNum = 0; // Prevent negative

    appData.balance = currentBalanceNum.toString();
    localStorage.setItem('nubankCloneData', JSON.stringify(appData));
    
    updateUI();
    renderHistory();

    // Show Success View First
    document.getElementById('success-val').innerText = `R$ ${transferData.value}`;
    document.getElementById('success-name').innerText = `Para ${transferData.receiverName}`;
    navigateTo('success-view');
}

function shareReceipt() {
    // Pega os valores atuais da tela (caso o usuário tenha editado algo manualmente)
    const val = document.getElementById('receipt-val').innerText;
    const name = document.getElementById('receipt-name').innerText;
    const date = document.getElementById('receipt-datetime').innerText;
    const transId = document.getElementById('receipt-id').innerText;

    const shareText = `*Comprovante de Transferência Pix*\n\n*Valor:* ${val}\n*Para:* ${name}\n*Data:* ${date}\n*ID:* ${transId}\n\nEnviado via Nubank`;

    if (navigator.share) {
        // Usa o compartilhamento nativo do celular (WhatsApp, etc)
        navigator.share({
            title: 'Comprovante Pix',
            text: shareText
        }).catch(err => console.log('Erro ao compartilhar', err));
    } else {
        // Fallback: Abre o WhatsApp Web ou App direto com o texto
        const encodedText = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
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

window.onclick = function (event) {
    const modal = document.getElementById('admin-modal');
    if (event.target == modal) {
        closeAdmin();
    }
}
