const API_URL = '/api';

// Define production processes - sesuai dengan yang sudah ditentukan
const productionProcesses = [
    { id: 'warehouse_in', name: 'Gudang Masuk', icon: 'fa-box' },
    { id: 'sanding', name: 'Amplas', icon: 'fa-sandpaper' },
    { id: 'assembly', name: 'Perakitan', icon: 'fa-tools' },
    { id: 'coloring', name: 'Pewarnaan', icon: 'fa-fill-drip' },
    { id: 'accessories', name: 'Aksesoris', icon: 'fa-puzzle-piece', optional: true },
    { id: 'welding', name: 'Las', icon: 'fa-fire', optional: true },
    { id: 'inspection', name: 'Inspeksi', icon: 'fa-search' },
    { id: 'coating', name: 'Pelapisan', icon: 'fa-layer-group' },
    { id: 'packaging', name: 'Packaging & Kode', icon: 'fa-box-open' },
    { id: 'warehouse_out', name: 'Gudang Akhir', icon: 'fa-warehouse' }
];

// Default efficiency settings for each process
const defaultEfficiencySettings = {
    warehouse_in: {
        name: 'Gudang Masuk',
        targetTime: 2, // hours
        targetQuality: 99, // percentage
        targetOutput: 100, // percentage
        criteria: [
            "Waktu bongkar muat maksimal 2 jam",
            "Akurasi data barang masuk 99%",
            "Tidak ada kerusakan selama handling"
        ]
    },
    sanding: {
        name: 'Amplas',
        targetTime: 4,
        targetQuality: 95,
        targetOutput: 90,
        criteria: [
            "Permukaan halus tanpa cacat",
            "Waktu proses sesuai spesifikasi material",
            "Penggunaan amplas optimal"
        ]
    },
    assembly: {
        name: 'Perakitan',
        targetTime: 6,
        targetQuality: 97,
        targetOutput: 95,
        criteria: [
            "Presisi komponen sesuai desain",
            "Kekuatan sambungan terjamin",
            "Waktu assembly sesuai kompleksitas"
        ]
    },
    coloring: {
        name: 'Pewarnaan',
        targetTime: 3,
        targetQuality: 98,
        targetOutput: 92,
        criteria: [
            "Konsistensi warna merata",
            "Ketebalan coating sesuai standar",
            "Waktu drying optimal"
        ]
    },
    accessories: {
        name: 'Aksesoris',
        targetTime: 2,
        targetQuality: 96,
        targetOutput: 94,
        criteria: [
            "Pemasangan aksesoris presisi",
            "Kesesuaian dengan desain",
            "Fungsi aksesoris terjamin"
        ]
    },
    welding: {
        name: 'Las',
        targetTime: 5,
        targetQuality: 95,
        targetOutput: 88,
        criteria: [
            "Kekuatan las memenuhi standar",
            "Keamanan proses pengelasan",
            "Finishing hasil las rapi"
        ]
    },
    inspection: {
        name: 'Inspeksi',
        targetTime: 1,
        targetQuality: 100,
        targetOutput: 100,
        criteria: [
            "Pemeriksaan menyeluruh semua komponen",
            "Dokumentasi hasil inspeksi",
            "Standar kualitas terpenuhi"
        ]
    },
    coating: {
        name: 'Pelapisan',
        targetTime: 4,
        targetQuality: 97,
        targetOutput: 90,
        criteria: [
            "Ketebalan lapisan seragam",
            "Daya tahan coating optimal",
            "Waktu aplikasi efisien"
        ]
    },
    packaging: {
        name: 'Packaging & Kode',
        targetTime: 2,
        targetQuality: 99,
        targetOutput: 98,
        criteria: [
            "Keamanan packaging terjamin",
            "Label dan kode akurat",
            "Efisiensi waktu packaging"
        ]
    },
    warehouse_out: {
        name: 'Gudang Akhir',
        targetTime: 1,
        targetQuality: 100,
        targetOutput: 100,
        criteria: [
            "Akurasi data barang keluar",
            "Keamanan penyimpanan",
            "Efisiensi penanganan pengiriman"
        ]
    }
};

// Login credentials
async function performLogin() {
    let username = document.getElementById("login-username").value;

    // Remove whitespace anywhere
    username = username.replace(/\s+/g, "");

    // Auto-correct capitalization (Andi, Arif, Anto)
    username = username.charAt(0).toUpperCase() + username.slice(1);

    const password = document.getElementById("login-password").value.trim();

    // Hash salted username
    const userKey = await sha256("JC-USER-" + username);

    const override = localStorage.getItem("jc_user_override_" + userKey);
    const storedHash = override || USERS[userKey];

    if (!storedHash) {
        document.getElementById("login-error").style.display = "block";
        return;
    }

    const passHash = await sha256(password);

    if (passHash === storedHash) {
        localStorage.setItem("jc_logged_in", "yes");
        localStorage.setItem("jc_user", userKey);
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline-flex";
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

function performLogout() {
    localStorage.removeItem("jc_logged_in");
    localStorage.removeItem("jc_user");
    location.reload();
}

function checkLoginState() {
    const logged = localStorage.getItem("jc_logged_in");
    const userKey = localStorage.getItem("jc_user");

    if (logged === "yes" && userKey) {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("logout-btn").style.display = "inline-flex";

        if (typeof showLoggedInUser === "function") {
            showLoggedInUser();
        }
    } else {
        document.getElementById("login-screen").style.display = "flex";
        document.getElementById("logout-btn").style.display = "none";
    }
}

function showLoggedInUser() {
    const userKey = localStorage.getItem("jc_user");
    if (!userKey) return;

    // You can show only hashed username or hide it completely.
    const display = document.getElementById("user-display");
    if (display) {
        display.textContent = "User Active";
    }
}

window.addEventListener("DOMContentLoaded", checkLoginState);

// Change Password Logic
function openChangePassword() {
    document.getElementById("changePasswordModal").classList.add("active");
}
function closeChangePassword() {
    document.getElementById("changePasswordModal").classList.remove("active");
    document.getElementById("cp-error").style.display = "none";
    document.getElementById("cp-success").style.display = "none";
}

async function changePassword() {
    const current = document.getElementById("cp-current").value;
    const newPass = document.getElementById("cp-new").value;
    const confirm = document.getElementById("cp-confirm").value;

    const errorBox = document.getElementById("cp-error");
    const successBox = document.getElementById("cp-success");

    errorBox.style.display = "none";
    successBox.style.display = "none";

    const userKey = localStorage.getItem("jc_user");

    const override = localStorage.getItem("jc_user_override_" + userKey);
    const storedHash = override || USERS[userKey];

    const currentHash = await sha256(current);

    if (currentHash !== storedHash) {
        errorBox.innerText = "Current password is incorrect.";
        errorBox.style.display = "block";
        return;
    }

    if (newPass !== confirm) {
        errorBox.innerText = "New password does not match.";
        errorBox.style.display = "block";
        return;
    }

    const newHash = await sha256(newPass);

    localStorage.setItem("jc_user_override_" + userKey, newHash);

    successBox.innerText = "Password updated successfully.";
    successBox.style.display = "block";
}

// Encrypt password
async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const USERS = {
    "fb6625bc989ff1b47976d979f31b21c8a8e4643f7493c11e81c3f4d47f0b257a": "779c3dbb3c8019cbf34123832f1f9cb79d4887c4cb7fe0173bb471ca1772ba20",
    "07fe8421423975c4b020801e713c688b6b536d48f9d2647483415ee1d3be3102": "dfd168e723b86030c7f1ed182dd3a0a9943eac09da3874a23eccb6fe8067b758",
    "ed75549e52d29f036d351298bf85af2a7ddb51dcdf94bfa0e139dc2a871cee28": "924246f9b1b601f3ec1c7ca28d3499e7d10e9d22f5fd16fd925191dbd1ec3018"
};

// Load efficiency settings from localStorage
function loadEfficiencySettings() {
    const saved = localStorage.getItem('processEfficiencySettings');
    return saved ? JSON.parse(saved) : {...defaultEfficiencySettings};
}
// Save orders to MongoDB via backend API
async function saveOrdersToDatabase() {
  try {
    const response = await fetch('/api?type=orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders) // Note: This will now refer to window.orders
    });

    if (!response.ok) {
      console.error('❌ Failed to save orders:', await response.text());
      showAlert('Could not sync orders with server.', 'warning');
    } else {
      console.log('✅ Orders saved to MongoDB');
    }
  } catch (error) {
    console.error('❌ Failed to save orders:', error);
    showAlert('Could not sync orders with server.', 'warning');
  }
}

// Save efficiency settings

async function saveEfficiencySettings() {
    const settings = {};
    
    productionProcesses.forEach(process => {
        settings[process.id] = {
            name: process.name,
            targetTime:
                parseFloat(document.getElementById(`time-${process.id}`).value) ||
                defaultEfficiencySettings[process.id].targetTime,
            targetQuality:
                parseFloat(document.getElementById(`quality-${process.id}`).value) ||
                defaultEfficiencySettings[process.id].targetQuality,
            targetOutput:
                parseFloat(document.getElementById(`output-${process.id}`).value) ||
                defaultEfficiencySettings[process.id].targetOutput,
            criteria: defaultEfficiencySettings[process.id].criteria
        };
    });

    // ✅ Save locally for instant use
    localStorage.setItem('processEfficiencySettings', JSON.stringify(settings));

    // ✅ Also persist to MongoDB via backend API
    try {
    await fetch('/api?type=settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ efficiency: settings })
    });
    console.log('✅ Efficiency settings saved to MongoDB');
    } catch (error) {
    console.error('❌ Failed to save settings:', error);
    showAlert('Failed to sync with server. Local copy saved only.', 'warning');
    }

    showAlert('Efficiency settings saved successfully!', 'success');
    loadEfficiencyPage();
}

// Reset efficiency settings to default
function resetEfficiencySettings() {
    if (confirm('Are you sure you want to reset all efficiency settings to default?')) {
        localStorage.removeItem('processEfficiencySettings');
        loadEfficiencyPage();
        showAlert('Efficiency settings reset to default!', 'success');
    }
}

// Load efficiency page
function loadEfficiencyPage() {
    const settings = loadEfficiencySettings();
    let html = '';
    
    productionProcesses.forEach(process => {
        const setting = settings[process.id];
        
        html += `
            <div class="efficiency-item">
                <div class="efficiency-header">
                    <div class="efficiency-title">
                        <i class="fas ${process.icon}"></i>
                        ${process.name}
                    </div>
                    <div>
                        <span style="font-size: 12px; color: #6c757d;">Adjust Targets:</span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Target Time (hours)</label>
                        <input type="number" id="time-${process.id}" class="efficiency-input" 
                                value="${setting.targetTime}" min="0.1" max="24" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Quality (%)</label>
                        <input type="number" id="quality-${process.id}" class="efficiency-input" 
                                value="${setting.targetQuality}" min="0" max="100" step="1">
                    </div>
                    
                    <div class="form-group">
                        <label>Target Output (%)</label>
                        <input type="number" id="output-${process.id}" class="efficiency-input" 
                                value="${setting.targetOutput}" min="0" max="100" step="1">
                    </div>
                </div>
                
                <div class="criteria-list">
                    <strong>Efficiency Criteria:</strong>
                    <ul>
                        ${setting.criteria.map(criterion => `<li>${criterion}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    });
    
    document.getElementById('efficiency-settings').innerHTML = html;
}

// Calculate process efficiency based on settings
function calculateProcessEfficiency(processId, actualTime, actualQuality, actualOutput) {
    const settings = loadEfficiencySettings();
    const setting = settings[processId];
    if (!setting) return 0;
    
    // Simple weighted average calculation
    const timeEfficiency = Math.max(0, (setting.targetTime / actualTime) * 100);
    const qualityEfficiency = actualQuality;
    const outputEfficiency = actualOutput;
    
    // Weighted average (time 40%, quality 40%, output 20%)
    const overallEfficiency = (timeEfficiency * 0.4) + (qualityEfficiency * 0.4) + (outputEfficiency * 0.2);
    
    return Math.min(100, overallEfficiency);
}

// Update efficiency calculation in analyzeOrder function
function updateEfficiencyCalculation(order) {
    const processEfficiency = {};
    
    productionProcesses.forEach(process => {
        const tracking = order.tracking.find(t => t.process === process.id);
        if (tracking && tracking.start_time && tracking.end_time) {
            const start = new Date(tracking.start_time);
            const end = new Date(tracking.end_time);
            const actualTime = (end - start) / (1000 * 60 * 60); // hours
            
            // Calculate quality (based on defect rate)
            const quality = Math.max(0, 100 - ((tracking.defect_quantity / order.quantity) * 100));
            
            // Calculate output (based on completion rate)
            const output = (tracking.quantity_completed / order.quantity) * 100;
            
            // Calculate efficiency using the new function
            processEfficiency[process.id] = calculateProcessEfficiency(
                process.id, 
                actualTime, 
                quality, 
                output
            );
        } else if (tracking && tracking.quantity_completed > 0) {
            // If in progress but no end time, estimate efficiency
            processEfficiency[process.id] = 50;
        } else {
            processEfficiency[process.id] = 0;
        }
    });
    
    return processEfficiency;
}

// Logo Management
let selectedLogo = 'industry';
let customLogoUrl = null;

function openLogoModal() {
    document.getElementById('logoModal').classList.add('active');
    // Reset selection
    document.querySelectorAll('.logo-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.logo-option[onclick="selectLogo('${selectedLogo}')"]`).classList.add('selected');
}

function closeLogoModal() {
    document.getElementById('logoModal').classList.remove('active');
}

function selectLogo(logoType) {
    selectedLogo = logoType;
    document.querySelectorAll('.logo-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.logo-option[onclick="selectLogo('${logoType}')"]`).classList.add('selected');
}

function saveLogo() {
    const logoIcon = document.getElementById('logo-icon');
    
    if (customLogoUrl) {
        // Use custom logo
        logoIcon.className = '';
        logoIcon.style.backgroundImage = `url(${customLogoUrl})`;
        logoIcon.style.backgroundSize = 'contain';
        logoIcon.style.backgroundRepeat = 'no-repeat';
        logoIcon.style.backgroundPosition = 'center';
        logoIcon.style.width = '32px';
        logoIcon.style.height = '32px';
    } else {
        // Use predefined icon
        logoIcon.className = `fas fa-${selectedLogo}`;
        logoIcon.style = '';
    }
    
    // Save to localStorage
    localStorage.setItem('selectedLogo', selectedLogo);
    if (customLogoUrl) {
        localStorage.setItem('customLogoUrl', customLogoUrl);
    }
    
    showAlert('Logo updated successfully!', 'success');
    closeLogoModal();
}

// Handle custom logo upload
document.getElementById('logo-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            customLogoUrl = event.target.result;
            showAlert('Custom logo uploaded. Click "Save Logo" to apply.', 'success');
        };
        reader.readAsDataURL(file);
    }
});

// Load saved logo on page load
function loadSavedLogo() {
    const savedLogo = localStorage.getItem('selectedLogo');
    const savedCustomLogo = localStorage.getItem('customLogoUrl');
    
    if (savedLogo) {
        selectedLogo = savedLogo;
    }
    
    if (savedCustomLogo) {
        customLogoUrl = savedCustomLogo;
    }
    
    // Apply the saved logo
    const logoIcon = document.getElementById('logo-icon');
    
    if (customLogoUrl) {
        logoIcon.className = '';
        logoIcon.style.backgroundImage = `url(${customLogoUrl})`;
        logoIcon.style.backgroundSize = 'contain';
        logoIcon.style.backgroundRepeat = 'no-repeat';
        logoIcon.style.backgroundPosition = 'center';
        logoIcon.style.width = '32px';
        logoIcon.style.height = '32px';
    } else {
        logoIcon.className = `fas fa-${selectedLogo}`;
        logoIcon.style = '';
    }
}

// Project Management
function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const title = document.getElementById('project-modal-title');
    const submitButton = document.getElementById('project-submit-button');
    const form = document.getElementById('project-form');
    
    if (projectId) {
        // Edit mode
        title.textContent = 'Edit Project';
        submitButton.textContent = 'Update Project';
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Project';
        
        // Load project data
        const project = projects.find(p => p.project_id === projectId);
        if (project) {
            document.getElementById('project-id').value = project.project_id;
            document.querySelector('input[name="project_name"]').value = project.project_name;
            document.querySelector('textarea[name="project_description"]').value = project.project_description || '';
            document.querySelector('input[name="start_date"]').value = project.start_date;
            document.querySelector('input[name="end_date"]').value = project.end_date;
            document.querySelector('input[name="client"]').value = project.client;
            document.querySelector('input[name="project_manager"]').value = project.project_manager;
            document.querySelector('select[name="status"]').value = project.status;
            document.querySelector('textarea[name="notes"]').value = project.notes || '';
        }
    } else {
        // Create mode
        title.textContent = 'Create New Project';
        submitButton.textContent = 'Create Project';
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Create Project';
        form.reset();
        document.getElementById('project-id').value = '';
        
        // Set default dates (minimum 3 weeks duration)
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 21); // 3 weeks minimum
        const endDateStr = endDate.toISOString().split('T')[0];
        
        document.querySelector('input[name="start_date"]').value = startDate;
        document.querySelector('input[name="end_date"]').value = endDateStr;
    }
    
    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

// Handle form submission for create and update project
document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const projectId = document.getElementById('project-id').value;

    // Disable submit button
    const submitButton = document.getElementById('project-submit-button');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        let payload;
        if (projectId) {
            // Editing: merge with existing data
            const existingProject = projects.find(p => p.project_id === projectId);
            payload = { ...existingProject, ...data, updated_at: new Date().toISOString() };
        } else {
            // Creating: create new payload
            payload = {
                ...data,
                project_id: null, // API will generate
                orders: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        }

        if (typeof saveProjectAPI !== 'function') {
            throw new Error('saveProjectAPI function is not defined. Check vercel.js');
        }

        await saveProjectAPI(payload); // This reloads all data
        closeProjectModal();

    } catch (error) {
        console.error('Error saving project:', error);
        showAlert(`Failed to save project: ${error.message}`, 'error');
    } finally {
        submitButton.disabled = false;
        const buttonText = projectId ? '<i class="fas fa-save"></i> Update Project' : '<i class="fas fa-plus"></i> Create Project';
        submitButton.innerHTML = buttonText;
    }
});

// Delete Project
async function deleteProject(projectId) {
    if (confirm(`Are you sure you want to delete project ${projectId}? This is permanent.`)) {
        try {
            if (typeof deleteProjectAPI !== 'function') {
                throw new Error('deleteProjectAPI function is not defined. Check vercel.js');
            }

            await deleteProjectAPI(projectId); // This reloads all data

        } catch (error) {
            console.error('Error deleting project:', error);
            showAlert(`Error deleting project: ${error.message}`, 'error');
        }
    }
}

// Load Projects
function loadProjects() {
    let html = '';
    
    // Use window.projects and window.orders
    if (!window.projects || window.projects.length === 0) {
        html = '<div style="text-align: center; padding: 40px; color: #6c757d;">No projects found. Create your first project to get started.</div>';
    } else {
        window.projects.forEach(project => {
            const projectOrders = window.orders.filter(o => o.project_id === project.project_id);
            const totalQuantity = projectOrders.reduce((sum, order) => sum + order.quantity, 0);
            const completedQuantity = projectOrders.reduce((sum, order) => {
                const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
                return sum + (warehouseOut ? warehouseOut.quantity_completed : 0);
            }, 0);
            
            const progress = totalQuantity > 0 ? Math.round((completedQuantity / totalQuantity) * 100) : 0;
            
            // Calculate project timeline progress
            const startDate = new Date(project.start_date);
            const endDate = new Date(project.end_date);
            const today = new Date();
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
            const timelineProgress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));
            
            const statusColor = project.status === 'completed' ? 'success' : 
                                project.status === 'in_progress' ? 'info' : 
                                project.status === 'on_hold' ? 'warning' : 'accent';
            
            html += `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-title">${project.project_name}</div>
                        <div>
                            <span class="badge badge-${statusColor}">${project.status.replace('_', ' ').toUpperCase()}</span>
                            <button class="btn btn-primary btn-sm" onclick="openProjectModal('${project.project_id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.project_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 14px; color: #6c757d;">Client</div>
                            <div style="font-weight: 600;">${project.client}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6c757d;">Project Manager</div>
                            <div style="font-weight: 600;">${project.project_manager}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6c757d;">Duration</div>
                            <div style="font-weight: 600;">${project.start_date} to ${project.end_date}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; color: #6c757d;">Orders</div>
                            <div style="font-weight: 600;">${projectOrders.length} orders (${totalQuantity} units)</div>
                        </div>
                    </div>
                    
                    <div class="project-timeline">
                        <div class="timeline-date">Timeline Progress: ${timelineProgress}%</div>
                        <div class="timeline-progress">
                            <div class="timeline-fill" style="width: ${timelineProgress}%"></div>
                        </div>
                    </div>
                    
                    <div class="project-timeline">
                        <div class="timeline-date">Production Progress: ${progress}%</div>
                        <div class="timeline-progress">
                            <div class="timeline-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="project-orders">
                        <h4 style="margin-bottom: 8px;">Orders in this Project</h4>
                        ${projectOrders.length > 0 ? projectOrders.map(order => {
                            const statusColor = order.current_status === 'completed' ? 'success' : 
                                                order.current_status === 'in_progress' ? 'info' : 
                                                order.current_status === 'on_hold' ? 'warning' : 'accent';
                            
                            return `
                                <div class="project-order-item">
                                    <div class="project-order-id">${order.order_id} - ${order.customer_name}</div>
                                    <div class="project-order-status badge badge-${statusColor}">${order.current_status.replace('_', ' ').toUpperCase()}</div>
                                </div>
                            `;
                        }).join('') : '<div style="color: #6c757d; font-style: italic;">No orders assigned to this project</div>'}
                    </div>
                    
                    ${project.project_description ? `
                        <div style="margin-top: 16px;">
                            <h4 style="margin-bottom: 8px;">Description</h4>
                            <p style="color: #6c757d;">${project.project_description}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }
    
    document.getElementById('projects-container').innerHTML = html;
}

// Update project select options in forms
function updateProjectSelects() {
    // Use window.projects
    const projectList = window.projects || [];
    
    // Update order form project select
    const orderProjectSelect = document.getElementById('order-project-select');
    if (orderProjectSelect) {
        let html = '<option value="">-- No Project --</option>';
        projectList.filter(p => p.status !== 'completed').forEach(project => {
            html += `<option value="${project.project_id}">${project.project_name} (${project.client})</option>`;
        });
        orderProjectSelect.innerHTML = html;
    }
    
    // Update DSS project select
    const dssProjectSelect = document.getElementById('dss-project-select');
    if (dssProjectSelect) {
        let html = '<option value="">-- Select Project --</option>';
        projectList.forEach(project => {
            html += `<option value="${project.project_id}">${project.project_name} (${project.client})</option>`;
        });
        dssProjectSelect.innerHTML = html;
    }
}

// Export Modal Functions
function openExportModal() {
    document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

// Export to Excel function
function exportToExcel(type) {
    try {
        let data = [];
        let filename = '';
        
        switch(type) {
            case 'orders':
                data = exportOrdersData();
                filename = 'Java_Connection_Orders.xlsx';
                break;
            case 'projects':
                data = exportProjectsData();
                filename = 'Java_Connection_Projects.xlsx';
                break;
            case 'tracking':
                data = exportTrackingData();
                filename = 'Java_Connection_Tracking.xlsx';
                break;
            case 'efficiency':
                data = exportEfficiencyData();
                filename = 'Java_Connection_Efficiency.xlsx';
                break;
            case 'all':
                data = exportAllData();
                filename = 'Java_Connection_Complete_Report.xlsx';
                break;
        }
        
        const wb = XLSX.utils.book_new();
        
        if (type === 'all') {
            data.forEach(sheet => {
                const ws = XLSX.utils.json_to_sheet(sheet.data);
                XLSX.utils.book_append_sheet(wb, ws, sheet.name);
            });
        } else {
            const ws = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'Data');
        }

        XLSX.writeFile(wb, filename);
        showAlert(`Data exported successfully as ${filename}`, 'success');
        closeExportModal();
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error exporting data', 'error');
    }
}

// Export projects data
function exportProjectsData() {
    // Use window.projects and window.orders
    return (window.projects || []).map(project => {
        const projectOrders = (window.orders || []).filter(o => o.project_id === project.project_id);
        const totalQuantity = projectOrders.reduce((sum, order) => sum + order.quantity, 0);
        const completedQuantity = projectOrders.reduce((sum, order) => {
            const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
            return sum + (warehouseOut ? warehouseOut.quantity_completed : 0);
        }, 0);

        let totalVolume = 0;
        let inProcessVolume = 0;

        projectOrders.forEach(order => {
            const L = order.package_length || 0;
            const W = order.package_width  || 0;
            const H = order.package_height || 0;
            const qty = order.quantity || 0;

            const volume = (L * W * H) / 1000000; // convert cm³ → m³
            const orderTotal = volume * qty;

            totalVolume += orderTotal;

            if (order.current_status !== 'completed') {
                inProcessVolume += orderTotal;
            }
        });
        
        const progress = totalQuantity > 0 ? Math.round((completedQuantity / totalQuantity) * 100) : 0;
        
        return {
            'Project ID': project.project_id,
            'Project Name': project.project_name,
            'Description': project.project_description || '',
            'Client': project.client,
            'Project Manager': project.project_manager,
            'Start Date': project.start_date,
            'End Date': project.end_date,
            'Status': project.status,
            'Orders Count': projectOrders.length,
            'Total Quantity': totalQuantity,
            'Completed Quantity': completedQuantity,
            'Progress': `${progress}%`,
            'Total Volume (m³)': totalVolume.toFixed(3),
            'In-Process Volume (m³)': inProcessVolume.toFixed(3),
            'Notes': project.notes || '',
            'Created Date': project.created_date
        };
    });
}

// Export orders data
function exportOrdersData() {
    // Use window.orders and window.projects
    return (window.orders || []).map(order => {
        const project = (window.projects || []).find(p => p.project_id === order.project_id);
        return {
            'Order ID': order.order_id,
            'Customer': order.customer_name,
            'Product': order.product_description,
            'Quantity': order.quantity,
            'Order Date': order.order_date,
            'Target Date': order.target_date,
            'Project': project ? project.project_name : 'None',
            'Status': order.current_status,
            'Progress': `${order.progress}%`,
            'Risk Level': order.risk_level,
            'Risk Score': order.risk_score,
            'PIC': order.pic_name,
            'Notes': order.notes || '',
            'Requires Accessories': order.requires_accessories ? 'Yes' : 'No',
            'Requires Welding': order.requires_welding ? 'Yes' : 'No'
        };
    });
}

// Export tracking data
function exportTrackingData() {
    const trackingData = [];
    
    // Use window.orders and window.projects
    (window.orders || []).forEach(order => {
        const project = (window.projects || []).find(p => p.project_id === order.project_id);
        order.tracking.forEach(track => {
            const process = productionProcesses.find(p => p.id === track.process);
            trackingData.push({
                'Order ID': order.order_id,
                'Customer': order.customer_name,
                'Project': project ? project.project_name : 'None',
                'Process': process ? process.name : track.process,
                'Status': track.status,
                'Quantity Completed': track.quantity_completed,
                'Defect Quantity': track.defect_quantity,
                'Start Time': track.start_time || 'Not started',
                'End Time': track.end_time || 'Not completed',
                'PIC': track.pic_name || '',
                'Last Updated': track.last_updated || 'Not updated'
            });
        });
    });
    
    return trackingData;
}

// Export efficiency data
function exportEfficiencyData() {
    const settings = loadEfficiencySettings();
    const efficiencyData = [];
    
    productionProcesses.forEach(process => {
        const setting = settings[process.id];
        if (setting) {
            efficiencyData.push({
                'Process': process.name,
                'Target Time (hours)': setting.targetTime,
                'Target Quality (%)': setting.targetQuality,
                'Target Output (%)': setting.targetOutput,
                'Criteria': setting.criteria.join('; ')
            });
        }
    });
    
    return efficiencyData;
}

// Export all data
function exportAllData() {
    // Use window.orders and window.projects
    const orderList = window.orders || [];
    const projectList = window.projects || [];
    
    return [
        {
            name: 'Orders',
            data: exportOrdersData()
        },
        {
            name: 'Projects',
            data: exportProjectsData()
        },
        {
            name: 'Tracking',
            data: exportTrackingData()
        },
        {
            name: 'Efficiency',
            data: exportEfficiencyData()
        },
        {
            name: 'Summary',
            data: [
                {
                    'Total Orders': orderList.length,
                    'Total Projects': projectList.length,
                    'Orders In Progress': orderList.filter(o => o.current_status === 'in_progress').length,
                    'Orders Completed': orderList.filter(o => o.current_status === 'completed').length,
                    'Projects In Progress': projectList.filter(p => p.status === 'in_progress').length,
                    'Projects Completed': projectList.filter(p => p.status === 'completed').length,
                    'Average Order Progress': `${(orderList.reduce((sum, o) => sum + o.progress, 0) / orderList.length).toFixed(1)}%`,
                    'Average Order Risk Score': (orderList.reduce((sum, o) => sum + o.risk_score, 0) / orderList.length).toFixed(1),
                    'Critical Orders': orderList.filter(o => o.risk_level === 'CRITICAL').length
                }
            ]
        }
    ];
}

// *** DELETED VARIABLE DECLARATIONS ***
// `let orders = [];` was removed.
// `projects = [...]` sample data was removed.
// All functions will now correctly use `window.orders` and `window.projects`
// which are populated by vercel.js

// Chart instances
// ** FIXED: Added all missing chart variables **
let progressChart = null;
let processEfficiencyChart = null;
let riskTimelineChart = null;
let resourceAllocationChart = null;
let combinedEfficiencyChart = null;
let bottleneckChart = null;
let projectTimelineChart = null;
let projectRiskChart = null;
let processFlowChart = null;
let projectProcessEfficiencyChart = null;
let projectRiskDistributionChart = null;
let orderProjectTimelineChart = null;

// Improved Risk Assessment Function
function calculateRiskAssessment(order, simulatedDate = null) {
    const today = simulatedDate ? new Date(simulatedDate) : new Date();
    const targetDate = new Date(order.target_date);
    const orderDate = new Date(order.order_date);

    const daysUntilDue = Math.ceil((targetDate - today) / 86400000);
    const daysSinceOrder = Math.ceil((today - orderDate) / 86400000);
    const totalDaysAllocated = Math.max(1, Math.ceil((targetDate - orderDate) / 86400000));

    const timeUsedRatio = daysSinceOrder / totalDaysAllocated;
    const timePressure = Math.max(0, Math.min(100, (timeUsedRatio - order.progress / 100) * 100));

    const progressRisk = 100 - order.progress;

    const totalDefects = order.tracking.reduce((s, t) => s + t.defect_quantity, 0);
    const defectRate = (totalDefects / order.quantity) * 100;
    const defectRisk = Math.min(100, defectRate * 10);

    let bottleneckRisk = 0;
    const completedProcesses = order.tracking.filter(t => t.quantity_completed === order.quantity).length;
    const expectedProcesses = Math.ceil(order.progress / 100 * order.tracking.length);

    if (completedProcesses < expectedProcesses - 2) {
        bottleneckRisk = 50;
    }

    const priorityRisk = order.priority === "high" ? 15 : order.priority === "medium" ? 5 : 0;

    const finalScore = Math.min(100,
        (progressRisk * 0.35) +
        (timePressure * 0.25) +
        (defectRisk * 0.20) +
        (bottleneckRisk * 0.10) +
        (priorityRisk * 0.10)
    );

    let riskLevel =
        finalScore >= 80 || daysUntilDue < 0 ? "CRITICAL" :
        finalScore >= 60 ? "HIGH" :
        finalScore >= 40 ? "MEDIUM" :
        finalScore >= 20 ? "LOW" :
        "VERY LOW";

    return {
        risk_score: Math.round(finalScore),
        risk_level: riskLevel,
        time_pressure: Math.round(timePressure),
        defect_rate: defectRate,
        days_until_due: daysUntilDue
    };
}

// ----- DATE UTILITIES -----
function getEarliestDate(order) {
    const trackingDates = order.tracking
        .map(t => t.start_time ? new Date(t.start_time) : null)
        .filter(Boolean);

    if (trackingDates.length > 0) {
        return new Date(Math.min(...trackingDates));
    }

    return new Date(order.order_date);
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function calculateRiskAtDate(order, date) {
    return calculateRiskAssessment(order, date).risk_score;
}

function generateRiskTimeline(order) {
    const start = getEarliestDate(order);

    const timelineDates = [
        start,
        addDays(start, 7),
        addDays(start, 14),
        addDays(start, 21),
        addDays(start, 28),
        new Date()
    ];

    return timelineDates.map(date => calculateRiskAtDate(order, date));
}

function polynomialTrend(values) {
    const n = values.length;
    const x = [...Array(n).keys()];
    const y = values;

    const sumX = x.reduce((a,b)=>a+b,0);
    const sumX2 = x.reduce((a,b)=>a+b*b,0);
    const sumX3 = x.reduce((a,b)=>a+b*b*b,0);
    const sumX4 = x.reduce((a,b)=>a+b*b*b*b,0);
    const sumY = y.reduce((a,b)=>a+b,0);
    const sumXY = x.reduce((a,b,i)=>a+b*y[i],0);
    const sumX2Y = x.reduce((a,b,i)=>a+b*b*y[i],0);

    const m = [
        [n, sumX, sumX2],
        [sumX, sumX2, sumX3],
        [sumX2, sumX3, sumX4]
    ];
    const v = [sumY, sumXY, sumX2Y];

    function solve(matrix, vector) {
        const a = JSON.parse(JSON.stringify(matrix));
        const b = [...vector];

        for (let i = 0; i < 3; i++) {
            let maxRow = i;
            for (let j = i + 1; j < 3; j++)
                if (Math.abs(a[j][i]) > Math.abs(a[maxRow][i])) maxRow = j;

            [a[i], a[maxRow]] = [a[maxRow], a[i]];
            [b[i], b[maxRow]] = [b[maxRow], b[i]];

            for (let j = i + 1; j < 3; j++) {
                const ratio = a[j][i] / a[i][i];
                for (let k = i; k < 3; k++) a[j][k] -= ratio * a[i][k];
                b[j] -= ratio * b[i];
            }
        }

        const sol = Array(3).fill(0);
        for (let i = 2; i >= 0; i--) {
            sol[i] = b[i] / a[i][i];
            for (let j = 0; j < i; j++)
                b[j] -= a[j][i] * sol[i];
        }
        return sol;
    }

    const [a, b, c] = solve(m, v);

    return x.map(i => a + b * i + c * i * i);
}

function createPredictedRisk(values) {
    const last = values[values.length - 1];
    const velocity = (values[values.length - 1] - values[0]) / values.length;
    const predicted = last + velocity * 2;
    return [...values.slice(0, 5), Math.min(100, Math.max(0, predicted))];
}

// Project Risk Assessment Function
function calculateProjectRiskAssessment(project) {
    const projectOrders = (window.orders || []).filter(o => o.project_id === project.project_id);
    
    if (projectOrders.length === 0) {
        return {
            risk_level: 'LOW',
            risk_score: 10,
            days_until_due: 0,
            completion_rate: 0,
            order_risks: []
        };
    }
    
    // Calculate overall project metrics
    const totalQuantity = projectOrders.reduce((sum, order) => sum + order.quantity, 0);
    const completedQuantity = projectOrders.reduce((sum, order) => {
        const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
        return sum + (warehouseOut ? warehouseOut.quantity_completed : 0);
    }, 0);
    
    const completionRate = totalQuantity > 0 ? (completedQuantity / totalQuantity) * 100 : 0;
    
    // Calculate project timeline
    const today = new Date();
    const endDate = new Date(project.end_date);
    const daysUntilDue = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // Calculate order risks
    const orderRisks = projectOrders.map(order => {
        const riskAssessment = calculateRiskAssessment(order);
        return {
            order_id: order.order_id,
            risk_level: riskAssessment.risk_level,
            risk_score: riskAssessment.risk_score
        };
    });
    
    // Calculate average risk score across all orders
    const avgRiskScore = projectOrders.reduce((sum, order) => {
        const riskAssessment = calculateRiskAssessment(order);
        return sum + riskAssessment.risk_score;
    }, 0) / projectOrders.length;
    
    // Adjust risk based on timeline and completion
    let timelineRisk = 0;
    if (daysUntilDue < 0) {
        timelineRisk = 30; // Project is overdue
    } else if (daysUntilDue < 7) {
        timelineRisk = 20; // Project due soon
    } else if (daysUntilDue < 14) {
        timelineRisk = 10; // Project due in 2 weeks
    }
    
    // Calculate completion risk
    const completionRisk = completionRate < 30 ? 20 : completionRate < 60 ? 10 : 0;
    
    // Combine all risk factors
    const finalRiskScore = Math.min(100, avgRiskScore + timelineRisk + completionRisk);
    
    // Determine risk level
    let riskLevel;
    if (finalRiskScore >= 80 || daysUntilDue < 0) {
        riskLevel = 'CRITICAL';
    } else if (finalRiskScore >= 60) {
        riskLevel = 'HIGH';
    } else if (finalRiskScore >= 40) {
        riskLevel = 'MEDIUM';
    } else if (finalRiskScore >= 20) {
        riskLevel = 'LOW';
    } else {
        riskLevel = 'VERY LOW';
    }
    
    return {
        risk_level: riskLevel,
        risk_score: Math.round(finalRiskScore),
        days_until_due: daysUntilDue,
        completion_rate: Math.round(completionRate),
        order_risks: orderRisks
    };
}

// DSS Tabs Management
function showDssTab(tabName) {
    document.querySelectorAll('.dss-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.dss-tab-content').forEach(content => content.classList.remove('active'));
    
    let tabIndex = 0;
    if (tabName === 'single') tabIndex = 0;
    else if (tabName === 'project') tabIndex = 1;
    else if (tabName === 'combined') tabIndex = 2;
    
    document.querySelector(`.dss-tab:nth-child(${tabIndex + 1})`).classList.add('active');
    document.getElementById(`dss-${tabName}`).classList.add('active');
    
    if (tabName === 'combined') {
        analyzeAllOrders();
    }
}

// Tab Management
function showTab(tabName, event) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    if (event) { // Add check for event, as it might be called programmatically
        event.target.classList.add('active');
    }

    // Use window.orders and window.projects
    const orderList = window.orders || [];
    const projectList = window.projects || [];

    if (tabName === 'orders') {
        renderOrders(orderList); // Use the global list
    } else if (tabName === 'projects') {
        loadProjects();
    } else if (tabName === 'tracking') {
        loadOrdersForTracking();
    } else if (tabName === 'dss') {
        loadOrdersForDSS();
        updateProjectSelects();
    } else if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'efficiency') {
        loadEfficiencyPage();
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        // Use window.orders and window.projects
        const orderList = window.orders || [];
        const projectList = window.projects || [];

        // Update risk assessment for all orders
        orderList.forEach(order => {
            const riskAssessment = calculateRiskAssessment(order);
            order.risk_level = riskAssessment.risk_level;
            order.risk_score = riskAssessment.risk_score;
        });

        // Calculate KPIs
        const totalOrders = orderList.length;
        const activeProjects = projectList.filter(p => p.status === 'in_progress').length;
        const completedOrders = orderList.filter(o => o.current_status === 'completed').length;
        const criticalOrders = orderList.filter(o => o.risk_level === 'CRITICAL').length;
        
        const avgProgress = totalOrders > 0 ? orderList.reduce((sum, order) => sum + order.progress, 0) / totalOrders : 0;
        const avgLeadTime = 48; // This would come from actual data
        const defectRate = 2.5; // This would come from actual data

        // Update KPI cards
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('active-projects').textContent = activeProjects;
        document.getElementById('completed-orders').textContent = avgProgress.toFixed(1) + '%';
        document.getElementById('at-risk').textContent = criticalOrders;
        document.getElementById('avg-lead-time').textContent = avgLeadTime;
        document.getElementById('defect-rate').textContent = defectRate + '%';

        // Update risk orders table
        let riskHtml = '';
        const atRiskOrders = orderList.filter(o => o.risk_level === 'CRITICAL' || o.risk_level === 'HIGH');
        
        atRiskOrders.forEach(order => {
            const project = projectList.find(p => p.project_id === order.project_id);
            const riskColor = order.risk_level === 'CRITICAL' ? 'danger' : 
                            order.risk_level === 'HIGH' ? 'warning' : 
                            order.risk_level === 'MEDIUM' ? 'info' : 'success';
            
            riskHtml += `
                <tr>
                    <td><strong>${order.order_id}</strong></td>
                    <td>${order.customer_name}</td>
                    <td>${project ? project.project_name : 'None'}</td>
                    <td><span class="badge badge-${riskColor}">${order.risk_level}</span></td>
                    <td>${order.risk_score}</td>
                    <td><button class="btn btn-primary btn-sm" onclick="analyzeOrderDirect('${order.order_id}')">Analyze</button></td>
                </tr>
            `;
        });

        document.getElementById('risk-orders-table').innerHTML = riskHtml || '<tr><td colspan="6">No at-risk orders</td></tr>';

        // Bottleneck detection
        const bottleneck = detectBottleneck();
        document.getElementById('bottleneck-stage').textContent = bottleneck.workstation;
        document.getElementById('bottleneck-risk').textContent = bottleneck.risk_level;

        const bottleneckColor = bottleneck.risk_level === 'HIGH' ? 'danger' : 'warning';
        const bottleneckAlert = `
            <div class="risk-card">
                <h4><i class="fas fa-exclamation-triangle"></i> Production Bottleneck Detected</h4>
                <p>
                    <strong>Workstation:</strong> ${bottleneck.workstation}<br>
                    <strong>Average Duration:</strong> ${bottleneck.avg_duration} hours<br>
                    <strong>Risk Level:</strong> <span class="badge badge-${bottleneckColor}">${bottleneck.risk_level}</span><br>
                    <strong>Action:</strong> ${bottleneck.recommendation}
                </p>
            </div>
        `;
        document.getElementById('bottleneck-alert').innerHTML = bottleneckAlert;

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Detect bottleneck in production
function detectBottleneck() {
    // Use window.orders
    const orderList = window.orders || [];
    const slowProcesses = {};
    
    orderList.forEach(order => {
        order.tracking.forEach(process => {
            if (process.start_time && process.end_time) {
                const start = new Date(process.start_time);
                const end = new Date(process.end_time);
                const duration = (end - start) / (1000 * 60 * 60); // hours
                
                if (!slowProcesses[process.process] || duration > slowProcesses[process.process].duration) {
                    slowProcesses[process.process] = {
                        duration: duration,
                        count: 1
                    };
                } else {
                    slowProcesses[process.process].count++;
                }
            }
        });
    });
    
    // Find the process with longest average duration
    let bottleneck = { workstation: 'None', avg_duration: 0, risk_level: 'LOW' };
    for (const [process, data] of Object.entries(slowProcesses)) {
        const avgDuration = data.duration / data.count;
        if (avgDuration > bottleneck.avg_duration) {
            const processName = productionProcesses.find(p => p.id === process)?.name || process;
            bottleneck = {
                workstation: processName,
                avg_duration: avgDuration.toFixed(1),
                risk_level: avgDuration > 8 ? 'HIGH' : 'MEDIUM',
                recommendation: avgDuration > 8 ? 
                    'Increase resources or review processes at this workstation' :
                    'Monitor this process for potential delays'
            };
        }
    }
    
    return bottleneck;
}

// Load Orders
function renderOrders(ordersToRender) {
    try {
        let html = '';
        // Use window.projects
        const projectList = window.projects || [];
        
        ordersToRender.forEach(order => {
            const project = projectList.find(p => p.project_id === order.project_id);
            const statusColor = order.current_status === 'completed' ? 'success' : 
                                order.current_status === 'in_progress' ? 'info' : 
                                order.current_status === 'on_hold' ? 'warning' : 'accent';
            
            const progressColor = order.progress > 80 ? 'progress-success' : 
                                order.progress > 50 ? 'progress-warning' : 
                                'progress-danger';
            
            const riskColor = order.risk_level === 'CRITICAL' ? 'danger' : 
                            order.risk_level === 'HIGH' ? 'warning' : 
                            order.risk_level === 'MEDIUM' ? 'info' : 'success';
            
            html += `
                <tr>
                    <td><strong>${order.order_id}</strong></td>
                    <td>${order.customer_name}</td>
                    <td>${order.product_description}</td>
                    <td>${order.quantity}</td>
                    <td>${((order.package_length * order.package_width * order.package_height) / 1000000).toFixed(3)}</td>
                    <td>${order.order_date}</td>
                    <td>${order.target_date}</td>
                    <td>${project ? project.project_name : 'None'}</td>
                    <td><span class="badge badge-${statusColor}">${order.current_status}</span></td>
                    <td>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${progressColor}" style="width: ${order.progress}%"></div>
                            </div>
                            <span class="progress-text">${order.progress}%</span>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-sm" onclick="editOrder('${order.order_id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-${riskColor} btn-sm" onclick="viewOrderRisk('${order.order_id}')">
                                <i class="fas fa-chart-line"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.order_id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        document.getElementById('orders-table').innerHTML = html || '<tr><td colspan="10">No orders found</td></tr>';

    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Error loading orders', 'error');
    }
}

// Load Orders for Tracking
async function loadOrdersForTracking() {
    try {
        // Use window.orders
        const orderList = window.orders || [];
        let html = '<option value="">-- Select Order --</option>';
        orderList.filter(o => o.current_status !== 'completed').forEach(order => {
            html += `<option value="${order.order_id}">${order.order_id} - ${order.customer_name}</option>`;
        });

        document.getElementById('track-order-select').innerHTML = html;

    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load Orders for DSS
async function loadOrdersForDSS() {
    try {
        // Use window.orders
        const orderList = window.orders || [];
        let html = '<option value="">-- Select Order --</option>';
        orderList.forEach(order => {
            html += `<option value="${order.order_id}">${order.order_id} - ${order.customer_name}</option>`;
        });

        document.getElementById('dss-order-select').innerHTML = html;

    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Load Order Tracking
function loadOrderTracking() {
    const orderId = document.getElementById('track-order-select').value;
    if (!orderId) {
        document.getElementById('order-tracking-info').style.display = 'none';
        return;
    }

    // Use window.orders
    const order = (window.orders || []).find(o => o.order_id === orderId);
    if (!order) return;

    document.getElementById('order-tracking-info').style.display = 'block';

    // Set current datetime for start time if not set
    const now = new Date();
    const nowFormatted = now.toISOString().slice(0, 16);
    document.getElementById('start-time').value = nowFormatted;

    // Generate process steps
    let processStepsHtml = '';
    let completedSteps = 0;
    let activeStepIndex = -1;

    // Filter processes based on order requirements
    const applicableProcesses = productionProcesses.filter(process => {
        if (process.optional) {
            if (process.id === 'accessories') return order.requires_accessories;
            if (process.id === 'welding') return order.requires_welding;
        }
        return true;
    });

    applicableProcesses.forEach((process, index) => {
        const tracking = order.tracking.find(t => t.process === process.id) || { status: 'pending', quantity_completed: 0 };
        let stepClass = '';
        
        if (tracking.quantity_completed === order.quantity) {
            stepClass = 'step-completed';
            completedSteps++;
        } else if (tracking.quantity_completed > 0) {
            stepClass = 'step-active';
            if (activeStepIndex === -1) activeStepIndex = index;
        }

        processStepsHtml += `
            <div class="process-step ${stepClass}" data-process="${process.id}">
                <div class="step-icon">
                    <i class="fas ${process.icon}"></i>
                </div>
                <div class="step-label">${process.name}</div>
            </div>
        `;
    });

    document.getElementById('process-steps').innerHTML = processStepsHtml;

    // Update process connector
    const connectorWidth = activeStepIndex !== -1 ? 
        (activeStepIndex / (applicableProcesses.length - 1)) * 100 : 
        (completedSteps / applicableProcesses.length) * 100;
    
    let connector = document.querySelector('.process-connector');
    if (!connector) {
        connector = document.createElement('div');
        connector.className = 'process-connector';
        document.getElementById('process-steps').appendChild(connector);
    }
    connector.style.width = `${connectorWidth}%`;

    // Generate quantity tracking table
    let quantityTableHtml = `
        <table class="quantity-table">
            <thead>
                <tr>
                    <th>Process</th>
                    <th>Status</th>
                    <th>Quantity Completed</th>
                    <th>Defect Quantity</th>
                    <th>Remaining</th>
                    <th>Last Updated</th>
                    <th>PIC</th>
                </tr>
            </thead>
            <tbody>
    `;

    applicableProcesses.forEach(process => {
        const tracking = order.tracking.find(t => t.process === process.id) || { 
            status: 'pending', 
            quantity_completed: 0, 
            defect_quantity: 0,
            pic_name: '',
            last_updated: null
        };
        
        const remaining = order.quantity - tracking.quantity_completed;
        const statusClass = tracking.quantity_completed === order.quantity ? 'status-completed' : 
                            tracking.quantity_completed > 0 ? 'status-in-progress' : 'status-pending';
        
        const statusText = tracking.quantity_completed === order.quantity ? 'COMPLETED' : 
                            tracking.quantity_completed > 0 ? 'IN PROGRESS' : 'PENDING';
        
        const lastUpdated = tracking.last_updated ? 
            new Date(tracking.last_updated).toLocaleString() : '-';
        
        quantityTableHtml += `
            <tr>
                <td>${process.name}</td>
                <td><span class="process-status ${statusClass}">${statusText}</span></td>
                <td>${tracking.quantity_completed}</td>
                <td>${tracking.defect_quantity}</td>
                <td>${remaining}</td>
                <td>${lastUpdated}</td>
                <td>${tracking.pic_name || '-'}</td>
            </tr>
        `;
    });

    quantityTableHtml += '</tbody></table>';
    document.getElementById('quantity-tracking-table').innerHTML = quantityTableHtml;

    // Generate process select options
    let processSelectHtml = '';
    applicableProcesses.forEach(process => {
        processSelectHtml += `<option value="${process.id}">${process.name}</option>`;
    });
    document.getElementById('track-process-select').innerHTML = processSelectHtml;

    // Set max values for quantity inputs
    document.getElementById('quantity-completed').max = order.quantity;
    document.getElementById('defect-quantity').max = order.quantity;
}

// Update Order Status based on quantity completed in each process
function updateOrderStatus(order) {
    // Calculate overall progress based on completed processes
    const applicableProcesses = productionProcesses.filter(process => {
        if (process.optional) {
            if (process.id === 'accessories') return order.requires_accessories;
            if (process.id === 'welding') return order.requires_welding;
        }
        return true;
    });

    // Count completed processes (where quantity_completed equals order quantity)
    const completedProcesses = applicableProcesses.filter(process => {
        const tracking = order.tracking.find(t => t.process === process.id);
        return tracking && tracking.quantity_completed === order.quantity;
    }).length;

    // Update progress percentage
    order.progress = Math.round((completedProcesses / applicableProcesses.length) * 100);

    // Determine order status based on quantity completed in warehouse_out
    const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
    
    if (warehouseOut && warehouseOut.quantity_completed === order.quantity) {
        order.current_status = 'completed';
    } else if (order.tracking.some(t => t.quantity_completed > 0 && t.quantity_completed < order.quantity)) {
        order.current_status = 'in_progress';
    } else {
        order.current_status = 'pending';
    }
    
    // Update risk assessment
    const riskAssessment = calculateRiskAssessment(order);
    order.risk_level = riskAssessment.risk_level;
    order.risk_score = riskAssessment.risk_score;
}

// Analyze Single Order
async function analyzeOrder() {
    const orderId = document.getElementById('dss-order-select').value;
    if (!orderId) return;

    try {
        // Use window.orders
        const order = (window.orders || []).find(o => o.order_id === orderId);
        if (!order) return;

        // Update risk assessment
        const riskAssessment = calculateRiskAssessment(order);
        order.risk_level = riskAssessment.risk_level;
        order.risk_score = riskAssessment.risk_score;

        // Calculate process efficiency using the new function
        const processEfficiency = updateEfficiencyCalculation(order);

        let html = `
            <div class="dss-grid">
                <div class="dss-card risk">
                    <h4><i class="fas fa-exclamation-triangle"></i> Risk Assessment</h4>
                    <div class="kpi-value" style="color: ${riskAssessment.risk_level === 'CRITICAL' ? 'var(--danger-color)' : riskAssessment.risk_level === 'HIGH' ? 'var(--warning-color)' : 'var(--info-color)'}">${riskAssessment.risk_level}</div>
                    <div class="kpi-label">Risk Score: ${riskAssessment.risk_score}/100</div>
                    <div class="kpi-label">Days Until Due: ${riskAssessment.days_until_due}</div>
                </div>
                <div class="dss-card forecast">
                    <h4><i class="fas fa-clock"></i> Forecast</h4>
                    <div class="kpi-value">${new Date(Date.now() + (100 - order.progress) * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                    <div class="kpi-label">Estimated Completion</div>
                    <div class="kpi-label">Hours Remaining: ${(100 - order.progress) * 2.4}</div>
                </div>
                <div class="dss-card efficiency">
                    <h4><i class="fas fa-tachometer-alt"></i> Efficiency</h4>
                    <div class="kpi-value">${order.progress}%</div>
                    <div class="kpi-label">Current Progress</div>
                    <div class="kpi-label">On Track: ${riskAssessment.days_until_due > 0 ? 'YES' : 'NO'}</div>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Order Progress vs Time</h4>
                    <canvas id="progressChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Process Efficiency</h4>
                    <canvas id="processEfficiencyChart"></canvas>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Risk Timeline</h4>
                    <canvas id="riskTimelineChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Resource Allocation</h4>
                    <canvas id="resourceAllocationChart"></canvas>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container chart-full">
                    <h4>Process Flow Analysis</h4>
                    <canvas id="processFlowChart"></canvas>
                </div>
            </div>

            <div class="table-container" style="margin-top: 24px;">
                <div style="padding: 20px;">
                    <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
                    <div style="margin-top: 16px;">
                        ${generateRecommendations(order, riskAssessment).map(rec => `
                            <div class="recommendation-item">
                                <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
                                ${rec.action}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('dss-results').innerHTML = html;

        // Render charts
        renderProgressChart(order);
        renderProcessEfficiencyChart(processEfficiency);
        renderRiskTimelineChart(order);
        renderResourceAllocationChart(order);
        renderProcessFlowChart(order);

    } catch (error) {
        console.error('Error analyzing order:', error);
        showAlert('Error analyzing order', 'error');
    }
}

// Analyze Project
async function analyzeProject() {
    const projectId = document.getElementById('dss-project-select').value;
    if (!projectId) return;

    try {
        // Use window.projects and window.orders
        const project = (window.projects || []).find(p => p.project_id === projectId);
        if (!project) return;

        const projectOrders = (window.orders || []).filter(o => o.project_id === projectId);
        
        // Update risk assessment for project
        const riskAssessment = calculateProjectRiskAssessment(project);

        // Calculate project metrics
        const totalQuantity = projectOrders.reduce((sum, order) => sum + order.quantity, 0);
        const completedQuantity = projectOrders.reduce((sum, order) => {
            const warehouseOut = order.tracking.find(t => t.process === 'warehouse_out');
            return sum + (warehouseOut ? warehouseOut.quantity_completed : 0);
        }, 0);

        // Calculate rubrikasi volume
        let totalVolume = 0;
        let inProcessVolume = 0;

        projectOrders.forEach(order => {
            const L = order.package_length || 0;
            const W = order.package_width  || 0;
            const H = order.package_height || 0;
            const qty = order.quantity || 0;

            const volume = (L * W * H) / 1000000; // convert cm³ → m³
            const orderTotal = volume * qty;

            totalVolume += orderTotal;

            if (order.current_status !== 'completed') {
                inProcessVolume += orderTotal;
            }
        });
                
        const completionRate = totalQuantity > 0 ? Math.round((completedQuantity / totalQuantity) * 100) : 0;
        
        // Calculate project timeline progress
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        const today = new Date();
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        const timelineProgress = Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)));

        // Calculate process efficiency across all orders in the project
        const processEfficiency = {};
        productionProcesses.forEach(process => {
            let totalEfficiency = 0;
            let count = 0;
            
            projectOrders.forEach(order => {
                const tracking = order.tracking.find(t => t.process === process.id);
                if (tracking && tracking.start_time && tracking.end_time) {
                    const start = new Date(tracking.start_time);
                    const end = new Date(tracking.end_time);
                    const actualTime = (end - start) / (1000 * 60 * 60); // hours
                    
                    // Calculate quality (based on defect rate)
                    const quality = Math.max(0, 100 - ((tracking.defect_quantity / order.quantity) * 100));
                    
                    // Calculate output (based on completion rate)
                    const output = (tracking.quantity_completed / order.quantity) * 100;
                    
                    // Calculate efficiency using the new function
                    totalEfficiency += calculateProcessEfficiency(
                        process.id, 
                        actualTime, 
                        quality, 
                        output
                    );
                    count++;
                } else if (tracking && tracking.quantity_completed > 0) {
                    // If in progress but no end time, estimate efficiency
                    totalEfficiency += 50;
                    count++;
                }
            });
            
            processEfficiency[process.id] = count > 0 ? totalEfficiency / count : 0;
        });

        // Compute total quantity & volume per workstation
        const workstationTotals = {};

        productionProcesses.forEach(proc => {
            workstationTotals[proc.id] = {
                qty: 0,
                volume: 0
            };
        });

        projectOrders.forEach(order => {
            const L = order.package_length || 0;
            const W = order.package_width  || 0;
            const H = order.package_height || 0;
            const volumePerUnit = (L * W * H) / 1000000;

            order.tracking.forEach(tr => {
                if (workstationTotals[tr.process]) {
                    workstationTotals[tr.process].qty += tr.quantity_completed || 0;
                    workstationTotals[tr.process].volume += (tr.quantity_completed || 0) * volumePerUnit;
                }
            });
        });

        let html = `
            <div class="dss-grid">
                <div class="dss-card risk">
                    <h4><i class="fas fa-exclamation-triangle"></i> Project Risk Assessment</h4>
                    <div class="kpi-value" style="color: ${riskAssessment.risk_level === 'CRITICAL' ? 'var(--danger-color)' : riskAssessment.risk_level === 'HIGH' ? 'var(--warning-color)' : 'var(--info-color)'}">${riskAssessment.risk_level}</div>
                    <div class="kpi-label">Risk Score: ${riskAssessment.risk_score}/100</div>
                    <div class="kpi-label">Days Until Due: ${riskAssessment.days_until_due}</div>
                </div>
                <div class="dss-card">
                    <h4><i class="fas fa-cube"></i> Total Volume (m³)</h4>
                    <div class="kpi-value">${totalVolume.toFixed(3)}</div>
                    <div class="kpi-label">Total cubic volume of all orders</div>
                </div>
                <div class="dss-card">
                    <h4><i class="fas fa-box"></i> In-Process Volume (m³)</h4>
                    <div class="kpi-value">${inProcessVolume.toFixed(3)}</div>
                    <div class="kpi-label">Volume still in production</div>
                </div>
                <div class="dss-card forecast">
                    <h4><i class="fas fa-chart-pie"></i> Project Progress</h4>
                    <div class="kpi-value">${completionRate}%</div>
                    <div class="kpi-label">Completion Rate</div>
                    <div class="kpi-label">Timeline Progress: ${timelineProgress}%</div>
                </div>
                <div class="dss-card efficiency">
                    <h4><i class="fas fa-clipboard-list"></i> Order Status</h4>
                    <div class="kpi-value">${projectOrders.length}</div>
                    <div class="kpi-label">Total Orders</div>
                    <div class="kpi-label">Total Quantity: ${totalQuantity} units</div>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Project Timeline</h4>
                    <canvas id="projectTimelineChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Process Efficiency</h4>
                    <canvas id="projectProcessEfficiencyChart"></canvas>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Order Risk Distribution</h4>
                    <canvas id="projectRiskChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Resource Allocation</h4>
                    <canvas id="projectResourceChart"></canvas>
                </div>
            </div>

            <div class="table-container" style="margin-top: 24px;">
                <div style="padding: 20px;">
                    <h3><i class="fas fa-lightbulb"></i> Project Recommendations</h3>
                    <div style="margin-top: 16px;">
                        ${generateProjectRecommendations(project, riskAssessment, projectOrders).map(rec => `
                            <div class="recommendation-item">
                                <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
                                ${rec.action}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        projectOrders.forEach(order => { html += generateOrderSectionHTML(order); });
        document.getElementById('dss-project-results').innerHTML = html;

        // Render charts
        renderProjectTimelineChart(project, timelineProgress, completionRate);
        renderProjectProcessEfficiencyChart(workstationTotals);
        renderProjectRiskChart(riskAssessment.order_risks);
        renderProjectResourceChart(projectOrders);

    } catch (error) {
        console.error('Error analyzing project:', error);
        showAlert('Error analyzing project', 'error');
    }
}

// Generate recommendations based on order status and risk
function generateRecommendations(order, riskAssessment) {
    const recommendations = [];
    
    if (riskAssessment.risk_level === 'CRITICAL') {
        recommendations.push({
            priority: 'HIGH',
            action: 'Immediate intervention required. Allocate additional resources to meet deadline.'
        });
    }
    
    if (riskAssessment.days_until_due < 3) {
        recommendations.push({
            priority: 'HIGH',
            action: 'Deadline approaching. Consider overtime or temporary workforce.'
        });
    }
    
    if (order.progress < 30 && riskAssessment.time_pressure > 50) {
        recommendations.push({
            priority: 'HIGH',
            action: 'Progress is behind schedule. Review process bottlenecks.'
        });
    }
    
    if (riskAssessment.defect_rate > 5) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'High defect rate detected. Improve quality control measures.'
        });
    }
    
    // Check for bottlenecks in specific processes
    const assembly = order.tracking.find(t => t.process === 'assembly');
    if (assembly && assembly.quantity_completed < order.quantity * 0.5 && order.progress > 30) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Assembly process is lagging. Review workflow and resource allocation.'
        });
    }
    
    if (order.requires_welding) {
        const welding = order.tracking.find(t => t.process === 'welding');
        if (welding && welding.quantity_completed === 0 && order.progress > 40) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Welding process not started. Ensure welding team is available.'
            });
        }
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'LOW',
            action: 'Order is on track. Continue monitoring progress.'
        });
    }
    
    return recommendations;
}

// Generate project recommendations
function generateProjectRecommendations(project, riskAssessment, projectOrders) {
    const recommendations = [];
    
    if (riskAssessment.risk_level === 'CRITICAL') {
        recommendations.push({
            priority: 'HIGH',
            action: 'Project is at critical risk. Immediate intervention required. Consider reallocating resources from lower priority projects.'
        });
    }
    
    if (riskAssessment.days_until_due < 7) {
        recommendations.push({
            priority: 'HIGH',
            action: 'Project deadline approaching in less than a week. Consider overtime or temporary workforce.'
        });
    }
    
    if (riskAssessment.completion_rate < 30) {
        recommendations.push({
            priority: 'HIGH',
            action: 'Project completion rate is below 30%. Review project plan and resource allocation.'
        });
    }
    
    // Check for high-risk orders
    const highRiskOrders = projectOrders.filter(o => {
        const risk = calculateRiskAssessment(o);
        return risk.risk_level === 'CRITICAL' || risk.risk_level === 'HIGH';
    });
    
    if (highRiskOrders.length > 0) {
        recommendations.push({
            priority: 'MEDIUM',
            action: `${highRiskOrders.length} orders in this project are at high risk. Focus on these orders first.`
        });
    }
    
    // Check for process bottlenecks across the project
    const processDelays = {};
    productionProcesses.forEach(process => {
        let totalDelay = 0;
        let count = 0;
        
        projectOrders.forEach(order => {
            const tracking = order.tracking.find(t => t.process === process.id);
            if (tracking && tracking.start_time && tracking.end_time) {
                const start = new Date(tracking.start_time);
                const end = new Date(tracking.end_time);
                const duration = (end - start) / (1000 * 60 * 60); // hours
                
                // Compare with expected duration from efficiency settings
                const settings = loadEfficiencySettings();
                const expectedDuration = settings[process.id]?.targetTime || 2;
                const delay = Math.max(0, duration - expectedDuration);
                totalDelay += delay;
                count++;
            }
        });
        
        if (count > 0) {
            processDelays[process.id] = totalDelay / count;
        }
    });
    
    // Find the process with highest delay
    let maxDelay = 0;
    let bottleneckProcess = '';
    
    for (const [process, delay] of Object.entries(processDelays)) {
        if (delay > maxDelay) {
            maxDelay = delay;
            bottleneckProcess = process;
        }
    }
    
    if (maxDelay > 4) {
        const processName = productionProcesses.find(p => p.id === bottleneckProcess)?.name || bottleneckProcess;
        recommendations.push({
            priority: 'MEDIUM',
            action: `Significant bottleneck detected at ${processName}. Average delay: ${maxDelay.toFixed(1)} hours.`
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'LOW',
            action: 'Project is on track. Continue monitoring progress.'
        });
    }
    
    return recommendations;
}

// Generate the HTML for a single order breakdown inside project analysis
function generateOrderSectionHTML(order) {
    const orderVolume = ((order.package_length || 0) * (order.package_width || 0) * (order.package_height || 0)) / 1000000;
    const volumePerUnit = orderVolume.toFixed(3);
    const totalOrderVolume = (orderVolume * (order.quantity || 0)).toFixed(3);

    // calculate per-workstation efficiencies using existing function
    const processEff = updateEfficiencyCalculation(order); // returns { processId: efficiencyPercent, ... }

    // Build efficiency list HTML
    const effListHtml = Object.keys(processEff).map(pid => {
        const proc = productionProcesses.find(p => p.id === pid);
        const name = proc ? proc.name : pid;
        const effVal = (processEff[pid] || 0).toFixed(1);
        const badgeClass = processEff[pid] >= 80 ? 'badge-success' : processEff[pid] >= 50 ? 'badge-warning' : 'badge-danger';
        return `<div class="pe-item"><div class="pe-name">${name}</div><div class="pe-value"><span class="badge ${badgeClass}">${effVal}%</span></div></div>`;
    }).join('');

    // compute timeline progress for the order (safe)
    const start = order.order_date ? new Date(order.order_date) : null;
    const end = order.target_date ? new Date(order.target_date) : null;
    let orderTimeline = '-';
    if (start && end) {
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
        const daysPassed = Math.ceil((Date.now() - start) / (1000 * 60 * 60 * 24));
        orderTimeline = `${Math.min(100, Math.max(0, Math.round((daysPassed / totalDays) * 100)))}%`;
    }

    return `
    <div class="order-breakdown-card">
        <div class="order-breakdown-header">
            <div class="order-title"><strong>${order.order_id}</strong> — ${order.product_description || 'Product'}</div>
            <div class="order-meta">${order.customer_name || ''} • ${order.current_status || ''}</div>
        </div>

        <div class="order-breakdown-grid">
            <div><strong>Quantity</strong><div>${order.quantity || 0}</div></div>
            <div><strong>Volume / unit</strong><div>${volumePerUnit} m³</div></div>
            <div><strong>Total Volume</strong><div>${totalOrderVolume} m³</div></div>
            <div><strong>Progress</strong><div>${order.progress || 0}%</div></div>
            <div><strong>Risk</strong><div>${order.risk_level || order.risk || 'N/A'}</div></div>
            <div><strong>Timeline</strong><div>${orderTimeline}</div></div>
        </div>

        <div class="process-efficiency-section">
            <h4>Process Efficiency (per workstation)</h4>
            <div class="process-efficiency-list">
                ${effListHtml || '<div style="color:#6c757d">No process data</div>'}
            </div>
        </div>

        ${order.notes ? `<div class="order-notes"><strong>Notes</strong><p>${order.notes}</p></div>` : ''}
    </div>
    <hr class="order-sep">
    `;
}

// Analyze All Orders (Combined Analysis)
function analyzeAllOrders() {
    try {
        // Use window.orders and window.projects
        const orderList = window.orders || [];
        const projectList = window.projects || [];

        // Calculate overall metrics
        const totalOrders = orderList.length;
        const totalProjects = projectList.length;
        const completedOrders = orderList.filter(o => o.current_status === 'completed').length;
        const inProgressOrders = orderList.filter(o => o.current_status === 'in_progress').length;
        const pendingOrders = orderList.filter(o => o.current_status === 'pending').length;
        const completedProjects = projectList.filter(p => p.status === 'completed').length;
        const inProgressProjects = projectList.filter(p => p.status === 'in_progress').length;
        
        const avgProgress = totalOrders > 0 ? orderList.reduce((sum, order) => sum + order.progress, 0) / totalOrders : 0;
        const avgRiskScore = totalOrders > 0 ? orderList.reduce((sum, order) => sum + order.risk_score, 0) / totalOrders : 0;
        
        // Calculate process efficiency across all orders
        const processEfficiency = {};
        productionProcesses.forEach(process => {
            let totalEfficiency = 0;
            let count = 0;
            
            orderList.forEach(order => {
                const tracking = order.tracking.find(t => t.process === process.id);
                if (tracking && tracking.start_time && tracking.end_time) {
                    const start = new Date(tracking.start_time);
                    const end = new Date(tracking.end_time);
                    const actualTime = (end - start) / (1000 * 60 * 60); // hours
                    
                    // Calculate quality (based on defect rate)
                    const quality = Math.max(0, 100 - ((tracking.defect_quantity / order.quantity) * 100));
                    
                    // Calculate output (based on completion rate)
                    const output = (tracking.quantity_completed / order.quantity) * 100;
                    
                    // Calculate efficiency using the new function
                    totalEfficiency += calculateProcessEfficiency(
                        process.id, 
                        actualTime, 
                        quality, 
                        output
                    );
                    count++;
                } else if (tracking && tracking.quantity_completed > 0) {
                    // If in progress but no end time, estimate efficiency
                    totalEfficiency += 50;
                    count++;
                }
            });
            
            processEfficiency[process.id] = count > 0 ? totalEfficiency / count : 0;
        });

        // Identify bottlenecks across all orders
        const bottleneckAnalysis = analyzeBottlenecks();
        
        // Calculate project risk distribution
        const projectRiskDistribution = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            very_low: 0
        };
        
        projectList.forEach(project => {
            const riskAssessment = calculateProjectRiskAssessment(project);
            projectRiskDistribution[riskAssessment.risk_level.toLowerCase().replace(' ', '_')]++;
        });
        
        let html = `
            <div class="dss-grid">
                <div class="dss-card risk">
                    <h4><i class="fas fa-chart-pie"></i> Order Distribution</h4>
                    <div class="kpi-value">${totalOrders}</div>
                    <div class="kpi-label">Total Orders</div>
                    <div class="kpi-label">Completed: ${completedOrders}</div>
                    <div class="kpi-label">In Progress: ${inProgressOrders}</div>
                </div>
                <div class="dss-card forecast">
                    <h4><i class="fas fa-project-diagram"></i> Project Distribution</h4>
                    <div class="kpi-value">${totalProjects}</div>
                    <div class="kpi-label">Total Projects</div>
                    <div class="kpi-label">Completed: ${completedProjects}</div>
                    <div class="kpi-label">In Progress: ${inProgressProjects}</div>
                </div>
                <div class="dss-card efficiency">
                    <h4><i class="fas fa-exclamation-triangle"></i> Risk Overview</h4>
                    <div class="kpi-value" style="color: ${avgRiskScore > 70 ? 'var(--danger-color)' : avgRiskScore > 50 ? 'var(--warning-color)' : 'var(--success-color)'}">${avgRiskScore > 70 ? 'HIGH' : avgRiskScore > 50 ? 'MEDIUM' : 'LOW'}</div>
                    <div class="kpi-label">Overall Risk Level</div>
                    <div class="kpi-label">Critical Orders: ${orderList.filter(o => o.risk_level === 'CRITICAL').length}</div>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Process Efficiency Across All Orders</h4>
                    <canvas id="combinedEfficiencyChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Production Bottlenecks</h4>
                    <canvas id="bottleneckChart"></canvas>
                </div>
            </div>

            <div class="chart-row">
                <div class="chart-container">
                    <h4>Project Risk Distribution</h4>
                    <canvas id="projectRiskDistributionChart"></canvas>
                </div>
                <div class="chart-container">
                    <h4>Order vs Project Timeline</h4>
                    <canvas id="orderProjectTimelineChart"></canvas>
                </div>
            </div>

            <div class="table-container" style="margin-top: 24px;">
                <div style="padding: 20px;">
                    <h3><i class="fas fa-lightbulb"></i> Overall Recommendations</h3>
                    <div style="margin-top: 16px;">
                        ${generateCombinedRecommendations(avgRiskScore, bottleneckAnalysis, projectRiskDistribution).map(rec => `
                            <div class="recommendation-item">
                                <span class="recommendation-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
                                ${rec.action}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('combined-results').innerHTML = html;

        // Render combined charts
        renderCombinedEfficiencyChart(processEfficiency);
        renderBottleneckChart(bottleneckAnalysis);
        renderProjectRiskDistributionChart(projectRiskDistribution);
        renderOrderProjectTimelineChart();

    } catch (error) {
        console.error('Error analyzing all orders:', error);
        showAlert('Error analyzing all orders', 'error');
    }
}

// Analyze bottlenecks across all orders
function analyzeBottlenecks() {
    const processDelays = {};
    // Use window.orders
    const orderList = window.orders || [];
    
    productionProcesses.forEach(process => {
        let totalDelay = 0;
        let count = 0;
        
        orderList.forEach(order => {
            const tracking = order.tracking.find(t => t.process === process.id);
            if (tracking && tracking.start_time && tracking.end_time) {
                const start = new Date(tracking.start_time);
                const end = new Date(tracking.end_time);
                const duration = (end - start) / (1000 * 60 * 60); // hours
                
                // Compare with expected duration from efficiency settings
                const settings = loadEfficiencySettings();
                const expectedDuration = settings[process.id]?.targetTime || 2;
                const delay = Math.max(0, duration - expectedDuration);
                totalDelay += delay;
                count++;
            }
        });
        
        processDelays[process.id] = count > 0 ? totalDelay / count : 0;
    });
    
    return processDelays;
}

// Generate combined recommendations
function generateCombinedRecommendations(avgRiskScore, bottleneckAnalysis, projectRiskDistribution) {
    const recommendations = [];
    
    if (avgRiskScore > 70) {
        recommendations.push({
            priority: 'HIGH',
            action: 'Overall risk is high. Review all critical orders and allocate resources accordingly.'
        });
    }
    
    // Find the process with highest delay
    let maxDelay = 0;
    let bottleneckProcess = '';
    
    for (const [process, delay] of Object.entries(bottleneckAnalysis)) {
        if (delay > maxDelay) {
            maxDelay = delay;
            bottleneckProcess = process;
        }
    }
    
    if (maxDelay > 4) {
        const processName = productionProcesses.find(p => p.id === bottleneckProcess)?.name || bottleneckProcess;
        recommendations.push({
            priority: 'HIGH',
            action: `Significant bottleneck detected at ${processName}. Average delay: ${maxDelay.toFixed(1)} hours.`
        });
    } else if (maxDelay > 2) {
        const processName = productionProcesses.find(p => p.id === bottleneckProcess)?.name || bottleneckProcess;
        recommendations.push({
            priority: 'MEDIUM',
            action: `Moderate bottleneck at ${processName}. Consider process optimization.`
        });
    }
    
    // Check for high-risk projects
    if (projectRiskDistribution.critical > 0 || projectRiskDistribution.high > 0) {
        recommendations.push({
            priority: 'HIGH',
            action: `${projectRiskDistribution.critical + projectRiskDistribution.high} projects are at high risk. Prioritize these projects.`
        });
    }
    
    // Check for resource allocation issues
    const assemblyEfficiency = bottleneckAnalysis['assembly'] || 0;
    if (assemblyEfficiency > 3) {
        recommendations.push({
            priority: 'MEDIUM',
            action: 'Assembly process consistently delayed. Review workflow and staffing.'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            priority: 'LOW',
            action: 'Production is running smoothly. Continue current operations.'
        });
    }
    
    return recommendations;
}

// Chart rendering functions
function renderProgressChart(order) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    if (progressChart) progressChart.destroy();

    const actualProgress = generateProgressTimeline(order);

    const plannedProgress = [25, 50, 75, 100];

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', 'W1', 'W2', 'W3', 'W4'],
            datasets: [
                {
                    label: 'Actual Progress',
                    data: actualProgress,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.35,
                    fill: true
                },
                {
                    label: 'Planned Progress',
                    data: plannedProgress,
                    borderColor: '#4cc9f0',
                    borderDash: [5,5],
                    fill: false,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    ticks: {
                        callback: v => v + '%'
                    }
                }
            }
        }
    });
}

function renderProcessEfficiencyChart(efficiencyData) {
    const ctx = document.getElementById('processEfficiencyChart').getContext('2d');
    
    if (processEfficiencyChart) {
        processEfficiencyChart.destroy();
    }
    
    // Use the actual process names from productionProcesses
    const processNames = productionProcesses.map(p => p.name);
    const efficiencyValues = productionProcesses.map(p => efficiencyData[p.id] || 0);
    
    processEfficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processNames,
            datasets: [{
                label: 'Efficiency (%)',
                data: efficiencyValues,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: '#4361ee',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderRiskTimelineChart(order) {
    const actual = generateRiskTimeline(order);
    const predicted = createPredictedRisk(actual);
    const trend = polynomialTrend(actual);

    if (riskTimelineChart) riskTimelineChart.destroy();

    const ctx = document.getElementById("riskTimelineChart").getContext("2d");

    riskTimelineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Start", "W1", "W2", "W3", "W4", "Current"],
            datasets: [
                {
                    label: "Actual Risk",
                    data: actual,
                    borderColor: "#e91e63",
                    backgroundColor: "rgba(233, 30, 99, 0.2)",
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Predicted Risk",
                    data: predicted,
                    borderColor: "#2196f3",
                    borderDash: [6,4],
                    fill: false,
                    tension: 0.3
                },
                {
                    label: "Trendline",
                    data: trend,
                    borderColor: "#4caf50",
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0
                }
            ]
        }
    });
}

function renderResourceAllocationChart(order) {
    const ctx = document.getElementById('resourceAllocationChart').getContext('2d');
    
    if (resourceAllocationChart) {
        resourceAllocationChart.destroy();
    }
    
    // Calculate resource allocation based on time spent in each process
    const allocationData = {};
    let totalTime = 0;
    
    order.tracking.forEach(process => {
        if (process.start_time && process.end_time) {
            const start = new Date(process.start_time);
            const end = new Date(process.end_time);
            const duration = (end - start) / (1000 * 60 * 60); // hours
            allocationData[process.process] = duration;
            totalTime += duration;
        }
    });
    
    // Convert to percentages
    const allocationPercentages = {};
    for (const [process, time] of Object.entries(allocationData)) {
        allocationPercentages[process] = (time / totalTime) * 100;
    }
    
    const processNames = [];
    const percentages = [];
    
    productionProcesses.forEach(process => {
        if (allocationPercentages[process.id]) {
            processNames.push(process.name);
            percentages.push(allocationPercentages[process.id]);
        }
    });
    
    resourceAllocationChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: processNames,
            datasets: [{
                data: percentages,
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(76, 201, 240, 0.7)',
                    'rgba(248, 150, 30, 0.7)',
                    'rgba(72, 149, 239, 0.7)',
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(241, 196, 15, 0.7)',
                    'rgba(46, 204, 113, 0.7)'
                ],
                borderColor: [
                    '#4361ee',
                    '#4cc9f0',
                    '#f8961e',
                    '#4895ef',
                    '#27ae60',
                    '#e74c3c',
                    '#9b59b6',
                    '#3498db',
                    '#f1c40f',
                    '#2ecc71'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderProcessFlowChart(order) {
    const ctx = document.getElementById('processFlowChart').getContext('2d');
    
    if (processFlowChart) {
        processFlowChart.destroy();
    }
    
    // Filter processes based on order requirements
    const applicableProcesses = productionProcesses.filter(process => {
        if (process.optional) {
            if (process.id === 'accessories') return order.requires_accessories;
            if (process.id === 'welding') return order.requires_welding;
        }
        return true;
    });
    
    const processLabels = applicableProcesses.map(p => p.name);
    const completionData = applicableProcesses.map(p => {
        const tracking = order.tracking.find(t => t.process === p.id) || { status: 'pending', quantity_completed: 0 };
        return (tracking.quantity_completed / order.quantity) * 100;
    });
    
    processFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processLabels,
            datasets: [{
                label: 'Completion Rate (%)',
                data: completionData,
                backgroundColor: completionData.map(value => {
                    if (value === 100) return 'rgba(76, 201, 240, 0.7)';
                    if (value > 50) return 'rgba(248, 150, 30, 0.7)';
                    return 'rgba(247, 37, 133, 0.7)';
                }),
                borderColor: completionData.map(value => {
                    if (value === 100) return '#4cc9f0';
                    if (value > 50) return '#f8961e';
                    return '#f72585';
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderCombinedEfficiencyChart(efficiencyData) {
    const ctx = document.getElementById('combinedEfficiencyChart').getContext('2d');
    
    if (combinedEfficiencyChart) {
        combinedEfficiencyChart.destroy();
    }
    
    const processNames = productionProcesses.map(p => p.name);
    const efficiencyValues = productionProcesses.map(p => efficiencyData[p.id] || 0);
    
    combinedEfficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processNames,
            datasets: [{
                label: 'Average Efficiency (%)',
                data: efficiencyValues,
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: '#4361ee',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderBottleneckChart(bottleneckData) {
    const ctx = document.getElementById('bottleneckChart').getContext('2d');
    
    if (bottleneckChart) {
        bottleneckChart.destroy();
    }
    
    const processNames = productionProcesses.map(p => p.name);
    const delayValues = productionProcesses.map(p => bottleneckData[p.id] || 0);
    
    bottleneckChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processNames,
            datasets: [{
                label: 'Average Delay (hours)',
                data: delayValues,
                backgroundColor: delayValues.map(value => {
                    if (value > 4) return 'rgba(231, 76, 60, 0.7)';
                    if (value > 2) return 'rgba(243, 156, 18, 0.7)';
                    return 'rgba(39, 174, 96, 0.7)';
                }),
                borderColor: delayValues.map(value => {
                    if (value > 4) return '#e74c3c';
                    if (value > 2) return '#f39c12';
                    return '#27ae60';
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function renderProjectTimelineChart(project, timelineProgress, completionRate) {
    const ctx = document.getElementById('projectTimelineChart').getContext('2d');
    
    if (projectTimelineChart) {
        projectTimelineChart.destroy();
    }
    
    // Generate weekly data points
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(totalDays / 7);
    
    const labels = [];
    const timelineData = [];
    const completionData = [];
    
    for (let i = 0; i <= weeks; i++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(startDate.getDate() + (i * 7));
        labels.push(`Week ${i + 1}`);
        
        // Timeline progress (linear)
        timelineData.push(Math.min(100, (i / weeks) * 100));
        
        // Completion progress (estimated based on current rate)
        if (i <= Math.floor((timelineProgress / 100) * weeks)) {
            completionData.push(Math.min(100, (completionRate / timelineProgress) * (i / weeks) * 100));
        } else {
            completionData.push(completionRate);
        }
    }
    
    projectTimelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Timeline Progress',
                data: timelineData,
                borderColor: '#4cc9f0',
                backgroundColor: 'rgba(76, 201, 240, 0.1)',
                tension: 0.3,
                fill: false
            }, {
                label: 'Completion Progress',
                data: completionData,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderProjectProcessEfficiencyChart(workstationTotals) {
    // ensure canvas exists
    const canvas = document.getElementById('projectProcessEfficiencyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Use a global stored on window to avoid redeclaration errors
    if (window.projectProcessEfficiencyChart) {
        try { window.projectProcessEfficiencyChart.destroy(); } catch (e) { /* ignore destroy errors */ }
    }

    const labels = Object.keys(workstationTotals).map(pid => {
        const proc = productionProcesses.find(p => p.id === pid);
        return proc ? proc.name : pid;
    });

    const qtyData = Object.values(workstationTotals).map(v => v.qty || 0);
    const volumeData = Object.values(workstationTotals).map(v => Number((v.volume || 0).toFixed(3)));

    window.projectProcessEfficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Quantity Completed',
                    data: qtyData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Volume (m³)',
                    data: volumeData,
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 12 } }
                },
                x: { ticks: { font: { size: 12 } } }
            },
            plugins: {
                legend: { labels: { font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label && context.dataset.label.includes('Volume')) {
                                return `${context.dataset.label}: ${context.formattedValue} m³`;
                            }
                            return `${context.dataset.label}: ${context.formattedValue}`;
                        }
                    }
                }
            }
        }
    });
}

function renderProjectRiskChart(orderRisks) {
    const ctx = document.getElementById('projectRiskChart').getContext('2d');
    
    if (projectRiskChart) {
        projectRiskChart.destroy();
    }
    
    // Count orders by risk level
    const riskCounts = {
        'CRITICAL': 0,
        'HIGH': 0,
        'MEDIUM': 0,
        'LOW': 0,
        'VERY LOW': 0
    };
    
    orderRisks.forEach(order => {
        riskCounts[order.risk_level]++;
    });
    
    projectRiskChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(riskCounts),
            datasets: [{
                data: Object.values(riskCounts),
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(149, 165, 166, 0.7)'
                ],
                borderColor: [
                    '#e74c3c',
                    '#f39c12',
                    '#3498db',
                    '#27ae60',
                    '#95a5a6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderProjectResourceChart(projectOrders) {
    const ctx = document.getElementById('projectResourceChart').getContext('2d');
    
    // Calculate resource allocation based on order quantities
    const orderData = projectOrders.map(order => {
        return {
            order_id: order.order_id,
            quantity: order.quantity,
            progress: order.progress
        };
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: orderData.map(o => o.order_id),
            datasets: [{
                label: 'Quantity',
                data: orderData.map(o => o.quantity),
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: '#4361ee',
                borderWidth: 1
            }, {
                label: 'Completed (%)',
                data: orderData.map(o => o.progress),
                backgroundColor: 'rgba(39, 174, 96, 0.7)',
                borderColor: '#27ae60',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderProjectRiskDistributionChart(riskDistribution) {
    const ctx = document.getElementById('projectRiskDistributionChart').getContext('2d');
    
    if (projectRiskDistributionChart) {
        projectRiskDistributionChart.destroy();
    }
    
    projectRiskDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low', 'Very Low'],
            datasets: [{
                data: [
                    riskDistribution.critical,
                    riskDistribution.high,
                    riskDistribution.medium,
                    riskDistribution.low,
                    riskDistribution.very_low
                ],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(39, 174, 96, 0.7)',
                    'rgba(149, 165, 166, 0.7)'
                ],
                borderColor: [
                    '#e74c3c',
                    '#f39c12',
                    '#3498db',
                    '#27ae60',
                    '#95a5a6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderOrderProjectTimelineChart() {
    const ctx = document.getElementById('orderProjectTimelineChart').getContext('2d');
    
    if (orderProjectTimelineChart) {
        orderProjectTimelineChart.destroy();
    }
    
    // Use window.orders and window.projects
    const orderList = window.orders || [];
    const projectList = window.projects || [];
    
    // Group orders by project
    const projectData = {};
    
    projectList.forEach(project => {
        const projectOrders = orderList.filter(o => o.project_id === project.project_id);
        if (projectOrders.length > 0) {
            projectData[project.project_name] = {
                totalOrders: projectOrders.length,
                avgProgress: projectOrders.reduce((sum, order) => sum + order.progress, 0) / projectOrders.length,
                avgRisk: projectOrders.reduce((sum, order) => sum + order.risk_score, 0) / projectOrders.length
            };
        }
    });
    
    // Add orders without projects
    const noProjectOrders = orderList.filter(o => !o.project_id);
    if (noProjectOrders.length > 0) {
        projectData['No Project'] = {
            totalOrders: noProjectOrders.length,
            avgProgress: noProjectOrders.reduce((sum, order) => sum + order.progress, 0) / noProjectOrders.length,
            avgRisk: noProjectOrders.reduce((sum, order) => sum + order.risk_score, 0) / noProjectOrders.length
        };
    }
    
    orderProjectTimelineChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(projectData),
            datasets: [{
                label: 'Average Progress (%)',
                data: Object.values(projectData).map(p => p.avgProgress),
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: '#4361ee',
                borderWidth: 1
            }, {
                label: 'Average Risk Score',
                data: Object.values(projectData).map(p => p.avgRisk),
                backgroundColor: 'rgba(231, 76, 60, 0.7)',
                borderColor: '#e74c3c',
                borderWidth: 1
            }, {
                label: 'Number of Orders',
                data: Object.values(projectData).map(p => p.totalOrders),
                backgroundColor: 'rgba(39, 174, 96, 0.7)',
                borderColor: '#27ae60',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateProgressTimeline(order) {
    const start = getEarliestDate(order);

    const timelineDates = [
        start,
        addDays(start, 7),
        addDays(start, 14),
        addDays(start, 21),
        addDays(start, 28)
    ];

    return timelineDates.map(d => {
        // Calculate progress by checking how many processes finished before this date
        const completed = order.tracking.filter(t => t.end_time && new Date(t.end_time) <= d);
        const percent = (completed.length / order.tracking.length) * 100;
        return Math.round(percent);
    });
}

// View Order Risk Details
function viewOrderRisk(orderId) {
    // Use window.orders
    const order = (window.orders || []).find(o => o.order_id === orderId);
    if (!order) return;
    
    const riskAssessment = calculateRiskAssessment(order);
    
    document.getElementById('dss-order-select').value = orderId;
    // Programmatically switch tab
    showTab('dss', document.querySelector('.nav-link[onclick*="showTab(\'dss\'"]'));
    analyzeOrder();
}

// Analyze Order Direct
function analyzeOrderDirect(orderId) {
    document.getElementById('dss-order-select').value = orderId;
    // Programmatically switch tab
    showTab('dss', document.querySelector('.nav-link[onclick*="showTab(\'dss\'"]'));
    showDssTab('single');
    analyzeOrder();
}

// Order Management
function openOrderModal(orderId = null) {
    const modal = document.getElementById('orderModal');
    const title = document.getElementById('modal-title');
    const submitButton = document.getElementById('submit-button');
    const form = document.getElementById('order-form');
    
    if (orderId) {
        // Edit mode
        title.textContent = 'Edit Order';
        submitButton.textContent = 'Update Order';
        submitButton.innerHTML = '<i class="fas fa-save"></i> Update Order';
        
        // Load order data
        // Use window.orders
        const order = (window.orders || []).find(o => o.order_id === orderId);
        if (order) {
            document.getElementById('order-id').value = order.order_id;
            document.querySelector('input[name="customer_name"]').value = order.customer_name;
            document.querySelector('input[name="product_description"]').value = order.product_description;
            document.querySelector('input[name="quantity"]').value = order.quantity;
            document.querySelector('input[name="order_date"]').value = order.order_date;
            document.querySelector('input[name="target_date"]').value = order.target_date;
            document.querySelector('select[name="project_id"]').value = order.project_id || '';
            document.querySelector('input[name="pic_name"]').value = order.pic_name;
            document.querySelector('select[name="priority"]').value = order.priority || 'medium';
            document.querySelector('textarea[name="notes"]').value = order.notes || '';
            document.querySelector('input[name="package_length"]').value = order.package_length || 0;
            document.querySelector('input[name="package_width"]').value  = order.package_width  || 0;
            document.querySelector('input[name="package_height"]').value = order.package_height || 0;
            document.getElementById('requires-accessories').checked = order.requires_accessories || false;
            document.getElementById('requires-welding').checked = order.requires_welding || false;
        }
    } else {
        // Create mode
        title.textContent = 'Create New Order';
        submitButton.textContent = 'Create Order';
        submitButton.innerHTML = '<i class="fas fa-plus"></i> Create Order';
        form.reset();
        document.getElementById('order-id').value = '';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 14);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        document.querySelector('input[name="order_date"]').value = today;
        document.querySelector('input[name="target_date"]').value = targetDateStr;
    }
    
    // Update project select options
    updateProjectSelects();
    
    modal.classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Handle form submission for create and update
document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const orderId = document.getElementById('order-id').value;

    data.package_length = parseFloat(data.package_length) || 0;
    data.package_width  = parseFloat(data.package_width)  || 0;
    data.package_height = parseFloat(data.package_height) || 0;

    // Add the extra boolean data and types
    data.requires_accessories = document.getElementById('requires-accessories').checked;
    data.requires_welding = document.getElementById('requires-welding').checked;
    data.quantity = parseInt(data.quantity);
    data.order_id = orderId || null; // Pass null if new, API will handle it

    // Populate tracking for new orders
    if (!orderId) {
        data.tracking = productionProcesses.map(process => ({
            process: process.id,
            status: 'pending',
            quantity_completed: 0,
            defect_quantity: 0,
            start_time: null, end_time: null, pic_name: '', issues: '', last_updated: null
        }));
    }

    // Disable submit button
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        // Call the saveOrder function from vercel.js
        if (typeof saveOrder !== 'function') {
            throw new Error('saveOrder function is not defined. Check vercel.js');
        }

        // We need to pass the *full* order object, not just form data
        let payload = data;
        if(orderId) {
            // We are editing, merge with existing data
            // Use window.orders
            const existingOrder = (window.orders || []).find(o => o.order_id === orderId);
            payload = { ...existingOrder, ...data };
        }

        await saveOrder(payload); // This function (from vercel.js) needs to handle reloading

        closeOrderModal();

    } catch (error) {
        console.error('Error in form submission:', error);
        showAlert(`Error saving order: ${error.message}`, 'error');
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        const buttonText = orderId ? '<i class="fas fa-save"></i> Update Order' : '<i class="fas fa-plus"></i> Create Order';
        submitButton.innerHTML = buttonText;
    }
});

// Edit Order
async function editOrder(orderId) {
    openOrderModal(orderId);
}
// Delete Order
async function deleteOrder(orderId) {
    if (confirm(`Are you sure you want to delete order ${orderId}? This is permanent.`)) {
        try {
            // Call the deleteOrderAPI function (which we need to add to vercel.js)
            if (typeof deleteOrderAPI !== 'function') {
                // Quick fix: add deleteOrderAPI to vercel.js if it's missing
                // For now, let's just show an error.
                // THIS IS THE FIX FROM THE PREVIOUS MESSAGE. 
                // Make sure vercel.js has the deleteOrderAPI function
                throw new Error('deleteOrderAPI function is not defined. Check vercel.js');
            }

            await deleteOrderAPI(orderId); // This function will handle reloading

            // The reload logic is in deleteOrderAPI, no need to do it here.

        } catch (error) {
            console.error('Error deleting order:', error);
            showAlert(`Error deleting order: ${error.message}`, 'error');
        }
    }
}

// Tracking Form
document.getElementById('tracking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderId = document.getElementById('track-order-select').value;
    const processId = document.getElementById('track-process-select').value;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        // Use window.orders
        const order = (window.orders || []).find(o => o.order_id === orderId);
        if (order) {
            const trackingIndex = order.tracking.findIndex(t => t.process === processId);
            if (trackingIndex !== -1) {
                const quantityCompleted = parseInt(data.quantity_completed) || 0;
                const now = new Date().toISOString();
                
                // Update tracking data
                order.tracking[trackingIndex] = {
                    ...order.tracking[trackingIndex],
                    quantity_completed: quantityCompleted,
                    defect_quantity: parseInt(data.defect_quantity) || 0,
                    start_time: data.start_time || order.tracking[trackingIndex].start_time || now,
                    end_time: data.end_time || order.tracking[trackingIndex].end_time,
                    pic_name: data.pic_name,
                    issues: data.issues,
                    last_updated: now
                };

                // Update process status based on quantity completed
                if (quantityCompleted === 0) {
                    order.tracking[trackingIndex].status = 'pending';
                } else if (quantityCompleted === order.quantity) {
                    order.tracking[trackingIndex].status = 'completed';
                    // Set end time if not already set
                    if (!order.tracking[trackingIndex].end_time) {
                        order.tracking[trackingIndex].end_time = now;
                    }
                } else {
                    order.tracking[trackingIndex].status = 'in_progress';
                }

                // Update order status and progress
                updateOrderStatus(order);
                
                // ** CRITICAL: Save the updated order back to the database **
                // We need to save the *entire order* object
                if (typeof saveOrder !== 'function') {
                    throw new Error('saveOrder function is not defined. Check vercel.js');
                }
                await saveOrder(order); // This will save and reload the app

                showAlert('Tracking updated successfully', 'success');
                e.target.reset();
                loadOrderTracking(); // This will run again after saveOrder reloads, which is fine
                
                // Refresh DSS analysis if we're on that tab
                if (document.getElementById('dss').classList.contains('active')) {
                    if (document.getElementById('dss-single').classList.contains('active')) {
                        analyzeOrder();
                    } else if (document.getElementById('dss-project').classList.contains('active')) {
                        analyzeProject();
                    } else {
                        analyzeAllOrders();
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error updating tracking', 'error');
    }
});

// Alert
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
    alert.innerHTML = `<i class="fas fa-${icon}"></i> ${message}`;
    
    document.getElementById('alert-container').appendChild(alert);

    setTimeout(() => alert.remove(), 4000);
}