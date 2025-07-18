// Dynamic API base URL for local and production
window.API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://yours-fashion.vercel.app";

// Lấy token từ localStorage
const token = localStorage.getItem("token");
if (!token) {
  alert("Vui lòng đăng nhập để tiếp tục");
  window.location.href = "login.html";
}

// Khởi tạo Flatpickr
flatpickr("#dob", {
  dateFormat: "d/m/Y",
  maxDate: "today",
  defaultDate: null,
  disableMobile: true,
  onOpen: function (selectedDates, dateStr, instance) {
    instance.calendarContainer.style.fontFamily = "'Segoe UI', sans-serif";
  },
});

// Lấy thông tin người dùng khi trang được tải
window.onload = async () => {
  // Show loading skeleton
  const loadingContainer = document.getElementById("profileLoadingContainer");
  const profileContainer = document.getElementById("editProfileContainer");
  
  if (loadingContainer) loadingContainer.style.display = "block";
  if (profileContainer) profileContainer.style.display = "none";
  
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      const user = data.user;
      console.log("User data loaded:", user);
      
      // Populate form fields
      document.getElementById("name").value = user.name || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("phone").value = user.phone || "";
      document.getElementById(
        "usernameDisplay"
      ).textContent = `Tên đăng nhập: ${user.username}`;
      
      if (user.gender) {
        document.querySelector(
          `input[name="gender"][value="${user.gender}"]`
        ).checked = true;
      }
      
      if (user.dob) {
        const dob = new Date(user.dob);
        document.getElementById("dob").value = `${dob
          .getDate()
          .toString()
          .padStart(2, "0")}/${(dob.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${dob.getFullYear()}`;
      }
      
      if (user.avatar) {
        document.getElementById("avatarImage").src = user.avatar;
      }
      
      // Hide loading and show profile with fade-in animation
      setTimeout(() => {
        if (loadingContainer) loadingContainer.style.display = "none";
        if (profileContainer) {
          profileContainer.style.display = "block";
          profileContainer.classList.add("fade-in");
        }
      }, 500); // Small delay for smooth transition
      
    } else {
      console.error("Error fetching user:", data.message);
      alert(data.message);
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Có lỗi xảy ra khi tải thông tin người dùng");
  }
};

// Hàm cập nhật thông tin người dùng
async function updateProfile(data) {
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Cập nhật thông tin thành công!");
      window.location.reload();
    } else {
      alert(result.message || "Có lỗi xảy ra khi cập nhật thông tin");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Có lỗi xảy ra khi cập nhật thông tin");
  }
}

// Xử lý sự kiện submit form
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Đang lưu...";
  saveBtn.classList.add("pulse");

  try {
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      gender: formData.get("gender"),
      dob: formData.get("dob"),
    };

    // Xử lý ngày sinh từ định dạng d/m/Y sang ISO
    if (data.dob) {
      const [day, month, year] = data.dob.split("/");
      data.dob = `${year}-${month}-${day}`;
    }

    // Xử lý avatar
    const avatarFile = document.getElementById("avatarUpload").files[0];
    if (avatarFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        data.avatar = reader.result; // base64 string
        await updateProfile(data);
      };
      reader.readAsDataURL(avatarFile);
    } else {
      await updateProfile(data);
    }
  } catch (error) {
    console.error("Error processing form:", error);
    alert("Có lỗi xảy ra khi xử lý form");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Lưu";
    saveBtn.classList.remove("pulse");
  }
});

// Xử lý sự kiện upload avatar
document
  .getElementById("avatarUpload")
  .addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB
        alert("File quá lớn. Vui lòng chọn file nhỏ hơn 1MB");
        this.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("avatarImage").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

// Xử lý dropdown menu
function toggleDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) {
    dropdown.classList.toggle("show");
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const userBtn = document.getElementById("accountBtn");
  const dropdown = document.getElementById("userDropdown");
  if (userBtn && dropdown && !userBtn.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.remove("show");
  }
});

// Function to activate tab (for navigation buttons)
function activateTab(tabName) {
  if (tabName === 'home') {
    window.location.replace('index.html');
  } else if (tabName === 'design') {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để sử dụng tính năng thiết kế');
      window.location.href = 'choose-login.html';
    } else {
      window.location.replace('design.html');
    }
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentUserName');
  localStorage.removeItem('userAvatar');
  alert('Đã đăng xuất thành công!');
  window.location.href = 'choose-login.html';
}

// Add event listeners for dropdown items
document.addEventListener('DOMContentLoaded', function() {
  // Handle logout link
  const logoutLink = document.querySelector('a[href="choose-login.html"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  }
});

// --- ORDER HISTORY LOGIC ---
async function loadOrderHistory() {
  const token = localStorage.getItem('token');
  const orderHistoryContainer = document.getElementById('orderHistoryContainer');
  if (!orderHistoryContainer) return;
  
  // Show loading skeleton
  orderHistoryContainer.innerHTML = `
    <h2 style="color:#5B22D4;text-align:center;margin-bottom:24px;">Lịch Sử Đơn Hàng</h2>
    <div class="order-history-skeleton">
      <div class="skeleton-order-card">
        <div class="skeleton-order-header"></div>
        <div class="skeleton-product-grid">
          <div class="skeleton-product-card">
            <div class="skeleton-product-image"></div>
            <div class="skeleton-product-title"></div>
            <div class="skeleton-product-info"></div>
            <div class="skeleton-product-price"></div>
          </div>
          <div class="skeleton-product-card">
            <div class="skeleton-product-image"></div>
            <div class="skeleton-product-title"></div>
            <div class="skeleton-product-info"></div>
            <div class="skeleton-product-price"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  try {
    const res = await fetch(`${window.API_BASE_URL}/api/my-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      orderHistoryContainer.innerHTML = `<p style="color:#e74c3c;">${data.message || 'Lỗi khi tải đơn hàng.'}</p>`;
      return;
    }
    const orders = data.orders || [];
    if (!orders.length) {
      orderHistoryContainer.innerHTML = '<p>Bạn chưa có đơn hàng nào.</p>';
      return;
    }
    // Store orders globally for filtering
    window._allOrders = orders;
    renderOrderHistory(orders);
    // Setup filter event
    const statusFilter = document.getElementById('orderStatusFilter');
    if (statusFilter) {
      statusFilter.onchange = function() {
        const selected = statusFilter.value;
        let filtered = orders;
        if (selected !== 'all') {
          filtered = orders.filter(o => o.status === selected);
        }
        renderOrderHistory(filtered);
      };
    }
  } catch (error) {
    orderHistoryContainer.innerHTML = '<p style="color:#e74c3c;">Lỗi khi tải đơn hàng.</p>';
  }
}

function renderOrderHistory(orders) {
  const orderHistoryContainer = document.getElementById('orderHistoryContainer');
  if (!orderHistoryContainer) return;
  // Get existing reviews to check which products have been reviewed
  const username = getUsernameFromToken() || localStorage.getItem('currentUser');
  let existingReviews = window._existingReviews || [];
  let html = '';
  
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const delayClass = `animate-delay-${(i % 5) + 1}`;
    html += `<div class="order-block slide-in-up ${delayClass}">\n        <div class="order-header">Mã đơn: <b>${order.orderCode}</b> | Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')} | Trạng thái: <span class="order-status">${getStatusText(order.status)}</span></div>\n        <div class="order-items" style="display: flex; flex-wrap: wrap; gap: 20px;">`;
    
    // Render store products
    for (let j = 0; j < order.items.length; j++) {
      const item = order.items[j];
      const canReview = order.status === 'DELIVERED_FINAL';
      const itemDesignId = item.designId || item.productId;
      const hasReviewed = existingReviews.some(review => review.designId === itemDesignId);
      const productLink = `products.html?designId=${encodeURIComponent(item.designId || item.productId || '')}`;
      const productDelayClass = `animate-delay-${((j + 1) % 3) + 1}`;
      
      html += `<div class="product-card scale-in ${productDelayClass}" style="min-width:220px;max-width:300px;width:100%;background:#fff;border:1.5px solid #eee;border-radius:15px;padding:18px 18px 24px 18px;text-align:center;display:flex;flex-direction:column;justify-content:flex-start;position:relative;box-shadow:0 6px 16px rgba(90,34,212,0.10);overflow:hidden;margin:18px 12px 32px 12px;">
        <a href="${productLink}" style="display:block;text-decoration:none;color:inherit;">
          <img src="${item.image || 'resources/tshirt-model.png'}" alt="${item.name}" style="width:auto;max-width:220px;max-height:180px;display:block;margin:0 auto;border-radius:10px;object-fit:unset;">
          <h3 style="color:#5B22D4;font-size:18px;margin:10px 0 5px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</h3>
        </a>
        <p style="color:#666;font-size:14px;margin:5px 0;">Size: ${item.size || ''}</p>
        <p class="price" style="color:#5B22D4;font-weight:bold;font-size:16px;margin-top:auto;display:flex;align-items:center;justify-content:center;gap:10px;">${item.price.toLocaleString()} VND x ${item.quantity}</p>`;
      
      if (canReview && itemDesignId) {
        if (hasReviewed) {
          html += `<button class="review-btn" disabled style="background:#28a745;cursor:default;">Đã đánh giá</button>`;
        } else {
          html += `<button class="review-btn bounce-in" data-design-id="${itemDesignId}">Đánh giá sản phẩm</button>`;
        }
      }
      html += `</div>`;
    }
    
    // Render custom design if present
    if (order.customDesign && order.customDesign.designImage) {
      html += `
        <div class="product-card scale-in animate-delay-2" style="min-width:220px;max-width:300px;width:100%;background:#fff;border:1.5px solid #eee;border-radius:15px;padding:18px 18px 24px 18px;text-align:center;display:flex;flex-direction:column;justify-content:flex-start;position:relative;box-shadow:0 6px 16px rgba(90,34,212,0.10);overflow:hidden;margin:18px 12px 32px 12px;">
          <img src="${order.customDesign.designImage}" alt="Thiết kế tùy chỉnh" style="width:auto;max-width:220px;max-height:180px;display:block;margin:0 auto;border-radius:10px;">
          <h3 style="color:#5B22D4;font-size:18px;margin:10px 0 5px 0;">Thiết kế tùy chỉnh</h3>
          <p style="color:#666;font-size:14px;margin:5px 0;">Loại: ${order.customDesign.designType || ''}</p>
          <p style="color:#666;font-size:14px;margin:5px 0;">Size: ${order.customDesign.size || ''}</p>
          <p style="color:#666;font-size:14px;margin:5px 0;">Số lượng: ${order.customDesign.quantity || 1}</p>
        </div>
      `;
    }
    html += '</div></div>';
  }
  
  orderHistoryContainer.innerHTML = `<h2 style="color:#5B22D4;text-align:center;margin-bottom:24px;" class="bounce-in">Lịch Sử Đơn Hàng</h2>` + html;
  attachReviewButtons();
}

window.showOrderHistory = function() {
  // Hide all containers with slide-out animation
  const containers = ['editProfileContainer', 'changeCredentialsContainer', 'draftsContainer'];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container && container.style.display !== 'none') {
      container.style.transform = 'translateX(100px)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    }
  });
  
  // Show order history with slide-in animation
  const orderHistoryContainer = document.getElementById('orderHistoryContainer');
  const filterBar = document.getElementById('orderHistoryFilterBar');
  
  if (orderHistoryContainer) {
    orderHistoryContainer.style.display = 'block';
    orderHistoryContainer.style.transform = 'translateX(50px)';
    orderHistoryContainer.style.opacity = '0';
    orderHistoryContainer.style.transition = 'all 0.4s ease-out';
    
    setTimeout(() => {
      orderHistoryContainer.style.transform = 'translateX(0)';
      orderHistoryContainer.style.opacity = '1';
    }, 100);
  }
  
  if (filterBar) {
    filterBar.style.display = 'block';
    filterBar.style.transform = 'translateY(-20px)';
    filterBar.style.opacity = '0';
    filterBar.style.transition = 'all 0.4s ease-out 0.2s';
    
    setTimeout(() => {
      filterBar.style.transform = 'translateY(0)';
      filterBar.style.opacity = '1';
    }, 300);
  }
  
  // Set sidebar active state
  document.querySelectorAll('.sidebar-action-btn').forEach(btn => btn.classList.remove('active'));
  const orderBtn = Array.from(document.querySelectorAll('.sidebar-action-btn')).find(btn => btn.textContent.includes('Lịch sử đơn hàng'));
  if (orderBtn) orderBtn.classList.add('active');
  
  // Load order history when tab is shown
  loadOrderHistory();
};

window.showEditProfile = function() {
  // Hide all containers with slide-out animation
  const containers = ['orderHistoryContainer', 'changeCredentialsContainer', 'draftsContainer'];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container && container.style.display !== 'none') {
      container.style.transform = 'translateX(-100px)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    }
  });
  
  // Hide the filter bar
  const filterBar = document.getElementById('orderHistoryFilterBar');
  if (filterBar) {
    filterBar.style.display = 'none';
  }
  
  // Show edit profile with slide-in animation
  const editProfileContainer = document.getElementById('editProfileContainer');
  if (editProfileContainer) {
    editProfileContainer.style.display = 'block';
    editProfileContainer.style.transform = 'translateX(-50px)';
    editProfileContainer.style.opacity = '0';
    editProfileContainer.style.transition = 'all 0.4s ease-out';
    
    setTimeout(() => {
      editProfileContainer.style.transform = 'translateX(0)';
      editProfileContainer.style.opacity = '1';
    }, 100);
  }
  
  // Set sidebar active state
  document.querySelectorAll('.sidebar-action-btn').forEach(btn => btn.classList.remove('active'));
  const editBtn = Array.from(document.querySelectorAll('.sidebar-action-btn')).find(btn => btn.textContent.includes('Thông tin cá nhân'));
  if (editBtn) editBtn.classList.add('active');
};

// --- REVIEW MODAL LOGIC (copied/adapted from product.js) ---
let selectedReviewDesignId = null;
let selectedRating = 0;

// Open the review modal for a specific designId
function openReviewModal(designId) {
  console.log('Opening review modal for designId:', designId);
  selectedReviewDesignId = designId;
  const currentUser = localStorage.getItem('currentUser') || getUsernameFromToken() || 'User';
  const currentUserName = localStorage.getItem('currentUserName') || currentUser;
  const userAvatar = localStorage.getItem('userAvatar') || 'resources/user-circle.png';
  
  const userNameElement = document.getElementById('userName');
  const userAvatarElement = document.getElementById('userAvatar');
  const modal = document.getElementById('reviewModal');
  
  console.log('Modal elements found:', { userNameElement, userAvatarElement, modal });
  
  if (userNameElement && userAvatarElement && modal) {
    userNameElement.textContent = currentUserName;
    userAvatarElement.src = userAvatar;
    modal.classList.add('show');
    console.log('Modal opened successfully');
    // Reset rating and clear stars
    selectedRating = 0;
    document.querySelectorAll('.star-rating i').forEach(s => s.classList.remove('selected'));
    // Attach star rating listeners every time modal is opened
    document.querySelectorAll('.star-rating i').forEach(star => {
      star.onclick = function() {
        selectedRating = parseInt(star.getAttribute('data-value'));
        document.querySelectorAll('.star-rating i').forEach((s, idx) => {
          if (idx < selectedRating) s.classList.add('selected');
          else s.classList.remove('selected');
        });
      };
    });
    // Attach review form submit event listener here
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.onsubmit = async function(e) {
        console.log('Review form submit event triggered!');
        e.preventDefault();
        console.log('Form submission prevented, starting review submission process...');
        
        const designId = selectedReviewDesignId;
        const color = document.getElementById('color').value;
        const size = document.getElementById('size').value;
        const descriptionMatch = document.getElementById('descriptionMatch').value;
        const material = document.getElementById('material').value;
        const feedback = document.getElementById('feedback').value;
        // Get username and avatar from token or localStorage
        const username = getUsernameFromToken() || localStorage.getItem('currentUser') || 'Ẩn danh';
        const avatar = localStorage.getItem('userAvatar') || 'resources/user-circle.png';
        
        console.log('Form data collected:', { designId, color, size, descriptionMatch, material, feedback, username, avatar });
        
        // Xử lý chọn sao
        const stars = document.querySelectorAll('.star-rating i');
        let selectedRating = 0;
        stars.forEach((star, idx) => {
          if (star.classList.contains('selected')) selectedRating = idx + 1;
        });
        
        // Validation
        console.log('Starting validation...');
        console.log('Selected rating:', selectedRating);
        console.log('DesignId:', designId);
        console.log('Form fields:', { color, size, descriptionMatch, material, feedback: feedback.trim() });
        
        if (!selectedRating) {
          console.log('Validation failed: No rating selected');
          alert('Vui lòng chọn số sao đánh giá!');
          return;
        }
        if (!designId) {
          console.log('Validation failed: No designId');
          alert('Không tìm thấy sản phẩm để đánh giá.');
          return;
        }
        if (!color || !size || !descriptionMatch || !material) {
          console.log('Validation failed: Missing required fields');
          alert('Vui lòng điền đầy đủ thông tin đánh giá!');
          return;
        }
        if (!feedback.trim()) {
          console.log('Validation failed: No feedback');
          alert('Vui lòng nhập nhận xét chi tiết!');
          return;
        }
        if (feedback.trim().length < 10) {
          console.log('Validation failed: Feedback too short');
          alert('Nhận xét phải có ít nhất 10 ký tự!');
          return;
        }
        
        console.log('Validation passed, proceeding with submission...');
        
        // Disable submit button to prevent double submission
        const submitBtn = document.querySelector('.review-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang gửi...';
        
        try {
          console.log('Submitting review from user-profile with data:', {
            designId,
            username,
            avatar,
            rating: selectedRating,
            feedback: feedback.trim(),
            color,
            size,
            descriptionMatch,
            material
          });
          
          // Only include avatar if it is not the default
          const reviewData = {
            designId,
            username,
            rating: selectedRating,
            feedback: feedback.trim(),
            color,
            size,
            descriptionMatch,
            material
          };
          if (avatar && avatar !== 'resources/user-circle.png') {
            reviewData.avatar = avatar;
          }
          const response = await fetch(`${window.API_BASE_URL}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
          });
          
          console.log('Review submission response status:', response.status);
          console.log('Review submission response headers:', response.headers);
          
          const data = await response.json();
          console.log('Review submission response data:', data);
          
          if (response.ok) {
            alert('Cảm ơn bạn đã gửi đánh giá!');
            document.getElementById('reviewForm').reset();
            stars.forEach(s => s.classList.remove('selected'));
            closeReviewModal();
            // Refresh reviews and order history immediately
            await loadReviews(designId);
            await loadOrderHistory();
            // Trigger storage event for other tabs
            localStorage.setItem('review_update', JSON.stringify({ designId, timestamp: Date.now() }));
          } else {
            alert(data.message || 'Lỗi khi gửi đánh giá!');
          }
        } catch (error) {
          console.error('Review submission error:', error);
          alert('Lỗi kết nối khi gửi đánh giá! Vui lòng thử lại.');
        } finally {
          // Re-enable submit button
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      };
    }
  } else {
    console.error('Could not find required modal elements');
  }
}

// Close the review modal
function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Helper to extract username from JWT token
function getUsernameFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || payload.name || payload.user || null;
  } catch (e) {
    return null;
  }
}

// Thank You Popup Functions
function showThankYouPopup() {
  const modal = document.getElementById('thankYouModal');
  if (modal) {
    modal.classList.add('show');
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeThankYouModal();
    }, 3000);
  }
}

function closeThankYouModal() {
  const modal = document.getElementById('thankYouModal');
  if (modal) {
    modal.classList.remove('show');
  }
}

// Close thank you modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('thankYouModal');
  if (modal && e.target === modal) {
    modal.classList.remove('show');
  }
});

// Add this helper at the top or near the order history rendering
function getStatusText(status) {
  const statusMap = {
    'PENDING': 'Chờ thanh toán',
    'PAID': 'Đã thanh toán',
    'DESIGN_IN_PROGRESS': 'Đang thiết kế',
    'DESIGN_APPROVED': 'Thiết kế đã duyệt',
    'DESIGN_REJECTED': 'Thiết kế bị từ chối',
    'COMPLETED': 'Đang làm áo',
    'DELIVERED': 'Đang giao',
    'DELIVERED_FINAL': 'Đã giao',
    'CANCELED': 'Đã hủy'
  };
  return statusMap[status] || status;
}

// Attach openReviewModal to all review buttons in order history after rendering
function attachReviewButtons() {
  console.log('Attaching review buttons...');
  const reviewButtons = document.querySelectorAll('.review-btn');
  console.log('Found', reviewButtons.length, 'review buttons');
  
  reviewButtons.forEach(btn => {
    if (!btn.disabled) {
      btn.onclick = function() {
        const designId = btn.getAttribute('data-design-id');
        console.log('Review button clicked for designId:', designId);
        openReviewModal(designId);
      };
    }
  });
}

window.showChangeCredentials = function() {
  // Hide all containers with slide-out animation
  const containers = ['editProfileContainer', 'orderHistoryContainer', 'draftsContainer'];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container && container.style.display !== 'none') {
      container.style.transform = 'translateX(100px)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    }
  });
  
  // Hide the filter bar
  const filterBar = document.getElementById('orderHistoryFilterBar');
  if (filterBar) {
    filterBar.style.display = 'none';
  }
  
  // Show change credentials with slide-in animation
  const changeCredentialsContainer = document.getElementById('changeCredentialsContainer');
  if (changeCredentialsContainer) {
    changeCredentialsContainer.style.display = 'block';
    changeCredentialsContainer.style.transform = 'translateX(50px)';
    changeCredentialsContainer.style.opacity = '0';
    changeCredentialsContainer.style.transition = 'all 0.4s ease-out';
    
    setTimeout(() => {
      changeCredentialsContainer.style.transform = 'translateX(0)';
      changeCredentialsContainer.style.opacity = '1';
    }, 100);
  }
  
  // Set sidebar active state
  document.querySelectorAll('.sidebar-action-btn').forEach(btn => btn.classList.remove('active'));
  const credBtn = Array.from(document.querySelectorAll('.sidebar-action-btn')).find(btn => btn.textContent.includes('Đổi mật khẩu'));
  if (credBtn) credBtn.classList.add('active');
};

// Add function for drafts tab
window.showDrafts = async function() {
  // Hide all containers with slide-out animation
  const containers = ['editProfileContainer', 'orderHistoryContainer', 'changeCredentialsContainer'];
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container && container.style.display !== 'none') {
      container.style.transform = 'translateY(50px)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    }
  });
  // Hide the filter bar
  const filterBar = document.getElementById('orderHistoryFilterBar');
  if (filterBar) {
    filterBar.style.display = 'none';
  }
  // Show drafts with slide-in animation
  const draftsContainer = document.getElementById('draftsContainer');
  if (draftsContainer) {
    draftsContainer.style.display = 'block';
    draftsContainer.style.transform = 'translateY(50px)';
    draftsContainer.style.opacity = '0';
    draftsContainer.style.transition = 'all 0.4s ease-out';
    setTimeout(() => {
      draftsContainer.style.transform = 'translateY(0)';
      draftsContainer.style.opacity = '1';
    }, 100);
  }
  // Set sidebar active state
  document.querySelectorAll('.sidebar-action-btn').forEach(btn => btn.classList.remove('active'));
  const draftsBtn = Array.from(document.querySelectorAll('.sidebar-action-btn')).find(btn => btn.textContent.includes('Thiết Kế Nháp'));
  if (draftsBtn) draftsBtn.classList.add('active');

  // --- NEW: Load and render customer drafts from database ---
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/api/my-drafts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const drafts = await response.json();
        const list = document.getElementById('customerDraftsList');
        if (list) {
          if (!drafts.length) {
            list.innerHTML = '<p style="text-align:center;color:#8A4AF3;font-size:1.1rem;margin:32px 0;">Bạn chưa có thiết kế nháp nào.</p>';
          } else {
            list.innerHTML = drafts.map(draft => `
              <div class="draft-card" style="background:#fff;border:1.5px solid #eee;border-radius:15px;padding:18px 18px 24px 18px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;margin:18px auto;max-width:340px;box-shadow:0 6px 16px rgba(90,34,212,0.10);">
                <img src="${draft.designImage || 'resources/tshirt-model.png'}" alt="Thiết kế nháp" style="width:auto;max-width:220px;max-height:180px;display:block;margin:0 auto 12px auto;border-radius:10px;object-fit:contain;">
                <h3 style="color:#5B22D4;font-size:18px;margin:10px 0 5px 0;">${draft.name || 'Thiết kế nháp'}</h3>
                <p style="color:#666;font-size:14px;margin:5px 0;">Loại: ${draft.productType || ''}</p>
                <p style="color:#666;font-size:14px;margin:5px 0;">Màu: ${draft.color || ''}</p>
                <p style="color:#666;font-size:14px;margin:5px 0;">Giá: ${draft.price ? draft.price.toLocaleString('vi-VN') : '0'} VND</p>
                <div style="display:flex;gap:12px;width:100%;justify-content:center;">
                  <button onclick="window.location.href='design.html?designId=${encodeURIComponent(draft.designId)}'" style="background:#8A4AF3;color:white;border:none;border-radius:25px;padding:12px 24px;font-weight:bold;font-size:14px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 12px rgba(138,74,243,0.3);">Tiếp tục thiết kế</button>
                  <button onclick="deleteDraft('${draft.designId}')" style="background:#e74c3c;color:white;border:none;border-radius:25px;padding:12px 24px;font-weight:bold;font-size:14px;cursor:pointer;transition:all 0.3s ease;box-shadow:0 4px 12px rgba(231,76,60,0.3);">Xóa nháp</button>
                </div>
              </div>
            `).join('');
          }
        }
      } else {
        console.error('Failed to fetch drafts:', response.status);
        const list = document.getElementById('customerDraftsList');
        if (list) {
          list.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:1.1rem;margin:32px 0;">Không thể tải drafts. Vui lòng thử lại sau.</p>';
        }
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      const list = document.getElementById('customerDraftsList');
      if (list) {
        list.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:1.1rem;margin:32px 0;">Lỗi khi tải drafts.</p>';
      }
    }
  } else {
    const list = document.getElementById('customerDraftsList');
    if (list) {
      list.innerHTML = '<p style="text-align:center;color:#e74c3c;font-size:1.1rem;margin:32px 0;">Vui lòng đăng nhập để xem drafts.</p>';
    }
  }
};

// Handle change credentials form submit
const changeCredentialsForm = document.getElementById('changeCredentialsForm');
if (changeCredentialsForm) {
  changeCredentialsForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('changeCredentialsMessage');
    const submitBtn = changeCredentialsForm.querySelector('button[type="submit"]');
    messageDiv.textContent = '';
    messageDiv.style.color = '#e74c3c';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang cập nhật...';
    submitBtn.classList.add('pulse');
    
    const newUsername = document.getElementById('newUsername').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword) {
      messageDiv.textContent = 'Vui lòng nhập mật khẩu hiện tại.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Cập nhật';
      submitBtn.classList.remove('pulse');
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      messageDiv.textContent = 'Mật khẩu mới không khớp.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Cập nhật';
      submitBtn.classList.remove('pulse');
      return;
    }
    
    try {
      const res = await fetch(`${window.API_BASE_URL}/api/change-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newUsername, currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        messageDiv.style.color = '#27ae60';
        messageDiv.textContent = 'Cập nhật thành công!';
        submitBtn.textContent = 'Thành công';
        submitBtn.classList.remove('pulse');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        messageDiv.style.color = '#e74c3c';
        messageDiv.textContent = data.message || 'Có lỗi xảy ra.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cập nhật';
        submitBtn.classList.remove('pulse');
      }
    } catch (err) {
      messageDiv.style.color = '#e74c3c';
      messageDiv.textContent = 'Có lỗi xảy ra khi cập nhật.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Cập nhật';
      submitBtn.classList.remove('pulse');
    }
  });
}

let draftToDelete = null;

window.deleteDraft = function(designId) {
  draftToDelete = designId;
  document.getElementById('deleteDraftModal').style.display = 'flex';
};

// Patch: Only set onclick handlers if elements exist
const cancelDeleteDraftBtn = document.getElementById('cancelDeleteDraftBtn');
if (cancelDeleteDraftBtn) {
  cancelDeleteDraftBtn.onclick = function() {
    document.getElementById('deleteDraftModal').style.display = 'none';
    draftToDelete = null;
  };
}

const confirmDeleteDraftBtn = document.getElementById('confirmDeleteDraftBtn');
if (confirmDeleteDraftBtn) {
  confirmDeleteDraftBtn.onclick = async function() {
    if (!draftToDelete) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để thực hiện thao tác này.');
      return;
    }
    try {
      const response = await fetch(`${window.API_BASE_URL}/api/delete-draft?designId=${encodeURIComponent(draftToDelete)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      document.getElementById('deleteDraftModal').style.display = 'none';
      draftToDelete = null;
      if (response.ok) {
        alert('Đã xóa thiết kế nháp thành công!');
        showDrafts();
      } else {
        const data = await response.json();
        alert(data.message || 'Lỗi khi xóa thiết kế nháp.');
      }
    } catch (error) {
      document.getElementById('deleteDraftModal').style.display = 'none';
      draftToDelete = null;
      alert('Lỗi kết nối server khi xóa thiết kế nháp.');
    }
  };
}

// Only show the drafts tab in the sidebar for customers
window.addEventListener('DOMContentLoaded', function() {
  const draftDropdownItem = document.getElementById('draftDropdownItem');
  function getRoleFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) { return null; }
  }
  if (draftDropdownItem && getRoleFromToken() === 'customer') {
    draftDropdownItem.style.display = 'block';
  } else if (draftDropdownItem) {
    draftDropdownItem.style.display = 'none';
  }
});
