// Backend Integration for Production Dashboard

const API_BASE_URL = '/api';

class BackendService {
    constructor() {
        this.isOnline = true;
        this.checkConnection();
    }

    async checkConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, { 
                method: 'GET',
                headers: this.getHeaders()
            });
            this.isOnline = response.ok;
        } catch (error) {
            this.isOnline = false;
            console.warn('Offline mode activated');
        }
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
        };
    }

    // Orders API
    async getOrders() {
        if (!this.isOnline) {
            return this.getFromLocalStorage('productionOrders') || [];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders`);
            if (!response.ok) throw new Error('Network response was not ok');
            const orders = await response.json();
            this.saveToLocalStorage('productionOrders', orders);
            return orders;
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            return this.getFromLocalStorage('productionOrders') || [];
        }
    }

    async saveOrder(orderData) {
        // Always save to localStorage first for immediate response
        const currentOrders = this.getFromLocalStorage('productionOrders') || [];
        const existingIndex = currentOrders.findIndex(o => o.order_id === orderData.order_id);
        
        if (existingIndex >= 0) {
            currentOrders[existingIndex] = orderData;
        } else {
            currentOrders.push(orderData);
        }
        
        this.saveToLocalStorage('productionOrders', currentOrders);

        // Try to sync with backend
        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(orderData)
                });
                
                if (!response.ok) throw new Error('Failed to save to backend');
                return await response.json();
            } catch (error) {
                console.warn('Failed to sync with backend, using local data:', error);
            }
        }

        return orderData;
    }

    async deleteOrder(orderId) {
        const currentOrders = this.getFromLocalStorage('productionOrders') || [];
        const filteredOrders = currentOrders.filter(o => o.order_id !== orderId);
        this.saveToLocalStorage('productionOrders', filteredOrders);

        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'DELETE',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ orderId })
                });
                return await response.json();
            } catch (error) {
                console.warn('Failed to delete from backend:', error);
            }
        }

        return { success: true };
    }

    // Tracking API
    async updateTracking(orderId, process, updates) {
        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/tracking`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ orderId, process, updates })
                });
                return await response.json();
            } catch (error) {
                console.warn('Failed to update tracking in backend:', error);
            }
        }
        return { success: true, offline: true };
    }

    // Efficiency API
    async getEfficiencySettings() {
        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/efficiency`);
                if (response.ok) {
                    const settings = await response.json();
                    this.saveToLocalStorage('efficiencySettings', settings);
                    return settings;
                }
            } catch (error) {
                console.warn('Failed to fetch efficiency settings:', error);
            }
        }
        return this.getFromLocalStorage('efficiencySettings') || this.getDefaultEfficiencySettings();
    }

    async saveEfficiencySettings(settings) {
        this.saveToLocalStorage('efficiencySettings', settings);

        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/efficiency`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(settings)
                });
                return await response.json();
            } catch (error) {
                console.warn('Failed to save efficiency settings to backend:', error);
            }
        }

        return { success: true, offline: true };
    }

    // Authentication
    async login(username, password) {
        if (this.isOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ username, password })
                });
                return await response.json();
            } catch (error) {
                console.error('Login failed:', error);
            }
        }
        
        // Offline demo login
        const demoUsers = {
            'admin': { role: 'admin', token: 'demo-admin-token' },
            'manager': { role: 'manager', token: 'demo-manager-token' },
            'operator': { role: 'operator', token: 'demo-operator-token' }
        };

        if (demoUsers[username]) {
            return {
                success: true,
                user: {
                    username,
                    role: demoUsers[username].role,
                    token: demoUsers[username].token
                }
            };
        }

        return { success: false, error: 'Invalid credentials' };
    }

    // Utility methods
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    getDefaultEfficiencySettings() {
        return {
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
    }
}

// Initialize backend service
const backendService = new BackendService();

// Export for use in main script
window.backendService = backendService;