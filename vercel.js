const API_BASE = "/api/index";

// Fetch orders
async function loadOrders() {
  const res = await fetch(API_BASE);
  const orders = await res.json();
  renderOrders(orders);
}

// Add new order
async function saveOrder(orderData) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const result = await res.json();
  console.log("Saved order:", result);
}
