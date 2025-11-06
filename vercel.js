// ===== REAL-TIME SYNC CONFIGURATION =====
const API_BASE = '/api'; // Ganti dengan URL API Vercel
let lastSyncTime = 0;
let syncInterval = 5000; // Sync setiap 5 detik
let isFirstLoad = true;

// ===== SETUP REAL-TIME SYNC =====
function setupRealtimeSync() {
  // Initial load
  syncDataFromServer();

  // Setup interval untuk auto-sync
  setInterval(syncDataFromServer, syncInterval);

  // Setup WebSocket-like polling untuk instant update
  setupPushNotifications();
}

// ===== SYNC DATA DARI SERVER =====
async function syncDataFromServer() {
  try {
    // Fetch orders
    const ordersRes = await fetch(`${API_BASE}?type=orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    // Fetch projects
    const projectsRes = await fetch(`${API_BASE}?type=projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (ordersRes.ok && projectsRes.ok) {
      const ordersData = await ordersRes.json();
      const projectsData = await projectsRes.json();

      if (ordersData.success && projectsData.success) {
        // Update data
        orders = ordersData.data || [];
        projects = projectsData.data || [];

        // Trigger UI update jika data berubah
        if (!isFirstLoad) {
          updateUI();
        }

        isFirstLoad = false;
        lastSyncTime = Date.now();

        console.log('✅ Data synced from server:', { orders: orders.length, projects: projects.length });
      }
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
}

// ===== UPDATE UI SETELAH SYNC =====
function updateUI() {
  const activeTab = document.querySelector('.tab-content.active');

  if (activeTab && activeTab.id === 'dashboard') {
    loadDashboard();
  } else if (activeTab && activeTab.id === 'orders') {
    loadOrders();
  } else if (activeTab && activeTab.id === 'projects') {
    loadProjects();
  } else if (activeTab && activeTab.id === 'tracking') {
    loadOrdersForTracking();
  } else if (activeTab && activeTab.id === 'dss') {
    loadOrdersForDSS();
  }
}

// ===== PUSH NOTIFICATIONS (INSTANT UPDATE) =====
function setupPushNotifications() {
  // Check untuk update setiap 3 detik
  setInterval(async () => {
    try {
      const lastUpdateRes = await fetch(`${API_BASE}?type=sync`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (lastUpdateRes.ok) {
        const syncData = await lastUpdateRes.json();
        
        // Jika ada update lebih baru dari last sync, fetch ulang data
        if (syncData.data && syncData.data.timestamp) {
          const serverTime = new Date(syncData.data.timestamp).getTime();
          if (serverTime > lastSyncTime) {
            console.log('🔄 New update detected, syncing...');
            await syncDataFromServer();
          }
        }
      }
    } catch (error) {
      console.error('Push notification check error:', error);
    }
  }, 3000);
}

// ===== OVERRIDE CREATE ORDER UNTUK AUTO-SYNC =====
const originalOrderFormSubmit = document.getElementById('order-form')?.addEventListener('submit', async (e) => {
  // Setelah order dibuat, auto-sync data
  setTimeout(() => {
    syncDataFromServer();
  }, 1000);
});

// ===== OVERRIDE CREATE PROJECT UNTUK AUTO-SYNC =====
const originalProjectFormSubmit = document.getElementById('project-form')?.addEventListener('submit', async (e) => {
  // Setelah project dibuat, auto-sync data
  setTimeout(() => {
    syncDataFromServer();
  }, 1000);
});

// ===== OVERRIDE TRACKING FORM UNTUK AUTO-SYNC =====
const originalTrackingFormSubmit = document.getElementById('tracking-form')?.addEventListener('submit', async (e) => {
  // Setelah tracking update, auto-sync data
  setTimeout(() => {
    syncDataFromServer();
  }, 500); // Lebih cepat untuk tracking
});

// ===== MULAI REAL-TIME SYNC SAAT PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  setupRealtimeSync();
  loadDashboard();
  loadSavedLogo();
});