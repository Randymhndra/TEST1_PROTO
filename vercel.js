const API_BASE = "https://test-1-proto.vercel.app/"; // or http://localhost:3000

// Use relative API paths so you don't depend on API_BASE being exact
// (keeps addresses exactly as your backend expects: /api?type=orders)
async function loadOrders() {
  try {
    const res = await fetch('/api?type=orders', { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to load orders: ${res.status} ${res.statusText} ${text}`);
    }
    const orders = await res.json();
    renderOrders(orders);
  } catch (err) {
    console.error('loadOrders error:', err);
    showAlert('Could not load orders from server. Open console/Network tab for details.', 'error');
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
    console.log("Saved order:", result);
    return result;
  } catch (err) {
    console.error('saveOrder error:', err);
    showAlert('Failed to save order. See console for details.', 'error');
    throw err;
  }
}
