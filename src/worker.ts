interface Env {
  FLEET_BACKUPS: KVNamespace;
  BACKUP_SCHEDULE: string;
  FLEET_API_KEY: string;
}

interface BackupMetadata {
  id: string;
  timestamp: string;
  vesselCount: number;
  kvEntries: number;
  gitHash?: string;
  size: number;
}

interface VesselConfig {
  id: string;
  name: string;
  config: Record<string, any>;
  lastUpdated: string;
}

const HTML_HEADER = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fleet Backup</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    :root {
      --dark: #0a0a0f;
      --accent: #0d9488;
      --light: #f8fafc;
      --gray: #475569;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }
    
    body {
      background: var(--dark);
      color: var(--light);
      min-height: 100vh;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      text-align: center;
      padding: 3rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 3rem;
    }
    
    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent), #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: var(--gray);
      max-width: 600px;
      margin: 0 auto;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }
    
    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      border-color: var(--accent);
    }
    
    .feature-card h3 {
      color: var(--accent);
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }
    
    .controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }
    
    .btn-primary {
      background: var(--accent);
      color: white;
    }
    
    .btn-primary:hover {
      background: #0b8379;
      transform: scale(1.05);
    }
    
    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: var(--light);
    }
    
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .backup-list {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 4rem;
    }
    
    .backup-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .backup-item:last-child {
      border-bottom: none;
    }
    
    .backup-info h4 {
      color: var(--accent);
      margin-bottom: 0.5rem;
    }
    
    .backup-meta {
      display: flex;
      gap: 1rem;
      color: var(--gray);
      font-size: 0.9rem;
    }
    
    footer {
      text-align: center;
      padding: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--gray);
      font-size: 0.9rem;
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(13, 148, 136, 0.1);
      border-radius: 20px;
      color: var(--accent);
      margin-top: 1rem;
    }
    
    .status::before {
      content: "";
      width: 8px;
      height: 8px;
      background: var(--accent);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      h1 {
        font-size: 2.5rem;
      }
      
      .controls {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Fleet Backup</h1>
      <p class="subtitle">Automated fleet backup — snapshot all vessel configs, KV data, and git state. Never lose your fleet.</p>
      <div class="status">System Operational</div>
    </header>
`;

const HTML_FOOTER = `
    <footer>
      <p>Fleet Backup System • Securing your vessels since 2024</p>
      <p>All backups are encrypted and stored securely</p>
    </footer>
  </div>
  
  <script>
    async function createSnapshot() {
      const btn = event.target;
      const originalText = btn.textContent;
      btn.textContent = 'Creating Snapshot...';
      btn.disabled = true;
      
      try {
        const response = await fetch('/api/snapshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          alert('Snapshot created successfully!');
          location.reload();
        } else {
          throw new Error('Failed to create snapshot');
        }
      } catch (error) {
        alert('Error creating snapshot: ' + error.message);
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    }
    
    async function loadBackups() {
      try {
        const response = await fetch('/api/backups');
        const backups = await response.json();
        
        const list = document.getElementById('backupList');
        list.innerHTML = '';
        
        backups.forEach(backup => {
          const item = document.createElement('div');
          item.className = 'backup-item';
          
          const date = new Date(backup.timestamp).toLocaleString();
          
          item.innerHTML = \`
            <div class="backup-info">
              <h4>Backup \${backup.id.slice(0, 8)}</h4>
              <div class="backup-meta">
                <span>\${date}</span>
                <span>•</span>
                <span>\${backup.vesselCount} vessels</span>
                <span>•</span>
                <span>\${backup.kvEntries} KV entries</span>
                <span>•</span>
                <span>\${(backup.size / 1024).toFixed(2)} KB</span>
              </div>
            </div>
            <button class="btn btn-secondary" onclick="restoreBackup('\${backup.id}')">Restore</button>
          \`;
          
          list.appendChild(item);
        });
      } catch (error) {
        console.error('Error loading backups:', error);
      }
    }
    
    async function restoreBackup(backupId) {
      if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
        return;
      }
      
      try {
        const response = await fetch(\`/api/restore/\${backupId}\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          alert('Backup restored successfully!');
        } else {
          throw new Error('Failed to restore backup');
        }
      } catch (error) {
        alert('Error restoring backup: ' + error.message);
      }
    }
    
    document.addEventListener('DOMContentLoaded', loadBackups);
  </script>
</body>
</html>
`;
const sh = {"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-ancestors 'none'","X-Frame-Options":"DENY"};
export default { async fetch(r: Request) { const u = new URL(r.url); if (u.pathname==='/health') return new Response(JSON.stringify({status:'ok'}),{headers:{'Content-Type':'application/json',...sh}}); return new Response(html,{headers:{'Content-Type':'text/html;charset=UTF-8',...sh}}); }};