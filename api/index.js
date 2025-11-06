import mongoose from 'mongoose';

// --- Database Connection ---
// Make sure you have MONGODB_URI in your Vercel Environment Variables
const MONGODB_URI = process.env.MONGODB_URI;

// Connection caching
let conn = null;
async function connectDB() {
  if (conn) {
    console.log("Using cached DB connection");
    return conn;
  }
  console.log("Creating new DB connection");
  conn = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false,
  });
  return conn;
}

// --- Mongoose Schemas ---
// I built these based on your vercel.js normalization logic

const TrackingSchema = new mongoose.Schema({
  process: String,
  status: String,
  quantity_completed: Number,
  defect_quantity: Number,
  start_time: Date,
  end_time: Date,
  pic_name: String,
  issues: String,
  last_updated: Date,
});

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, unique: true, index: true },
  customer_name: String,
  product_description: String,
  quantity: Number,
  order_date: String,
  target_date: String,
  project_id: { type: String, index: true },
  pic_name: String,
  current_status: String,
  priority: String,
  requires_accessories: Boolean,
  requires_welding: Boolean,
  notes: String,
  progress: Number,
  risk_level: String,
  risk_score: Number,
  tracking: [TrackingSchema],
}, { timestamps: true }); // Added timestamps

// Auto-generate custom Order ID if not provided
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.order_id) {
    const lastOrder = await mongoose.model('Order', OrderSchema).findOne().sort('-createdAt');
    let newId = 1;
    if (lastOrder && lastOrder.order_id && lastOrder.order_id.startsWith('ORD-')) {
      newId = parseInt(lastOrder.order_id.split('-')[1], 10) + 1;
    }
    this.order_id = `ORD-${String(newId).padStart(5, '0')}`; // e.g., ORD-00001
  }
  next();
});

const ProjectSchema = new mongoose.Schema({
  project_id: { type: String, unique: true, index: true },
  project_name: String,
  project_description: String,
  start_date: String,
  end_date: String,
  client: String,
  project_manager: String,
  status: String,
  notes: String,
}, { timestamps: true });

// Auto-generate custom Project ID if not provided
ProjectSchema.pre('save', async function (next) {
  if (this.isNew && !this.project_id) {
    const lastProject = await mongoose.model('Project', ProjectSchema).findOne().sort('-createdAt');
    let newId = 1;
    if (lastProject && lastProject.project_id && lastProject.project_id.startsWith('PROJ-')) {
      newId = parseInt(lastProject.project_id.split('-')[1], 10) + 1;
    }
    this.project_id = `PROJ-${String(newId).padStart(4, '0')}`; // e.g., PROJ-0001
  }
  next();
});

// --- Main API Handler ---
export default async function handler(req, res) {
  
  // --- Set Headers (CORS & Cache) ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  // --- OPTIONS Preflight Request ---
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    await connectDB();
    // Use mongoose.models to avoid recompiling
    const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
    const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

    const { type } = req.query;

    // --- GET Requests ---
    if (req.method === 'GET') {
      if (type === 'orders') {
        const orders = await Order.find({}).sort('-createdAt');
        return res.status(200).json(orders);
      }
      if (type === 'projects') {
        const projects = await Project.find({}).sort('-createdAt');
        return res.status(200).json(projects);
      }
    }

    // --- POST Requests (Create/Update) ---
    if (req.method === 'POST') {
      if (type === 'orders') {
        const orderData = req.body;
        if (orderData.order_id) {
          // Update
          const { order_id, ...updateData } = orderData;
          const updatedOrder = await Order.findOneAndUpdate(
            { order_id: order_id },
            updateData,
            { new: true } // Return the updated document
          );
          return res.status(200).json(updatedOrder);
        } else {
          // Create
          const newOrder = new Order(orderData);
          await newOrder.save();
          return res.status(201).json(newOrder);
        }
      }
      if (type === 'projects') {
        const projectData = req.body;
        if (projectData.project_id) {
          // Update
          const { project_id, ...updateData } = projectData;
          const updatedProject = await Project.findOneAndUpdate(
            { project_id: project_id },
            updateData,
            { new: true }
          );
          return res.status(200).json(updatedProject);
        } else {
          // Create
          const newProject = new Project(projectData);
          await newProject.save();
          return res.status(201).json(newProject);
        }
      }
    }

// --- DELETE Requests (NEW DEBUGGING VERSION) ---
    if (req.method === 'DELETE') {
      
      console.log("--- DELETE Request Received ---");
      console.log("Query:", req.query);
      console.log("Body Type:", typeof req.body);
      console.log("Raw Body:", req.body);
      
      // Vercel sometimes stringifies the body, let's check
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.error("Body was a string but not valid JSON");
        }
      }

      console.log("Parsed Body:", body);

      if (type === 'orders') {
        const { order_id } = body;
        console.log("Extracted order_id:", order_id);

        if (!order_id) {
          console.error("Order ID is missing!");
          return res.status(400).json({ message: "Order ID missing" });
        }
        
        const result = await Order.deleteOne({ order_id: order_id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: `Order ${order_id} not found` });
        }
        console.log("✅ Successfully deleted order:", order_id);
        return res.status(200).json({ message: `Order ${order_id} deleted` });
      }
      
      if (type === 'projects') {
        const { project_id } = body;
        console.log("Extracted project_id:", project_id);

        if (!project_id) {
          console.error("Project ID is missing!");
          return res.status(400).json({ message: "Project ID missing" });
        }
        
        // Also delete associated orders
        await Order.deleteMany({ project_id: project_id });
        
        const result = await Project.deleteOne({ project_id: project_id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: `Project ${project_id} not found` });
        }
        console.log("✅ Successfully deleted project:", project_id);
        return res.status(200).json({ message: `Project ${project_id} and associated orders deleted` });
      }
    }

    // --- Fallback for Invalid Route/Method ---
    // This is the line that sent your error message
    return res.status(404).json({ message: "Invalid route or method" });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}