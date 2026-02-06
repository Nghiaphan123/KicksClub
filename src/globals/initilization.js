let products = [
  {
    id: 1,
    name: "ADIDAS 4DFWD X PARLEY RUNNING SHOES",
    brand: "Adidas",
    price: 125.00,
    tag: "New Release",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [
      { name: "Shadow Navy", hex: "#2C3545", selected: true },
      { name: "Army Green", hex: "#788575", selected: false }
    ],
    sizes: [
      { val: 38, available: true }, { val: 39, available: false }, 
      { val: 40, available: true }, { val: 41, available: true }
    ],
    description: "Shadow Navy / Army Green style for comfort.",
    amount: 50
  },
  {
    id: 2,
    name: "NIKE AIR MAX 270",
    brand: "Nike",
    price: 150.00,
    tag: "Best Seller",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [
      { name: "White/Black", hex: "#FFFFFF", selected: true },
      { name: "Red", hex: "#FF0000", selected: false }
    ],
    sizes: [
      { val: 40, available: true }, { val: 41, available: true }, 
      { val: 42, available: false }, { val: 43, available: true }
    ],
    description: "Nike introducing the new air max for everyone's comfort.",
    amount: 50
  },
  {
    id: 3,
    name: "JORDAN RETRO 4 'MILITARY BLUE'",
    brand: "Jordan",
    price: 210.00,
    tag: "Trending",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Blue/White", hex: "#4f6bf5", selected: true }],
    sizes: [{ val: 42, available: true }, { val: 43, available: true }],
    description: "Classic silhouette with modern blue accents.",
    amount: 5
  },
  {
    id: 4,
    name: "YEEZY BOOST 350 V2",
    brand: "Adidas",
    price: 230.00,
    tag: "Limited Edition",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Cream White", hex: "#F5F5DC", selected: true }],
    sizes: [{ val: 36, available: true }, { val: 37, available: true }],
    description: "Ultra-comfortable Boost technology.",
    amount: 50
  },
  {
    id: 5,
    name: "PUMA RS-X REINVENT",
    brand: "Puma",
    price: 110.00,
    tag: "Sale",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Pastel Mix", hex: "#FFD1DC", selected: true }],
    sizes: [{ val: 38, available: true }, { val: 39, available: true }],
    description: "Chunky sneaker style for everyday wear.",
    amount: 50
  },
  {
    id: 6,
    name: "NEW BALANCE 550",
    brand: "New Balance",
    price: 120.00,
    tag: "New Release",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Green/White", hex: "#006400", selected: true }],
    sizes: [{ val: 40, available: true }, { val: 44, available: false }],
    description: "Retro basketball inspired design.",
    amount: 50
  },
  {
    id: 7,
    name: "CONVERSE CHUCK 70 CLASSIC",
    brand: "Converse",
    price: 85.00,
    tag: "Classic",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Black", hex: "#000000", selected: true }],
    sizes: [{ val: 35, available: true }, { val: 45, available: true }],
    description: "The timeless high-top sneaker.",
    amount: 5
  },
  {
    id: 8,
    name: "VANS OLD SKOOL CORE",
    brand: "Vans",
    price: 65.00,
    tag: "Essential",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Black/White", hex: "#111111", selected: true }],
    sizes: [{ val: 39, available: true }, { val: 40, available: true }],
    description: "Iconic sidestripe skate shoe.",
    amount: 50
  },
  {
    id: 9,
    name: "ASICS GEL-KAYANO 30",
    brand: "Asics",
    price: 160.00,
    tag: "Running",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Deep Ocean", hex: "#000080", selected: true }],
    sizes: [{ val: 41, available: true }, { val: 42, available: true }],
    description: "Maximum support and stability for runners.",
    amount: 50
  },
  {
    id: 10,
    name: "BALENCIAGA TRIPLE S",
    brand: "Luxury",
    price: 950.00,
    tag: "High-End",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Grey/Red/Blue", hex: "#808080", selected: true }],
    sizes: [{ val: 38, available: true }, { val: 42, available: true }],
    description: "The pioneer of the chunky sneaker trend.",
    amount: 5
  },
  {
    id: 11,
    name: "NIKE DUNK LOW PANDA",
    brand: "Nike",
    price: 110.00,
    tag: "Hot Deal",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "White/Black", hex: "#FFFFFF", selected: true }],
    sizes: [{ val: 38, available: true }, { val: 43, available: false }],
    description: "Most popular colorway for street style.",
    amount: 50
  },
  {
    id: 12,
    name: "ADIDAS ULTRABOOST LIGHT",
    brand: "Adidas",
    price: 190.00,
    tag: "New Release",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Solar Red", hex: "#FF4500", selected: true }],
    sizes: [{ val: 40, available: true }, { val: 41, available: true }],
    description: "The lightest Ultraboost ever made.",
    amount: 5
  },
  {
    id: 13,
    name: "REEBOK CLUB C 85",
    brand: "Reebok",
    price: 75.00,
    tag: "Vintage",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Vintage White", hex: "#FAF9F6", selected: true }],
    sizes: [{ val: 42, available: true }, { val: 43, available: true }],
    description: "Clean, minimalist 80s court style.",
    amount: 5
  },
  {
    id: 14,
    name: "SALOMON XT-6",
    brand: "Salomon",
    price: 180.00,
    tag: "Outdoor",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Ghost Grey", hex: "#D3D3D3", selected: true }],
    sizes: [{ val: 41, available: true }, { val: 42, available: true }],
    description: "Technical footwear for trail and urban life.",
    amount: 50
  },
  {
    id: 15,
    name: "DR. MARTENS 1460 BOOTS",
    brand: "Dr. Martens",
    price: 170.00,
    tag: "Iconic",
    image: "./../../.././../../../res/images/products/winterKick.png",
    colors: [{ name: "Cherry Red", hex: "#8B0000", selected: true }],
    sizes: [{ val: 37, available: true }, { val: 41, available: true }],
    description: "The original 8-eye leather boot.",
    amount: 50
  },
  {
    id: 16,
    name: "ON CLOUD 5",
    brand: "On",
    price: 140.00,
    tag: "Comfort",
    image: "./../../../res/images/products/winterKick.png",
    colors: [{ name: "All Black", hex: "#000000", selected: true }],
    sizes: [{ val: 40, available: true }, { val: 45, available: true }],
    description: "Swiss engineering for cloud-like steps.",
    amount: 50
  },
  {
    id: 17,
    name: "NEW BALANCE 990V6",
    brand: "New Balance",
    price: 200.00,
    tag: "Premium",
    image: "./../../../res/images/products/winterKick.png",
    colors: [{ name: "Grey", hex: "#A9A9A9", selected: true }],
    sizes: [{ val: 40, available: true }, { val: 41, available: true }],
    description: "The standard for premium performance sneakers.",
    amount: 50
  },
  {
    id: 18,
    name: "ADIDAS SAMBA OG",
    brand: "Adidas",
    price: 100.00,
    tag: "Must-Have",
    image: "./../../../res/images/products/winterKick.png",
    colors: [{ name: "Cloud White", hex: "#FFFFFF", selected: true }],
    sizes: [{ val: 38, available: true }, { val: 39, available: true }],
    description: "From indoor soccer to street icon.",
    amount: 5
  },
  {
    id: 19,
    name: "NIKE AIR FORCE 1 '07",
    brand: "Nike",
    price: 115.00,
    tag: "Essential",
    image: "./../../../res/images/products/winterKick.png",
    colors: [{ name: "Triple White", hex: "#FFFFFF", selected: true }],
    sizes: [{ val: 36, available: true }, { val: 46, available: true }],
    description: "Basketball OG that redefined sneaker culture.",
    amount: 50
  },
  {
    id: 20,
    name: "OFF-WHITE OUT OF OFFICE",
    brand: "Luxury",
    price: 550.00,
    tag: "Designer",
    image: "./../../../res/images/products/winterKick.png",
    colors: [{ name: "White/Pink", hex: "#FFC0CB", selected: true }],
    sizes: [{ val: 37, available: true }, { val: 41, available: true }],
    description: "Virgil Abloh's take on a 80s tennis shoe.",
    amount: 5
  }
];


// Đẩy danh sách sản phẩm lên localStorage nếu chưa có
if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(products));
  }
/**
 * initialization.js
 * File này dùng để khởi tạo trạng thái ban đầu của trang web
 */

window.onload = function() {
    console.log("Trang web đã sẵn sàng!");
  
    // 1. KIỂM TRA DỮ LIỆU
    // Kiểm tra xem biến 'products' đã tồn tại chưa (tránh lỗi ReferenceError)
    if (typeof products === 'undefined') {
        console.error("Lỗi: Không tìm thấy biến 'products'. Hãy kiểm tra lại file data hoặc thứ tự nhúng script.");
        return;
    }

    // 2. KHỞI TẠO GIAO DIỆN
    try {
        // Render sản phẩm đầu tiên lên phần chi tiết (Upper section)
        // Mặc định lấy sản phẩm index 0
        if (products.length > 0) {
            renderProductDetail(products[0]);
        }

        // Render toàn bộ danh sách sản phẩm xuống lưới (Lower section)
        renderProductGrid();
        
        console.log("Khởi tạo dữ liệu thành công!");
    } catch (error) {
        console.error("Đã xảy ra lỗi trong quá trình render:", error);
    }
};

let users = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan.99@gmail.com",
    phone: "0909123456",
    password: "12345",
    role: "customer",
    status: "active",
    // Người này có 2 địa chỉ
    address: [
      {
        id: "addr_1",
        type: "Nhà riêng",
        content: "Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
        isDefault: true // Địa chỉ mặc định
      },
      {
        id: "addr_2",
        type: "Công ty",
        content: "Tòa nhà Landmark 81, Quận Bình Thạnh, TP. Hồ Chí Minh",
        isDefault: false
      }
    ],
    cart: [],
    orders: [] 
  },
  {
    id: 2,
    name: "Trần Thị Bích",
    email: "bichtran.design@gmail.com",
    phone: "0988765432",
    password: "12345",
    role: "customer",
    status: "banned",
    // Người này có 1 địa chỉ
    address: [
      {
        id: "addr_3",
        type: "Nhà riêng",
        content: "Ngõ 105 Láng Hạ, Quận Đống Đa, Hà Nội",
        isDefault: true
      }
    ],
    cart: [],
    orders: []
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    email: "nam.lehoang@techcorp.vn",
    phone: "0912345678",
    password: "12345",
    role: "admin",
    status: "active",
    // Admin cũng có 1 địa chỉ
    address: [
      {
        id: "addr_4",
        type: "Văn phòng",
        content: "78 Đường Bạch Đằng, Quận Hải Châu, Đà Nẵng",
        isDefault: true
      }
    ],
    cart: [],
    orders: []
  },
  {
    id: 4,
    name: "Phạm Minh Tuấn",
    email: "tuanpham123@yahoo.com.vn",
    phone: "0356789123",
    password: "12345",
    role: "customer",
    status: "active",
    // TÀI KHOẢN NÀY CHƯA CÓ ĐỊA CHỈ (Mảng rỗng)
    address: [], 
    cart: [],
    orders: []
  }
];

// Đẩy danh sách người dùng lên localStorage nếu chưa có
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(users));
}