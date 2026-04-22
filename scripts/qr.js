const API_BASE = 'https://gymmanagementbackend.vercel.app/api';
const token = localStorage.getItem('token');
const currentStudentId = localStorage.getItem('studentId');
const currentStudentName = localStorage.getItem('studentName') || 'Student';

let scanner = null;
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
    statusDisplay.className = 'status-display';
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
    await apiFetch('/qr/validate', {
      method: 'POST',
      body: JSON.stringify({ qrCode: content })
    });

    // First try check-in, if already inside fallback to checkout
    try {
      await apiFetch('/logs/entry', {
        method: 'POST',
        body: JSON.stringify({ studentId: currentStudentId, studentName: currentStudentName })
      });
      showResult('✅ Checked IN successfully!', 'success');
    } catch (entryErr) {
      await apiFetch('/logs/exit', {
        method: 'POST',
        body: JSON.stringify({ studentId: currentStudentId, studentName: currentStudentName })
      });
      showResult('✅ Checked OUT successfully!', 'success');
    }

    await refreshCurrentStatus();
    await refreshTodayActivity();
  } catch (err) {
    showResult(`❌ ${err.message}`, 'error');
  } finally {
    isProcessingScan = false;
  }
}

async function startScanner() {
  const preview = document.getElementById('preview');
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');

  if (!preview || !window.Instascan) {
    showResult('❌ QR scanner library not loaded', 'error');
    return;
  }

  try {
    scanner = new Instascan.Scanner({ video: preview, mirror: false });
    scanner.addListener('scan', processScannedCode);

    const cameras = await Instascan.Camera.getCameras();
    if (!cameras.length) {
      showResult('❌ No camera found on this device', 'error');
      return;
    }

    await scanner.start(cameras[0]);
    showResult('📷 Camera started. Scan QR now.', 'success');
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
  } catch (error) {
    showResult(`❌ Unable to start camera: ${error.message}`, 'error');
  }
}

function stopScanner() {
  const startBtn = document.getElementById('startScanBtn');
  const stopBtn = document.getElementById('stopScanBtn');

  if (scanner) {
    scanner.stop();
    scanner = null;
  }

  if (startBtn) startBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
  showResult('Camera stopped.', 'info');
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAuth()) return;

  document.getElementById('startScanBtn')?.addEventListener('click', startScanner);
  document.getElementById('stopScanBtn')?.addEventListener('click', stopScanner);

  await refreshCurrentStatus();
  await refreshTodayActivity();
});