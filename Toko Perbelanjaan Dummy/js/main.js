const products = [
  {
    id: 1,
    name: 'Tas Kain Premium',
    category: 'Fashion',
    price: 185000,
    originalPrice: 260000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'Lampu Smart Desk',
    category: 'Elektronik',
    price: 340000,
    originalPrice: 420000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Set Perlengkapan Dapur',
    category: 'Rumah',
    price: 230000,
    originalPrice: 290000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80',
    badge: 'Promo',
  },
  {
    id: 4,
    name: 'Skin Care Glow Trio',
    category: 'Kecantikan',
    price: 210000,
    originalPrice: 280000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
    badge: 'Top Rated',
  },
  {
    id: 5,
    name: 'Jam Tangan Minimalis',
    category: 'Aksesoris',
    price: 275000,
    originalPrice: 360000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    badge: 'Popular',
  },
  {
    id: 6,
    name: 'Bumbu Rasa Nusantara',
    category: 'Makanan',
    price: 96000,
    originalPrice: 135000,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
    badge: 'Fresh',
  },
  {
    id: 7,
    name: 'Setalat Olahraga',
    category: 'Peralatan',
    price: 430000,
    originalPrice: 520000,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    badge: 'Hot',
  },
  {
    id: 8,
    name: 'Vitamin Harian Plus',
    category: 'Kesehatan',
    price: 170000,
    originalPrice: 220000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    badge: 'Healthy',
  },
];

const cart = [];
let activeCategory = 'Semua';
let searchTerm = '';
let sortValue = 'featured';

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const productGrid = document.getElementById('productGrid');
const emptyState = document.getElementById('emptyState');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutTotal = document.getElementById('checkoutTotal');
const toast = document.getElementById('toast');
const overlay = document.getElementById('overlay');
const cartDrawer = document.getElementById('cartDrawer');
const checkoutModal = document.getElementById('checkModal');
const storeStatusText = document.getElementById('storeStatusText');
const searchInput = document.querySelector('.search-box input');
const sortSelect = document.getElementById('sortSelect');
const formStatus = document.getElementById('fromStatus');
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

function formatMoney(value) {
  return moneyFormatter.format(value);
}

async function postJSON(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Terjadi kesalahan saat mengirim data.');
  }

  return response.json();
}

function getVisibleProducts() {
  let list = [...products];

  if (activeCategory !== 'Semua') {
    list = list.filter((product) => product.category === activeCategory);
  }

  if (searchTerm) {
    const keyword = searchTerm.toLowerCase();
    list = list.filter((product) => product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword));
  }

  switch (sortValue) {
    case 'newest':
      list.sort((a, b) => b.id - a.id);
      break;
    case 'price-low':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      list.sort((a, b) => b.price - a.price);
      break;
    default:
      list.sort((a, b) => b.rating - a.rating);
      break;
  }

  return list;
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card" data-id="${product.id}">
          <div class="product-image-wrap">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="product-badge">${product.badge}</span>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span class="product-category">${product.category}</span>
              <span class="product-rating"><i data-lucide="star"></i> ${product.rating}</span>
            </div>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price-row">
              <div class="product-price">
                <small>${formatMoney(product.originalPrice)}</small>
                <strong>${formatMoney(product.price)}</strong>
              </div>
              <button class="add-button" data-product-id="${product.id}" type="button">Tambah</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  lucide.createIcons();
}

function renderCart() {
  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <i data-lucide="shopping-bag"></i>
        <p>Keranjang belanja kamu kosong</p>
        <small>Tambahkan produk ke keranjang untuk melihatnya di sini.</small>
      </div>
    `;
    cartCount.textContent = '0';
    cartTotal.textContent = 'Rp 0';
    checkoutTotal.textContent = 'Rp 0';
    lucide.createIcons();
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <strong>${item.name}</strong>
            <small>${item.category}</small>
            <div class="cart-item-actions">
              <div class="qty-stepper">
                <button type="button" data-action="decrease" data-id="${item.id}">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" data-id="${item.id}">+</button>
              </div>
              <span>${formatMoney(item.price * item.quantity)}</span>
            </div>
          </div>
          <div class="cart-item-price">
            <button class="cart-item-remove" type="button" data-action="remove" data-id="${item.id}">Hapus</button>
          </div>
        </div>
      `,
    )
    .join('');

  cartCount.textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
  cartTotal.textContent = formatMoney(total);
  checkoutTotal.textContent = formatMoney(total);
  lucide.createIcons();
}

function addToCart(productId) {
  const product = products.find((item) => item.id === Number(productId));
  if (!product) return;

  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} ditambahkan ke keranjang`);
}

function adjustQuantity(productId, change) {
  const item = cart.find((entry) => entry.id === Number(productId));
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.id === Number(productId));
    cart.splice(index, 1);
  }

  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === Number(productId));
  if (index >= 0) {
    cart.splice(index, 1);
    renderCart();
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 1800);
}

function updateStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const isWeekend = day === 0 || day === 6;
  const isOpen = isWeekend ? hour >= 10 && hour < 20 : hour >= 9 && hour < 21;

  storeStatusText.textContent = isOpen ? 'Store Sudah Buka' : 'Store Tutup';
  const statusDot = document.querySelector('.hours-dot');
  if (statusDot) {
    statusDot.style.background = isOpen ? '#1f8b5a' : '#d9534f';
    statusDot.style.boxShadow = isOpen ? '0 0 0 7px rgba(31, 139, 90, 0.15)' : '0 0 0 7px rgba(217, 83, 79, 0.15)';
  }
}

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('visible');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('visible');
  checkoutModal.classList.remove('visible');
}

function openCheckout() {
  if (!cart.length) {
    showToast('Keranjang masih kosong');
    return;
  }

  checkoutModal.classList.add('visible');
  cartDrawer.classList.remove('open');
  overlay.classList.add('visible');
}

function closeCheckout() {
  checkoutModal.classList.remove('visible');
  overlay.classList.remove('visible');
}

function attachEvents() {
  document.querySelectorAll('.category-card').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll('.category-card').forEach((card) => {
        card.classList.toggle('active', card === button);
      });
      renderProducts();
    });
  });

  document.getElementById('showAllProducts').addEventListener('click', () => {
    activeCategory = 'Semua';
    document.querySelectorAll('.category-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.category === 'Semua');
    });
    document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
    renderProducts();
  });

  searchInput.addEventListener('input', (event) => {
    searchTerm = event.target.value.trim();
    renderProducts();
  });

  sortSelect.addEventListener('change', (event) => {
    sortValue = event.target.value;
    renderProducts();
  });

  productGrid.addEventListener('click', (event) => {
    const target = event.target.closest('.add-button');
    if (!target) return;
    addToCart(target.dataset.productId);
  });

  cartItems.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    const { action, id } = target.dataset;
    if (action === 'increase') adjustQuantity(id, 1);
    if (action === 'decrease') adjustQuantity(id, -1);
    if (action === 'remove') removeFromCart(id);
  });

  document.getElementById('openCart').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
  document.getElementById('checkoutButton').addEventListener('click', openCheckout);
  document.getElementById('overlay').addEventListener('click', () => {
    closeCart();
    closeCheckout();
  });
  document.getElementById('focusSearch').addEventListener('click', () => {
    document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
    searchInput.focus();
  });
  document.getElementById('menuButton').addEventListener('click', openCart);

  document.getElementById('checkoutForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      payment: formData.get('payment'),
      cart,
    };

    try {
      const result = await postJSON('/api/order', payload);
      formStatus.textContent = result.message;
      event.target.reset();
      cart.length = 0;
      renderCart();
      closeCheckout();
      showToast('Pesanan berhasil dikirim');
    } catch (error) {
      formStatus.textContent = error.message;
    }
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const result = await postJSON('/api/contact', payload);
      contactStatus.textContent = result.message;
      event.target.reset();
      showToast('Pesan kontak berhasil dikirim');
    } catch (error) {
      contactStatus.textContent = error.message;
    }
  });
}

function init() {
  renderProducts();
  renderCart();
  updateStoreStatus();
  attachEvents();
  lucide.createIcons();
}

init();
