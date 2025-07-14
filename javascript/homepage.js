// Function to render a single product card (reuse from designer-products.js)
function renderProductCard(design) {
  let imageSrc = '';
  if (design.designImage && design.designImage.startsWith('data:image/')) {
    imageSrc = design.designImage;
  } else if (design.productType && design.productType.toLowerCase().includes('hoodie')) {
    imageSrc = 'resources/hoodie-demo.png';
  } else {
    imageSrc = 'resources/tshirt-model.png';
  }
  // Show "New" label if uploaded in last 24h
  const isNew = (() => {
    const uploadDate = new Date(design.createdAt || design.uploadDate || 0);
    const now = new Date();
    const timeDifference = now - uploadDate;
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference <= 24;
  })();
  return `
    <div class="product-card" style="cursor:pointer" onclick="window.location.href='products.html?designId=${encodeURIComponent(design.designId)}'">
      <img src="${imageSrc}" alt="${design.productType || 'Product'}">
      ${isNew ? '<span class="new-label">New</span>' : ''}
      ${design.isCustomDesign ? '<span class="custom-design-label" style="position:absolute;top:10px;right:10px;background:#7B3FF2;color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:600;">🎨 Thiết kế tùy chỉnh</span>' : ''}
      <h3>${design.name || 'Tên thiết kế'}</h3>
      <p>by <b>${design.username || 'Designer'}</b></p>
      <p class="price">${design.price ? design.price.toLocaleString() : ''} VND</p>
      <button class="btn btn-secondary" onclick="window.location.href='products.html?designId=${encodeURIComponent(design.designId)}'; event.stopPropagation();">Xem sản phẩm</button>
    </div>
  `;
}

function toggleDropdown() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown.classList.contains('show')) {
    dropdown.classList.remove('show');
  } else {
    dropdown.classList.add('show');
  }
}

// Clear currentUser and token on logout
window.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('a[href="choose-login.html"], .logout-btn').forEach(link => {
    link.addEventListener('click', function() {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    });
  });
});

function loadFeaturedProducts() {
  const container = document.getElementById('featured-products');
  if (!container) {
    console.log('Featured products container not found');
    return;
  }
  
  console.log('Loading featured products...');
  // Show spinner immediately
  container.innerHTML = '<div class="loading-spinner"></div>';
  
  // Start timer and fetch in parallel
  const minDelay = new Promise(resolve => setTimeout(resolve, 500));
  const fetchDesigns = fetch('/api/designs')
    .then(response => response.json())
    .catch(() => null);

  Promise.all([minDelay, fetchDesigns]).then(([_, designs]) => {
    console.log('Featured products loaded:', designs ? designs.length : 0);
    // Filter: at least 1 heart (likes/favorites/loveCount >= 1)
    const filtered = (Array.isArray(designs) ? designs : []).filter(d => (d.likes || d.favorites || d.loveCount || 0) >= 1);
    // Sort by most loved
    filtered.sort((a, b) => ((b.likes || b.favorites || b.loveCount || 0) - (a.likes || a.favorites || a.loveCount || 0)));
    // Show up to 8 featured products
    const featured = filtered.slice(0, 8);
    
    if (featured.length > 0) {
      container.innerHTML = featured.map(renderProductCard).join('');
      // Animate product cards with staggered delay
      const cards = container.querySelectorAll('.product-card');
      cards.forEach((card, idx) => {
        card.classList.add('fade-in');
        setTimeout(() => {
          card.classList.add('animated');
        }, idx * 100);
      });
    } else {
      container.innerHTML = '<p class="empty-message">Chưa có sản phẩm nổi bật nào.</p>';
    }
  });
}

function loadDesignerProducts() {
  const container = document.getElementById('designer-products');
  if (!container) {
    console.log('Designer products container not found');
    return;
  }
  
  console.log('Loading designer products...');
  // Show spinner immediately
  container.innerHTML = '<div class="loading-spinner"></div>';
  
  // Start timer and fetch in parallel
  const minDelay = new Promise(resolve => setTimeout(resolve, 500));
  const fetchDesigns = fetch('/api/designs')
    .then(response => response.json())
    .catch(() => null);

  Promise.all([minDelay, fetchDesigns]).then(([_, designs]) => {
    console.log('Designer products loaded:', designs ? designs.length : 0);
    // Sort by newest first
    const sorted = (Array.isArray(designs) ? designs : []).sort((a, b) => new Date(b.createdAt || b.uploadDate || 0) - new Date(a.createdAt || a.uploadDate || 0));
    // Show up to 8 latest designs
    const latest = sorted.slice(0, 8);
    
    if (latest.length > 0) {
      container.innerHTML = latest.map(renderProductCard).join('');
      // Animate product cards with staggered delay
      const cards = container.querySelectorAll('.product-card');
      cards.forEach((card, idx) => {
        card.classList.add('fade-in');
        setTimeout(() => {
          card.classList.add('animated');
        }, idx * 100);
      });
    } else {
      container.innerHTML = '<p class="empty-message">Chưa có thiết kế mới nào.</p>';
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  loadFeaturedProducts();
  loadDesignerProducts();
});
// Do the same for designer products if needed