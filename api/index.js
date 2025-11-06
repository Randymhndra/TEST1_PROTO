// api/index.js
import { MongoClient } from "mongodb";
import * as XLSX from "xlsx";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "javaconnection";

// Initialize database once at cold start
initializeData();

// === BODY PARSER ===
async function getBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null;
  }
}

// === MAIN HANDLER ===
export default async function handler(req, res) {
  const { type, id } = req.query;
  const method = req.method;

  try {
    await client.connect();
    const db = client.db(dbName);

    switch (type) {
      case "orders":
        return await handleOrders(db, req, res, method, id);
      case "projects":
        return await handleProjects(db, req, res, method, id);
      case "settings":
        return await handleSettings(db, req, res, method);
      case "tracking":
        return await handleTracking(db, req, res, method, id);
      case "export":
        return await handleExport(db, req, res, method);
      default:
        return res.status(400).json({ error: "Invalid API type" });
    }
  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({ error: "Database connection failed" });
  } finally {
    await client.close();
  }
}

// === ORDERS HANDLER ===
async function handleOrders(db, req, res, method, id) {
  const collection = db.collection("orders");
  switch (method) {
    case "GET":
      if (id) {
        const order = await collection.findOne({ order_id: id });
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json(order);
      }
      const allOrders = await collection.find({}).toArray();
      return res.status(200).json(allOrders);

    case "POST":
      const newOrder = await getBody(req);
      newOrder.order_id = `ORD-${Date.now()}`;
      newOrder.created_at = new Date().toISOString();
      newOrder.updated_at = new Date().toISOString();
      newOrder.current_status = "pending";
      newOrder.progress = 0;
      newOrder.risk_level = "LOW";
      newOrder.risk_score = 10;
      newOrder.tracking = initializeTracking(newOrder);

      await collection.insertOne(newOrder);
      return res.status(201).json(newOrder);

    case "PUT":
      if (!id) return res.status(400).json({ error: "Order ID required" });
      const body = await getBody(req);
      await collection.updateOne({ order_id: id }, { $set: { ...body, updated_at: new Date().toISOString() } });
      const updated = await collection.findOne({ order_id: id });
      return res.status(200).json(updated);

    case "DELETE":
      if (!id) return res.status(400).json({ error: "Order ID required" });
      await collection.deleteOne({ order_id: id });
      return res.status(200).json({ message: "Order deleted successfully" });

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === PROJECTS HANDLER ===
async function handleProjects(db, req, res, method, id) {
  const collection = db.collection("projects");
  switch (method) {
    case "GET":
      if (id) {
        const project = await collection.findOne({ project_id: id });
        if (!project) return res.status(404).json({ error: "Project not found" });
        return res.status(200).json(project);
      }
      const allProjects = await collection.find({}).toArray();
      return res.status(200).json(allProjects);

    case "POST":
      const newProject = await getBody(req);
      newProject.project_id = `PRJ-${Date.now()}`;
      newProject.created_at = new Date().toISOString();
      newProject.updated_at = new Date().toISOString();
      await collection.insertOne(newProject);
      return res.status(201).json(newProject);

    case "PUT":
      if (!id) return res.status(400).json({ error: "Project ID required" });
      const body = await getBody(req);
      await collection.updateOne({ project_id: id }, { $set: { ...body, updated_at: new Date().toISOString() } });
      const updated = await collection.findOne({ project_id: id });
      return res.status(200).json(updated);

    case "DELETE":
      if (!id) return res.status(400).json({ error: "Project ID required" });
      await collection.deleteOne({ project_id: id });
      return res.status(200).json({ message: "Project deleted successfully" });

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === SETTINGS HANDLER ===
async function handleSettings(db, req, res, method) {
  const collection = db.collection("settings");
  switch (method) {
    case "GET":
      const settings = await collection.findOne({});
      return res.status(200).json(settings || {});

    case "PUT":
      const body = await getBody(req);
      await collection.updateOne({}, { $set: { ...body, updated_at: new Date().toISOString() } }, { upsert: true });
      const updated = await collection.findOne({});
      return res.status(200).json(updated);

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === TRACKING HANDLER ===
async function handleTracking(db, req, res, method, id) {
  if (method !== "PUT") return res.status(405).json({ error: "Method not allowed" });
  if (!id) return res.status(400).json({ error: "Order ID required" });

  const { processId, trackingData } = await getBody(req);
  if (!processId || !trackingData) return res.status(400).json({ error: "Missing processId or trackingData" });

  const collection = db.collection("orders");
  const order = await collection.findOne({ order_id: id });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const trackIndex = order.tracking.findIndex(t => t.process === processId);
  if (trackIndex === -1) return res.status(404).json({ error: "Process not found" });

  order.tracking[trackIndex] = { ...order.tracking[trackIndex], ...trackingData, last_updated: new Date().toISOString() };
  updateOrderStatus(order);

  await collection.updateOne({ order_id: id }, { $set: order });
  return res.status(200).json(order);
}

// === EXPORT HANDLER ===
async function handleExport(db, req, res, method) {
  if (method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { target } = req.query;
  const orders = await db.collection("orders").find({}).toArray();
  const projects = await db.collection("projects").find({}).toArray();
  const tracking = await db.collection("tracking").find({}).toArray();
  const settings = await db.collection("settings").findOne({});

  const wb = XLSX.utils.book_new();
  const addSheet = (name, data) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), name);

  if (target === "orders") addSheet("Orders", orders);
  else if (target === "projects") addSheet("Projects", projects);
  else if (target === "tracking") addSheet("Tracking", tracking);
  else if (target === "efficiency") {
    const eff = settings?.efficiency
      ? Object.entries(settings.efficiency).map(([k, v]) => ({
          process_id: k,
          target_time: v.targetTime,
          target_quality: v.targetQuality,
          target_output: v.targetOutput,
        }))
      : [];
    addSheet("Efficiency", eff);
  } else if (target === "complete") {
    addSheet("Orders", orders);
    addSheet("Projects", projects);
    addSheet("Tracking", tracking);
    const eff = settings?.efficiency
      ? Object.entries(settings.efficiency).map(([k, v]) => ({
          process_id: k,
          target_time: v.targetTime,
          target_quality: v.targetQuality,
          target_output: v.targetOutput,
        }))
      : [];
    addSheet("Efficiency", eff);
  } else {
    return res.status(400).json({ error: "Invalid export target" });
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename=${target}-report.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.status(200).send(buffer);
}

// === DEFAULT DATA INITIALIZATION ===
async function initializeData() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const orders = await db.collection("orders").countDocuments();
    const projects = await db.collection("projects").countDocuments();
    const settings = await db.collection("settings").countDocuments();

    if (orders === 0) {
      await db.collection("orders").insertMany(defaultOrders);
      console.log("✅ Initialized default orders");
    }
    if (projects === 0) {
      await db.collection("projects").insertMany(defaultProjects);
      console.log("✅ Initialized default projects");
    }
    if (settings === 0) {
      await db.collection("settings").insertOne(defaultSettings);
      console.log("✅ Initialized default settings");
    }
  } catch (err) {
    console.error("Error initializing data:", err);
  } finally {
    await client.close();
  }
}

// === HELPERS ===
function initializeTracking(order) {
  const processes = [
    "warehouse_in", "sanding", "assembly", "coloring",
    "accessories", "welding", "inspection", "coating",
    "packaging", "warehouse_out"
  ];
  return processes.map(p => ({
    process: p,
    status: "pending",
    quantity_completed: 0,
    defect_quantity: 0,
    start_time: null,
    end_time: null,
    pic_name: "",
    last_updated: null,
  }));
}

function updateOrderStatus(order) {
  const applicable = [
    "warehouse_in", "sanding", "assembly", "coloring",
    "accessories", "welding", "inspection", "coating",
    "packaging", "warehouse_out"
  ].filter(p => !(p === "accessories" && !order.requires_accessories) && !(p === "welding" && !order.requires_welding));

  const done = applicable.filter(p => {
    const t = order.tracking.find(x => x.process === p);
    return t && t.quantity_completed === order.quantity;
  }).length;

  order.progress = Math.round((done / applicable.length) * 100);
  order.current_status = done === applicable.length
    ? "completed"
    : order.tracking.some(t => t.quantity_completed > 0)
    ? "in_progress"
    : "pending";
}

// === DEFAULT DATA ===
const defaultOrders = [
  {
    order_id: "ORD-001",
    customer_name: "PT Maju Jaya",
    product_description: "Meja Kerja Kayu",
    quantity: 5,
    order_date: "2024-01-01",
    target_date: "2024-01-21",
    pic_name: "Budi Santoso",
    current_status: "in_progress",
    notes: "Prioritas tinggi",
    requires_accessories: true,
    requires_welding: false,
    progress: 40,
    risk_level: "MEDIUM",
    risk_score: 60,
    project_id: "PRJ-001",
    priority: "high",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tracking: initializeTracking({ quantity: 5 }),
  },
];

const defaultProjects = [
  {
    project_id: "PRJ-001",
    project_name: "Office Furniture Project",
    project_description: "Complete office furniture set for client",
    start_date: "2024-01-01",
    end_date: "2024-01-25",
    client: "PT Maju Jaya",
    project_manager: "Budi Santoso",
    status: "in_progress",
    notes: "High priority project",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const defaultSettings = {
  logo: { icon: "industry", customUrl: null },
  company: {
    name: "Java Connection",
    address: "Jakarta, Indonesia",
    phone: "+62 21 1234 5678",
    email: "info@javaconnection.com",
  },
  efficiency: {
    warehouse_in: { targetTime: 2, targetQuality: 99, targetOutput: 100 },
    sanding: { targetTime: 4, targetQuality: 95, targetOutput: 90 },
    assembly: { targetTime: 6, targetQuality: 97, targetOutput: 95 },
    coloring: { targetTime: 3, targetQuality: 98, targetOutput: 92 },
  },
};