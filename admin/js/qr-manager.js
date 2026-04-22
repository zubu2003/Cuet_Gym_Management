const API_BASE = 'http://localhost:5000/api';
let qrCode = null;
let timerInterval;
let secondsLeft = 30;

async function generateQR() {
  const interval = parseInt(document.getElementById('refreshInterval').value) || 30;
  try {
    const response = await fetch(`${API_BASE}/qr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval })
    });
    const data = await response.json();
    qrCode = data.qrCode;
    document.getElementById('entryQR').innerHTML = '';
    new QRCode(document.getElementById('entryQR'), { text: qrCode, width: 200, height: 200 });
    startTimer(interval);
  } catch (err) { console.error(err); }
}

function startTimer(seconds) {
  if (timerInterval) clearInterval(timerInterval);
  secondsLeft = seconds;
  document.getElementById('qrTimer').textContent = secondsLeft;
  timerInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById('qrTimer').textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById('qrStatus').textContent = 'Expired';
    }
  }, 1000);
}

document.getElementById('regenerateBtn')?.addEventListener('click', generateQR);
document.getElementById('applySettingsBtn')?.addEventListener('click', generateQR);
generateQR();