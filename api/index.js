import mongoose from "mongoose";

// MongoDB connection URI
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://Verc3L:cVUPUNi1bTH51Dlz@tvrggydb.kufz1s1.mongodb.net/";

let conn = null;

async function connectToDB() {
  if (conn) return conn;
  conn = await mongoose.connect(uri, { dbName: "Proto" });
  console.log("✅ Connected to MongoDB Atlas");
  return conn;
}

// --- Schemas ---
const OrderSchema = new mongoose.Schema(
  {
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
  },
  { strict: false }
);

const ProjectSchema = new mongoose.Schema(
  {
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
  },
  { strict: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { strict: false }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const Project =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Setting =
  mongoose.models.Setting || mongoose.model("Setting", SettingsSchema);

// Enable body parser
export const config = {
  api: { bodyParser: true },
};

// --- API Handler ---
export default async function handler(req, res) {
  await connectToDB();
  const { method, query } = req;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") return res.status(200).end();

  try {
    const type = query.type;

    // ORDERS
    if (type === "orders") {
      if (method === "GET") {
        const orders = await Order.find();
        return res.status(200).json(orders);
      }

      if (method === "POST") {
        if (!req.body || Object.keys(req.body).length === 0)
          return res.status(400).json({ message: "Empty order data" });

        const newOrder = await Order.create(req.body);
        console.log("✅ Order saved:", newOrder);
        return res.status(201).json(newOrder);
      }

      if (method === "PUT") {
        await Order.deleteMany({});
        await Order.insertMany(req.body);
        return res.status(200).json({ message: "Orders replaced" });
      }
    }

    // PROJECTS
    if (type === "projects") {
      if (method === "GET") {
        const projects = await Project.find();
        return res.status(200).json(projects);
      }

      if (method === "POST") {
        const newProject = await Project.create(req.body);
        console.log("✅ Project saved:", newProject);
        return res.status(201).json(newProject);
      }

      if (method === "PUT") {
        await Project.deleteMany({});
        await Project.insertMany(req.body);
        return res.status(200).json({ message: "Projects replaced" });
      }
    }

    // SETTINGS
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

    res.status(404).json({ message: "Invalid route or method" });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: err.message });
  }
}

// --- Auto-seed initial data ---
(async () => {
  try {
    await connectToDB();
    const count = await Order.countDocuments();
    if (count === 0) {
      await Order.create({
        order_id: "ORD-003",
        customer_name: "PT Nusantara Mebel",
        product_description: "Lemari Kayu Jati Ukir",
        quantity: 15,
        order_date: "2025-11-06",
        target_date: "2025-11-20",
        project_id: "",
        pic_name: "Andi Saputra",
        priority: "medium",
        requires_accessories: true,
        requires_welding: false,
        notes:
          "Gunakan finishing warna natural dengan lapisan pelindung UV.",
        current_status: "pending",
        progress: 0,
        risk_level: "LOW",
        risk_score: 10,
        tracking: [],
      });
      console.log("✅ Seeded initial order data");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
})();
