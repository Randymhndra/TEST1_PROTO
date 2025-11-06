import mongoose from "mongoose";

// ✅ Always reference the same cluster + database
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://Verc3L:cVUPUNi1bTH51Dlz@tvrggydb.kufz1s1.mongodb.net?retryWrites=true&w=majority";

// ✅ Reuse global connection across Vercel invocations
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongoose) => {
      console.log("✅ Connected to MongoDB Atlas (Proto)");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Schema — flexible
const OrderSchema = new mongoose.Schema({}, { strict: false });

// Force exact collection name if needed
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");

// API handler
export default async function handler(req, res) {
  await connectToDB();

  const { method, query } = req;
  const type = query.type;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") return res.status(200).end();

  try {
    // === ORDERS ===
    if (type === "orders") {
      if (method === "GET") {
        const orders = await Order.find().lean();
        console.log(`📦 Fetched ${orders.length} orders`);
        return res.status(200).json(orders);
      }

      if (method === "POST") {
        const newOrder = await Order.create(req.body);
        console.log("✅ Order created:", newOrder.order_id);
        return res.status(201).json(newOrder);
      }

      if (method === "PUT") {
        await Order.deleteMany({});
        await Order.insertMany(req.body);
        return res.status(200).json({ message: "Orders replaced" });
      }
    }

    // Default
    return res.status(404).json({ message: "Invalid route" });
  } catch (err) {
    console.error("❌ API error:", err);
    res.status(500).json({ error: err.message });
  }
}
