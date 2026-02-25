// --- 1. TOGGLE FORM ---
function toggleForm(form) {
  const loginContainer = document.getElementById('login-container');
  const registerContainer = document.getElementById('register-container');

  if (form === 'register') {
    loginContainer.classList.add('hidden');
    registerContainer.classList.remove('hidden');
  } else {
    registerContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
  }
}

// Lấy danh sách users từ LocalStorage (Đồng bộ với hệ thống cũ)
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// --- 2. REGISTRATION (ĐĂNG KÝ) ---
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', function (e) {
  e.preventDefault();

  // Khuyên dùng: Gắn id hoặc name vào thẻ HTML (vd: id="reg-name") thay vì query theo type
  const inputs = registerForm.querySelectorAll('input:not([type="submit"])');
  const name = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value;
  const confirmPassword = inputs[3].value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  const usersList = getUsers();

  // Kiểm tra xem Email đã tồn tại chưa
  const emailExists = usersList.some(u => u.email === email);
  if (emailExists) {
      alert('This email is already registered. Please log in.');
      return;
  }

  // Tạo User mới theo chuẩn cấu trúc E-commerce của chúng ta
  const newUser = {
      id: Date.now(), // Tạo ID ngẫu nhiên bằng thời gian
      name: name,
      email: email,
      password: password, 
      role: "customer",
      status: "active",
      address: [],
      cart: [],
      orders: []
  };

  // Lưu vào mảng users tổng
  usersList.push(newUser);
  localStorage.setItem('users', JSON.stringify(usersList));

  alert('Registration successful! You can now log in.');
  
  // Xóa trắng form đăng ký
  registerForm.reset(); 
  toggleForm('login');
});


// --- 3. LOGIN (ĐĂNG NHẬP) ---
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const inputs = loginForm.querySelectorAll('input:not([type="submit"])');
  const email = inputs[0].value.trim();
  const password = inputs[1].value;

  const usersList = getUsers();

  // Tìm user theo email
  const user = usersList.find(u => u.email === email);

  if (!user) {
    alert('User not found. Please register first.');
    return;
  }

  // Kiểm tra trạng thái tài khoản (ví dụ bị Admin khóa)
  if (user.status === 'banned') {
      alert('Your account has been banned. Please contact support.');
      return;
  }

  if (user.password !== password) {
    alert('Incorrect password.');
    return;
  }

  // ĐỒNG BỘ: Lưu dưới tên 'currentUser' để file cart.js có thể lấy thông tin Checkout
  const currentUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
  };
  localStorage.setItem('currentUser', JSON.stringify(currentUserData));

  alert('Login successful!');
  
  // Chuyển về trang chủ thay vì dashboard nếu đây là account khách hàng thường
  window.location.href = '../index/index.html'; 
});