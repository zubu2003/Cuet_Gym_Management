async function processScannedCode(content) {
  // First validate QR with backend
  try {
    const validateRes = await fetch(`${API_BASE}/qr/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCode: content })
    });
    if (!validateRes.ok) {
      showResult('❌ Invalid or expired QR code!', 'error');
      return;
    }
    // QR is valid – proceed with entry/exit
    let response = await fetch(`${API_BASE}/logs/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: currentStudentId, studentName: currentStudentName })
    });
    if (response.ok) showResult('✅ Checked IN successfully!', 'success');
    else {
      response = await fetch(`${API_BASE}/logs/exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: currentStudentId, studentName: currentStudentName })
      });
      if (response.ok) showResult('✅ Checked OUT successfully!', 'success');
      else showResult('❌ Error processing QR', 'error');
    }
  } catch (err) { showResult('Network error: ' + err.message, 'error'); }
}