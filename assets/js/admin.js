/**
 * EYESOFT - Experience The Live
 * Premium AV Admin Portal & Customer Reviews Management Engine
 * Visual Inspiration: Executive Modern Dashboard
 */

const API_BASE = '/api';

// Global App State
const state = {
  currentTab: 'dashboard',
  authToken: localStorage.getItem('eyesoft_admin_token'),
  adminUser: null,
  stats: null,
  reviews: [],
  reviewFilter: 'all', // 'all' | 'pending' | 'approved' | 'rejected'
  searchQuery: '',
  ratingFilter: 'all',
  autoSyncTimer: null,
  lastPendingCount: null,
  isSyncing: false,
  sidebarOpen: false
};

// ==============================================================================
// 1. Initialization & Authentication
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (state.authToken) {
    verifySession();
  } else {
    showLoginView();
  }
});

async function apiFetch(endpoint, options = {}) {
  const headers = options.headers || {};
  if (state.authToken) {
    headers['Authorization'] = `Bearer ${state.authToken}`;
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
      showToast('Session expired. Please sign in again.', 'warning');
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
    state.adminUser = await apiFetch('/auth/me');
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
  const submitBtn = document.getElementById('loginSubmitBtn');
  
  if (errorEl) errorEl.style.display = 'none';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Verifying Credentials...</span>`;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: 'Invalid login credentials' }));
      throw new Error(data.detail || 'Invalid username or password');
    }

    const data = await res.json();
    state.authToken = data.access_token;
    localStorage.setItem('eyesoft_admin_token', state.authToken);
    state.adminUser = data.user;
    showToast('Secure sign in verified. Welcome back!', 'success');
    showDashboardView();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Sign In to Executive Portal</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      `;
    }
  }
}

function logout() {
  stopAutoSync();
  state.authToken = null;
  state.adminUser = null;
  localStorage.removeItem('eyesoft_admin_token');
  showLoginView();
  showToast('Signed out of admin portal.', 'info');
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>`;
  } else {
    input.type = 'password';
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

// ==============================================================================
// 2. Login View
// ==============================================================================

function showLoginView() {
  const root = document.getElementById('adminApp');
  if (!root) return;

  root.innerHTML = `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <img src="/assets/logo/eyesoft_new_logo.png" alt="EYESOFT" class="login-logo" onerror="this.style.display='none'">
          <h1 class="login-title">EYESOFT AV Admin</h1>
          <p class="login-subtitle">EXPERIENCE THE LIVE &bull; Customer Reviews & Operations Portal</p>
          <span class="login-badge">Authorized Personnel Only</span>
        </div>

        <div id="loginError" class="login-alert error" style="display:none;"></div>

        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label" for="loginUsername">Admin Username</label>
            <div class="input-with-icon">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <input type="text" id="loginUsername" class="form-control" placeholder="Enter username (e.g. admin)" required autofocus value="admin">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="loginPassword">Security Password</label>
            <div class="input-with-icon">
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input type="password" id="loginPassword" class="form-control" placeholder="••••••••••••" required>
              <button type="button" class="toggle-password-btn" onclick="togglePasswordVisibility('loginPassword', this)" title="Show/Hide Password">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <button type="submit" id="loginSubmitBtn" class="btn-admin-submit">
            <span>Sign In to Executive Portal</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </form>

        <div class="login-footer-security">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>End-to-end encrypted session &bull; SQLite Verified Database</span>
        </div>
      </div>
    </div>
  `;
}

// ==============================================================================
// 3. Application Shell & Navigation
// ==============================================================================

function showDashboardView() {
  const root = document.getElementById('adminApp');
  if (!root) return;

  const username = state.adminUser?.username || 'admin';
  const initial = username[0].toUpperCase();

  root.innerHTML = `
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="sidebar-brand">
          <img src="/assets/logo/eyesoft_new_logo.png" alt="EYESOFT Logo" class="sidebar-logo" onerror="this.src='/assets/logo/eyesoft_new_logo.png'">
          <span class="sidebar-portal-tag">PORTAL</span>
        </div>

        <nav class="sidebar-nav-container">
          <div class="nav-group-title">Customer Reviews & Ops</div>
          <a class="sidebar-link active" data-tab="dashboard" onclick="switchTab('dashboard')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Dashboard</span>
          </a>
          <a class="sidebar-link" data-tab="reviews" onclick="switchTab('reviews')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>Customer Reviews</span>
            <span id="sidebarPendingBadge" class="sidebar-badge pending" style="display:none;">0</span>
          </a>
          <a class="sidebar-link" data-tab="live-reviews" onclick="switchTab('live-reviews')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Live Website Preview</span>
            <span class="sidebar-badge live">Live</span>
          </a>

          <div class="nav-group-title">Hardware & Catalogue</div>
          <a class="sidebar-link" data-tab="products" onclick="switchTab('products')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            <span>Products & AV Gear</span>
          </a>
          <a class="sidebar-link" data-tab="categories" onclick="switchTab('categories')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span>AV Solution Categories</span>
          </a>
          <a class="sidebar-link" data-tab="clients" onclick="switchTab('clients')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Brochure Clients</span>
          </a>
          <a class="sidebar-link" data-tab="news" onclick="switchTab('news')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            <span>News & Press Releases</span>
          </a>

          <div class="nav-group-title">System & Security</div>
          <a class="sidebar-link" data-tab="contact" onclick="switchTab('contact')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Headquarters Contact</span>
          </a>
          <a class="sidebar-link" data-tab="settings" onclick="switchTab('settings')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Security & Passwords</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-db-status">
            <span class="db-status-dot"></span>
            <span>SQLite Connected &bull; Persistent</span>
          </div>
          <a href="/" target="_blank" class="btn-sidebar-secondary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            <span>View Public Website</span>
          </a>
          <button class="btn-sidebar-logout" onclick="logout()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Admin Stage -->
      <main class="admin-main">
        <header class="admin-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" onclick="toggleMobileSidebar()" aria-label="Toggle navigation menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div class="topbar-breadcrumb">
                <span>EYESOFT Admin</span>
                <span>/</span>
                <span id="pageBreadcrumb">Dashboard</span>
              </div>
              <h2 class="topbar-title" id="pageTitle">Customer Reviews & Metrics Dashboard</h2>
            </div>
          </div>

          <div class="topbar-right">
            <!-- Real-Time Auto Sync Pulse Indicator -->
            <div class="live-sync-indicator" title="Auto-polling database every 4 seconds for live customer review submissions">
              <span class="pulse-dot"></span>
              <span>Live Sync (4s)</span>
            </div>

            <!-- Test Simulator Action Button -->
            <button class="btn-topbar-action" onclick="openTestReviewModal()" title="Simulate a real customer review submission">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>+ Simulate Review</span>
            </button>

            <!-- Public Site Link -->
            <a href="/" target="_blank" class="btn-topbar-primary">
              <span>Live Website</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>

            <!-- User Avatar Pill -->
            <div class="admin-user-pill">
              <div class="user-avatar">${initial}</div>
              <div class="user-info">
                <span class="user-name">${state.adminUser?.full_name || 'Admin'}</span>
                <span class="user-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Dynamic Content Body -->
        <div class="admin-content" id="tabContent">
          <div style="text-align:center; padding:3rem; color:#64748B;">
            Initializing workspace...
          </div>
        </div>
      </main>
    </div>

    <!-- Universal Modal System -->
    <div class="admin-modal-backdrop" id="adminModal" onclick="closeModalOnBackdrop(event)">
      <div class="admin-modal-dialog" id="modalDialog">
        <!-- Injected Dynamically -->
      </div>
    </div>

    <!-- Floating Toast Notification System -->
    <div class="admin-toast-container" id="toastContainer"></div>
  `;

  // Start background live polling
  startAutoSync();

  // Load Initial Tab
  loadTab(state.currentTab);
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

function switchTab(tab) {
  state.currentTab = tab;
  
  // Close mobile sidebar if open
  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) sidebar.classList.remove('open');

  // Update sidebar active classes
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tab') === tab);
  });

  loadTab(tab);
}

async function loadTab(tab) {
  const container = document.getElementById('tabContent');
  const title = document.getElementById('pageTitle');
  const breadcrumb = document.getElementById('pageBreadcrumb');
  if (!container) return;

  try {
    switch (tab) {
      case 'dashboard':
        if (title) title.textContent = 'Customer Reviews & Operations Dashboard';
        if (breadcrumb) breadcrumb.textContent = 'Dashboard';
        await renderDashboardTab(container);
        break;
      case 'reviews':
        if (title) title.textContent = 'Customer Reviews Management & Verification';
        if (breadcrumb) breadcrumb.textContent = 'Customer Reviews';
        await renderReviewsTab(container);
        break;
      case 'live-reviews':
        if (title) title.textContent = 'Live Public Website Customer Reviews Preview';
        if (breadcrumb) breadcrumb.textContent = 'Live Site Preview';
        await renderLiveReviewsTab(container);
        break;
      case 'products':
        if (title) title.textContent = 'Product Catalogue & Audio-Visual Gear';
        if (breadcrumb) breadcrumb.textContent = 'Products';
        await renderProductsTab(container);
        break;
      case 'categories':
        if (title) title.textContent = 'Audio-Visual Solution Categories';
        if (breadcrumb) breadcrumb.textContent = 'Categories';
        await renderCategoriesTab(container);
        break;
      case 'clients':
        if (title) title.textContent = 'Our Clients (Brochure Roster)';
        if (breadcrumb) breadcrumb.textContent = 'Clients';
        await renderClientsTab(container);
        break;
      case 'news':
        if (title) title.textContent = 'News, Announcements & Case Studies';
        if (breadcrumb) breadcrumb.textContent = 'News';
        await renderNewsTab(container);
        break;
      case 'contact':
        if (title) title.textContent = 'Headquarters & Business Information';
        if (breadcrumb) breadcrumb.textContent = 'Contact';
        await renderContactTab(container);
        break;
      case 'settings':
        if (title) title.textContent = 'Administrator Security & Diagnostics';
        if (breadcrumb) breadcrumb.textContent = 'Settings';
        renderSettingsTab(container);
        break;
      default:
        switchTab('dashboard');
    }
  } catch (err) {
    container.innerHTML = `
      <div style="background:#FEE2E2; border:1px solid #FECACA; border-radius:12px; padding:2rem; color:#991B1B;">
        <h3 style="font-weight:700; margin-bottom:0.5rem;">Failed to load view</h3>
        <p>${escapeHtml(err.message)}</p>
        <button class="btn-secondary" onclick="loadTab('${tab}')" style="margin-top:1rem;">Retry</button>
      </div>
    `;
  }
}

// ==============================================================================
// 4. Real-time Live Polling & Auto-Sync Engine
// ==============================================================================

function startAutoSync() {
  stopAutoSync();
  // Poll every 4 seconds
  state.autoSyncTimer = setInterval(async () => {
    if (state.isSyncing || !state.authToken) return;
    state.isSyncing = true;
    try {
      const stats = await apiFetch('/stats');
      state.stats = stats;

      // Update sidebar badge
      const badge = document.getElementById('sidebarPendingBadge');
      if (badge) {
        badge.textContent = stats.pending_reviews;
        badge.style.display = stats.pending_reviews > 0 ? 'inline-block' : 'none';
      }

      // Detect new incoming pending reviews!
      if (state.lastPendingCount !== null && stats.pending_reviews > state.lastPendingCount) {
        const diff = stats.pending_reviews - state.lastPendingCount;
        showToast(`🔔 ${diff} new customer review${diff > 1 ? 's' : ''} received! Awaiting approval.`, 'warning');

        // Dynamically refresh the current tab to show new review immediately
        if (state.currentTab === 'dashboard') {
          await renderDashboardTab(document.getElementById('tabContent'), true);
        } else if (state.currentTab === 'reviews') {
          await renderReviewsTab(document.getElementById('tabContent'), true);
        }
      }

      state.lastPendingCount = stats.pending_reviews;
    } catch (e) {
      // Background poll fail handled quietly
    } finally {
      state.isSyncing = false;
    }
  }, 4000);
}

function stopAutoSync() {
  if (state.autoSyncTimer) {
    clearInterval(state.autoSyncTimer);
    state.autoSyncTimer = null;
  }
}

// ==============================================================================
// 5. Tab: Dashboard Overview (Executive Metrics + Rating + Quick Queue)
// ==============================================================================

async function renderDashboardTab(container, silent = false) {
  if (!silent) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:#64748B;">Loading executive metrics...</div>`;
  }

  const stats = await apiFetch('/stats');
  state.stats = stats;
  state.lastPendingCount = stats.pending_reviews;

  // Fetch pending reviews for quick action center
  const pendingReviews = await apiFetch('/admin/reviews?status=pending');

  // Update badge in sidebar
  const badge = document.getElementById('sidebarPendingBadge');
  if (badge) {
    badge.textContent = stats.pending_reviews;
    badge.style.display = stats.pending_reviews > 0 ? 'inline-block' : 'none';
  }

  const breakdown = stats.rating_breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalApproved = stats.approved_reviews || 1;

  container.innerHTML = `
    <!-- Top Stats 4-Card Grid -->
    <div class="stats-grid">
      <!-- Stat 1: Total Reviews -->
      <div class="stat-card" onclick="switchTab('reviews')" style="cursor:pointer;">
        <div class="stat-header">
          <div class="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="stat-badge neutral">All-Time</span>
        </div>
        <div class="stat-label">Total Customer Reviews</div>
        <div class="stat-value">${stats.total_reviews}</div>
        <div class="stat-subtext">Cumulative submissions across public website</div>
      </div>

      <!-- Stat 2: Pending Reviews (Requires Attention) -->
      <div class="stat-card ${stats.pending_reviews > 0 ? 'alert-card' : ''}" onclick="filterAndSwitchReviews('pending')" style="cursor:pointer;">
        <div class="stat-header">
          <div class="stat-icon amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <span class="stat-badge amber">${stats.pending_reviews > 0 ? 'Requires Action' : 'All Clear'}</span>
        </div>
        <div class="stat-label">Pending Approval Queue</div>
        <div class="stat-value" style="color:#D97706;">${stats.pending_reviews}</div>
        <div class="stat-subtext">${stats.pending_reviews > 0 ? 'Customer submissions awaiting review' : 'No submissions pending moderation'}</div>
      </div>

      <!-- Stat 3: Approved & Live Reviews -->
      <div class="stat-card" onclick="filterAndSwitchReviews('approved')" style="cursor:pointer;">
        <div class="stat-header">
          <div class="stat-icon emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <span class="stat-badge emerald">Published</span>
        </div>
        <div class="stat-label">Approved & Publicly Live</div>
        <div class="stat-value" style="color:#059669;">${stats.approved_reviews}</div>
        <div class="stat-subtext">Currently displayed on public EYESOFT site</div>
      </div>

      <!-- Stat 4: Rejected Reviews -->
      <div class="stat-card" onclick="filterAndSwitchReviews('rejected')" style="cursor:pointer;">
        <div class="stat-header">
          <div class="stat-icon rose">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <span class="stat-badge neutral">Hidden</span>
        </div>
        <div class="stat-label">Rejected Reviews</div>
        <div class="stat-value" style="color:#DC2626;">${stats.rejected_reviews}</div>
        <div class="stat-subtext">Declined submissions permanently hidden from visitors</div>
      </div>
    </div>

    <!-- 2-Column Overview: Ratings Breakdown & Pending Queue -->
    <div class="overview-two-col">
      <!-- Column 1: Customer Satisfaction & Rating Breakdown -->
      <div class="admin-card rating-overview-card">
        <div class="admin-card-header" style="padding:0; margin-bottom:1.25rem;">
          <div>
            <h3 class="admin-card-title">Customer Satisfaction & Rating Analytics</h3>
            <p class="admin-card-desc">Calculated exclusively from published, verified customer reviews</p>
          </div>
        </div>

        <div class="rating-big-score">
          <span class="rating-number-huge">${stats.average_rating.toFixed(1)}</span>
          <span style="font-size:1.15rem; color:#64748B; font-weight:600;">/ 5.0</span>
        </div>

        <div class="rating-stars-row">
          ${renderStarsHtml(stats.average_rating)}
          <span style="font-size:0.875rem; color:#64748B; font-weight:600; margin-left:0.5rem;">(${stats.approved_reviews} verified reviews)</span>
        </div>

        <!-- Rating Progress Bars (5 down to 1) -->
        <div class="rating-breakdown-bars">
          ${[5, 4, 3, 2, 1].map(star => {
            const count = breakdown[star] || 0;
            const pct = totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
            return `
              <div class="rating-bar-row">
                <span class="rating-bar-label">${star} Stars</span>
                <div class="rating-bar-track">
                  <div class="rating-bar-fill" style="width: ${pct}%;"></div>
                </div>
                <span class="rating-bar-count">${count}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.8125rem; color:#64748B;">Need to test submission flow?</span>
          <button class="btn-secondary" style="font-size:0.8125rem; padding:0.4rem 0.85rem;" onclick="openTestReviewModal()">+ Simulate Test Review</button>
        </div>
      </div>

      <!-- Column 2: Pending Reviews Queue (Immediate Actions) -->
      <div class="admin-card" style="display:flex; flex-direction:column;">
        <div class="admin-card-header">
          <div>
            <h3 class="admin-card-title">Reviews Awaiting Approval Queue</h3>
            <p class="admin-card-desc">Review submitted feedback before publishing publicly</p>
          </div>
          <button class="btn-secondary" style="font-size:0.75rem; padding:0.35rem 0.65rem;" onclick="filterAndSwitchReviews('pending')">View All (${stats.pending_reviews})</button>
        </div>

        <div style="flex:1; overflow-y:auto; max-height:360px;">
          ${pendingReviews.length === 0 ? `
            <div style="text-align:center; padding:3.5rem 1.5rem; color:#64748B;">
              <div style="width:54px; height:54px; border-radius:50%; background:#DCFCE7; color:#16A34A; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h4 style="font-weight:700; color:#0F172A; margin-bottom:0.25rem;">Pending Queue is Empty</h4>
              <p style="font-size:0.875rem;">All customer submissions have been moderated. New submissions will appear here instantly via live sync.</p>
              <button class="btn-primary" style="margin-top:1.25rem; font-size:0.8125rem;" onclick="openTestReviewModal()">Submit A Test Review Now</button>
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:0.75rem; padding:1.25rem;">
              ${pendingReviews.map(r => `
                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:1rem; transition:var(--transition);" onmouseover="this.style.borderColor='#CBD5E1'" onmouseout="this.style.borderColor='#E2E8F0'">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <div style="display:flex; align-items:center; gap:0.65rem;">
                      <div class="customer-avatar" style="width:32px; height:32px; font-size:0.75rem;">${(r.customer_name || 'C')[0].toUpperCase()}</div>
                      <div>
                        <div style="font-weight:700; font-size:0.875rem; color:#0F172A;">${escapeHtml(r.customer_name)}</div>
                        <div style="font-size:0.75rem; color:#64748B;">${escapeHtml(r.company_or_designation || 'Verified Client')}</div>
                      </div>
                    </div>
                    <span style="color:#F59E0B; font-weight:700; font-size:0.8125rem;">★ ${r.rating} / 5</span>
                  </div>
                  <p style="font-size:0.8125rem; color:#334155; font-style:italic; margin-bottom:0.75rem; line-height:1.4;">
                    "${escapeHtml(r.review_text)}"
                  </p>
                  <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #E2E8F0; padding-top:0.65rem;">
                    <span style="font-size:0.75rem; color:#94A3B8;">${formatDate(r.created_at)}</span>
                    <div class="action-buttons-group">
                      <button class="btn-action approve" onclick="approveReview(${r.id})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Approve
                      </button>
                      <button class="btn-action reject" onclick="rejectReview(${r.id})">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Recent Submissions Activity Table -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Recent Submissions Stream</h3>
          <p class="admin-card-desc">Latest customer reviews submitted via the public EYESOFT website</p>
        </div>
        <button class="btn-secondary" onclick="switchTab('reviews')">Open Reviews Manager &rarr;</button>
      </div>

      <div class="table-responsive">
        ${(!stats.recent_reviews || stats.recent_reviews.length === 0) ? `
          <div style="text-align:center; padding:2.5rem; color:#64748B;">No review activity logged yet.</div>
        ` : `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Star Rating</th>
                <th>Review Excerpt</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${stats.recent_reviews.map(r => `
                <tr>
                  <td>
                    <div class="customer-cell">
                      <div class="customer-avatar">${(r.customer_name || 'C')[0].toUpperCase()}</div>
                      <div>
                        <div class="customer-name">${escapeHtml(r.customer_name)}</div>
                        <div class="customer-designation">${escapeHtml(r.company_or_designation || 'Verified Client')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="rating-stars-gold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    <span class="rating-score">${r.rating}.0</span>
                  </td>
                  <td style="max-width:300px;">
                    <div class="review-text-preview">"${escapeHtml(r.review_text)}"</div>
                  </td>
                  <td>
                    <span class="status-pill ${r.status}">${r.status}</span>
                  </td>
                  <td style="font-size:0.8125rem; color:#64748B;">${formatDate(r.created_at)}</td>
                  <td>
                    <div class="action-buttons-group">
                      ${r.status !== 'approved' ? `
                        <button class="btn-action approve" onclick="approveReview(${r.id})" title="Approve and Publish">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Approve
                        </button>
                      ` : ''}
                      ${r.status !== 'rejected' ? `
                        <button class="btn-action reject" onclick="rejectReview(${r.id})" title="Reject and Hide">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Reject
                        </button>
                      ` : ''}
                      <button class="btn-action view" onclick="viewReviewDetail(${r.id})" title="View Complete Review Details">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
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

function filterAndSwitchReviews(filterStatus) {
  state.reviewFilter = filterStatus;
  switchTab('reviews');
}

// ==============================================================================
// 6. Tab: Customer Reviews Management & Moderation
// ==============================================================================

async function renderReviewsTab(container, silent = false) {
  if (!silent) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:#64748B;">Loading customer reviews database...</div>`;
  }

  // Fetch stats and review list with filters
  const stats = await apiFetch('/stats');
  state.stats = stats;

  let url = `/admin/reviews?status=${state.reviewFilter}`;
  if (state.searchQuery && state.searchQuery.trim()) {
    url += `&search=${encodeURIComponent(state.searchQuery.trim())}`;
  }
  if (state.ratingFilter && state.ratingFilter !== 'all') {
    url += `&rating=${state.ratingFilter}`;
  }

  const reviews = await apiFetch(url);
  state.reviews = reviews;

  container.innerHTML = `
    <div class="admin-card">
      <!-- Filter Tabs Navigation -->
      <div class="filter-tabs-bar">
        <div class="filter-tab ${state.reviewFilter === 'all' ? 'active' : ''}" onclick="setReviewTabFilter('all')">
          <span>All Reviews</span>
          <span class="tab-count-pill">${stats.total_reviews}</span>
        </div>
        <div class="filter-tab ${state.reviewFilter === 'pending' ? 'active' : ''}" onclick="setReviewTabFilter('pending')">
          <span>Pending Approval</span>
          <span class="tab-count-pill pending-pill">${stats.pending_reviews}</span>
        </div>
        <div class="filter-tab ${state.reviewFilter === 'approved' ? 'active' : ''}" onclick="setReviewTabFilter('approved')">
          <span>Approved & Live</span>
          <span class="tab-count-pill">${stats.approved_reviews}</span>
        </div>
        <div class="filter-tab ${state.reviewFilter === 'rejected' ? 'active' : ''}" onclick="setReviewTabFilter('rejected')">
          <span>Rejected</span>
          <span class="tab-count-pill">${stats.rejected_reviews}</span>
        </div>
      </div>

      <!-- Action Toolbar -->
      <div class="toolbar-row">
        <div class="toolbar-search">
          <span class="toolbar-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input type="text" id="reviewSearchInput" placeholder="Search customer, company, or message..." value="${escapeHtml(state.searchQuery)}" oninput="handleReviewSearchInput(this.value)">
        </div>

        <div class="toolbar-filters">
          <select class="select-filter" id="reviewRatingFilter" onchange="handleRatingFilterChange(this.value)">
            <option value="all" ${state.ratingFilter === 'all' ? 'selected' : ''}>All Star Ratings</option>
            <option value="5" ${state.ratingFilter === '5' ? 'selected' : ''}>★★★★★ 5 Stars</option>
            <option value="4" ${state.ratingFilter === '4' ? 'selected' : ''}>★★★★☆ 4 Stars</option>
            <option value="3" ${state.ratingFilter === '3' ? 'selected' : ''}>★★★☆☆ 3 Stars</option>
            <option value="2" ${state.ratingFilter === '2' ? 'selected' : ''}>★★☆☆☆ 2 Stars</option>
            <option value="1" ${state.ratingFilter === '1' ? 'selected' : ''}>★☆☆☆☆ 1 Star</option>
          </select>

          <button class="btn-primary" style="font-size:0.8125rem; padding:0.55rem 1rem;" onclick="openTestReviewModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>+ Simulate Review</span>
          </button>
        </div>
      </div>

      <!-- Reviews Data Table -->
      <div class="table-responsive">
        ${reviews.length === 0 ? `
          <div style="text-align:center; padding:4rem 1.5rem; color:#64748B;">
            <div style="font-size:2.5rem; margin-bottom:0.75rem;">💬</div>
            <h4 style="font-weight:700; color:#0F172A; margin-bottom:0.25rem;">No reviews matching current filter</h4>
            <p style="font-size:0.875rem;">Try adjusting your search criteria or filter tabs above.</p>
            <button class="btn-secondary" style="margin-top:1rem;" onclick="resetReviewFilters()">Clear Filters</button>
          </div>
        ` : `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review Content</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${reviews.map(r => `
                <tr>
                  <td>
                    <div class="customer-cell">
                      <div class="customer-avatar">${(r.customer_name || 'C')[0].toUpperCase()}</div>
                      <div>
                        <div class="customer-name">${escapeHtml(r.customer_name)}</div>
                        <div class="customer-designation">${escapeHtml(r.company_or_designation || 'Verified Client')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="rating-stars-gold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    <span class="rating-score">${r.rating}.0</span>
                  </td>
                  <td style="max-width:360px;">
                    <div class="review-text-preview" onclick="viewReviewDetail(${r.id})" style="cursor:pointer;" title="Click to view full review">
                      "${escapeHtml(r.review_text)}"
                    </div>
                  </td>
                  <td>
                    <span class="status-pill ${r.status}">${r.status}</span>
                  </td>
                  <td style="font-size:0.8125rem; color:#64748B;">${formatDate(r.created_at)}</td>
                  <td>
                    <div class="action-buttons-group">
                      ${r.status !== 'approved' ? `
                        <button class="btn-action approve" onclick="approveReview(${r.id})" title="Approve: Review will appear live on public website">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                          Approve
                        </button>
                      ` : ''}
                      ${r.status !== 'rejected' ? `
                        <button class="btn-action reject" onclick="rejectReview(${r.id})" title="Reject: Hide review from public website">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Reject
                        </button>
                      ` : ''}
                      <button class="btn-action delete" onclick="confirmDeleteReview(${r.id}, '${escapeHtml(r.customer_name)}')" title="Permanently delete review from database">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                      <button class="btn-action view" onclick="viewReviewDetail(${r.id})" title="View full details and audit logs">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
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

function setReviewTabFilter(filter) {
  state.reviewFilter = filter;
  renderReviewsTab(document.getElementById('tabContent'));
}

let searchDebounceTimer = null;
function handleReviewSearchInput(query) {
  state.searchQuery = query;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    renderReviewsTab(document.getElementById('tabContent'));
  }, 350);
}

function handleRatingFilterChange(rating) {
  state.ratingFilter = rating;
  renderReviewsTab(document.getElementById('tabContent'));
}

function resetReviewFilters() {
  state.reviewFilter = 'all';
  state.searchQuery = '';
  state.ratingFilter = 'all';
  renderReviewsTab(document.getElementById('tabContent'));
}

// Review Status Operations
async function approveReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
    showToast('Review approved! Now published on public EYESOFT website.', 'success');
    closeModal();
    if (state.currentTab === 'dashboard') {
      renderDashboardTab(document.getElementById('tabContent'));
    } else {
      renderReviewsTab(document.getElementById('tabContent'));
    }
  } catch (err) {
    showToast(`Approval failed: ${err.message}`, 'error');
  }
}

async function rejectReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    });
    showToast('Review rejected. Hidden from public website.', 'warning');
    closeModal();
    if (state.currentTab === 'dashboard') {
      renderDashboardTab(document.getElementById('tabContent'));
    } else {
      renderReviewsTab(document.getElementById('tabContent'));
    }
  } catch (err) {
    showToast(`Rejection failed: ${err.message}`, 'error');
  }
}

function confirmDeleteReview(id, customerName) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title" style="color:#DC2626;">Permanently Delete Customer Review</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="admin-modal-body">
      <p style="margin-bottom:1rem; font-size:0.95rem; color:#1E293B;">
        Are you sure you want to permanently delete the review submitted by <strong>${escapeHtml(customerName)}</strong>?
      </p>
      <div style="background:#FEE2E2; border-left:4px solid #DC2626; padding:0.85rem 1rem; border-radius:4px; font-size:0.8125rem; color:#991B1B;">
        <strong>Warning:</strong> This operation will permanently remove this customer testimonial from the SQLite database. It cannot be recovered.
      </div>
    </div>
    <div class="admin-modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="executeDeleteReview(${id})">Yes, Delete Permanently</button>
    </div>
  `;
  openModal();
}

async function executeDeleteReview(id) {
  try {
    await apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Review permanently deleted from database.', 'success');
    if (state.currentTab === 'dashboard') {
      renderDashboardTab(document.getElementById('tabContent'));
    } else {
      renderReviewsTab(document.getElementById('tabContent'));
    }
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  }
}

async function viewReviewDetail(id) {
  try {
    const review = await apiFetch(`/admin/reviews/${id}`);
    const dialog = document.getElementById('modalDialog');

    dialog.innerHTML = `
      <div class="admin-modal-header">
        <div>
          <h3 class="admin-modal-title">Review Submission Details</h3>
          <div style="font-size:0.75rem; color:#64748B;">Database Record ID: #${review.id}</div>
        </div>
        <button class="admin-modal-close" onclick="closeModal()">&times;</button>
      </div>

      <div class="admin-modal-body">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem;">
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <div class="customer-avatar" style="width:44px; height:44px; font-size:1.1rem;">
              ${(review.customer_name || 'C')[0].toUpperCase()}
            </div>
            <div>
              <div style="font-size:1.05rem; font-weight:800; color:#0F172A;">${escapeHtml(review.customer_name)}</div>
              <div style="font-size:0.8125rem; color:#64748B;">${escapeHtml(review.company_or_designation || 'Verified Customer')}</div>
            </div>
          </div>
          <span class="status-pill ${review.status}">${review.status}</span>
        </div>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:1.25rem; margin-bottom:1.25rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
            <span class="rating-stars-gold" style="font-size:1.2rem;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            <span style="font-weight:700; color:#475569;">${review.rating}.0 out of 5</span>
          </div>
          <div style="font-size:0.95rem; color:#1E293B; line-height:1.6; font-style:italic;">
            "${escapeHtml(review.review_text)}"
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; font-size:0.8125rem; color:#64748B; background:#FFFFFF; border:1px solid #E2E8F0; padding:1rem; border-radius:8px;">
          <div>
            <span style="display:block; font-weight:600; color:#334155;">Submitted On:</span>
            <span>${formatDate(review.created_at)}</span>
          </div>
          <div>
            <span style="display:block; font-weight:600; color:#334155;">Visibility Status:</span>
            <span>${review.status === 'approved' ? '🟢 Publicly Visible on Website' : '🔴 Hidden from Website Visitors'}</span>
          </div>
        </div>
      </div>

      <div class="admin-modal-footer">
        <button class="btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn-danger" onclick="confirmDeleteReview(${review.id}, '${escapeHtml(review.customer_name)}')">Delete</button>
        ${review.status !== 'rejected' ? `
          <button class="btn-warning" onclick="rejectReview(${review.id})">Reject Review</button>
        ` : ''}
        ${review.status !== 'approved' ? `
          <button class="btn-success" onclick="approveReview(${review.id})">Approve & Publish</button>
        ` : ''}
      </div>
    `;
    openModal();
  } catch (err) {
    showToast(`Failed to load review: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 7. Test Review Submission Simulator (Demonstrates Public -> DB -> Admin Live Flow)
// ==============================================================================

function openTestReviewModal() {
  const dialog = document.getElementById('modalDialog');
  let selectedRating = 5;

  dialog.innerHTML = `
    <div class="admin-modal-header">
      <div>
        <h3 class="admin-modal-title">Simulate Customer Review Submission</h3>
        <div style="font-size:0.75rem; color:#64748B;">Executes exact public POST /api/reviews endpoint with status = pending</div>
      </div>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>

    <form onsubmit="submitSimulatedReview(event)">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Customer Name *</label>
          <input type="text" id="simCustomerName" class="form-control" required placeholder="e.g. Ramesh Krishnan" value="Ramesh Krishnan">
        </div>

        <div class="form-group">
          <label class="form-label">Company / Designation (Optional)</label>
          <input type="text" id="simCompany" class="form-control" placeholder="e.g. Head of Infrastructure, TechCorp India" value="Head of Infrastructure, TechCorp India">
        </div>

        <div class="form-group">
          <label class="form-label">Star Rating (1 to 5) *</label>
          <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.25rem;">
            <select id="simRating" class="form-control" style="width:140px;" onchange="updateSimStars(this.value)">
              <option value="5" selected>★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
            <span id="simStarsDisplay" class="rating-stars-gold" style="font-size:1.3rem;">★★★★★</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Review Testimonial Message *</label>
          <textarea id="simReviewText" class="form-control" rows="4" required placeholder="Enter review feedback...">EYESOFT delivered an exceptional unified AV setup for our 200-seat boardroom. Crystal-clear video and high-fidelity acoustics throughout.</textarea>
        </div>

        <div style="background:#EFF6FF; border-left:4px solid #0066FF; padding:0.75rem 1rem; border-radius:4px; font-size:0.8125rem; color:#1E40AF;">
          <strong>Live Workflow Verification:</strong> Upon submission, this review will be saved to SQLite with status <code>pending</code>. It will NOT appear publicly until you click <strong>Approve</strong> in this Admin Portal.
        </div>
      </div>

      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary" id="btnSimSubmit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span>Submit Public Review</span>
        </button>
      </div>
    </form>
  `;
  openModal();
}

function updateSimStars(rating) {
  const display = document.getElementById('simStarsDisplay');
  if (display) {
    const num = parseInt(rating, 10) || 5;
    display.textContent = '★'.repeat(num) + '☆'.repeat(5 - num);
  }
}

async function submitSimulatedReview(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('btnSimSubmit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Submitting to Database...</span>`;
  }

  const payload = {
    customer_name: document.getElementById('simCustomerName').value.trim(),
    company_or_designation: document.getElementById('simCompany').value.trim(),
    rating: parseInt(document.getElementById('simRating').value, 10),
    review_text: document.getElementById('simReviewText').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Submission failed' }));
      throw new Error(err.detail || 'Failed to submit review');
    }

    closeModal();
    showToast('Customer review submitted! Status: Pending. Notice the real-time queue update.', 'success');

    // Instantly refresh views
    if (state.currentTab === 'dashboard') {
      renderDashboardTab(document.getElementById('tabContent'));
    } else if (state.currentTab === 'reviews') {
      renderReviewsTab(document.getElementById('tabContent'));
    }
  } catch (err) {
    showToast(`Simulation error: ${err.message}`, 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Submit Public Review</span>`;
    }
  }
}

// ==============================================================================
// 8. Tab: Live Website Reviews Preview
// ==============================================================================

async function renderLiveReviewsTab(container) {
  container.innerHTML = `<div style="text-align:center; padding:3rem; color:#64748B;">Connecting to public API (GET /api/reviews)...</div>`;

  const publicReviews = await apiFetch('/reviews');

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Live Public Website Customer Reviews</h3>
          <p class="admin-card-desc">Only reviews with status <strong>Approved</strong> are rendered to public visitors on index.html</p>
        </div>
        <a href="/#customer-reviews" target="_blank" class="btn-primary" style="font-size:0.8125rem;">
          <span>Open on Public Site</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      <div style="padding:1.5rem;">
        <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.75rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span style="font-size:0.875rem; color:#1E40AF;">
            <strong>Verification guarantee:</strong> There are currently <strong>${publicReviews.length}</strong> approved reviews visible to the public. Any review pending moderation or rejected is strictly filtered out by the backend SQL engine.
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1.25rem;">
          ${publicReviews.map(r => `
            <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:1.5rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                  <span class="rating-stars-gold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                  <span class="status-pill approved" style="font-size:0.7rem;">Live</span>
                </div>
                <p style="font-size:0.925rem; color:#1E293B; line-height:1.5; font-style:italic; margin-bottom:1rem;">
                  "${escapeHtml(r.review_text)}"
                </p>
              </div>
              <div style="border-top:1px solid #F1F5F9; padding-top:0.75rem; display:flex; align-items:center; gap:0.75rem;">
                <div class="customer-avatar" style="width:34px; height:34px; font-size:0.8rem;">${(r.customer_name || 'C')[0].toUpperCase()}</div>
                <div>
                  <div style="font-weight:700; font-size:0.875rem; color:#0F172A;">${escapeHtml(r.customer_name)}</div>
                  <div style="font-size:0.75rem; color:#64748B;">${escapeHtml(r.company_or_designation || 'Verified Client')}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==============================================================================
// 9. Tab: Product Catalogue Management
// ==============================================================================

async function renderProductsTab(container) {
  const products = await apiFetch('/products');

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Audio-Visual Equipment Catalogue</h3>
          <p class="admin-card-desc">Manage projectors, screens, podiums, amplifiers, and conference hardware</p>
        </div>
        <div class="toolbar-filters">
          <input type="text" id="productSearch" class="form-control" style="width:240px; padding:0.45rem 0.85rem;" placeholder="Search products..." onkeyup="filterProductsTable()">
          <button class="btn-primary" onclick="openAddProductModal()">
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
                <td style="width:70px;">
                  <img src="/${p.image}" alt="${escapeHtml(p.name)}" style="width:48px; height:48px; object-fit:contain; border-radius:6px; background:#F8FAFC; border:1px solid #E2E8F0;" onerror="this.src='/assets/logo/eyesoft_new_logo.png'">
                </td>
                <td>
                  <strong style="color:#0F172A;">${escapeHtml(p.name)}</strong>
                  <div style="font-size:0.75rem; color:#64748B;">ID: ${p.id} &bull; Slug: ${p.slug}</div>
                </td>
                <td>
                  <span style="background:#F1F5F9; color:#334155; padding:0.25rem 0.55rem; border-radius:4px; font-size:0.75rem; font-weight:700;">${escapeHtml(p.category_name)}</span>
                </td>
                <td style="max-width:260px; font-size:0.8125rem; color:#475569;">
                  ${escapeHtml(p.tagline || '')}
                </td>
                <td>
                  ${p.is_featured ? `<span class="status-pill approved" style="font-size:0.7rem;">Featured</span>` : `<span style="font-size:0.75rem; color:#94A3B8;">Standard</span>`}
                </td>
                <td>
                  <div class="action-buttons-group">
                    <button class="btn-action view" onclick="openEditProductModal('${p.id}')">Edit</button>
                    <button class="btn-action delete" onclick="confirmDeleteProduct('${p.id}', '${escapeHtml(p.name)}')">Delete</button>
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
  const query = (document.getElementById('productSearch')?.value || '').toLowerCase();
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
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Add New AV Product</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddProduct(event)">
      <div class="admin-modal-body">
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
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="newProdDesc" class="form-control" rows="3" placeholder="Detailed product overview..."></textarea>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Create Product</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddProduct(e) {
  e.preventDefault();
  const catSelect = document.getElementById('newProdCategory');
  const catName = catSelect.options[catSelect.selectedIndex].getAttribute('data-name');

  const payload = {
    id: document.getElementById('newProdId').value.trim(),
    category_id: catSelect.value,
    category_name: catName,
    name: document.getElementById('newProdName').value.trim(),
    tagline: document.getElementById('newProdTagline').value.trim(),
    description: document.getElementById('newProdDesc').value.trim(),
    image: document.getElementById('newProdImage').value.trim(),
    is_featured: 1
  };

  try {
    await apiFetch('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast('Product added successfully', 'success');
    renderProductsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

async function openEditProductModal(productId) {
  const prod = await apiFetch(`/products/${productId}`);
  const categories = await apiFetch('/categories');
  const dialog = document.getElementById('modalDialog');

  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Edit Product: ${escapeHtml(prod.name)}</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditProduct(event, '${prod.id}')">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input type="text" id="editProdName" class="form-control" required value="${escapeHtml(prod.name)}">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="editProdCategory" class="form-control" required>
              ${categories.map(c => `<option value="${c.id}" data-name="${c.name}" ${c.id === prod.category_id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Featured on Home?</label>
            <select id="editProdFeatured" class="form-control">
              <option value="1" ${prod.is_featured ? 'selected' : ''}>Yes</option>
              <option value="0" ${!prod.is_featured ? 'selected' : ''}>No</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Tagline</label>
          <input type="text" id="editProdTagline" class="form-control" value="${escapeHtml(prod.tagline || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Product Image Path *</label>
          <input type="text" id="editProdImage" class="form-control" required value="${escapeHtml(prod.image)}">
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea id="editProdDesc" class="form-control" rows="3">${escapeHtml(prod.description || '')}</textarea>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditProduct(e, productId) {
  e.preventDefault();
  const catSelect = document.getElementById('editProdCategory');
  const catName = catSelect.options[catSelect.selectedIndex].getAttribute('data-name');

  const payload = {
    category_id: catSelect.value,
    category_name: catName,
    name: document.getElementById('editProdName').value.trim(),
    tagline: document.getElementById('editProdTagline').value.trim(),
    description: document.getElementById('editProdDesc').value.trim(),
    image: document.getElementById('editProdImage').value.trim(),
    is_featured: parseInt(document.getElementById('editProdFeatured').value, 10)
  };

  try {
    await apiFetch(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    closeModal();
    showToast('Product updated successfully', 'success');
    renderProductsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteProduct(id, name) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title" style="color:#DC2626;">Delete Product</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="admin-modal-body">
      <p>Are you sure you want to delete <strong>${escapeHtml(name)}</strong>?</p>
    </div>
    <div class="admin-modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="executeDeleteProduct('${id}')">Delete Product</button>
    </div>
  `;
  openModal();
}

async function executeDeleteProduct(id) {
  try {
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Product deleted', 'success');
    renderProductsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 10. Tab: Categories Overview
// ==============================================================================

async function renderCategoriesTab(container) {
  const categories = await apiFetch('/categories');

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Audio-Visual Solution Categories</h3>
          <p class="admin-card-desc">Brochure-aligned product classification</p>
        </div>
      </div>
      <div style="padding:1.5rem; display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1.25rem;">
        ${categories.map(c => `
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:1.25rem;">
            <div style="font-weight:700; font-size:1rem; color:#0F172A; margin-bottom:0.25rem;">${escapeHtml(c.name)}</div>
            <div style="font-size:0.75rem; color:#64748B; margin-bottom:0.75rem;">Category ID: ${c.id}</div>
            <div style="font-size:0.8125rem; color:#475569;">${escapeHtml(c.description || '')}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==============================================================================
// 11. Tab: Clients Management
// ==============================================================================

async function renderClientsTab(container) {
  const clients = await apiFetch('/clients');

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Official Brochure Clients Roster</h3>
          <p class="admin-card-desc">Verified institutions and enterprise clients</p>
        </div>
        <button class="btn-primary" onclick="openAddClientModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Client</span>
        </button>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Sector</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(c => `
              <tr>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td><span style="background:#F1F5F9; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.8125rem; font-weight:600;">${escapeHtml(c.sector || 'Enterprise')}</span></td>
                <td>
                  <div class="action-buttons-group">
                    <button class="btn-action view" onclick="openEditClientModal(${c.id}, '${escapeHtml(c.name)}', '${escapeHtml(c.sector || '')}')">Edit</button>
                    <button class="btn-action delete" onclick="confirmDeleteClient(${c.id}, '${escapeHtml(c.name)}')">Delete</button>
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
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Add Client</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddClient(event)">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Client / Institution Name *</label>
          <input type="text" id="newClientName" class="form-control" required placeholder="e.g. SRM Institute of Science and Technology">
        </div>
        <div class="form-group">
          <label class="form-label">Sector</label>
          <input type="text" id="newClientSector" class="form-control" placeholder="e.g. Higher Education">
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Add Client</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddClient(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('newClientName').value.trim(),
    sector: document.getElementById('newClientSector').value.trim(),
    logo: ''
  };

  try {
    await apiFetch('/admin/clients', { method: 'POST', body: JSON.stringify(payload) });
    closeModal();
    showToast('Client added', 'success');
    renderClientsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function openEditClientModal(id, currentName, currentSector) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Edit Client</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditClient(event, ${id})">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Client Name *</label>
          <input type="text" id="editClientName" class="form-control" required value="${escapeHtml(currentName)}">
        </div>
        <div class="form-group">
          <label class="form-label">Sector</label>
          <input type="text" id="editClientSector" class="form-control" value="${escapeHtml(currentSector)}">
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditClient(e, id) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('editClientName').value.trim(),
    sector: document.getElementById('editClientSector').value.trim(),
    logo: ''
  };

  try {
    await apiFetch(`/admin/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    closeModal();
    showToast('Client updated', 'success');
    renderClientsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteClient(id, name) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title" style="color:#DC2626;">Delete Client</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="admin-modal-body">
      <p>Are you sure you want to remove <strong>${escapeHtml(name)}</strong>?</p>
    </div>
    <div class="admin-modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="executeDeleteClient(${id})">Delete</button>
    </div>
  `;
  openModal();
}

async function executeDeleteClient(id) {
  try {
    await apiFetch(`/admin/clients/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Client removed', 'success');
    renderClientsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 12. Tab: News Management
// ==============================================================================

async function renderNewsTab(container) {
  const newsList = await apiFetch('/news');

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">News & Updates Management</h3>
          <p class="admin-card-desc">Company press releases and AV case studies</p>
        </div>
        <button class="btn-primary" onclick="openAddNewsModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Publish Article</span>
        </button>
      </div>

      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${newsList.map(n => `
              <tr>
                <td>
                  <strong>${escapeHtml(n.title)}</strong>
                  <div style="font-size:0.75rem; color:#64748B;">Slug: ${n.slug}</div>
                </td>
                <td><span style="background:#F1F5F9; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.8125rem;">${escapeHtml(n.category || 'Press')}</span></td>
                <td style="font-size:0.8125rem; color:#64748B;">${n.published_date || ''}</td>
                <td>
                  <div class="action-buttons-group">
                    <button class="btn-action view" onclick="openEditNewsModal(${n.id})">Edit</button>
                    <button class="btn-action delete" onclick="confirmDeleteNews(${n.id}, '${escapeHtml(n.title)}')">Delete</button>
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
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Publish News Article</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitAddNews(event)">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Article Title *</label>
          <input type="text" id="newNewsTitle" class="form-control" required placeholder="e.g. EYESOFT Completes Civic Council AV Deployment">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="newNewsCat" class="form-control" placeholder="Deployment">
          </div>
          <div class="form-group">
            <label class="form-label">Published Date</label>
            <input type="date" id="newNewsDate" class="form-control" value="${new Date().toISOString().split('T')[0]}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary / Excerpt</label>
          <textarea id="newNewsSummary" class="form-control" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Article Content</label>
          <textarea id="newNewsContent" class="form-control" rows="4"></textarea>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Publish Article</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitAddNews(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('newNewsTitle').value.trim(),
    category: document.getElementById('newNewsCat').value.trim() || 'News',
    published_date: document.getElementById('newNewsDate').value,
    summary: document.getElementById('newNewsSummary').value.trim(),
    content: document.getElementById('newNewsContent').value.trim(),
    image: 'assets/images/about/about_hero.jpg'
  };

  try {
    await apiFetch('/admin/news', { method: 'POST', body: JSON.stringify(payload) });
    closeModal();
    showToast('Article published', 'success');
    renderNewsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

async function openEditNewsModal(id) {
  const newsItem = await apiFetch(`/news/${id}`);
  const dialog = document.getElementById('modalDialog');

  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title">Edit Article</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <form onsubmit="submitEditNews(event, ${id})">
      <div class="admin-modal-body">
        <div class="form-group">
          <label class="form-label">Title *</label>
          <input type="text" id="editNewsTitle" class="form-control" required value="${escapeHtml(newsItem.title)}">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <input type="text" id="editNewsCat" class="form-control" value="${escapeHtml(newsItem.category || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" id="editNewsDate" class="form-control" value="${newsItem.published_date || ''}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Summary</label>
          <textarea id="editNewsSummary" class="form-control" rows="2">${escapeHtml(newsItem.summary || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Content</label>
          <textarea id="editNewsContent" class="form-control" rows="4">${escapeHtml(newsItem.content || '')}</textarea>
        </div>
      </div>
      <div class="admin-modal-footer">
        <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn-primary">Save Changes</button>
      </div>
    </form>
  `;
  openModal();
}

async function submitEditNews(e, id) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('editNewsTitle').value.trim(),
    category: document.getElementById('editNewsCat').value.trim(),
    published_date: document.getElementById('editNewsDate').value,
    summary: document.getElementById('editNewsSummary').value.trim(),
    content: document.getElementById('editNewsContent').value.trim(),
    image: 'assets/images/about/about_hero.jpg'
  };

  try {
    await apiFetch(`/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    closeModal();
    showToast('Article updated', 'success');
    renderNewsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

function confirmDeleteNews(id, title) {
  const dialog = document.getElementById('modalDialog');
  dialog.innerHTML = `
    <div class="admin-modal-header">
      <h3 class="admin-modal-title" style="color:#DC2626;">Delete Article</h3>
      <button class="admin-modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="admin-modal-body">
      <p>Are you sure you want to delete <strong>${escapeHtml(title)}</strong>?</p>
    </div>
    <div class="admin-modal-footer">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" onclick="executeDeleteNews(${id})">Delete</button>
    </div>
  `;
  openModal();
}

async function executeDeleteNews(id) {
  try {
    await apiFetch(`/admin/news/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Article deleted', 'success');
    renderNewsTab(document.getElementById('tabContent'));
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 13. Tab: Contact Details Management
// ==============================================================================

async function renderContactTab(container) {
  const contact = await apiFetch('/contact');

  container.innerHTML = `
    <div class="admin-card" style="max-width:750px;">
      <div class="admin-card-header">
        <div>
          <h3 class="admin-card-title">Official EYESOFT Contact Information</h3>
          <p class="admin-card-desc">Synchronized across website footer, contact box, and inquiries</p>
        </div>
      </div>

      <form onsubmit="submitUpdateContact(event)" style="padding:1.5rem;">
        <div class="form-group">
          <label class="form-label">Headquarters Address *</label>
          <textarea id="contactAddress" class="form-control" rows="3" required>${escapeHtml(contact.address || '')}</textarea>
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

        <button type="submit" class="btn-primary" style="margin-top:0.5rem;">
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
    await apiFetch('/admin/contact', { method: 'PUT', body: JSON.stringify(payload) });
    showToast('Contact details successfully updated', 'success');
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 14. Tab: Settings, Security & Diagnostics
// ==============================================================================

function renderSettingsTab(container) {
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; max-width:980px;">
      <!-- Password Update Card -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <h3 class="admin-card-title">Security & Password</h3>
            <p class="admin-card-desc">Update administrator login password with bcrypt hashing</p>
          </div>
        </div>

        <form onsubmit="submitChangePassword(event)" style="padding:1.5rem;">
          <div class="form-group">
            <label class="form-label">Current Password *</label>
            <input type="password" id="currentPass" class="form-control" required placeholder="••••••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">New Password * (Min 6 characters)</label>
            <input type="password" id="newPass" class="form-control" required minlength="6" placeholder="••••••••••••">
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password *</label>
            <input type="password" id="confirmPass" class="form-control" required minlength="6" placeholder="••••••••••••">
          </div>

          <button type="submit" class="btn-primary" style="margin-top:0.5rem;">
            <span>Update Security Password</span>
          </button>
        </form>
      </div>

      <!-- System Diagnostics & Database Info -->
      <div class="admin-card">
        <div class="admin-card-header">
          <div>
            <h3 class="admin-card-title">System Diagnostics</h3>
            <p class="admin-card-desc">Environment and database status</p>
          </div>
        </div>

        <div style="padding:1.5rem; font-size:0.875rem;">
          <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #E2E8F0;">
            <span style="font-weight:700; color:#0F172A; display:block;">Active Administrator:</span>
            <span style="color:#64748B;">${state.adminUser?.full_name || 'Admin'} (${state.adminUser?.username || 'admin'})</span>
          </div>
          <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #E2E8F0;">
            <span style="font-weight:700; color:#0F172A; display:block;">Database Engine:</span>
            <span style="color:#059669; font-weight:600;">SQLite 3 &bull; Local Persistent Storage</span>
          </div>
          <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #E2E8F0;">
            <span style="font-weight:700; color:#0F172A; display:block;">Live Sync Polling Rate:</span>
            <span style="color:#64748B;">4,000 ms (Real-time review capture)</span>
          </div>
          <div style="margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #E2E8F0;">
            <span style="font-weight:700; color:#0F172A; display:block;">Dedicated Admin URL:</span>
            <span style="color:#0066FF; font-family:monospace;">/admin/ &bull; /admin</span>
          </div>
          <div>
            <span style="font-weight:700; color:#0F172A; display:block;">Security Shield:</span>
            <span style="color:#64748B;">JWT Bearer Authentication + Bcrypt Encryption</span>
          </div>
        </div>
      </div>
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
    showToast('Password updated. Please log in with your new password.', 'success');
    logout();
  } catch (err) {
    showToast(`Password update failed: ${err.message}`, 'error');
  }
}

// ==============================================================================
// 15. Modal & Toast Helpers
// ==============================================================================

function openModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('open');
}

function closeModalOnBackdrop(e) {
  if (e.target.id === 'adminModal') {
    closeModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function renderStarsHtml(rating) {
  const full = Math.round(rating);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= full ? '★' : '☆';
  }
  return html;
}

function formatDate(isoStr) {
  if (!isoStr) return 'Recent';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoStr.split('T')[0] || isoStr;
  }
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
