import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      dbName: "Proto",
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Example schema for orders
const orderSchema = new mongoose.Schema({
  order_id: String,
  customer_name: String,
  product_description: String,
  quantity: Number,
  order_date: String,
  target_date: String,
  project_id: String,
  status: String,
  progress: Number
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const orders = await Order.find({});
    return res.status(200).json(orders);
  }

  if (req.method === "POST") {
    const data = req.body;
    const newOrder = await Order.create(data);
    return res.status(201).json(newOrder);
  }

  res.status(405).json({ message: "Method not allowed" });
}