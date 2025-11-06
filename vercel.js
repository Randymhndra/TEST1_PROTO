// === PRIMARY APP LOADER ===
window.addEventListener("DOMContentLoaded", async () => {
  // This function now runs *after* script.js is loaded
  // and *after* the DOM is ready.
  await loadAndInitializeApp();
});

/**
 * Fetches, normalizes, and loads all application data.
 * This is the single source of truth for starting the app.
 */
async function loadAndInitializeApp() {
  console.log("🌐 Initializing application...");
  try {
    // 1. Fetch data from the API
    console.log("...Fetching orders from /api?type=orders");
    const res = await fetch('/api?type=orders', { cache: 'no-store' });
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid data format.");
    console.log(`✅ Fetched ${data.length} orders.`);

    // 2. Normalize data (to match script.js expectations)
    const normalized = data.map(o => ({
      order_id: o.order_id || "",
      customer_name: o.customer_name || o.customerName || "Unknown Customer",
      product_description: o.product_description || o.product || "",
      quantity: o.quantity || o.qty || 0,
      order_date: o.order_date || o.orderDate || "",
      target_date: o.target_date || o.targetDate || "",
      project_id: o.project_id || o.project || "",
      pic_name: o.pic_name || o.picName || "",
      current_status: o.current_status || o.status || "pending",
      priority: o.priority || "medium",
      requires_accessories: o.requires_accessories ?? o.requiresAccessories ?? false,
      requires_welding: o.requires_welding ?? o.requiresWelding ?? false,
      notes: o.notes || "",
      progress: o.progress || 0,
      risk_level: o.risk_level || o.riskLevel || "LOW",
      risk_score: o.risk_score || o.riskScore || 0,
      tracking: o.tracking || []
    }));
    console.log("...Data normalized.");

    // 3. Save to the global variable
    window.orders = normalized;

    // 4. Initialize components NOW that data is ready
    if (typeof loadDashboard === "function") {
      console.log("...Loading Dashboard.");
      loadDashboard();
    } else {
      console.error("❌ loadDashboard() function not found!");
    }

    if (typeof loadSavedLogo === "function") {
      console.log("...Loading Logo.");
      loadSavedLogo();
    } else {
      console.error("❌ loadSavedLogo() function not found!");
    }

    if (typeof renderOrders === "function") {
      console.log("...Pre-rendering Orders tab.");
      renderOrders(normalized); // This populates the hidden tab
    } else {
      console.error("❌ renderOrders() function not found!");
    }
    
    console.log("✅ Application initialized successfully.");

  } catch (err) {
    console.error("❌ Failed to initialize application:", err);
    if (typeof showAlert === "function") {
      showAlert("Could not load application data from server.", "error");
    }
  }
}


// === API FUNCTIONS ===

/**
 * Saves (creates or updates) an order to the database via API.
 * On success, it reloads the entire application.
 */
async function saveOrder(orderData) {
  try {
    // Normalize field names to match MongoDB schema
    const payload = {
      order_id: orderData.order_id || null, // Let API generate if new
      customer_name: orderData.customer_name || '',
      product_description: orderData.product_description || '',
      quantity: parseInt(orderData.quantity) || 0,
      order_date: orderData.order_date || '',
      target_date: orderData.target_date || '',
      project_id: orderData.project_id || '',
      pic_name: orderData.pic_name || '',
      priority: orderData.priority || 'medium',
      requires_accessories: orderData.requires_accessories ?? false,
      requires_welding: orderData.requires_welding ?? false,
      notes: orderData.notes || '',
      current_status: orderData.current_status || 'pending',
      progress: orderData.progress || 0,
      risk_level: orderData.risk_level || 'LOW',
      risk_score: orderData.risk_score || 0,
      tracking: Array.isArray(orderData.tracking) ? orderData.tracking : []
    };

    console.log("🟡 Sending order payload to /api?type=orders:", payload);

    const res = await fetch('/api?type=orders', {
      method: "POST", // Use POST for create/update
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to save order: ${res.status} ${res.statusText} ${text}`);
    }

    const result = await res.json();
    console.log("✅ Order saved to MongoDB:", result);

    showAlert('Order saved successfully', 'success');
    
    // RE-LOAD ALL DATA from DB to sync UI
    await loadAndInitializeApp();
    
    return result;

  } catch (err) {
    console.error('❌ saveOrder error:', err);
    showAlert('Failed to save order. See console for details.', 'error');
    throw err; // Re-throw error so form can handle it
  }
}

/**
 * Deletes an order from the database via API.
 * On success, it reloads the entire application.
 */
async function deleteOrderAPI(orderId) {
  try {
    console.log(`🟡 Deleting order ${orderId}...`);
    
    const res = await fetch('/api?type=orders', {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Failed to delete order: ${res.status} ${res.statusText} ${text}`);
    }

    const result = await res.json();
    console.log("✅ Order deleted from MongoDB:", result);

    showAlert('Order deleted successfully', 'success');
    
    // RE-LOAD ALL DATA from DB to sync UI
    await loadAndInitializeApp();
    
    return result;
    
  } catch (err) {
    console.error('❌ deleteOrderAPI error:', err);
    showAlert('Failed to delete order. See console for details.', 'error');
    throw err; // Re-throw error
  }
}