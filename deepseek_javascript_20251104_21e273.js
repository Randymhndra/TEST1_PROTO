module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;
    
    if (method === 'POST') {
      const { orderId, process, updates } = req.body;
      
      // In a real application, you would update the database
      // For demo, we'll just return success
      
      return res.status(200).json({
        success: true,
        message: 'Tracking updated successfully',
        data: {
          orderId,
          process,
          updates,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  } catch (error) {
    console.error('Tracking API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};