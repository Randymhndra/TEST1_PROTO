import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
let conn = null;

async function connectDB() {
    if (conn) {
        return conn;
    }
    conn = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
    });
    return conn;
}

const TrackingSchema = new mongoose.Schema(
    {
        process: String,
        status: String,
        quantity_completed: Number,
        defect_quantity: Number,
        start_time: Date,
        end_time: Date,
        pic_name: String,
        issues: String,
        last_updated: Date,
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
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
        package_length: Number,
        package_width: Number,
        package_height: Number,
        progress: Number,
        risk_level: String,
        risk_score: Number,
        tracking: [TrackingSchema],
    },
    { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
    {
        project_id: { type: String, unique: true, index: true },
        project_name: String,
        project_description: String,
        start_date: String,
        end_date: String,
        client: String,
        project_manager: String,
        status: String,
        notes: String,
    },
    { timestamps: true }
);

OrderSchema.pre("save", async function (next) {
    if (this.isNew && !this.order_id) {
        const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
        const last = await Order.findOne().sort("-createdAt");
        let newId = 1;

        if (last && last.order_id && last.order_id.startsWith("ORD-")) {
            newId = parseInt(last.order_id.split("-")[1], 10) + 1;
        }

        this.order_id = `ORD-${String(newId).padStart(5, "0")}`;
    }
    next();
});

ProjectSchema.pre("save", async function (next) {
    if (this.isNew && !this.project_id) {
        const Project =
            mongoose.models.Project || mongoose.model("Project", ProjectSchema);
        const last = await Project.findOne().sort("-createdAt");
        let newId = 1;

        if (last && last.project_id && last.project_id.startsWith("PROJ-")) {
            newId = parseInt(last.project_id.split("-")[1], 10) + 1;
        }

        this.project_id = `PROJ-${String(newId).padStart(4, "0")}`;
    }
    next();
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

    if (req.method === "OPTIONS") return res.status(200).end();

    try {
        await connectDB();

        const Order =
            mongoose.models.Order || mongoose.model("Order", OrderSchema);
        const Project =
            mongoose.models.Project || mongoose.model("Project", ProjectSchema);

        const { type } = req.query;

        if (req.method === "GET") {
            if (type === "orders") {
                const orders = await Order.find({}).sort("-createdAt");
                return res.status(200).json(orders);
            }
            if (type === "projects") {
                const projects = await Project.find({}).sort("-createdAt");
                return res.status(200).json(projects);
            }

            return res.status(400).json({ message: "Invalid GET type" });
        }

        if (req.method === "POST") {
            if (type === "orders") {
                const data = req.body;

                if (data.order_id) {
                    const updated = await Order.findOneAndUpdate(
                        { order_id: data.order_id },
                        { ...data },
                        { new: true }
                    );
                    return res.status(200).json(updated);
                }

                const newOrder = new Order(data);
                await newOrder.save();
                return res.status(201).json(newOrder);
            }

            if (type === "projects") {
                const data = req.body;

                if (data.project_id) {
                    const updated = await Project.findOneAndUpdate(
                        { project_id: data.project_id },
                        { ...data },
                        { new: true }
                    );
                    return res.status(200).json(updated);
                }

                const newProject = new Project(data);
                await newProject.save();
                return res.status(201).json(newProject);
            }

            return res.status(400).json({ message: "Invalid POST type" });
        }

        if (req.method === "PUT") {
            if (type === "orders") {
                const bulk = req.body;

                if (!Array.isArray(bulk)) {
                    return res.status(400).json({ message: "Expected array of orders" });
                }

                for (const item of bulk) {
                    await Order.updateOne({ order_id: item.order_id }, item, {
                        upsert: true,
                    });
                }

                return res.status(200).json({ message: "Orders synced" });
            }

            return res.status(400).json({ message: "Invalid PUT type" });
        }

        if (req.method === "DELETE") {
            let body = req.body;

            if (!body) body = {};

            if (typeof body === "string" && body.trim() !== "") {
                try {
                    body = JSON.parse(body);
                } catch (e) {}
            }

            if (typeof body !== "object") body = {};

            if (type === "orders") {
                const { order_id } = body;

                if (!order_id) {
                    return res.status(400).json({ message: "order_id missing" });
                }

                const result = await Order.deleteOne({ order_id });

                if (result.deletedCount === 0) {
                    return res
                        .status(404)
                        .json({ message: `Order ${order_id} not found` });
                }

                return res
                    .status(200)
                    .json({ message: `Order ${order_id} deleted` });
            }

            if (type === "projects") {
                const { project_id } = body;

                if (!project_id) {
                    return res.status(400).json({ message: "project_id missing" });
                }

                await Order.deleteMany({ project_id });
                const result = await Project.deleteOne({ project_id });

                if (result.deletedCount === 0) {
                    return res
                        .status(404)
                        .json({ message: `Project ${project_id} not found` });
                }

                return res.status(200).json({
                    message: `Project ${project_id} and related orders deleted`,
                });
            }
            return res.status(400).json({ message: "Invalid DELETE type" });
        }
        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error("API ERROR:", error);
        return res
            .status(500)
            .json({ message: "Server error", error: error.message });
    }
}