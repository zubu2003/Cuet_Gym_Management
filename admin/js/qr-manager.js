let timerInterval = null;
let autoRegenerateInterval = null;
let currentInterval = 30;

function parseIntervalValue() {
  const inputVal = Number(document.getElementById('refreshInterval')?.value || 30);
  return Math.max(10, Math.min(60, inputVal));
}

function renderQRCode(qrCode) {
  const qrContainer = document.getElementById('dynamicQR');
  if (!qrContainer) return;
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, {
    text: qrCode,
    width: 220,
    height: 220
  });
}

function startCountdown(seconds) {
  if (timerInterval) clearInterval(timerInterval);
  let remaining = seconds;
  const timerEl = document.getElementById('qrTimer');
  const statusEl = document.getElementById('qrStatus');

  if (timerEl) timerEl.textContent = remaining;
  if (statusEl) {
    statusEl.textContent = 'Active';
    statusEl.className = 'status-ok';
  }

  timerInterval = setInterval(() => {
    remaining -= 1;
    if (timerEl) timerEl.textContent = Math.max(0, remaining);
    if (remaining <= 0) {
      clearInterval(timerInterval);
      if (statusEl) {
        statusEl.textContent = 'Refreshing...';
        statusEl.className = 'status-warning';
      }
    }
  }, 1000);
}

async function generateQR() {
  currentInterval = parseIntervalValue();
  document.getElementById('intervalDisplay').textContent = currentInterval;

  try {
    const data = await apiFetch('/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ interval: currentInterval })
    });
    renderQRCode(data.qrCode);
    startCountdown(currentInterval);
  } catch (err) {
    console.error('QR generation failed:', err);
    const statusEl = document.getElementById('qrStatus');
    if (statusEl) {
      statusEl.textContent = 'Error';
      statusEl.className = 'status-danger';
    }
  }
}

async function loadRecentScans() {
  try {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const logs = await apiFetch(`/logs?date=${date}`);

    const tbody = document.getElementById('scanLogs');
    const scanCountEl = document.getElementById('scanCount');
    if (!tbody || !scanCountEl) return;

    scanCountEl.textContent = `${logs.length} scans today`;

    if (!logs.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No scans today</td></tr>';
      return;
    }

    tbody.innerHTML = logs.slice(0, 20).map(log => `
      <tr>
        <td>${log.time || '-'}</td>
        <td>${log.studentName || '-'}</td>
        <td>${log.studentId || '-'}</td>
        <td>${log.type === 'entry' ? 'Check IN' : 'Check OUT'}</td>
        <td class="${log.type === 'entry' ? 'status-ok' : 'status-warning'}">${log.type === 'entry' ? 'Inside' : 'Left'}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Failed to load scan logs:', error);
  }
}

function setupAutoRegenerate() {
  if (autoRegenerateInterval) clearInterval(autoRegenerateInterval);
  autoRegenerateInterval = setInterval(generateQR, currentInterval * 1000);
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('regenerateBtn')?.addEventListener('click', generateQR);
  document.getElementById('applySettingsBtn')?.addEventListener('click', () => {
    generateQR();
    setupAutoRegenerate();
  });

  await generateQR();
  setupAutoRegenerate();
  await loadRecentScans();
  setInterval(loadRecentScans, 10000);
});