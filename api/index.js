import mongoose from "mongoose";
import cors from "cors";

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://Verc3L:cVUPUNi1bTH51Dlz@tvrggydb.kufz1s1.mongodb.net/";

let conn = null;

async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(uri, { dbName: "Proto" });
  console.log("✅ Connected to MongoDB Atlas");
  return conn;
}

// Define Schemas
const OrderSchema = new mongoose.Schema({
  order_id: String,
  customer_name: String,
  product_description: String,
  quantity: Number,
  order_date: String,
  target_date: String,
  project_id: String,
  current_status: String,
  progress: Number,
  tracking: Array,
  notes: String,
  requires_accessories: Boolean,
  requires_welding: Boolean,
  risk_level: String,
  risk_score: Number,
  pic_name: String,
});

const ProjectSchema = new mongoose.Schema({
  project_id: String,
  project_name: String,
  project_description: String,
  start_date: String,
  end_date: String,
  client: String,
  project_manager: String,
  status: String,
  notes: String,
  orders: Array,
  created_date: String,
  updated_at: String,
});

const SettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingsSchema);

// Enable CORS (important for Vercel frontend)
export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  await connectToDB();
  const { method, query } = req;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") return res.status(200).end();

  try {
    const type = query.type;

    // --- ORDERS ---
    if (type === "orders") {
      if (method === "GET") {
        const orders = await Order.find();
        return res.status(200).json(orders);
      }
      if (method === "PUT") {
        await Order.deleteMany({});
        await Order.insertMany(req.body);
        return res.status(200).json({ message: "Orders saved" });
      }
      if (method === "POST") {
        const newOrder = await Order.create(req.body);
        return res.status(201).json(newOrder);
      }
    }

    // --- PROJECTS ---
    if (type === "projects") {
      if (method === "GET") {
        const projects = await Project.find();
        return res.status(200).json(projects);
      }
      if (method === "PUT") {
        await Project.deleteMany({});
        await Project.insertMany(req.body);
        return res.status(200).json({ message: "Projects saved" });
      }
      if (method === "POST") {
        const newProject = await Project.create(req.body);
        return res.status(201).json(newProject);
      }
    }

    // --- SETTINGS (efficiency, logo, etc) ---
    if (type === "settings") {
      if (method === "GET") {
        const settings = await Setting.findOne({ key: "efficiency" });
        return res.status(200).json(settings ? settings.value : {});
      }
      if (method === "PUT") {
        await Setting.updateOne(
          { key: "efficiency" },
          { value: req.body.efficiency },
          { upsert: true }
        );
        return res.status(200).json({ message: "Settings saved" });
      }
    }

    // Default fallback
    res.status(404).json({ message: "Invalid route or method" });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
