document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌐 DOM fully loaded — initializing order system...");
  if (typeof loadOrders === "function") {
    console.log("✅ Calling loadOrders() at startup...");
    await loadOrders();
  } else {
    console.warn("⚠️ loadOrders() not defined yet, will retry...");
    const retry = setInterval(() => {
      if (typeof loadOrders === "function") {
        clearInterval(retry);
        console.log("✅ loadOrders() ready, executing...");
        loadOrders();
      }
    }, 300);
  }
});

// Fetch orders from MongoDB
async function loadOrders() {
  try {
    const res = await fetch('/api?type=orders', { cache: 'no-store' });
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error('Invalid response format');

    // ✅ Replace global orders with backend data
    window.orders = data.map(o => ({
      order_id: o.order_id || `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customer_name: o.customer_name || o.customerName || 'Unknown Customer',
      product_description: o.product_description || o.product || '',
      quantity: o.quantity || 0,
      order_date: o.order_date || o.orderDate || '',
      target_date: o.target_date || o.targetDate || '',
      project_id: o.project_id || '',
      pic_name: o.pic_name || '',
      current_status: o.current_status || 'pending',
      priority: o.priority || 'medium',
      requires_accessories: o.requires_accessories ?? false,
      requires_welding: o.requires_welding ?? false,
      notes: o.notes || '',
      progress: o.progress || 0,
      risk_level: o.risk_level || 'LOW',
      risk_score: o.risk_score || 0,
      tracking: o.tracking || []
    }));

    console.log('✅ Orders loaded:', window.orders);

    const renderCheck = setInterval(() => {
      if (typeof renderOrders === 'function') {
        clearInterval(renderCheck);
        console.log('🎨 Rendering orders...');
        renderOrders(window.orders);
      } else {
        console.warn('⏳ Waiting for renderOrders() before rendering...');
      }
    }, 300);

  } catch (err) {
    console.error('loadOrders error:', err);
    showAlert('Could not load orders from server.', 'error');
  }
}

async function saveOrder(orderData) {
  try {
    // Normalize field names to match MongoDB schema
    const payload = {
      order_id: orderData.order_id || `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      customer_name: orderData.customerName || orderData.customer_name || '',
      product_description: orderData.product || orderData.product_description || '',
      quantity: orderData.qty || orderData.quantity || 0,
      order_date: orderData.orderDate || orderData.order_date || '',
      target_date: orderData.targetDate || orderData.target_date || '',
      project_id: orderData.project || orderData.project_id || '',
      pic_name: orderData.picName || orderData.pic_name || '',
      priority: orderData.priority || 'medium',
      requires_accessories: orderData.requires_accessories ?? orderData.requiresAccessories ?? false,
      requires_welding: orderData.requires_welding ?? orderData.requiresWelding ?? false,
      notes: orderData.notes || '',
      current_status: orderData.current_status || 'pending',
      progress: orderData.progress || 0,
      risk_level: orderData.risk_level || 'LOW',
      risk_score: orderData.risk_score || 0,
      tracking: Array.isArray(orderData.tracking) ? orderData.tracking : []
    };

    console.log("🟡 Sending order payload:", payload);

    const res = await fetch('/api?type=orders', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to save order: ${res.status} ${res.statusText} ${text}`);
    }

    const result = await res.json();
    console.log("✅ Order saved to MongoDB:", result);

    // Refresh the orders table immediately
    if (typeof loadOrders === "function") {
      await loadOrders();
    }

    showAlert('Order saved successfully', 'success');
    return result;

  } catch (err) {
    console.error('❌ saveOrder error:', err);
    showAlert('Failed to save order. See console for details.', 'error');
    throw err;
  }
}

// === FORCE INITIAL LOAD ===
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🌐 DOM fully loaded — fetching Orders now...");
  try {
    const res = await fetch('/api?type=orders', { cache: 'no-store' });
    const orders = await res.json();
    console.log("✅ Fetched from API:", orders);
    if (typeof renderOrders === "function") renderOrders(orders);
  } catch (err) {
    console.error("❌ Failed to fetch orders:", err);
  }
});
