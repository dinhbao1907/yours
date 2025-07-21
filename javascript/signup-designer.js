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
function showNotification(message, type = 'success') {
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

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  showSpinner(true);
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  // Username validation: at least 6 chars, only letters and numbers
  if (!/^[A-Za-z0-9]{6,}$/.test(username)) {
    showSpinner(false);
    showNotification('Tên đăng nhập phải có ít nhất 6 ký tự, chỉ bao gồm chữ cái và số.', 'error');
    return;
  }
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/signup-designer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });
    const data = await response.json();
    showSpinner(false);
    // Notification box logic remains as before
    const notificationBox = document.createElement('div');
    notificationBox.className = 'notification-box';
    notificationBox.textContent = data.message;
    document.body.appendChild(notificationBox);
    setTimeout(() => notificationBox.style.display = 'block', 10);
    if (response.status === 201) {
      let currentEmail = email;
      document.getElementById('verificationModal').style.display = 'flex';
      setTimeout(() => notificationBox.remove(), 1500);
      document.getElementById('verification-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentEmail) {
          showNotification('Không tìm thấy email của tài khoản. Vui lòng đăng ký lại.', 'error');
          return;
        }
        const verificationCode = document.getElementById('verificationCode').value;
        const requestBody = { email: currentEmail, verificationCode };
        try {
          const response = await fetch(`${window.API_BASE_URL}/api/verify-designer-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();
          const verifyBox = document.createElement('div');
          verifyBox.className = 'notification-box';
          verifyBox.textContent = data.message;
          document.body.appendChild(verifyBox);
          setTimeout(() => verifyBox.style.display = 'block', 10);
          if (response.status === 200) {
            setTimeout(() => {
              verifyBox.remove();
              document.getElementById('verificationModal').style.display = 'none';
              window.location.href = 'signin-designer.html';
            }, 1500);
          } else {
            setTimeout(() => verifyBox.remove(), 1500);
          }
        } catch (error) {
          showNotification('Lỗi: ' + error.message, 'error');
        }
      });
      window.resendVerificationCode = async () => {
        if (!currentEmail) {
          showNotification('Không tìm thấy email của tài khoản. Vui lòng đăng ký lại.', 'error');
          return;
        }
        const requestBody = { email: currentEmail };
        try {
          const response = await fetch(`${window.API_BASE_URL}/api/resend-designer-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          const data = await response.json();
          showNotification(data.message, response.ok ? 'success' : 'error');
        } catch (error) {
          showNotification('Lỗi: ' + error.message, 'error');
        }
      };
    } else {
      setTimeout(() => notificationBox.remove(), 1500);
    }
  } catch (error) {
    showSpinner(false);
    showNotification('Lỗi: ' + error.message, 'error');
  }
});