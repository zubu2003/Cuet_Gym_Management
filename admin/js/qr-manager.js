// QR Manager JavaScript - Single QR for Entry & Exit
let dynamicQR;
let currentQRCode;
let timerInterval;
let secondsLeft = 30;
let refreshInterval = 30;

function generateQRCode() {
    const timestamp = Date.now();
    const token = Math.random().toString(36).substring(2, 15);
    // Single QR for both entry and exit
    currentQRCode = `GYM_ACCESS_${timestamp}_${token}`;
    
    const qrContainer = document.getElementById("dynamicQR");
    qrContainer.innerHTML = '';
    
    dynamicQR = new QRCode(qrContainer, {
        text: currentQRCode,
        width: 250,
        height: 250,
        colorDark: "#1e3c72",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Store in localStorage for validation
    localStorage.setItem('admin_current_qr', JSON.stringify({ 
        code: currentQRCode, 
        expires: timestamp + refreshInterval * 1000 
    }));
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    secondsLeft = refreshInterval;
    
    timerInterval = setInterval(() => {
        secondsLeft--;
        document.getElementById('qrTimer').textContent = secondsLeft;
        if (secondsLeft <= 0) {
            document.getElementById('qrStatus').textContent = 'Expired';
            document.getElementById('qrStatus').className = 'status-danger';
            clearInterval(timerInterval);
        }
    }, 1000);
}

function regenerateQR() {
    generateQRCode();
    startTimer();
    document.getElementById('qrStatus').textContent = 'Active';
    document.getElementById('qrStatus').className = 'status-ok';
    document.getElementById('intervalDisplay').textContent = refreshInterval;
}

function updateInterval() {
    refreshInterval = parseInt(document.getElementById('refreshInterval').value);
    document.getElementById('intervalDisplay').textContent = refreshInterval;
    regenerateQR();
}

function loadScanLogs() {
    const scans = JSON.parse(localStorage.getItem('qr_scans')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todayScans = scans.filter(s => s.date === today);
    document.getElementById('scanCount').textContent = `${todayScans.length} scans today`;
    
    const tbody = document.getElementById('scanLogs');
    if (scans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No scans yet</td></tr>';
        return;
    }
    tbody.innerHTML = scans.slice(-20).reverse().map(s => `
        <tr>
            <td>${s.time}</td>
            <td>${s.studentName}</td>
            <td>${s.studentId}</td>
            <td class="${s.action === 'Check In' ? 'status-ok' : 'status-warning'}">${s.action}</td>
            <td class="status-ok">${s.status}</td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    generateQRCode();
    startTimer();
    loadScanLogs();
    setInterval(loadScanLogs, 5000);
    
    document.getElementById('regenerateBtn').addEventListener('click', regenerateQR);
    document.getElementById('applySettingsBtn').addEventListener('click', updateInterval);
});