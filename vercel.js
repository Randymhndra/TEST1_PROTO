// === PRIMARY APP LOADER ===
window.addEventListener("DOMContentLoaded", loadAndInitializeApp);

/**
 * Fetches, normalizes, and loads all application data.
 * This is the single source of truth for starting the app and reloading after saves.
 */
async function loadAndInitializeApp() {
  console.log("🌐 Initializing application... Fetching all data.");
  try {
    // 1. Fetch Orders and Projects in parallel
    const [ordersRes, projectsRes] = await Promise.all([
      fetch('/api?type=orders', { cache: 'no-store' }),
      fetch('/api?type=projects', { cache: 'no-store' })
    ]);

    if (!ordersRes.ok) throw new Error(`Orders API failed: ${ordersRes.statusText}`);
    if (!projectsRes.ok) throw new Error(`Projects API failed: ${projectsRes.statusText}`);

    const ordersData = await ordersRes.json();
    const projectsData = await projectsRes.json();

    if (!Array.isArray(ordersData)) throw new Error("Orders API did not return an array.");
    if (!Array.isArray(projectsData)) throw new Error("Projects API did not return an array.");
    
    console.log(`✅ Fetched ${ordersData.length} orders and ${projectsData.length} projects.`);

    // 2. Normalize Orders
    const normalizedOrders = ordersData.map(o => ({
      order_id: o.order_id || "",
      customer_name: o.customer_name || o.customerName || "Unknown Customer",
      product_description: o.product_description || o.product || "",
      quantity: o.quantity || o.qty || 0,
      order_date: o.order_date || o.orderDate || "",
      target_date: o.target_date || o.targetDate || "",
      project_id: o.project_id || o.project || null,
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
    
    // 3. Normalize Projects (This is the COMPLETE version)
    const normalizedProjects = projectsData.map(p => ({
        project_id: p.project_id,
        project_name: p.project_name,
        project_description: p.project_description || '',
        start_date: p.start_date || '',
        end_date: p.end_date || '',
        client: p.client || '',
        project_manager: p.project_manager || '',
        status: p.status || 'planning',
        notes: p.notes || '',
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
    }));

    // 4. Save to global variables
    // These are the single source of truth for the app
    window.orders = normalizedOrders;
    window.projects = normalizedProjects;
    console.log("...Data normalized and saved to window.");

    // 5. Initialize UI
    // These functions (from script.js) will now use the window.orders/projects
    if (typeof loadDashboard === "function") loadDashboard();
    if (typeof loadSavedLogo === "function") loadSavedLogo();
    
    // Check which tab is active and render it
    const activeTab = document.querySelector('.tab-content.active').id || 'dashboard';
    if (activeTab === 'orders') {
        renderOrders(normalizedOrders);
    } else if (activeTab === 'projects') {
        loadProjects();
    }
    // All other tabs are populated on-demand by showTab()

    if (typeof updateProjectSelects === "function") updateProjectSelects();
    
    console.log("✅ Application initialized successfully.");

  } catch (err) {
    console.error("❌ Failed to initialize application:", err);
    if (typeof showAlert === "function") {
      showAlert("Could not load application data from server.", "error");
    }
  }
}


async function saveOrder(orderData) {
  try {
    console.log("🟡 Sending order payload to /api?type=orders:", orderData);
    const res = await fetch('/api?type=orders', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error(`Failed to save order: ${await res.text()}`);
    
    const result = await res.json();
    console.log("✅ Order saved to MongoDB:", result);
    showAlert('Order saved successfully', 'success');
    
    await loadAndInitializeApp(); // Reload ALL data
    return result;

  } catch (err) {
    console.error('❌ saveOrder error:', err);
    showAlert('Failed to save order. See console for details.', 'error');
    throw err;
  }
}

// RIGHT
async function deleteOrderAPI(orderId) {
  try {
    console.log(`🟡 Deleting order ${orderId}...`);
    const res = await fetch('/api?type=orders', { // <-- Use query param
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (!res.ok) throw new Error(`Failed to delete order: ${await res.text()}`);

    const result = await res.json();
    console.log("✅ Order deleted from MongoDB:", result);
    showAlert('Order deleted successfully', 'success');
    
    await loadAndInitializeApp(); // Reload ALL data
    return result;
    
  } catch (err) {
    console.error('❌ deleteOrderAPI error:', err);
    showAlert('Failed to delete order. See console for details.', 'error');
    throw err;
  }
}

/**
 * Saves (creates or updates) a project to the database via API.
 */
async function saveProjectAPI(projectData) {
  try {
    console.log("🟡 Sending project payload to /api?type=projects:", projectData);
    const res = await fetch('/api?type=projects', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (!res.ok) throw new Error(`Failed to save project: ${await res.text()}`);
    
    const result = await res.json();
    console.log("✅ Project saved to MongoDB:", result);
    showAlert('Project saved successfully', 'success');
    
    await loadAndInitializeApp(); // Reload ALL data
    return result;

  } catch (err) {
    console.error('❌ saveProjectAPI error:', err);
    showAlert('Failed to save project. See console for details.', 'error');
    throw err;
  }
}

// In vercel.js

// RIGHT
async function deleteProjectAPI(projectId) {
  try {
    console.log(`🟡 Deleting project ${projectId}...`);
    
    // This is the correct URL with the query parameter
    const res = await fetch('/api?type=projects', { 
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId }),
    });

    if (!res.ok) throw new Error(`Failed to delete project: ${await res.text()}`);

    const result = await res.json();
    console.log("✅ Project deleted from MongoDB:", result);
    showAlert('Project deleted successfully', 'success');
    
    await loadAndInitializeApp(); // Reload ALL data
    return result;
    
  } catch (err) {
    console.error('❌ deleteProjectAPI error:', err);
    showAlert('Failed to delete project. See console for details.', 'error');
    throw err;
  }
}