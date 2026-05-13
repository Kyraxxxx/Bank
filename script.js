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
    balanceNubank: "2456.78",
    balancePicPay: "1.06", // Identical to screenshot initial
    invoice: "845.32",
    loan: "5000.00",
    currentBank: "nubank", // Default
    history: [],
    contacts: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    applyTheme();
    updateUI();
    setupInputs();
    renderHistory();
    renderContacts();
    
    // Configura botões de abrir admin
    const profileBtn = document.getElementById('picpay-profile-btn');
    if(profileBtn) profileBtn.onclick = openAdmin;
    
    const picpayMenuBtn = document.getElementById('picpay-menu-btn');
    if(picpayMenuBtn) picpayMenuBtn.onclick = openAdmin;

    // Face ID removido - Navega direto para home
    if(appData.currentBank === 'picpay') {
        navigateTo('picpay-home-view');
    } else {
        navigateTo('home-view');
    }
});

// THEME LOGIC
function applyTheme() {
    if (appData.currentBank === 'picpay') {
        document.body.classList.add('theme-picpay');
        // Update profile icon initials
        const profileBtn = document.getElementById('picpay-profile-btn');
        if(profileBtn && appData.userName) {
            profileBtn.innerText = appData.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        }
    } else {
        document.body.classList.remove('theme-picpay');
    }
}

// QR CODE SCAN SIMULATION
function startQrScan() {
    navigateTo('qr-scan-view');
    
    // Simula o tempo de "focando" a câmera
    setTimeout(() => {
        handleQrScan();
    }, 3000);
}

function handleQrScan() {
    // Dados aleatórios para o pagamento via QR Code
    transferData.numericValue = Math.floor(Math.random() * 500) + 50.50;
    transferData.value = transferData.numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    let fakeNames = ["Restaurante Central", "Supermercado Extra", "Posto Ipiranga", "Farmácia Pague Menos"];
    transferData.receiverName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    transferData.receiverCpf = "**.***.***/***-**";
    transferData.key = "qrcode-pagamento-simulado-" + Math.floor(Math.random() * 100000);
    
    document.getElementById('confirm-val').innerText = `R$ ${transferData.value}`;
    document.getElementById('confirm-name').innerText = transferData.receiverName;
    
    navigateTo('pix-confirm-view');
}

// PDF DOWNLOAD LOGIC
async function downloadReceiptPDF() {
    const { jsPDF } = window.jspdf;
    
    // Identifica qual view está ativa para tirar o print
    const activeView = document.querySelector('.view.active');
    const receiptArea = activeView.id === 'receipt-view' ? 
        document.querySelector('#receipt-view .receipt-body-white') : 
        document.querySelector('#history-receipt-view .receipt-body-white');

    if (!receiptArea) return;

    // Feedback visual
    const downloadBtn = document.querySelector('.view.active .download-receipt');
    if(downloadBtn) downloadBtn.style.opacity = '0.5';

    try {
        // Gera o canvas do comprovante
        const canvas = await html2canvas(receiptArea, {
            backgroundColor: "#ffffff",
            scale: 2, // Boa qualidade para PDF
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        const filename = appData.currentBank === 'picpay' ? 'comprovante-picpay.pdf' : 'comprovante-nubank.pdf';
        pdf.save(filename);

    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        alert('Erro ao gerar o comprovante em PDF.');
    } finally {
        if(downloadBtn) downloadBtn.style.opacity = '1';
    }
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('nubankCloneData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Migração de dados para balanço separado
        if(parsed.balance && !parsed.balanceNubank) {
            parsed.balanceNubank = parsed.balance;
            delete parsed.balance;
        }
        
        appData = { ...appData, ...parsed };
        if(!appData.currentBank) appData.currentBank = "nubank";
        if(!appData.balancePicPay) appData.balancePicPay = "1.06";
    }
}

// Format numbers to BRL string
function formatMoney(value) {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    return "R$ " + num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Update UI with current data
function openFeature(name, icon) {
    const titleEl = document.getElementById('feature-title');
    const nameEl = document.getElementById('feature-name');
    const iconEl = document.getElementById('feature-icon');
    if(titleEl) titleEl.innerText = name;
    if(nameEl) nameEl.innerText = name;
    if(iconEl) iconEl.innerText = icon;
    navigateTo('feature-view');
}

function updateUI() {
    const nameDisplays = ['user-name-display'];
    nameDisplays.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = id.includes('greeting') || id === 'user-name-display' ? `Olá, ${appData.userName}` : appData.userName;
    });

    const balanceNubankDisplay = document.getElementById('balance-display');
    if(balanceNubankDisplay) balanceNubankDisplay.innerText = formatMoney(appData.balanceNubank);

    const balancePicPayDisplay = document.getElementById('picpay-balance-display');
    if(balancePicPayDisplay) balancePicPayDisplay.innerText = formatMoney(appData.balancePicPay);

    // Update PicPay profile icon initials
    const picpayProfileBtn = document.getElementById('picpay-profile-btn');
    if(picpayProfileBtn && appData.userName) {
        picpayProfileBtn.innerText = appData.userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    const invoiceEl = document.getElementById('invoice-display');
    if(invoiceEl) invoiceEl.innerText = formatMoney(appData.invoice);
    
    const loanEl = document.getElementById('loan-display');
    if(loanEl) loanEl.innerText = formatMoney(appData.loan);

    const transferBalance = document.getElementById('transfer-balance');
    if (transferBalance) {
        const currentBal = appData.currentBank === 'picpay' ? appData.balancePicPay : appData.balanceNubank;
        transferBalance.innerText = formatMoney(currentBal);
    }

    if (!isBalanceVisible) {
        applyBlur();
    }
}

// Input setups
function setupInputs() {
    const valInput = document.getElementById('transfer-input-val');
    if (valInput) {
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

function showCurrentReceipt() {
    navigateTo('receipt-view');
}

window.navigateTo = navigateTo;
window.showCurrentReceipt = showCurrentReceipt;

const randomNames = ["Marcos Oliveira", "Ana Beatriz Costa", "Ricardo Santos", "Juliana Pereira", "Felipe Almeida", "Camila Souza"];
const randomCpfs = ["***.445.890-**", "***.123.678-**", "***.990.221-**", "***.556.778-**"];

// View Navigation
function navigateTo(viewId) {
    // If navigating to home, check bank
    if(viewId === 'home-view' || viewId === 'picpay-home-view') {
        viewId = appData.currentBank === 'picpay' ? 'picpay-home-view' : 'home-view';
    }

    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    const target = document.getElementById(viewId);
    if(target) {
        target.classList.add('active');
    }

    if (viewId === 'home-view' || viewId === 'picpay-home-view' || viewId === 'investments-view' || viewId === 'shopping-view') {
        document.querySelectorAll('.bottom-nav .nav-item, .picpay-nav .picpay-nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const items = document.querySelectorAll('.bottom-nav .nav-item');
        const picpayItems = document.querySelectorAll('.picpay-nav .picpay-nav-item');
        
        if (viewId === 'home-view' || viewId === 'picpay-home-view') {
            if(items[0]) items[0].classList.add('active');
            if(picpayItems[0]) picpayItems[0].classList.add('active');
        }
        if (viewId === 'investments-view') if(items[1]) items[1].classList.add('active');
        if (viewId === 'shopping-view') if(items[2]) items[2].classList.add('active');
    }
}

// Eye Toggle Logic
const eyeOpenPath = "M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z";
const eyeClosedPath = "M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C13.66 9 15 10.34 15 12C15 13.66 13.66 15 12 15ZM11.83 2.12C11.89 2.12 11.95 2.12 12 2.12C17 2.12 21.27 5.23 23 9.62C22.61 10.62 22.09 11.55 21.46 12.38L19.86 10.78C20.36 10.11 20.76 9.38 21.05 8.62C19.5 4.88 15.93 2.5 12 2.5C11.41 2.5 10.83 2.58 10.28 2.72L8.63 1.07C9.64 0.44 10.72 0 11.83 2.12ZM2.71 3.16L1.3 4.57L3.13 6.4C1.94 7.6 1.05 9.01 0.5 10.62C2.23 15.01 6.5 18.12 11.5 18.12C12.59 18.12 13.65 17.96 14.65 17.65L18.43 21.43L19.84 20.02L2.71 3.16ZM11.5 16.12C7.57 16.12 4 13.74 2.45 10.62C2.9 9.44 3.59 8.35 4.45 7.42L7.26 10.23C7.09 10.78 7 11.38 7 12C7 14.76 9.24 17 12 17C12.62 17 13.22 16.91 13.77 16.74L14.64 17.61C13.66 17.94 12.6 18.12 11.5 18.12V16.12Z";

function toggleBalance() {
    isBalanceVisible = !isBalanceVisible;
    const eyeIcons = [
        document.querySelector('#eye-icon path'),
        ...document.querySelectorAll('.eye-icon-dynamic path')
    ];

    if (isBalanceVisible) {
        eyeIcons.forEach(icon => { if(icon) icon.setAttribute('d', eyeOpenPath); });
        document.querySelectorAll('.money-value').forEach(el => {
            el.classList.remove('blur-text');
            // Restore original value from appData
            updateUI();
        });
    } else {
        eyeIcons.forEach(icon => { if(icon) icon.setAttribute('d', eyeClosedPath); });
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
    const listNubank = document.getElementById('history-list');
    const listPicPay = document.getElementById('picpay-history-list');
    const noHistoryNubank = document.getElementById('no-history');
    const noHistoryPicPay = document.getElementById('picpay-no-history');
    
    if(!listNubank || !listPicPay) return;

    listNubank.innerHTML = '';
    listPicPay.innerHTML = '';
    
    if (appData.history.length === 0) {
        if(noHistoryNubank) noHistoryNubank.style.display = 'block';
        if(noHistoryPicPay) noHistoryPicPay.style.display = 'block';
        return;
    }
    
    if(noHistoryNubank) noHistoryNubank.style.display = 'none';
    if(noHistoryPicPay) noHistoryPicPay.style.display = 'none';
    
    [...appData.history].reverse().forEach((item, index) => {
        const realIndex = appData.history.length - 1 - index;
        
        // Item Nubank
        const divNu = document.createElement('div');
        divNu.className = 'history-item-ui';
        divNu.onclick = () => viewHistoryReceipt(realIndex);
        divNu.innerHTML = `
            <div class="history-item-info">
                <h4>Transferência enviada</h4>
                <p>${item.receiverName}</p>
                <p>${item.date}</p>
            </div>
            <div class="history-item-value">- ${formatMoney(item.numericValue.toString().replace('.', ','))}</div>
        `;
        listNubank.appendChild(divNu);

        // Item PicPay
        const divPP = document.createElement('div');
        divPP.className = 'history-item-ui';
        divPP.style.borderBottom = '1px solid #eee';
        divPP.style.padding = '12px 0';
        divPP.onclick = () => viewHistoryReceipt(realIndex);
        divPP.innerHTML = `
            <div class="history-item-info">
                <h4 style="font-size:0.95rem; color:#111;">Pagamento para ${item.receiverName}</h4>
                <p style="font-size:0.8rem; color:#737373;">${item.dateTimeFull.split(' - ')[0]}</p>
            </div>
            <div class="history-item-value" style="color:#111; font-weight:700;">- ${formatMoney(item.numericValue.toString().replace('.', ','))}</div>
        `;
        listPicPay.appendChild(divPP);
    });

    renderFullHistory();
}

function renderFullHistory() {
    const list = document.getElementById('full-history-list');
    const noHistory = document.getElementById('full-no-history');
    if(!list) return;

    if(appData.history.length === 0) {
        list.innerHTML = '';
        noHistory.style.display = 'block';
        return;
    }

    noHistory.style.display = 'none';
    list.innerHTML = '';

    appData.history.slice().reverse().forEach((item, index) => {
        const realIndex = appData.history.length - 1 - index;
        const div = document.createElement('div');
        div.className = 'history-item-ui';
        div.onclick = () => viewHistoryReceipt(realIndex);
        
        if (appData.currentBank === 'picpay') {
            div.innerHTML = `
                <div class="history-item-info">
                    <h4 style="font-size:0.95rem; color:#111;">Pagamento para ${item.receiverName}</h4>
                    <p style="font-size:0.8rem; color:#737373;">${item.dateTimeFull.split(' - ')[0]}</p>
                </div>
                <div class="history-item-value" style="color:#111; font-weight:700;">- ${formatMoney(item.numericValue.toString().replace('.', ','))}</div>
            `;
        } else {
            div.innerHTML = `
                <div class="history-item-info">
                    <h4>${item.receiverName}</h4>
                    <p>${item.date}</p>
                </div>
                <div class="history-item-value">- ${formatMoney(item.numericValue.toString().replace('.', ','))}</div>
            `;
        }
        list.appendChild(div);
    });
}

function renderContacts() {
    const list = document.getElementById('recent-contacts-list');
    const section = document.getElementById('recent-contacts-section');
    if(!list || !appData.contacts || appData.contacts.length === 0) {
        if(section) section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';
    
    appData.contacts.slice(0, 4).forEach(contact => {
        const div = document.createElement('div');
        div.className = 'recent-contact-item';
        div.onclick = () => selectContact(contact);
        
        const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        div.innerHTML = `
            <div class="contact-avatar">${initials}</div>
            <div class="contact-info">
                <h5>${contact.name}</h5>
                <p>CPF: ${contact.cpf}</p>
            </div>
        `;
        list.appendChild(div);
    });
}

function getNubankReceiptHTML(item) {
    return `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 20px;">
            <path d="M7.2795 5.4336c-1.1815 0-2.1846.4628-2.9432 1.252h-.002c-.0541-.0022-.1074-.002-.162-.002-1.5436 0-2.9925.8835-3.699 2.2559-.3088.5996-.4234 1.2442-.459 1.9003-.0321.589 0 1.1863 0 1.7696v5.6523H3.184s.0022-2.784 0-5.1777c-.0014-1.6112-.0118-3.0471 0-3.3418.056-1.3937.4372-2.3053 1.1484-3.0508 2.3585.0018 3.8852 1.6091 3.9705 4.168.0196.5874.0254 3.7304.0254 3.7304v3.672h3.1678v-4.965c0-1.5007.0127-2.8006-.0918-3.6952-.292-2.5-1.821-4.168-4.1248-4.168zm8.3903.3008l-3.166.0039v4.9648c0 1.5009-.0127 2.8007.0919 3.6953.2921 2.5001 1.821 4.168 4.1248 4.168 1.1815 0 2.1846-.4628 2.9432-1.252.0003-.0003.0016.0004.002 0 .0542.0023.1093.002.164.002 1.5435 0 2.9905-.8835 3.6971-2.2558.3088-.5997.4233-1.2442.459-1.9004.032-.5889 0-1.1862 0-1.7695V5.7383H20.816s-.0022 2.784 0 5.1777c.0015 1.6113.0119 3.047 0 3.3418-.056 1.3935-.4372 2.3053-1.1483 3.0508-2.3586-.0018-3.8853-1.6091-3.9706-4.168-.0196-.5874-.0273-2.0437-.0273-3.7324Z" fill="#737373"/>
        </svg>
        <h1 class="receipt-title-white">Comprovante de<br>transferência</h1>
        <p class="receipt-date-white" contenteditable="true" spellcheck="false">${item.dateTimeFull}</p>
        <div class="receipt-row mt-30">
            <p class="receipt-label">Valor</p>
            <p class="receipt-val-white" contenteditable="true" spellcheck="false">R$ ${item.value}</p>
        </div>
        <div class="receipt-row">
            <p class="receipt-label">Tipo de transferência</p>
            <p class="receipt-val-gray" contenteditable="true" spellcheck="false">Pix</p>
        </div>
        <div class="receipt-divider-light"></div>
        <div class="receipt-section-title">
            <svg viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8ZM12 16L8 12H11V10H13V12H16L12 16Z" fill="#111111"/></svg>
            <span>Destino</span>
        </div>
        <div class="receipt-details">
            <div class="receipt-row-detail">
                <p class="receipt-label">Nome</p>
                <p class="receipt-value-bold" contenteditable="true" spellcheck="false">${item.receiverName}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">CPF/CNPJ</p>
                <p class="receipt-value-bold" contenteditable="true" spellcheck="false">${item.receiverCpf}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">Chave Pix</p>
                <p class="receipt-value-bold" contenteditable="true" spellcheck="false">${item.key}</p>
            </div>
            <div class="receipt-row-detail">
                <p class="receipt-label">Instituição</p>
                <p class="receipt-value-bold" contenteditable="true" spellcheck="false">${item.institution}</p>
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
}

function getPicPayReceiptHTML(item) {
    return `
        <h1 class="picpay-receipt-title">Comprovante de Pix enviado</h1>
        <p class="picpay-receipt-label" contenteditable="true" spellcheck="false" style="margin-bottom: 0;">${item.dateTimeFull.split(' - ')[0]} - ${item.dateTimeFull.split(' - ')[1]}</p>
        
        <div class="picpay-success-banner">
            <div class="picpay-success-check">
                <svg viewBox="0 0 24 24" fill="white" width="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <span contenteditable="true" spellcheck="false">Pagamento enviado com sucesso!</span>
        </div>

        <div class="picpay-receipt-section">
            <p class="picpay-receipt-label">Valor</p>
            <h2 class="picpay-receipt-val" contenteditable="true" spellcheck="false">R$ ${item.value}</h2>
        </div>

        <div class="picpay-receipt-person">
            <p class="picpay-receipt-label">Para</p>
            <h4 contenteditable="true" spellcheck="false">${item.receiverName}</h4>
            <p contenteditable="true" spellcheck="false">${item.receiverCpf}</p>
            <p contenteditable="true" spellcheck="false">${item.institution}</p>
        </div>

        <div class="picpay-receipt-person">
            <p class="picpay-receipt-label">De</p>
            <h4 contenteditable="true" spellcheck="false">${appData.userName}</h4>
            <p contenteditable="true" spellcheck="false">***.***.***-**</p>
            <p contenteditable="true" spellcheck="false">PICPAY SERVIÇOS S.A.</p>
        </div>

        <div class="picpay-receipt-section">
            <p class="picpay-receipt-label">ID da transação</p>
            <p contenteditable="true" spellcheck="false" style="font-size: 0.85rem; color: #111; word-break: break-all; font-weight: 500;">${item.transactionId}</p>
        </div>

        <div class="picpay-info-box">
            <svg viewBox="0 0 24 24" fill="#2196F3" width="24" style="flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <p>Se precisar, você pode devolver o valor total ou parcial desse pagamento por 90 dias a partir da data de recebimento.</p>
        </div>

        <div class="picpay-receipt-footer">
            Dúvidas? Acesse a nossa <span>Central de Ajuda</span>
        </div>

        <div class="picpay-receipt-actions">
            <div class="picpay-action-item" onclick="shareReceipt()">
                <div class="picpay-action-icon">
                    <svg viewBox="0 0 24 24" fill="#11C76F" width="24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                </div>
                <span>Compartilhar Comprovante</span>
            </div>
            <div class="picpay-action-item">
                <div class="picpay-action-icon">
                    <svg viewBox="0 0 24 24" fill="#11C76F" width="24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </div>
                <span>Devolver pagamento</span>
            </div>
            <div class="picpay-action-item">
                <div class="picpay-action-icon">
                    <svg viewBox="0 0 24 24" fill="#11C76F" width="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                </div>
                <span>Guardar dinheiro</span>
            </div>
        </div>
    `;
}

function viewHistoryReceipt(index) {
    const item = appData.history[index];
    const body = document.getElementById('history-receipt-body');
    
    if (appData.currentBank === 'picpay') {
        body.innerHTML = getPicPayReceiptHTML(item);
    } else {
        body.innerHTML = getNubankReceiptHTML(item);
    }
    
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
    const now = new Date();
    const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const dateStrShort = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]}`;
    const dateStrFull = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const randomHex = Array.from({ length: 22 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toLowerCase();
    const idStr = `E18236120${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${randomHex}`;

    // Se não for um contato salvo, gera um nome/cpf aleatório para realismo
    if (!transferData.receiverName || transferData.receiverName === "João Silva") {
        transferData.receiverName = randomNames[Math.floor(Math.random() * randomNames.length)];
        transferData.receiverCpf = randomCpfs[Math.floor(Math.random() * randomCpfs.length)];
    }

    const item = {
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

    const body = document.getElementById('receipt-body');
    if (appData.currentBank === 'picpay') {
        body.innerHTML = getPicPayReceiptHTML(item);
    } else {
        body.innerHTML = getNubankReceiptHTML(item);
    }

    if(!appData.history) appData.history = [];
    appData.history.push(item);

    if(!appData.contacts) appData.contacts = [];
    const exists = appData.contacts.find(c => c.cpf === transferData.receiverCpf);
    if(!exists) {
        appData.contacts.unshift({
            name: transferData.receiverName,
            cpf: transferData.receiverCpf,
            key: transferData.key
        });
        renderContacts();
    }

    // Subtrai do banco ativo
    let currentBalanceNum = parseFloat(appData.currentBank === 'picpay' ? appData.balancePicPay : appData.balanceNubank);
    if (isNaN(currentBalanceNum)) currentBalanceNum = 0;

    currentBalanceNum -= transferData.numericValue;
    if (currentBalanceNum < 0) currentBalanceNum = 0;

    if(appData.currentBank === 'picpay') {
        appData.balancePicPay = currentBalanceNum.toString();
    } else {
        appData.balanceNubank = currentBalanceNum.toString();
    }
    
    localStorage.setItem('nubankCloneData', JSON.stringify(appData));
    
    updateUI();
    renderHistory();

    document.getElementById('success-val').innerText = `R$ ${transferData.value}`;
    document.getElementById('success-name').innerText = `Para ${transferData.receiverName}`;
    navigateTo('success-view');
}

async function shareReceipt() {
    const activeView = document.querySelector('.view.active');
    const receiptArea = activeView.id === 'receipt-view' ? 
        document.querySelector('#receipt-view .receipt-body-white') : 
        document.querySelector('#history-receipt-view .receipt-body-white');

    if (!receiptArea) return;

    const shareBtn = document.querySelector('.view.active .share-receipt');
    if(shareBtn) shareBtn.style.opacity = '0.5';

    try {
        const canvas = await html2canvas(receiptArea, {
            backgroundColor: "#ffffff",
            scale: 3,
            logging: false,
            useCORS: true
        });

        canvas.toBlob(async (blob) => {
            const file = new File([blob], 'comprovante-pix.png', { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Comprovante Pix',
                    text: 'Enviado via PicPay'
                });
            } else {
                const link = document.createElement('a');
                link.download = 'comprovante-pix.png';
                link.href = canvas.toDataURL("image/png");
                link.click();
                alert('O seu navegador não suporta compartilhamento direto de arquivos. A imagem foi baixada para você enviar manualmente.');
            }
        }, 'image/png');

    } catch (err) {
        console.error('Erro ao gerar imagem:', err);
        alert('Erro ao gerar o comprovante em imagem.');
    } finally {
        if(shareBtn) shareBtn.style.opacity = '1';
    }
}

function finishPix() {
    document.getElementById('transfer-input-val').value = '';
    document.getElementById('pix-key-input').value = '';
    document.querySelector('#transfer-view .fab-btn').classList.remove('active');
    document.querySelector('#pix-key-view .fab-btn').classList.remove('active');

    navigateTo('home-view');
}

// Admin Panel Logic
function openAdmin() {
    document.getElementById('admin-name').value = appData.userName;
    document.getElementById('admin-balance-nubank').value = appData.balanceNubank;
    document.getElementById('admin-balance-picpay').value = appData.balancePicPay;
    document.getElementById('admin-invoice').value = appData.invoice;
    document.getElementById('admin-loan').value = appData.loan;
    document.getElementById('admin-bank').value = appData.currentBank || 'nubank';

    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdmin() {
    document.getElementById('admin-modal').style.display = 'none';
}

function saveAdminData() {
    appData.userName = document.getElementById('admin-name').value;
    appData.balanceNubank = document.getElementById('admin-balance-nubank').value.replace(',', '.');
    appData.balancePicPay = document.getElementById('admin-balance-picpay').value.replace(',', '.');
    appData.invoice = document.getElementById('admin-invoice').value.replace(',', '.');
    appData.loan = document.getElementById('admin-loan').value.replace(',', '.');
    appData.currentBank = document.getElementById('admin-bank').value;

    localStorage.setItem('nubankCloneData', JSON.stringify(appData));

    applyTheme();
    updateUI();
    closeAdmin();
    
    // Refresh to home to see changes
    navigateTo('home-view');
}

window.onclick = function (event) {
    const modal = document.getElementById('admin-modal');
    if (event.target == modal) {
        closeAdmin();
    }
}
