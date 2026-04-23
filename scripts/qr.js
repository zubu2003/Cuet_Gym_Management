const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5001/api' : '/api';
const token = localStorage.getItem('token');
const currentStudentId = localStorage.getItem('studentId');
const currentStudentName = localStorage.getItem('studentName') || 'Student';

let html5QrCode = null;
let isScannerRunning = false;
let isProcessingScan = false;
let lastScannedContent = '';
let lastScanTime = 0;

function checkAuth() {
  if (!token || !currentStudentId) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = 'login.html';
    throw new Error('Session expired');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showResult(message, type) {
  const resultEl = document.getElementById('scanResult');
  if (!resultEl) return;
  resultEl.textContent = message;
  resultEl.className = `scan-result ${type}`;
}

function updateStatusDisplay(isInside) {
  const statusDisplay = document.getElementById('statusDisplay');
  if (!statusDisplay) return;

  if (isInside) {
    statusDisplay.innerHTML = `
      <span class="material-icons">check_circle</span>
      <span>Currently checked in</span>
    `;
    statusDisplay.className = 'status-display status-in';
  } else {
    statusDisplay.innerHTML = `
      <span class="material-icons">info</span>
      <span>Not checked in</span>
    `;
    statusDisplay.className = 'status-display status-out';
  }
}

function renderTodayActivity(logs) {
  const logList = document.getElementById('logList');
  if (!logList) return;

  if (!logs.length) {
    logList.innerHTML = '<p class="no-log">No activity yet. Scan QR code to check in/out.</p>';
    return;
  }

  logList.innerHTML = logs
    .map(log => {
      const action = log.type === 'entry' ? 'Check IN' : 'Check OUT';
      const durationText = log.duration ? ` (${log.duration} min)` : '';
      return `<div class="log-item">${log.time} - ${action}${durationText}</div>`;
    })
    .join('');
}

async function refreshCurrentStatus() {
  try {
    const active = await apiFetch('/logs/active');
    const isInside = active.some(s => s.studentId === currentStudentId);
    updateStatusDisplay(isInside);

    const maxCapacity = 40;
    const currentCount = active.length;
    const percent = (currentCount / maxCapacity) * 100;
    const gymCapacityEl = document.getElementById('gymCapacityCount');
    const gymCrowdStatusEl = document.getElementById('gymCrowdStatus');

    if (gymCapacityEl) {
      gymCapacityEl.textContent = `${currentCount} / ${maxCapacity}`;
    }
    if (gymCrowdStatusEl) {
      if (percent < 70) {
        gymCrowdStatusEl.textContent = '✅ Not Crowded';
        gymCrowdStatusEl.className = 'gym-status-state status-ok';
      } else if (percent < 90) {
        gymCrowdStatusEl.textContent = '⚠️ Getting Crowded';
        gymCrowdStatusEl.className = 'gym-status-state status-warning';
      } else {
        gymCrowdStatusEl.textContent = '🔴 Very Crowded';
        gymCrowdStatusEl.className = 'gym-status-state status-danger';
      }
    }
  } catch (error) {
    console.error('Failed to refresh status:', error);
  }
}

async function refreshTodayActivity() {
  try {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const logs = await apiFetch(`/logs?search=${encodeURIComponent(currentStudentId)}&date=${dateStr}`);
    renderTodayActivity(logs);
  } catch (error) {
    console.error('Failed to refresh activity:', error);
  }
}

async function processScannedCode(content) {
  if (isProcessingScan) return;

  // Prevent duplicate scans of same frame within short period
  const now = Date.now();
  if (content === lastScannedContent && now - lastScanTime < 3000) return;
  lastScannedContent = content;
  lastScanTime = now;

  isProcessingScan = true;
  try {
    const scanResult = await apiFetch('/qr/scan', {
      method: 'POST',
      body: JSON.stringify({
        qrCode: content,
        studentId: currentStudentId,
        studentName: currentStudentName
      })
    });

    const actionText = scanResult.action === 'entry' ? 'IN' : 'OUT';
    showResult(`✅ Checked ${actionText} successfully!`, 'success');

    await refreshCurrentStatus();
    await refreshTodayActivity();
    await stopScanner();
  } catch (err) {
    showResult(`❌ ${err.message}`, 'error');
  } finally {
    isProcessingScan = false;
  }
}

async function startScanner() {
  const modal = document.getElementById('scannerModal');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');
  const qrReaderId = 'qrReader';

  if (!window.Html5Qrcode) {
    showResult('❌ QR scanner library not loaded', 'error');
    return;
  }

  if (isScannerRunning) return;

  if (modal) {
    modal.classList.remove('hidden');
  }

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(qrReaderId);
  }

  const config = {
    fps: 10,
    qrbox: { width: 240, height: 240 },
    aspectRatio: 1.0
  };

  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        processScannedCode(decodedText);
      },
      () => {}
    );

    isScannerRunning = true;
    showResult('📷 Camera opened. Scan QR now.', 'success');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
  } catch (error) {
    try {
      await html5QrCode.start(
        { facingMode: 'user' },
        config,
        (decodedText) => {
          processScannedCode(decodedText);
        },
        () => {}
      );
      isScannerRunning = true;
      showResult('📷 Camera opened. Scan QR now.', 'success');
      if (startBtn) startBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
    } catch (secondError) {
      showResult(`❌ Unable to start camera: ${secondError.message}`, 'error');
      if (modal) modal.classList.add('hidden');
    }
  }
}

async function stopScanner() {
  const modal = document.getElementById('scannerModal');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');

  try {
    if (html5QrCode && isScannerRunning) {
      await html5QrCode.stop();
      await html5QrCode.clear();
    }
  } catch (error) {
    console.error('Failed stopping scanner:', error);
  } finally {
    isScannerRunning = false;
    if (modal) modal.classList.add('hidden');
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  document.getElementById('startScanBtn')?.addEventListener('click', () => {
    startScanner();
  });
  document.getElementById('stopScanBtn')?.addEventListener('click', () => {
    stopScanner();
    showResult('Camera closed.', 'info');
  });
  document.getElementById('closeScannerBtn')?.addEventListener('click', () => {
    stopScanner();
    showResult('Camera closed.', 'info');
  });
  document.getElementById('scannerModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'scannerModal') {
      stopScanner();
      showResult('Camera closed.', 'info');
    }
  });

  await refreshCurrentStatus();
  await refreshTodayActivity();
});

window.addEventListener('beforeunload', () => {
  if (html5QrCode && isScannerRunning) {
    html5QrCode.stop().catch(() => {});
  }
});