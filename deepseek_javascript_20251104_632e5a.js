const { createClient } = require('@vercel/kv');

// For demo purposes, we'll use in-memory storage
// In production, replace with Vercel KV, MongoDB, or PostgreSQL
let ordersStorage = [];

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    
    switch (method) {
      case 'GET':
        // Get all orders
        const { orderId } = req.query;
        if (orderId) {
          const order = ordersStorage.find(o => o.order_id === orderId);
          if (!order) {
            return res.status(404).json({ error: 'Order not found' });
          }
          return res.status(200).json(order);
        }
        return res.status(200).json(ordersStorage);

      case 'POST':
        // Create or update order
        const orderData = req.body;
        
        if (!orderData.order_id) {
          // Create new order
          const newOrderId = 'ORD-' + String(ordersStorage.length + 1).padStart(3, '0');
          const newOrder = {
            ...orderData,
            order_id: newOrderId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          ordersStorage.push(newOrder);
          return res.status(201).json(newOrder);
        } else {
          // Update existing order
          const index = ordersStorage.findIndex(o => o.order_id === orderData.order_id);
          if (index === -1) {
            return res.status(404).json({ error: 'Order not found' });
          }
          ordersStorage[index] = {
            ...ordersStorage[index],
            ...orderData,
            updated_at: new Date().toISOString()
          };
          return res.status(200).json(ordersStorage[index]);
        }

      case 'DELETE':
        // Delete order
        const { orderId: deleteOrderId } = req.body;
        const deleteIndex = ordersStorage.findIndex(o => o.order_id === deleteOrderId);
        if (deleteIndex === -1) {
          return res.status(404).json({ error: 'Order not found' });
        }
        ordersStorage.splice(deleteIndex, 1);
        return res.status(200).json({ message: 'Order deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};