// QR Scanner page JS
document.addEventListener('DOMContentLoaded', function() {
    let scanner = null;
    let isScanning = false;
    
    const preview = document.getElementById('preview');
    const startBtn = document.getElementById('startScanBtn');
    const stopBtn = document.getElementById('stopScanBtn');
    const resultDiv = document.getElementById('scanResult');
    const logList = document.getElementById('logList');
    const statusDisplay = document.getElementById('statusDisplay');
    
    // Get current user (in real app, this comes from login)
    // For demo, we'll use a fixed user
    const currentUser = {
        id: 'STU001',
        name: 'Sazid',
        email: 'sazid@cuet.ac.bd'
    };
    
    // Get current date
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    
    // Load today's logs from localStorage
    let todayLogs = JSON.parse(localStorage.getItem(`gym_logs_${dateStr}_${currentUser.id}`)) || [];
    
    // Check if user is currently inside
    function isUserInside() {
        // Find if there's an entry without exit today
        const lastEntry = todayLogs.filter(log => log.type === 'entry').pop();
        const lastExit = todayLogs.filter(log => log.type === 'exit').pop();
        
        if (!lastEntry) return false;
        if (!lastExit) return true;
        
        return lastEntry.timestamp > lastExit.timestamp;
    }
    
    // Update status display
    function updateStatusDisplay() {
        if (!statusDisplay) return;
        
        const inside = isUserInside();
        statusDisplay.className = inside ? 'status-display inside' : 'status-display outside';
        
        if (inside) {
            statusDisplay.innerHTML = `
                <span class="material-icons">fitness_center</span>
                <span>✅ You are currently INSIDE the gym</span>
            `;
        } else {
            statusDisplay.innerHTML = `
                <span class="material-icons">logout</span>
                <span>❌ You are OUTSIDE the gym</span>
            `;
        }
    }
    
    // Update log display
    function updateLogDisplay() {
        if (!logList) return;
        
        if (todayLogs.length === 0) {
            logList.innerHTML = '<p class="no-log">No activity yet. Scan QR code to check in/out.</p>';
            return;
        }
        
        logList.innerHTML = '';
        // Show logs in reverse order (newest first)
        [...todayLogs].reverse().forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.innerHTML = `
                <span class="log-time">${log.time}</span>
                <span class="log-type ${log.type}">
                    <span class="material-icons">${log.type === 'entry' ? 'login' : 'logout'}</span>
                    ${log.type === 'entry' ? 'Checked IN' : 'Checked OUT'}
                </span>
                <span class="log-message">${log.message}</span>
            `;
            logList.appendChild(logItem);
        });
    }
    
    // Add log to storage
    function addLog(type, message, scannedData) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        const logEntry = {
            time: timeStr,
            type: type,
            message: message,
            scannedData: scannedData,
            timestamp: now.getTime()
        };
        
        todayLogs.push(logEntry);
        localStorage.setItem(`gym_logs_${dateStr}_${currentUser.id}`, JSON.stringify(todayLogs));
        
        updateLogDisplay();
        updateStatusDisplay();
        
        return logEntry;
    }
    
    // Process scanned QR code
    function processScannedCode(content) {
        // Parse QR content (in real app, this will come from admin's dynamic QR)
        let studentId = content;
        let studentName = currentUser.name;
        let qrType = 'dynamic';
        
        // Try to extract info from QR (for demo)
        if (content.includes('|')) {
            const parts = content.split('|');
            studentId = parts[0];
            qrType = parts[1] || 'dynamic';
        }
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        // Check if user is inside
        const isInside = isUserInside();
        
        if (!isInside) {
            // User is outside -> Check IN
            addLog('entry', `Checked IN at ${timeStr}`, studentId);
            
            resultDiv.className = 'scan-result';
            resultDiv.innerHTML = `
                ✅ CHECK IN SUCCESSFUL!<br>
                Welcome ${studentName}!<br>
                You checked in at ${timeStr}<br>
                Enjoy your workout! 💪
            `;
            resultDiv.style.display = 'block';
            
            // Play success sound effect (optional)
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 4000);
            
        } else {
            // User is inside -> Check OUT
            // Find entry time to calculate duration
            const entryLog = [...todayLogs].reverse().find(log => log.type === 'entry');
            const entryTime = entryLog ? new Date(entryLog.timestamp) : null;
            
            let durationMsg = '';
            if (entryTime) {
                const durationMs = now - entryTime;
                const durationMin = Math.floor(durationMs / 60000);
                const durationHour = Math.floor(durationMin / 60);
                const durationMinRemain = durationMin % 60;
                
                if (durationHour > 0) {
                    durationMsg = `Duration: ${durationHour}h ${durationMinRemain}m`;
                } else {
                    durationMsg = `Duration: ${durationMin} minutes`;
                }
            }
            
            addLog('exit', `Checked OUT at ${timeStr}`, studentId);
            
            resultDiv.className = 'scan-result';
            resultDiv.innerHTML = `
                ✅ CHECK OUT SUCCESSFUL!<br>
                Goodbye ${studentName}!<br>
                You checked out at ${timeStr}<br>
                ${durationMsg}<br>
                Come back soon! 👋
            `;
            resultDiv.style.display = 'block';
            
            setTimeout(() => {
                resultDiv.style.display = 'none';
            }, 4000);
        }
        
        // For demo, also show alert
        const action = !isInside ? 'IN' : 'OUT';
        alert(`${action} recorded for ${studentName} at ${timeStr}`);
    }
    
    // Start scanning
    startBtn.addEventListener('click', function() {
        if (scanner) {
            scanner.stop();
        }
        
        scanner = new Instascan.Scanner({ 
            video: preview,
            mirror: false,
            backgroundScan: true,
            continuous: true
        });
        
        scanner.addListener('scan', function(content) {
            if (content && content.trim()) {
                processScannedCode(content);
            }
        });
        
        Instascan.Camera.getCameras().then(function(cameras) {
            if (cameras.length > 0) {
                // Use back camera if available
                const backCamera = cameras.find(cam => 
                    cam.name.toLowerCase().includes('back') || 
                    cam.name.toLowerCase().includes('rear')
                ) || cameras[0];
                
                scanner.start(backCamera);
                preview.style.display = 'block';
                startBtn.disabled = true;
                stopBtn.disabled = false;
                isScanning = true;
                
                resultDiv.className = 'scan-result';
                resultDiv.innerHTML = '📷 Camera started. Point at QR code to scan.';
                resultDiv.style.display = 'block';
                
                setTimeout(() => {
                    if (resultDiv.innerHTML === '📷 Camera started. Point at QR code to scan.') {
                        resultDiv.style.display = 'none';
                    }
                }, 3000);
            } else {
                alert('No cameras found on this device.');
            }
        }).catch(function(e) {
            console.error(e);
            alert('Camera access denied. Please allow camera permissions to use QR scanner.');
        });
    });
    
    // Stop scanning
    stopBtn.addEventListener('click', function() {
        if (scanner) {
            scanner.stop();
            scanner = null;
        }
        
        preview.style.display = 'none';
        startBtn.disabled = false;
        stopBtn.disabled = true;
        isScanning = false;
        resultDiv.style.display = 'none';
    });
    
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Initialize displays
    updateLogDisplay();
    updateStatusDisplay();
});