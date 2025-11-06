// api/index.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query } = req;
  const { type, id } = query;

  try {
    switch (type) {
      case 'orders':
        return await handleOrders(req, res, method, id);
      case 'projects':
        return await handleProjects(req, res, method, id);
      case 'settings':
        return await handleSettings(req, res, method, id);
      case 'tracking':
        return await handleTracking(req, res, method, id);
      case 'export':
        return await handleExport(req, res, method);
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions for KV storage
async function getFromKV(key) {
  try {
    const data = await kv.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting from KV:', error);
    return null;
  }
}

async function setToKV(key, value) {
  try {
    await kv.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error setting to KV:', error);
    return false;
  }
}

async function deleteFromKV(key) {
  try {
    await kv.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting from KV:', error);
    return false;
  }
}

// Initialize default data
async function initializeData() {
  try {
    // Check if data exists
    const orders = await getFromKV('orders');
    const projects = await getFromKV('projects');
    const settings = await getFromKV('settings');

    // Initialize orders if empty
    if (!orders || orders.length === 0) {
      const defaultOrders = [
        {
          order_id: 'ORD-001',
          customer_name: 'PT Maju Jaya',
          product_description: 'Meja Kerja Kayu',
          quantity: 5,
          order_date: '2024-01-01',
          target_date: '2024-01-21',
          pic_name: 'Budi Santoso',
          current_status: 'in_progress',
          notes: 'Prioritas tinggi',
          requires_accessories: true,
          requires_welding: false,
          progress: 40,
          risk_level: 'MEDIUM',
          risk_score: 60,
          project_id: 'PRJ-001',
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tracking: [
            { 
              process: 'warehouse_in', 
              status: 'completed', 
              quantity_completed: 5, 
              defect_quantity: 0, 
              start_time: '2024-01-02T08:00', 
              end_time: '2024-01-02T10:00', 
              pic_name: 'Budi', 
              last_updated: '2024-01-02T10:00' 
            },
            { 
              process: 'sanding', 
              status: 'completed', 
              quantity_completed: 5, 
              defect_quantity: 1, 
              start_time: '2024-01-02T10:30', 
              end_time: '2024-01-02T14:00', 
              pic_name: 'Ahmad', 
              last_updated: '2024-01-02T14:00' 
            },
            { 
              process: 'assembly', 
              status: 'in_progress', 
              quantity_completed: 3, 
              defect_quantity: 0, 
              start_time: '2024-01-03T08:00', 
              end_time: null, 
              pic_name: 'Sari', 
              last_updated: '2024-01-05T16:30' 
            }
          ]
        },
        {
          order_id: 'ORD-002',
          customer_name: 'CV Sejahtera',
          product_description: 'Kursi Kantor',
          quantity: 10,
          order_date: '2024-01-05',
          target_date: '2024-01-25',
          pic_name: 'Siti Rahayu',
          current_status: 'in_progress',
          notes: 'Warna hitam doff',
          requires_accessories: false,
          requires_welding: true,
          progress: 20,
          risk_level: 'HIGH',
          risk_score: 75,
          project_id: 'PRJ-001',
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tracking: [
            { 
              process: 'warehouse_in', 
              status: 'completed', 
              quantity_completed: 10, 
              defect_quantity: 0, 
              start_time: '2024-01-06T08:00', 
              end_time: '2024-01-06T09:30', 
              pic_name: 'Budi', 
              last_updated: '2024-01-06T09:30' 
            },
            { 
              process: 'sanding', 
              status: 'completed', 
              quantity_completed: 10, 
              defect_quantity: 0, 
              start_time: '2024-01-06T10:00', 
              end_time: '2024-01-06T15:00', 
              pic_name: 'Ahmad', 
              last_updated: '2024-01-06T15:00' 
            },
            { 
              process: 'assembly', 
              status: 'in_progress', 
              quantity_completed: 2, 
              defect_quantity: 0, 
              start_time: '2024-01-09T08:00', 
              end_time: null, 
              pic_name: 'Sari', 
              last_updated: '2024-01-10T12:00' 
            }
          ]
        }
      ];
      await setToKV('orders', defaultOrders);
      console.log('✅ Initialized default orders');
    }

    // Initialize projects if empty
    if (!projects || projects.length === 0) {
      const defaultProjects = [
        {
          project_id: 'PRJ-001',
          project_name: 'Office Furniture Project',
          project_description: 'Complete office furniture set for client',
          start_date: '2024-01-01',
          end_date: '2024-01-25',
          client: 'PT Maju Jaya',
          project_manager: 'Budi Santoso',
          status: 'in_progress',
          notes: 'High priority project',
          created_date: '2024-01-01',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      await setToKV('projects', defaultProjects);
      console.log('✅ Initialized default projects');
    }

    // Initialize settings if empty
    if (!settings) {
      const defaultSettings = {
        logo: {
          icon: 'industry',
          customUrl: null
        },
        efficiency: {
          warehouse_in: { targetTime: 2, targetQuality: 99, targetOutput: 100 },
          sanding: { targetTime: 4, targetQuality: 95, targetOutput: 90 },
          assembly: { targetTime: 6, targetQuality: 97, targetOutput: 95 },
          coloring: { targetTime: 3, targetQuality: 98, targetOutput: 92 },
          accessories: { targetTime: 2, targetQuality: 96, targetOutput: 94 },
          welding: { targetTime: 5, targetQuality: 95, targetOutput: 88 },
          inspection: { targetTime: 1, targetQuality: 100, targetOutput: 100 },
          coating: { targetTime: 4, targetQuality: 97, targetOutput: 90 },
          packaging: { targetTime: 2, targetQuality: 99, targetOutput: 98 },
          warehouse_out: { targetTime: 1, targetQuality: 100, targetOutput: 100 }
        },
        company: {
          name: 'Java Connection',
          address: 'Jakarta, Indonesia',
          phone: '+62 21 1234 5678',
          email: 'info@javaconnection.com'
        }
      };
      await setToKV('settings', defaultSettings);
      console.log('✅ Initialized default settings');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Orders handler
async function handleOrders(req, res, method, id) {
  try {
    // Initialize data if empty
    await initializeData();
    
    let orders = await getFromKV('orders') || [];
    
    switch (method) {
      case 'GET':
        if (id) {
          const order = orders.find(o => o.order_id === id);
          if (!order) return res.status(404).json({ error: 'Order not found' });
          return res.status(200).json(order);
        }
        return res.status(200).json(orders);

      case 'POST':
        const newOrder = req.body;
        newOrder.order_id = `ORD-${Date.now()}`;
        newOrder.created_at = new Date().toISOString();
        newOrder.updated_at = new Date().toISOString();
        newOrder.current_status = 'pending';
        newOrder.progress = 0;
        newOrder.risk_level = 'LOW';
        newOrder.risk_score = 10;
        
        // Initialize tracking
        const productionProcesses = [
          { id: 'warehouse_in', name: 'Gudang Masuk' },
          { id: 'sanding', name: 'Amplas' },
          { id: 'assembly', name: 'Perakitan' },
          { id: 'coloring', name: 'Pewarnaan' },
          { id: 'accessories', name: 'Aksesoris', optional: true },
          { id: 'welding', name: 'Las', optional: true },
          { id: 'inspection', name: 'Inspeksi' },
          { id: 'coating', name: 'Pelapisan' },
          { id: 'packaging', name: 'Packaging & Kode' },
          { id: 'warehouse_out', name: 'Gudang Akhir' }
        ];
        
        newOrder.tracking = productionProcesses.map(process => ({
          process: process.id,
          status: 'pending',
          quantity_completed: 0,
          defect_quantity: 0,
          start_time: null,
          end_time: null,
          pic_name: '',
          issues: '',
          last_updated: null
        }));
        
        orders.push(newOrder);
        await setToKV('orders', orders);
        return res.status(201).json(newOrder);

      case 'PUT':
        if (!id) return res.status(400).json({ error: 'Order ID required' });
        
        const updateIndex = orders.findIndex(o => o.order_id === id);
        if (updateIndex === -1) return res.status(404).json({ error: 'Order not found' });
        
        orders[updateIndex] = { 
          ...orders[updateIndex], 
          ...req.body, 
          updated_at: new Date().toISOString() 
        };
        
        await setToKV('orders', orders);
        return res.status(200).json(orders[updateIndex]);

      case 'DELETE':
        if (!id) return res.status(400).json({ error: 'Order ID required' });
        
        const deleteIndex = orders.findIndex(o => o.order_id === id);
        if (deleteIndex === -1) return res.status(404).json({ error: 'Order not found' });
        
        orders.splice(deleteIndex, 1);
        await setToKV('orders', orders);
        return res.status(200).json({ message: 'Order deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handleOrders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Projects handler
async function handleProjects(req, res, method, id) {
  try {
    await initializeData();
    
    let projects = await getFromKV('projects') || [];
    
    switch (method) {
      case 'GET':
        if (id) {
          const project = projects.find(p => p.project_id === id);
          if (!project) return res.status(404).json({ error: 'Project not found' });
          return res.status(200).json(project);
        }
        return res.status(200).json(projects);

      case 'POST':
        const newProject = req.body;
        newProject.project_id = `PRJ-${Date.now()}`;
        newProject.created_at = new Date().toISOString();
        newProject.updated_at = new Date().toISOString();
        
        projects.push(newProject);
        await setToKV('projects', projects);
        return res.status(201).json(newProject);

      case 'PUT':
        if (!id) return res.status(400).json({ error: 'Project ID required' });
        
        const updateIndex = projects.findIndex(p => p.project_id === id);
        if (updateIndex === -1) return res.status(404).json({ error: 'Project not found' });
        
        projects[updateIndex] = { 
          ...projects[updateIndex], 
          ...req.body, 
          updated_at: new Date().toISOString() 
        };
        
        await setToKV('projects', projects);
        return res.status(200).json(projects[updateIndex]);

      case 'DELETE':
        if (!id) return res.status(400).json({ error: 'Project ID required' });
        
        const deleteIndex = projects.findIndex(p => p.project_id === id);
        if (deleteIndex === -1) return res.status(404).json({ error: 'Project not found' });
        
        projects.splice(deleteIndex, 1);
        await setToKV('projects', projects);
        return res.status(200).json({ message: 'Project deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handleProjects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Settings handler
async function handleSettings(req, res, method, id) {
  try {
    await initializeData();
    
    let settings = await getFromKV('settings') || {
      logo: { icon: 'industry', customUrl: null },
      efficiency: {},
      company: {
        name: 'Java Connection',
        address: '',
        phone: '',
        email: ''
      }
    };
    
    switch (method) {
      case 'GET':
        return res.status(200).json(settings);

      case 'PUT':
        settings = { 
          ...settings, 
          ...req.body, 
          updated_at: new Date().toISOString() 
        };
        
        await setToKV('settings', settings);
        return res.status(200).json(settings);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in handleSettings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Tracking handler
async function handleTracking(req, res, method, id) {
  try {
    if (method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    if (!id) {
      return res.status(400).json({ error: 'Order ID required' });
    }
    
    const { processId, trackingData } = req.body;
    
    if (!processId || !trackingData) {
      return res.status(400).json({ error: 'Process ID and tracking data required' });
    }
    
    let orders = await getFromKV('orders') || [];
    const orderIndex = orders.findIndex(o => o.order_id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const trackingIndex = orders[orderIndex].tracking.findIndex(t => t.process === processId);
    
    if (trackingIndex === -1) {
      return res.status(404).json({ error: 'Process not found' });
    }
    
    // Update tracking
    orders[orderIndex].tracking[trackingIndex] = {
      ...orders[orderIndex].tracking[trackingIndex],
      ...trackingData,
      last_updated: new Date().toISOString()
    };
    
    // Update order status
    updateOrderStatus(orders[orderIndex]);
    orders[orderIndex].updated_at = new Date().toISOString();
    
    await setToKV('orders', orders);
    return res.status(200).json(orders[orderIndex]);
    
  } catch (error) {
    console.error('Error in handleTracking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export handler
async function handleExport(req, res, method) {
  try {
    if (method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    await initializeData();
    
    const orders = await getFromKV('orders') || [];
    const projects = await getFromKV('projects') || [];
    const settings = await getFromKV('settings') || {};
    
    const exportData = {
      orders,
      projects,
      settings,
      exported_at: new Date().toISOString(),
      total_orders: orders.length,
      total_projects: projects.length
    };
    
    return res.status(200).json(exportData);
    
  } catch (error) {
    console.error('Error in handleExport:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to update order status
function updateOrderStatus(order) {
  const applicableProcesses = [
    'warehouse_in', 'sanding', 'assembly', 'coloring', 
    'accessories', 'welding', 'inspection', 'coating', 
    'packaging', 'warehouse_out'
  ].filter(process => {
    if (process === 'accessories' && !order.requires_accessories) return false;
    if (process === 'welding' && !order.requires_welding) return false;
    return true;
  });

  const completedProcesses = applicableProcesses.filter(process => {
    const tracking = order.tracking.find(t => t.process === process);
    return tracking && tracking.quantity_completed === order.quantity;
  }).length;

  order.progress = Math.round((completedProcesses / applicableProcesses.length) * 100);

  const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
  if (warehouseOut && warehouseOut.quantity_completed === order.quantity) {
    order.current_status = 'completed';
  } else if (order.tracking.some(t => t.quantity_completed > 0)) {
    order.current_status = 'in_progress';
  } else {
    order.current_status = 'pending';
  }
}