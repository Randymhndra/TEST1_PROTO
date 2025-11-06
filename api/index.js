// api/index.js
import client from "../mongodb.js"; // adjust path if mongodb.ts/js is in /lib or elsewhere
import * as XLSX from "xlsx";

// Utility to read body
async function getBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    return null;
  }
}

// === Main Handler ===
export default async function handler(req, res) {
  const { type, id } = req.query;
  const method = req.method;

  try {
    const db = client.db("javaconnection");

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
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
}

// === ORDERS ===
async function handleOrders(db, req, res, method, id) {
  const collection = db.collection("orders");
  switch (method) {
    case "GET":
      if (id) {
        const order = await collection.findOne({ order_id: id });
        if (!order) return res.status(404).json({ error: "Order not found" });
        return res.status(200).json(order);
      }
      return res.status(200).json(await collection.find({}).toArray());

    case "POST":
      const newOrder = await getBody(req);
      newOrder.order_id = `ORD-${Date.now()}`;
      newOrder.created_at = new Date().toISOString();
      newOrder.updated_at = new Date().toISOString();
      newOrder.current_status = "pending";
      newOrder.progress = 0;
      newOrder.tracking = initializeTracking(newOrder);
      await collection.insertOne(newOrder);
      return res.status(201).json(newOrder);

    case "PUT":
      if (!id) return res.status(400).json({ error: "Order ID required" });
      const body = await getBody(req);
      await collection.updateOne(
        { order_id: id },
        { $set: { ...body, updated_at: new Date().toISOString() } }
      );
      return res.status(200).json(await collection.findOne({ order_id: id }));

    case "DELETE":
      if (!id) return res.status(400).json({ error: "Order ID required" });
      await collection.deleteOne({ order_id: id });
      return res.status(200).json({ message: "Order deleted successfully" });

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === PROJECTS ===
async function handleProjects(db, req, res, method, id) {
  const collection = db.collection("projects");
  switch (method) {
    case "GET":
      if (id) {
        const project = await collection.findOne({ project_id: id });
        if (!project) return res.status(404).json({ error: "Project not found" });
        return res.status(200).json(project);
      }
      return res.status(200).json(await collection.find({}).toArray());

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
      await collection.updateOne(
        { project_id: id },
        { $set: { ...body, updated_at: new Date().toISOString() } }
      );
      return res.status(200).json(await collection.findOne({ project_id: id }));

    case "DELETE":
      if (!id) return res.status(400).json({ error: "Project ID required" });
      await collection.deleteOne({ project_id: id });
      return res.status(200).json({ message: "Project deleted successfully" });

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === SETTINGS ===
async function handleSettings(db, req, res, method) {
  const collection = db.collection("settings");
  switch (method) {
    case "GET":
      const settings = await collection.findOne({});
      return res.status(200).json(settings || {});

    case "PUT":
      const body = await getBody(req);
      await collection.updateOne({}, { $set: body }, { upsert: true });
      return res.status(200).json(await collection.findOne({}));

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

// === TRACKING ===
async function handleTracking(db, req, res, method, id) {
  if (method !== "PUT") return res.status(405).json({ error: "Method not allowed" });
  const { processId, trackingData } = await getBody(req);
  if (!id || !processId || !trackingData)
    return res.status(400).json({ error: "Order ID, processId, and trackingData required" });

  const orders = db.collection("orders");
  const order = await orders.findOne({ order_id: id });
  if (!order) return res.status(404).json({ error: "Order not found" });

  const trackIndex = order.tracking.findIndex(t => t.process === processId);
  if (trackIndex === -1) return res.status(404).json({ error: "Process not found" });

  order.tracking[trackIndex] = {
    ...order.tracking[trackIndex],
    ...trackingData,
    last_updated: new Date().toISOString()
  };

  updateOrderStatus(order);
  await orders.updateOne({ order_id: id }, { $set: order });
  return res.status(200).json(order);
}

// === EXPORT ===
async function handleExport(db, req, res, method) {
  if (method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { target } = req.query;
  const orders = await db.collection("orders").find({}).toArray();
  const projects = await db.collection("projects").find({}).toArray();
  const settings = await db.collection("settings").findOne({});

  const wb = XLSX.utils.book_new();
  const addSheet = (name, data) =>
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), name);

  switch (target) {
    case "orders":
      addSheet("Orders", orders);
      break;
    case "projects":
      addSheet("Projects", projects);
      break;
    case "complete":
      addSheet("Orders", orders);
      addSheet("Projects", projects);
      addSheet("Settings", [settings || {}]);
      break;
    default:
      return res.status(400).json({ error: "Invalid export target" });
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename=${target}-export.xlsx`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  return res.status(200).send(buffer);
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
    last_updated: null
  }));
}

function updateOrderStatus(order) {
  const applicable = [
    "warehouse_in", "sanding", "assembly", "coloring",
    "accessories", "welding", "inspection", "coating",
    "packaging", "warehouse_out"
  ].filter(p => !(p === "accessories" && !order.requires_accessories) &&
                !(p === "welding" && !order.requires_welding));

  const completed = applicable.filter(p => {
    const t = order.tracking.find(x => x.process === p);
    return t && t.quantity_completed === order.quantity;
  }).length;

  order.progress = Math.round((completed / applicable.length) * 100);
  order.current_status = completed === applicable.length
    ? "completed"
    : order.tracking.some(t => t.quantity_completed > 0)
      ? "in_progress"
      : "pending";
}
