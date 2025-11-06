import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Verc3L:cVUPUNi1bTH51Dlz@tvrggydb.kufz1s1.mongodb.net?retryWrites=true&w=majority";

// ✅ Maintain global connection cache to persist between invocations
if (!global._mongooseConnection) {
  global._mongooseConnection = mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then((conn) => {
      console.log("✅ Connected to MongoDB Atlas");
      return conn;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      throw err;
    });
}

// ✅ Define flexible schemas
const OrderSchema = new mongoose.Schema({}, { strict: false });
const ProjectSchema = new mongoose.Schema({}, { strict: false });

// ✅ Models (force correct collection names)
const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");
const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema, "projects");

export const config = { api: { bodyParser: true } };

// ✅ API Handler
export default async function handler(req, res) {
  const { method, query } = req;

  await global._mongooseConnection;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader(
    'Cache-Control',
    'no-cache, no-store, max-age=0, must-revalidate'
  );
  if (method === "OPTIONS") return res.status(200).end();

  const type = query.type;
  console.log(`📡 API call: ${method} / ${type}`);

  try {
    // ===== ORDERS =====
    if (type === "orders") {
      if (method === "GET") {
        const orders = await Order.find().lean();
        console.log(`📦 Returning ${orders.length} orders`);
        return res.status(200).json(orders);
      }

      if (method === "POST") {
        const payload = req.body;
        const newOrder = await Order.create(payload);
        console.log("✅ Saved new order:", newOrder.order_id);
        return res.status(201).json(newOrder);
      }
    }

    // ===== PROJECTS =====
    if (type === "projects") {
      if (method === "GET") {
        const projects = await Project.find().lean();
        console.log(`📂 Returning ${projects.length} projects`);
        return res.status(200).json(projects);
      }

      if (method === "POST") {
        const payload = req.body;
        const newProject = await Project.create(payload);
        console.log("✅ Saved new project:", newProject.project_id);
        return res.status(201).json(newProject);
      }
    }

    return res.status(404).json({ message: "Invalid route or method" });
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
