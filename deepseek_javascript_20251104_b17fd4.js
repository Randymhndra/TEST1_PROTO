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
    
    if (method === 'GET') {
      // Return efficiency settings
      const defaultSettings = {
        warehouse_in: { name: 'Gudang Masuk', targetTime: 2, targetQuality: 99, targetOutput: 100 },
        sanding: { name: 'Amplas', targetTime: 4, targetQuality: 95, targetOutput: 90 },
        assembly: { name: 'Perakitan', targetTime: 6, targetQuality: 97, targetOutput: 95 },
        coloring: { name: 'Pewarnaan', targetTime: 3, targetQuality: 98, targetOutput: 92 },
        accessories: { name: 'Aksesoris', targetTime: 2, targetQuality: 96, targetOutput: 94 },
        welding: { name: 'Las', targetTime: 5, targetQuality: 95, targetOutput: 88 },
        inspection: { name: 'Inspeksi', targetTime: 1, targetQuality: 100, targetOutput: 100 },
        coating: { name: 'Pelapisan', targetTime: 4, targetQuality: 97, targetOutput: 90 },
        packaging: { name: 'Packaging & Kode', targetTime: 2, targetQuality: 99, targetOutput: 98 },
        warehouse_out: { name: 'Gudang Akhir', targetTime: 1, targetQuality: 100, targetOutput: 100 }
      };
      
      return res.status(200).json(defaultSettings);
    }

    if (method === 'POST') {
      // Save efficiency settings
      const settings = req.body;
      // In real app, save to database
      return res.status(200).json({
        success: true,
        message: 'Efficiency settings saved',
        settings
      });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  } catch (error) {
    console.error('Efficiency API Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};