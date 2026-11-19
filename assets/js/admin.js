/**
 * EYESOFT - Experience The Live
 * Admin Dashboard Engine (Vanilla JS SPA)
 * Interacts with FastAPI SQLite Backend APIs
 */

const API_BASE = '/api';
let currentTab = 'dashboard';
let authToken = localStorage.getItem('eyesoft_admin_token');
let adminUser = null;

// ==============================================================================
// Initialization & Authentication
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    verifySession();
  } else {
    showLoginView();
  }
});

async function apiFetch(endpoint, options = {}) {
  const headers = options.headers || {};
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      logout();
      showToast('Session expired. Please log in again.', 'error');
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'An error occurred');
    }

    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

async function verifySession() {
  try {
    adminUser = await apiFetch('/auth/me');
    showDashboardView();
  } catch (e) {
    logout();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || 'Invalid username or password');
    }

    const data = await res.json();
    authToken = data.access_token;
    localStorage.setItem('eyesoft_admin_token', authToken);
    adminUser = data.user;
    showToast('Signed in successfully', 'success');
    showDashboardView();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
}

function logout() {
  authToken = null;
  adminUser = null;
  localStorage.removeItem('eyesoft_admin_token');
  showLoginView();
  showToast('Logged out successfully', 'success');
}

// ==============================================================================
// View Renderers
// ==============================================================================

function showLoginView() {
  const root = document.getElementById('adminApp');
  root.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <img src="/assets/logo/eyesoft_new_logo.png" alt="EYESOFT Logo" class="login-logo">
        <h1 class="login-title">Admin Management Portal</h1>
        <p class="login-subtitle">EXPERIENCE THE LIVE &bull; Authorized Personnel Only</p>
        
        <div id="loginError" style="display:none; color:#EF4444; background:#FEE2E2; padding:0.75rem; border-radius:6px; font-size:0.875rem; margin-bottom:1.25rem;"></div>

        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="loginUsername">Username</label>
            <input type="text" id="loginUsername" class="form-control" placeholder="admin" required autofocus>
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">Password</label>
            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn-admin-primary">
            <span>Secure Admin Sign In</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div style="margin-top: 1.5rem; font-size: 0.75rem; color: #94A3B8;">
          Default credentials initialized in .env configuration
        </div>
      </div>
    </div>
  `;
}

function showDashboardView() {
  const root = document.getElementById('adminApp');
  root.innerHTML = `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <img src="/assets/logo/eyesoft_new_logo.png" alt="EYESOFT" class="sidebar-logo">
          <span class="sidebar-badge">Admin</span>
        </div>

        <div class="sidebar-nav">
          <div class="nav-section-title">Core Management</div>
          <div class="sidebar-item active" onclick="switchTab('dashboard')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Dashboard</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('products')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>Products</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('categories')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>Categories</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('clients')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Clients</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('news')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            <span>News</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('reviews')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Customer Reviews</span>
            <span id="sidebarPendingBadge" class="sidebar-item-badge" style="display:none;">0</span>
          </div>

          <div class="nav-section-title">Configuration</div>
          <div class="sidebar-item" onclick="switchTab('contact')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Contact Details</span>
          </div>
          <div class="sidebar-item" onclick="switchTab('settings')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </div>
          <div class="sidebar-item" onclick="logout()" style="color:#F87171;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Logout</span>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="admin-user-info">
            <div class="admin-avatar">${(adminUser?.username || 'A')[0].toUpperCase()}</div>
            <div class="admin-meta">
              <div class="admin-name">${adminUser?.full_name || 'Admin'}</div>
              <div class="admin-role">Full Access</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Body -->
      <main class="admin-main">
        <header class="admin-topbar">
          <h2 class="topbar-title" id="pageTitle">Dashboard Overview</h2>
          <div class="topbar-actions">
            <a href="/" target="_blank" class="public-site-link">
              <span>View Live Website</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </header>

        <div class="content-body" id="tabContent">
          <!-- Dynamic Content Loaded Here -->
        </div>
      </main>
    </div>

    <!-- Generic Modal Container -->
    <div class="modal-backdrop" id="adminModal" onclick="closeModalOnBackdrop(event)">
      <div class="modal-dialog" id="modalDialog">
        <!-- Injected dynamically -->
      </div>
    </div>

    <div class="toast-container" id="toastContainer"></div>
  `;

  loadTab(currentTab);
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.remove('active');
  });
  event?.currentTarget?.classList?.add('active');
  loadTab(tab);
}

async function loadTab(tab) {
  const container = document.getElementById('tabContent');
  const title = document.getElementById('pageTitle');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:3rem; color:#64748B;">Loading data...</div>`;

  try {
    switch (tab) {
      case 'dashboard':
        title.textContent = 'Dashboard Overview';
        await renderDashboardTab(container);
        break;
      case 'products':
        title.textContent = 'Products Management';
        await renderProductsTab(container);
        break;
      case 'categories':
        title.textContent = 'Categories Overview';
        await renderCategoriesTab(container);
        break;
      case 'clients':
        title.textContent = 'Our Clients (Official Brochure Roster)';
        await renderClientsTab(container);
        break;
      case 'news':
        title.textContent = 'News & Updates Management';
        await renderNewsTab(container);
        break;
      case 'reviews':
        title.textContent = 'Customer Reviews Management';
        await renderReviewsTab(container);
        break;
      case 'contact':
        title.textContent = 'Contact & Business Information';
        await renderContactTab(container);
        break;
      case 'settings':
        title.textContent = 'Admin Settings & Security';
        renderSettingsTab(container);
        break;
    }
  } catch (err) {
    container.innerHTML = `<div style="color:#EF4444; padding:2rem;">Failed to load view: ${err.message}</div>`;
  }
}

// ==============================================================================
// Tab 1: Dashboard Overview
// ==============================================================================

async function renderDashboardTab(container) {
  const stats = await apiFetch('/stats');
  const reviews = await apiFetch('/admin/reviews?status=pending');

  // Update badge in sidebar
  const badge = document.getElementById('sidebarPendingBadge');
  if (badge) {
    badge.textContent = stats.pending_reviews;
    badge.style.display = stats.pending_reviews > 0 ? 'inline-block' : 'none';
  }

  container.innerHTML = `
    <!-- Top Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" onclick="switchTab('products')" style="cursor:pointer;">
        <div class="stat-icon stat-icon-blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Total Products</div>
          <div class="stat-value">${stats.total_products}</div>
        </div>
      </div>

      <div class="stat-card" onclick="switchTab('clients')" style="cursor:pointer;">
        <div class="stat-icon stat-icon-purple">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Total Clients</div>
          <div class="stat-value">${stats.total_clients}</div>
        </div>
      </div>

      <div class="stat-card" onclick="switchTab('news')" style="cursor:pointer;">
        <div class="stat-icon stat-icon-blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">News Articles</div>
          <div class="stat-value">${stats.total_news}</div>
        </div>
      </div>

      <div class="stat-card" onclick="switchTab('reviews')" style="cursor:pointer; border-color:${stats.pending_reviews > 0 ? '#F59E0B' : '#E2E8F0'};">
        <div class="stat-icon stat-icon-amber">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Pending Reviews</div>
          <div class="stat-value" style="color:#D97706;">${stats.pending_reviews}</div>
        </div>
      </div>

      <div class="stat-card" onclick="switchTab('reviews')" style="cursor:pointer;">
        <div class="stat-icon stat-icon-green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Approved Reviews</div>
          <div class="stat-value" style="color:#059669;">${stats.approved_reviews}</div>
        </div>
      </div>
    </div>

    <!-- Pending Reviews Action Center -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">Pending Customer Reviews Queue</div>
          <div style="font-size:0.8125rem; color:#64748B;">Reviews submitted by customers awaiting administrative approval before going public</div>
        </div>
        <button class="btn-admin-secondary" onclick="switchTab('reviews')">View All Reviews &rarr;</button>
      </div>

      <div class="table-responsive">
        ${reviews.length === 0 ? `
          <div style="text-align:center; padding:3rem; color:#64748B;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.5" style="margin-bottom:0.75rem;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div>All submitted customer reviews have been reviewed. No pending items!</div>
          </div>
        ` : `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.map(r => `
                <tr>
                  <td>
                    <strong>${escapeHtml(r.customer_name)}</strong>
                    ${r.company_or_designation ? `<div style="font-size:0.75rem; color:#64748B;">${escapeHtml(r.company_or_designation)}</div>` : ''}
                  </td>
                  <td>
                    <span style="color:#F59E0B; font-weight:700;">★ ${r.rating} / 5</span>
                  </td>
                  <td style="max-width:350px;">
                    <div style="font-size:0.875rem; color:#334155;">"${escapeHtml(r.review_text)}"</div>
                  </td>
                  <td style="font-size:0.8125rem; color:#64748B;">${r.created_at.split('T')[0]}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn-admin-success" onclick="approveReview(${r.id})">Approve</button>
                      <button class="btn-admin-warning" onclick="rejectReview(${r.id})">Reject</button>
                      <button class="btn-admin-danger" onclick="confirmDeleteReview(${r.id})">Delete</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

// ==============================================================================
// Tab 2: Products Management
// ==============================================================================

async function renderProductsTab(container) {
  const products = await apiFetch('/products');

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">Product & Hardware Catalogue</div>
          <div style="font-size:0.8125rem; color:#64748B;">Manage projectors, screens, podiums, and AV peripherals</div>
        </div>
        <div class="table-toolbar">
          <input type="text" id="productSearch" class="search-input" placeholder="Search products..." onkeyup="filterProductsTable()">
          <button class="btn-admin-primary" onclick="openAddProductModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table" id="productsTable">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Tagline</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr data-name="${p.name.toLowerCase()}" data-category="${p.category_name.toLowerCase()}">
                <td>
                  <img src="/${p.image}" alt="${escapeHtml(p.name)}" class="table-thumb" onerror="this.src='/assets/logo/eyesoft_new_logo.png'">
                </td>
                <td>
                  <strong>${escapeHtml(p.name)}</strong>
                  <div style="font-size:0.75rem; color:#64748B;">ID: ${p.id} &bull; Slug: ${p.slug}</div>
                </td>
                <td>
                  <span style="background:#F1F5F9; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.8125rem; font-weight:600;">${escapeHtml(p.category_name)}</span>
                </td>
                <td style="max-width:240px; font-size:0.8125rem; color:#475569;">
                  ${escapeHtml(p.tagline || '')}
                </td>
                <td>
                  ${p.is_featured ? `<span class="status-badge status-approved">Yes</span>` : `<span class="status-badge" style="background:#E2E8F0; color:#475569;">No</span>`}
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-admin-secondary" onclick="openEditProductModal('${p.id}')">Edit</button>
                    <button class="btn-admin-danger" onclick="confirmDeleteProduct('${p.id}', '${escapeHtml(p.name)}')">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterProductsTable() {
  const query = document.getElementById('productSearch').value.toLowerCase();
  const rows = document.querySelectorAll('#productsTable tbody tr');
  rows.forEach(r => {
    const text = (r.getAttribute('data-name') + ' ' + r.getAttribute('data-category'));
    r.style.display = text.includes(query) ? '' : 'none';
  });
}

async function openAddProductModal() {
  const categories = await apiFetch('/categories');
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Add New Product</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddProduct(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" id="newProdName" class="form-control" required placeholder="e.g. Ultra HD Laser Projector">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Product ID (Unique) *</label>
            <input type="text" id="newProdId" class="form-control" required placeholder="proj-laser-venue">
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="newProdCategory" class="form-control" required>
              ${categories.map(c => `<option value="${c.id}" data-name="${c.name}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Tagline</label>
          <input type="text" id="newProdTagline" class="form-control" placeholder="Short impactful product summary">
        </div>
        <div class="form-group">
          <label class="form-label">Product Image Path *</label>
          <input type="text" id="newProdImage" class="form-control" required value="assets/images/products/product_projector.jpg">
          <div style="font-size:0.75rem; color:#64748B; margin-top:0.25rem;">Must use original brochure image path preserving brand rules.</div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="newProdDesc" class="form-control" placeholder="Detailed product overview..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Key Features (One per line)</label>
          <textarea id="newProdFeatures" class="form-control" placeholder="Solid-state laser light engine&#10;WUXGA resolution&#10;Motorized lens shift"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Applications (One per line)</label>
          <textarea id="newProdApps" class="form-control" placeholder="Corporate Auditoriums&#10;Higher Education Lecture Halls"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Create Product</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddProduct(e) {
  e.preventDefault();
  const catSelect = document.getElementById('newProdCategory');
  const catOption = catSelect.options[catSelect.selectedIndex];

  const features = document.getElementById('newProdFeatures').value.split('\n').map(s => s.trim()).filter(Boolean);
  const apps = document.getElementById('newProdApps').value.split('\n').map(s => s.trim()).filter(Boolean);

  const payload = {
    id: document.getElementById('newProdId').value.trim(),
    slug: document.getElementById('newProdId').value.trim().toLowerCase(),
    name: document.getElementById('newProdName').value.trim(),
    category_id: catSelect.value,
    category_name: catOption.getAttribute('data-name'),
    tagline: document.getElementById('newProdTagline').value.trim(),
    image: document.getElementById('newProdImage').value.trim(),
    description: document.getElementById('newProdDesc').value.trim(),
    key_features: features,
    specifications: {},
    applications: apps,
    is_featured: 1,
    display_order: 1
  };

  try {
    await apiFetch('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast('Product added successfully', 'success');
    loadTab('products');
  } catch (err) {
    showToast(`Failed to add product: ${err.message}`, 'error');
  }
}

async function openEditProductModal(productId) {
  const prod = await apiFetch(`/products/${productId}`);
  const categories = await apiFetch('/categories');
  const dialog = document.getElementById('modalDialog');

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Edit Product: ${escapeHtml(prod.name)}</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditProduct(event, '${prod.id}')">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" id="editProdName" class="form-control" required value="${escapeHtml(prod.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">Tagline</label>
          <input type="text" id="editProdTagline" class="form-control" value="${escapeHtml(prod.tagline || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Image Path *</label>
          <input type="text" id="editProdImage" class="form-control" required value="${escapeHtml(prod.image)}">
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="editProdDesc" class="form-control">${escapeHtml(prod.description || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Key Features (One per line)</label>
          <textarea id="editProdFeatures" class="form-control">${(prod.key_features || []).join('\n')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Applications (One per line)</label>
          <textarea id="editProdApps" class="form-control">${(prod.applications || []).join('\n')}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditProduct(e, productId) {
  e.preventDefault();
  const features = document.getElementById('editProdFeatures').value.split('\n').map(s => s.trim()).filter(Boolean);
  const apps = document.getElementById('editProdApps').value.split('\n').map(s => s.trim()).filter(Boolean);

  const payload = {
    name: document.getElementById('editProdName').value.trim(),
    tagline: document.getElementById('editProdTagline').value.trim(),
    image: document.getElementById('editProdImage').value.trim(),
    description: document.getElementById('editProdDesc').value.trim(),
    key_features: features,
    applications: apps
  };

  try {
    await apiFetch(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast('Product updated successfully', 'success');
    loadTab('products');
  } catch (err) {
    showToast(`Update failed: ${err.message}`, 'error');
  }
}

function confirmDeleteProduct(id, name) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title" style="color:#DC2626;">Permanently Delete Product</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:1rem; font-size:0.9375rem;">Are you sure you want to permanently delete <strong>"${name}"</strong> from the database?</p>
      <div style="background:#FEE2E2; border-left:4px solid #DC2626; padding:0.75rem 1rem; border-radius:4px; font-size:0.8125rem; color:#991B1B;">
        <strong>Warning:</strong> This operation will physically execute a hard delete from the SQL database. It cannot be undone.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-admin-danger" onclick="executeDeleteProduct('${id}')">Yes, Permanently Delete</button>
    </div>
  `;
  openModal();
}

async function executeDeleteProduct(id) {
  try {
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Product permanently deleted from database', 'success');
    loadTab('products');
  } catch (err) {
    showToast(`Deletion failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Tab 3: Categories Overview
// ==============================================================================

async function renderCategoriesTab(container) {
  const categories = await apiFetch('/categories');

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">Product & Sector Categories</div>
          <div style="font-size:0.8125rem; color:#64748B;">Core taxonomy organizing the customer navigation journey</div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Category ID</th>
              <th>Name</th>
              <th>Badge</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            ${categories.map(c => `
              <tr>
                <td><code>${c.id}</code></td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td><span style="background:#F3E5F5; color:#6A1B9A; font-weight:700; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">${escapeHtml(c.badge || '')}</span></td>
                <td style="color:#64748B; font-size:0.8125rem;">${escapeHtml(c.description || '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==============================================================================
// Tab 4: Clients Management (26 Official Clients)
// ==============================================================================

async function renderClientsTab(container) {
  const clients = await apiFetch('/clients');

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">Client Roster (${clients.length} Official Clients)</div>
          <div style="font-size:0.8125rem; color:#64748B;">Verified client partnerships extracted verbatim from the official EYESOFT company brochure</div>
        </div>
        <div class="table-toolbar">
          <button class="btn-admin-primary" onclick="openAddClientModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Client</span>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Client Name</th>
              <th>Sector Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map((c, i) => `
              <tr>
                <td style="color:#94A3B8; font-weight:700;">${i + 1}</td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>
                  <span style="background:#F1F5F9; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.8125rem; color:#475569;">${escapeHtml(c.sector)}</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button class="btn-admin-secondary" onclick="openEditClientModal(${c.id}, '${escapeHtml(c.name)}', '${escapeHtml(c.sector)}')">Edit</button>
                    <button class="btn-admin-danger" onclick="confirmDeleteClient(${c.id}, '${escapeHtml(c.name)}')">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddClientModal() {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Add Client</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddClient(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Client / Institution Name *</label>
          <input type="text" id="newClientName" class="form-control" required placeholder="e.g. PSG College of Technology">
        </div>
        <div class="form-group">
          <label class="form-label">Sector</label>
          <select id="newClientSector" class="form-control">
            <option value="Educational Institutions">Educational Institutions</option>
            <option value="Corporate">Corporate</option>
            <option value="Government Organisations">Government Organisations</option>
            <option value="Healthcare">Healthcare</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Add Client</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddClient(e) {
  e.preventDefault();
  const name = document.getElementById('newClientName').value.trim();
  const sector = document.getElementById('newClientSector').value;

  try {
    await apiFetch('/admin/clients', {
      method: 'POST',
      body: JSON.stringify({ name, sector })
    });
    closeModal();
    showToast('Client added successfully', 'success');
    loadTab('clients');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function openEditClientModal(id, currentName, currentSector) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Edit Client</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditClient(event, ${id})">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Client Name *</label>
          <input type="text" id="editClientName" class="form-control" required value="${currentName}">
        </div>
        <div class="form-group">
          <label class="form-label">Sector</label>
          <select id="editClientSector" class="form-control">
            <option value="Educational Institutions" ${currentSector === 'Educational Institutions' ? 'selected' : ''}>Educational Institutions</option>
            <option value="Corporate" ${currentSector === 'Corporate' ? 'selected' : ''}>Corporate</option>
            <option value="Government Organisations" ${currentSector === 'Government Organisations' ? 'selected' : ''}>Government Organisations</option>
            <option value="Healthcare" ${currentSector === 'Healthcare' ? 'selected' : ''}>Healthcare</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditClient(e, id) {
  e.preventDefault();
  const name = document.getElementById('editClientName').value.trim();
  const sector = document.getElementById('editClientSector').value;

  try {
    await apiFetch(`/admin/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, sector })
    });
    closeModal();
    showToast('Client updated successfully', 'success');
    loadTab('clients');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteClient(id, name) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title" style="color:#DC2626;">Delete Client</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:1rem;">Are you sure you want to permanently delete <strong>"${name}"</strong> from the client directory?</p>
    </div>
    <div class="modal-footer">
      <button class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-admin-danger" onclick="executeDeleteClient(${id})">Yes, Delete</button>
    </div>
  `;
  openModal();
}

async function executeDeleteClient(id) {
  try {
    await apiFetch(`/admin/clients/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Client deleted permanently', 'success');
    loadTab('clients');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Tab 5: News Articles Management
// ==============================================================================

async function renderNewsTab(container) {
  const articles = await apiFetch('/news');

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">News & Company Updates</div>
          <div style="font-size:0.8125rem; color:#64748B;">Official company announcements, installations, and facilities updates</div>
        </div>
        <div class="table-toolbar">
          <button class="btn-admin-primary" onclick="openAddNewsModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Create Article</span>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Article Title</th>
              <th>Date</th>
              <th>Author</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${articles.map(a => `
              <tr>
                <td>
                  <img src="/${a.featured_image}" class="table-thumb" alt="${escapeHtml(a.title)}" onerror="this.src='/assets/logo/eyesoft_new_logo.png'">
                </td>
                <td>
                  <strong>${escapeHtml(a.title)}</strong>
                  <div style="font-size:0.75rem; color:#64748B;">Slug: ${a.slug}</div>
                </td>
                <td style="font-size:0.8125rem; color:#64748B;">${a.published_date}</td>
                <td style="font-size:0.8125rem;">${escapeHtml(a.author)}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn-admin-secondary" onclick="openEditNewsModal(${a.id})">Edit</button>
                    <button class="btn-admin-danger" onclick="confirmDeleteNews(${a.id}, '${escapeHtml(a.title)}')">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddNewsModal() {
  const dialog = document.getElementById('modalDialog');
  const today = new Date().toISOString().split('T')[0];

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Publish News Article</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddNews(event)">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Article Title *</label>
          <input type="text" id="newNewsTitle" class="form-control" required placeholder="e.g. EYESOFT Deploys 4K Video Wall System">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Publication Date *</label>
            <input type="date" id="newNewsDate" class="form-control" required value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">Featured Image Path *</label>
            <input type="text" id="newNewsImage" class="form-control" required value="assets/images/solutions/video_wall.jpg">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary / Teaser *</label>
          <textarea id="newNewsSummary" class="form-control" style="min-height:70px;" required placeholder="Brief 1-2 sentence overview of the news article"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Full Article Content *</label>
          <textarea id="newNewsContent" class="form-control" style="min-height:160px;" required placeholder="Complete article body text..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Publish Article</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddNews(e) {
  e.preventDefault();
  const title = document.getElementById('newNewsTitle').value.trim();
  const published_date = document.getElementById('newNewsDate').value;
  const featured_image = document.getElementById('newNewsImage').value.trim();
  const summary = document.getElementById('newNewsSummary').value.trim();
  const content = document.getElementById('newNewsContent').value.trim();

  try {
    await apiFetch('/admin/news', {
      method: 'POST',
      body: JSON.stringify({ title, published_date, featured_image, summary, content })
    });
    closeModal();
    showToast('News article published successfully', 'success');
    loadTab('news');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

async function openEditNewsModal(id) {
  const article = await apiFetch(`/news/${id}`);
  const dialog = document.getElementById('modalDialog');

  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Edit News Article</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditNews(event, ${id})">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Article Title *</label>
          <input type="text" id="editNewsTitle" class="form-control" required value="${escapeHtml(article.title)}">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Publication Date *</label>
            <input type="date" id="editNewsDate" class="form-control" required value="${article.published_date}">
          </div>
          <div class="form-group">
            <label class="form-label">Featured Image Path *</label>
            <input type="text" id="editNewsImage" class="form-control" required value="${escapeHtml(article.featured_image)}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary / Teaser *</label>
          <textarea id="editNewsSummary" class="form-control" style="min-height:70px;" required>${escapeHtml(article.summary)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Full Article Content *</label>
          <textarea id="editNewsContent" class="form-control" style="min-height:160px;" required>${escapeHtml(article.content)}</textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-admin-primary" style="width:auto;">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditNews(e, id) {
  e.preventDefault();
  const title = document.getElementById('editNewsTitle').value.trim();
  const published_date = document.getElementById('editNewsDate').value;
  const featured_image = document.getElementById('editNewsImage').value.trim();
  const summary = document.getElementById('editNewsSummary').value.trim();
  const content = document.getElementById('editNewsContent').value.trim();

  try {
    await apiFetch(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, published_date, featured_image, summary, content })
    });
    closeModal();
    showToast('News article updated', 'success');
    loadTab('news');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteNews(id, title) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title" style="color:#DC2626;">Delete News Article</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:1rem;">Are you sure you want to permanently delete <strong>"${title}"</strong>?</p>
    </div>
    <div class="modal-footer">
      <button class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-admin-danger" onclick="executeDeleteNews(${id})">Yes, Delete</button>
    </div>
  `;
  openModal();
}

async function executeDeleteNews(id) {
  try {
    await apiFetch(`/admin/news/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('News article deleted permanently', 'success');
    loadTab('news');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Tab 6: Customer Reviews Management
// ==============================================================================

async function renderReviewsTab(container) {
  const reviews = await apiFetch('/admin/reviews');

  container.innerHTML = `
    <div class="table-card">
      <div class="table-header">
        <div>
          <div class="table-title">Customer Reviews & Testimonials</div>
          <div style="font-size:0.8125rem; color:#64748B;">Manage public review submissions: approve, reject, or permanently delete</div>
        </div>
        <div class="table-toolbar">
          <select id="reviewStatusFilter" class="form-control" style="width:160px; padding:0.4rem 0.75rem;" onchange="filterReviewsTable()">
            <option value="all">All Reviews</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div class="table-responsive">
        <table class="admin-table" id="reviewsTable">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review Text</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reviews.map(r => `
              <tr data-status="${r.status}">
                <td>
                  <strong>${escapeHtml(r.customer_name)}</strong>
                  ${r.company_or_designation ? `<div style="font-size:0.75rem; color:#64748B;">${escapeHtml(r.company_or_designation)}</div>` : ''}
                </td>
                <td>
                  <span style="color:#F59E0B; font-weight:700;">★ ${r.rating} / 5</span>
                </td>
                <td style="max-width:320px;">
                  <div style="font-size:0.875rem; color:#334155;">"${escapeHtml(r.review_text)}"</div>
                </td>
                <td>
                  <span class="status-badge status-${r.status}">${r.status}</span>
                </td>
                <td style="font-size:0.8125rem; color:#64748B;">${r.created_at.split('T')[0]}</td>
                <td>
                  <div class="action-btns">
                    ${r.status !== 'approved' ? `<button class="btn-admin-success" onclick="approveReview(${r.id})">Approve</button>` : ''}
                    ${r.status !== 'rejected' ? `<button class="btn-admin-warning" onclick="rejectReview(${r.id})">Reject</button>` : ''}
                    <button class="btn-admin-danger" onclick="confirmDeleteReview(${r.id})">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function filterReviewsTable() {
  const filter = document.getElementById('reviewStatusFilter').value;
  const rows = document.querySelectorAll('#reviewsTable tbody tr');
  rows.forEach(r => {
    const status = r.getAttribute('data-status');
    r.style.display = (filter === 'all' || status === filter) ? '' : 'none';
  });
}

async function approveReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
    showToast('Review approved and published publicly', 'success');
    loadTab(currentTab);
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

async function rejectReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    });
    showToast('Review rejected (hidden from public site)', 'success');
    loadTab(currentTab);
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteReview(id) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title" style="color:#DC2626;">Permanently Delete Review</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body">
      <p style="margin-bottom:1rem;">Are you sure you want to permanently delete this customer review?</p>
      <div style="background:#FEE2E2; border-left:4px solid #DC2626; padding:0.75rem 1rem; border-radius:4px; font-size:0.8125rem; color:#991B1B;">
        This action will permanently delete the review from the SQL database.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-admin-danger" onclick="executeDeleteReview(${id})">Yes, Delete Permanently</button>
    </div>
  `;
  openModal();
}

async function executeDeleteReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Review permanently deleted from database', 'success');
    loadTab(currentTab);
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Tab 7: Contact Details Management
// ==============================================================================

async function renderContactTab(container) {
  const contact = await apiFetch('/contact');

  container.innerHTML = `
    <div class="table-card" style="max-width:750px;">
      <div class="table-header">
        <div>
          <div class="table-title">Official EYESOFT Contact Information</div>
          <div style="font-size:0.8125rem; color:#64748B;">Synchronized across all website pages and inquiry links</div>
        </div>
      </div>

      <form onsubmit="submitUpdateContact(event)" style="padding:1.5rem;">
        <div class="form-group">
          <label class="form-label">Headquarters Address *</label>
          <textarea id="contactAddress" class="form-control" style="min-height:80px;" required>${escapeHtml(contact.address || '')}</textarea>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
          <div class="form-group">
            <label class="form-label">Phone Number *</label>
            <input type="text" id="contactPhone" class="form-control" required value="${escapeHtml(contact.phone || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp Contact Number *</label>
            <input type="text" id="contactWhatsapp" class="form-control" required value="${escapeHtml(contact.whatsapp || '+919942436956')}">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
          <div class="form-group">
            <label class="form-label">Official Email *</label>
            <input type="email" id="contactEmail" class="form-control" required value="${escapeHtml(contact.email || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Official Website *</label>
            <input type="text" id="contactWebsite" class="form-control" required value="${escapeHtml(contact.website || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Google Maps Embed URL</label>
          <input type="text" id="contactMap" class="form-control" value="${escapeHtml(contact.map_embed_url || '')}">
        </div>

        <button type="submit" class="btn-admin-primary" style="width:auto; margin-top:0.5rem;">
          <span>Update Contact Details</span>
        </button>
      </form>
    </div>
  `;
}

async function submitUpdateContact(e) {
  e.preventDefault();
  const payload = {
    address: document.getElementById('contactAddress').value.trim(),
    phone: document.getElementById('contactPhone').value.trim(),
    whatsapp: document.getElementById('contactWhatsapp').value.trim(),
    email: document.getElementById('contactEmail').value.trim(),
    website: document.getElementById('contactWebsite').value.trim(),
    map_embed_url: document.getElementById('contactMap').value.trim()
  };

  try {
    await apiFetch('/admin/contact', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    showToast('Contact details successfully updated in database', 'success');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Tab 8: Settings & Security
// ==============================================================================

function renderSettingsTab(container) {
  container.innerHTML = `
    <div class="table-card" style="max-width:600px;">
      <div class="table-header">
        <div>
          <div class="table-title">Administrator Security & Password</div>
          <div style="font-size:0.8125rem; color:#64748B;">Update administrator password securely with bcrypt hashing</div>
        </div>
      </div>

      <form onsubmit="submitChangePassword(event)" style="padding:1.5rem;">
        <div class="form-group">
          <label class="form-label">Current Password *</label>
          <input type="password" id="currentPass" class="form-control" required placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">New Password * (Min 6 characters)</label>
          <input type="password" id="newPass" class="form-control" required minlength="6" placeholder="••••••••">
        </div>
        <div class="form-group">
          <label class="form-label">Confirm New Password *</label>
          <input type="password" id="confirmPass" class="form-control" required minlength="6" placeholder="••••••••">
        </div>

        <button type="submit" class="btn-admin-primary" style="width:auto; margin-top:0.5rem;">
          <span>Update Admin Password</span>
        </button>
      </form>
    </div>
  `;
}

async function submitChangePassword(e) {
  e.preventDefault();
  const current_password = document.getElementById('currentPass').value;
  const new_password = document.getElementById('newPass').value;
  const confirm_password = document.getElementById('confirmPass').value;

  if (new_password !== confirm_password) {
    showToast('New passwords do not match!', 'error');
    return;
  }

  try {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    });
    showToast('Password updated successfully. Please log in with your new password.', 'success');
    logout();
  } catch (err) {
    showToast(`Password change failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// Modal & Toast Helpers
// ==============================================================================

function openModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.add('show');
}

function closeModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('show');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'adminModal') {
    closeModal();
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
