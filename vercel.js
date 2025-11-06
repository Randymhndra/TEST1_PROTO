const API_BASE = "https://test-1-proto.vercel.app/"; // or http://localhost:3000

// Fetch orders
async function loadOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  const orders = await res.json();
  renderOrders(orders);
}

// Add new order
async function saveOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const result = await res.json();
  console.log("Saved order:", result);
}