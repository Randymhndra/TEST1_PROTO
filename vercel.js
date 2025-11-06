// Ensure required functions exist before calling
if (typeof renderOrders !== "function") {
  console.error("❌ renderOrders() not found. Make sure script.js loads before vercel.js.");
}

// Fetch orders
async function loadOrders() {
  try {
    const res = await fetch('/api?type=orders', { cache: 'no-store' });
    const orders = await res.json();

    if (typeof renderOrders === "function") {
      renderOrders(orders);
    } else {
      console.error("renderOrders is not defined when loadOrders ran");
    }

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
