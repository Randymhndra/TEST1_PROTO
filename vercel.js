document.addEventListener("DOMContentLoaded", () => {
  // Only load orders after script.js has fully loaded
  if (typeof renderOrders !== "function") {
    console.warn("⚠️ renderOrders() not yet loaded, retrying...");
    const interval = setInterval(() => {
      if (typeof renderOrders === "function") {
        clearInterval(interval);
        console.log("✅ renderOrders() available, loading orders...");
        loadOrders();
      }
    }, 200);
  } else {
    console.log("✅ renderOrders() available, loading orders...");
    loadOrders();
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

    if (typeof renderOrders === 'function') {
      renderOrders(window.orders);
    } else {
      console.error('renderOrders() not found');
    }

  } catch (err) {
    console.error('loadOrders error:', err);
    showAlert('Could not load orders from server.', 'error');
  }
}

async function saveOrder(orderData) {
  try {
    const res = await fetch('/api?type=orders', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to save order: ${res.status} ${res.statusText} ${text}`);
    }

    const result = await res.json();
    console.log("✅ Saved order:", result);

    // ✅ reload list immediately
    if (typeof loadOrders === "function") {
      await loadOrders();
    }

    showAlert('Order saved successfully', 'success');
    return result;
  } catch (err) {
    console.error('saveOrder error:', err);
    showAlert('Failed to save order. See console for details.', 'error');
    throw err;
  }
}

