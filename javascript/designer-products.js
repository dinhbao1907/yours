// Function to render a single product card
function renderProductCard(design) {
  // Use the actual design image if available, otherwise fallback
  let imageSrc = '';
  if (design.designImage && design.designImage.startsWith('data:image/')) {
    imageSrc = design.designImage;
  } else {
    imageSrc = 'resources/tshirt-white.png'; // fallback to plain shirt
  }

  // Only show custom tag for customer custom designs
  const isCustom = design.type === 'custom-design';
  const customTag = isCustom ? '<span class="custom-design-label" style="position:absolute;top:10px;right:10px;background:#7B3FF2;color:white;padding:4px 8px;border-radius:12px;font-size:12px;font-weight:600;">🎨 Thiết kế tuỳ chỉnh</span>' : '';

  return `
    <div class="product-card" style="cursor:pointer" onclick="window.location.href='products.html?designId=${encodeURIComponent(design.designId)}'">
      <img src="${imageSrc}" alt="${design.productType}">
      <span class="new-label">New</span>
      ${customTag}
      <h3>${design.name || 'Tên thiết kế'}</h3>
      <p>by <b>${design.username || 'Designer'}</b></p>
      <p class="price">${design.price ? design.price.toLocaleString() : ''} VND</p>
      <button class="btn btn-secondary" onclick="window.location.href='products.html?designId=${encodeURIComponent(design.designId)}'; event.stopPropagation();">Xem sản phẩm</button>
    </div>
  `;
}

// Function to load designer products
function loadDesignerProducts() {
  const container = document.getElementById('designer-products');
  if (!container) return;

  // Show loading state
  container.innerHTML = '<div class="loading-spinner"></div>';

  // Fetch designs from backend
  fetch('/api/designs')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(designs => {
      if (Array.isArray(designs) && designs.length > 0) {
        // Sort by newest (createdAt or uploadDate descending)
        const sorted = designs.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.uploadDate || 0);
          const dateB = new Date(b.createdAt || b.uploadDate || 0);
          return dateB - dateA;
        });
        // Show only the latest 5
        const latest = sorted.slice(0, 5);
        container.innerHTML = latest.map(renderProductCard).join('');
        // Animate product cards with staggered delay
        const cards = container.querySelectorAll('.product-card');
        cards.forEach((card, idx) => {
          setTimeout(() => {
            card.classList.add('animated');
          }, idx * 100);
        });
      } else {
        container.innerHTML = '<p>Chưa có thiết kế nào được đăng tải.</p>';
      }
    })
    .catch(error => {
      console.error('Error loading designer products:', error);
      container.innerHTML = '<p>Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.</p>';
    });
}

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadDesignerProducts); 