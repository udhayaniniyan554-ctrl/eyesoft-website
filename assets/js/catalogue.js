/**
 * EYESOFT Product Catalogue & Projector Showcase
 * Fully reactive data-driven catalogue ready for verified model integrations.
 */

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('productGridContainer');
  const searchInput = document.getElementById('catalogueSearchInput');
  const filterPills = document.querySelectorAll('.filter-pill');

  // Load products from JSON
  fetch('assets/data/products.json')
    .then(res => res.json())
    .then(data => {
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch(err => {
      console.error('Error loading products.json:', err);
    });

  function renderProducts(products) {
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #6B7280;">
          <svg style="width: 48px; height: 48px; margin: 0 auto 1rem; stroke: #9CA3AF; fill: none;" viewBox="0 0 24 24" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">No matching AV equipment found</h3>
          <p>Try searching for "projector", "podium", "screen", "mounting", or clear filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(prod => `
      <div class="product-card" data-category="${prod.category}">
        <div class="product-card-image-wrapper">
          <span class="product-category-tag">${prod.category}</span>
          <img class="product-card-img" src="${prod.image}" alt="${prod.name}" loading="lazy">
        </div>
        <div class="product-card-body">
          <h3 class="product-card-title">${prod.name}</h3>
          <p class="product-card-desc">${prod.tagline || prod.description.substring(0, 110) + '...'}</p>
          
          <div class="product-spec-preview">
            <div class="spec-preview-row">
              <span class="spec-preview-label">Brochure Source:</span>
              <span class="spec-preview-val">Page ${prod.brochure_page}</span>
            </div>
            ${prod.specifications['Model Series'] ? `
            <div class="spec-preview-row">
              <span class="spec-preview-label">Specification:</span>
              <span class="spec-preview-val" style="color: #6A1B9A;">Verified Multi-Brand</span>
            </div>` : ''}
          </div>

          <div class="product-card-actions">
            <button class="btn btn-outline btn-sm" onclick="openProductDetail('${prod.id}')" style="flex: 1;">
              View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.openEnquiryModal('Enquiry: ${prod.name}')" style="flex: 1;">
              Enquire
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Filter by Category
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-filter');
      applyFilters(cat, searchInput ? searchInput.value : '');
    });
  });

  // Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const activePill = document.querySelector('.filter-pill.active');
      const cat = activePill ? activePill.getAttribute('data-filter') : 'all';
      applyFilters(cat, e.target.value);
    });
  }

  function applyFilters(category, query) {
    const q = query.trim().toLowerCase();
    const filtered = allProducts.filter(prod => {
      const matchCat = category === 'all' || prod.category.toLowerCase().includes(category.toLowerCase());
      const matchSearch = !q || 
        prod.name.toLowerCase().includes(q) ||
        prod.description.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        (prod.applications && prod.applications.some(a => a.toLowerCase().includes(q)));
      return matchCat && matchSearch;
    });
    renderProducts(filtered);
  }

  // Global Product Detail Opener
  window.openProductDetail = function(productId) {
    const prod = allProducts.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    document.getElementById('modalProductTitle').textContent = prod.name;
    document.getElementById('modalProductCategory').textContent = prod.category;
    document.getElementById('modalProductImage').src = prod.image;
    document.getElementById('modalProductImage').alt = prod.name;
    document.getElementById('modalProductDesc').textContent = prod.description;
    
    // Specs Table
    const specsTable = document.getElementById('modalProductSpecs');
    if (specsTable) {
      specsTable.innerHTML = Object.entries(prod.specifications || {}).map(([key, val]) => `
        <tr>
          <th>${key}</th>
          <td>${val}</td>
        </tr>
      `).join('');
    }

    // Key features
    const featList = document.getElementById('modalProductFeatures');
    if (featList && prod.key_features) {
      featList.innerHTML = prod.key_features.map(f => `
        <li style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.875rem; color: #4B5563;">
          <svg style="width: 14px; height: 14px; stroke: #6A1B9A; fill: none; flex-shrink: 0; margin-top: 3px;" viewBox="0 0 24 24" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${f}</span>
        </li>
      `).join('');
    }

    // Action button
    const enquireBtn = document.getElementById('modalEnquireBtn');
    if (enquireBtn) {
      enquireBtn.onclick = () => {
        modal.classList.remove('open');
        window.openEnquiryModal(`Enquiry for: ${prod.name} (${prod.category})`);
      };
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
});
