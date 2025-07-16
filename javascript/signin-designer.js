// Dynamic API base URL for local and production
window.API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://yours-fashion.vercel.app";

// Spinner and notification CSS injection
(function() {
  if (!document.getElementById('spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `
    .spinner-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(255,255,255,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;
      display: none;
    }
    .spinner {
      border: 6px solid #eee; border-top: 6px solid #7B3FF2; border-radius: 50%; width: 48px; height: 48px; animation: spin 1s linear infinite;
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .notification-box {
      position: fixed; top: 32px; left: 50%; transform: translateX(-50%); background: #e74c3c; color: #fff; padding: 14px 32px; border-radius: 8px; font-size: 1rem; font-weight: 500; z-index: 10001; box-shadow: 0 2px 12px rgba(0,0,0,0.08); display: none; animation: fadeIn 0.3s;
    }
    .notification-box.success { background: #4CAF50; }
    @keyframes fadeIn { from { opacity: 0; top: 0; } to { opacity: 1; top: 32px; } }
    `;
    document.head.appendChild(style);
  }
  if (!document.getElementById('spinner-overlay')) {
    const spinner = document.createElement('div');
    spinner.id = 'spinner-overlay';
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(spinner);
  }
})();

function showSpinner(show) {
  document.getElementById('spinner-overlay').style.display = show ? 'flex' : 'none';
}
function showNotification(message, type = 'error') {
  let box = document.querySelector('.notification-box');
  if (!box) {
    box = document.createElement('div');
    box.className = 'notification-box';
    document.body.appendChild(box);
  }
  box.textContent = message;
  box.className = 'notification-box' + (type === 'success' ? ' success' : '');
  box.style.display = 'block';
  setTimeout(() => { box.style.display = 'none'; }, 2200);
}

document.getElementById('signin-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showSpinner(true);
  const usernameOrEmail = document.getElementById('usernameOrEmail').value;
  const password = document.getElementById('password').value;
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/signin-designer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    const data = await response.json();
    showSpinner(false);
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      showNotification('Đăng nhập thành công!', 'success');
      setTimeout(() => { window.location.href = 'designer-store.html'; }, 800);
    } else {
      showNotification(data.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    showSpinner(false);
    showNotification('Lỗi kết nối: ' + error.message);
  }
});