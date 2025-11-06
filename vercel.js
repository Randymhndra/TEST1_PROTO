// === FORCE INITIAL LOAD ===
window.addEventListener("DOMContentLoaded", async () => {
  console.log("🌐 DOM fully loaded — fetching all data...");
  try {
    // 1. Fetch Orders
    const ordersRes = await fetch('/api?type=orders', { cache: 'no-store' });
    const ordersData = await ordersRes.json();
    if (!Array.isArray(ordersData)) throw new Error("Invalid data from Orders API");
    console.log(`✅ Fetched ${ordersData.length} orders.`);

    // 2. Fetch Projects
    const projectsRes = await fetch('/api?type=projects', { cache: 'no-store' });
    const projectsData = await projectsRes.json();
    if (!Array.isArray(projectsData)) throw new Error("Invalid data from Projects API");
    console.log(`✅ Fetched ${projectsData.length} projects.`);

    // 3. Normalize Orders
    const normalizedOrders = ordersData.map(o => ({
      order_id: o.order_id || "",
      customer_name: o.customer_name || o.customerName || "Unknown Customer",
      product_description: o.product_description || o.product || "",
      quantity: o.quantity || o.qty || 0,
      order_date: o.order_date || o.orderDate || "",
      target_date: o.target_date || o.targetDate || "",
      project_id: o.project_id || o.project || null, // Ensure null for 'None'
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
    
    // 4. Normalize Projects (you may not need this, but it's good practice)
    const normalizedProjects = projectsData.map(p => ({
        project_id: p.project_id,
        project_name: p.project_name,
        client: p.client,
        // ... add other project fields as needed
    }));

    // 5. Save to global variables
    window.orders = normalizedOrders;
    window.projects = normalizedProjects; // This overwrites the sample data
    console.log("...Data normalized and saved to window.");

    // 6. Initialize UI
    if (typeof loadDashboard === "function") {
        console.log("📈 Loading Dashboard...");
        loadDashboard();
    }
    if (typeof loadSavedLogo === "function") {
        console.log("🎨 Loading Logo...");
        loadSavedLogo();
    }
    if (typeof renderOrders === "function") {
        console.log("🎨 Rendering orders...");
        renderOrders(normalizedOrders); // Pre-render the hidden orders tab
    }
    
    console.log("✅ Application initialized successfully.");

  } catch (err) {
    console.error("❌ Failed to fetch or render initial data:", err);
    showAlert("Could not load data from server.", "error");
  }
});