/* =============================================
   OMINIRA — Main JavaScript
   ============================================= */

// ─── LOADER ───────────────────────────────────
(function () {
  const loader   = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  let pct = 0;

  const tick = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        // Init observers after loader
        initScrollAnimations();
      }, 400);
    }
    progress.style.width = pct + '%';
  }, 80);
})();

// ─── CUSTOM CURSOR ────────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let   mx = 0, my = 0, fx = 0, fy = 0;

document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top  = my + 'px';
});

(function animateCursorFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  cursorFollower.style.left = fx + 'px';
  cursorFollower.style.top  = fy + 'px';
  requestAnimationFrame(animateCursorFollower);
})();

document.querySelectorAll('a, button, .product-card, .filter-btn, .color-dot').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    cursorFollower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    cursorFollower.classList.remove('hover');
  });
});

// ─── NAV SCROLL ───────────────────────────────
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const s = window.scrollY;
  if (s > 60) nav.classList.add('scrolled');
  else         nav.classList.remove('scrolled');
  lastScroll = s;
}, { passive: true });

// ─── HAMBURGER / MOBILE MENU ──────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobile()  { hamburger.classList.add('active'); mobileMenu.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMobile() { hamburger.classList.remove('active'); mobileMenu.classList.remove('open'); document.body.style.overflow = ''; }

hamburger.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMobile() : openMobile());
mobileClose.addEventListener('click', closeMobile);
mobileLinks.forEach(l => l.addEventListener('click', closeMobile));

// ─── SCROLL ANIMATIONS ────────────────────────
function initScrollAnimations() {
  const targets = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children in same parent
        const siblings = entry.target.parentElement.querySelectorAll('[data-animate]');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(t => observer.observe(t));
}

// ─── PRODUCT FILTER ───────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    productCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        // Re-trigger animation
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 50);
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ─── CART ─────────────────────────────────────
let cart = [];

// Try load from localStorage
try { cart = JSON.parse(localStorage.getItem('ominiraCart')) || []; } catch(e) {}

function saveCart() {
  try { localStorage.setItem('ominiraCart', JSON.stringify(cart)); } catch(e) {}
}

const cartBtn      = document.getElementById('cartBtn');
const cartCount    = document.getElementById('cartCount');
const cartDrawer   = document.getElementById('cartDrawer');
const cartOverlay  = document.getElementById('cartOverlay');
const cartClose    = document.getElementById('cartClose');
const cartItems    = document.getElementById('cartItems');
const cartEmpty    = document.getElementById('cartEmpty');
const cartFooter   = document.getElementById('cartFooter');
const cartTotalEl  = document.getElementById('cartTotalPrice');
const checkoutBtn  = document.getElementById('checkoutBtn');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Count badge
  if (count > 0) {
    cartCount.textContent = count;
    cartCount.classList.add('visible');
  } else {
    cartCount.classList.remove('visible');
  }

  // Items
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartFooter.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    cartTotalEl.textContent = total + ' €';
  }

  // Render items
  const existingItems = cartItems.querySelectorAll('.cart-item');
  existingItems.forEach(el => el.remove());

  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.img || 'assets/collection.png'}" alt="${item.name}" loading="lazy"/>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price * item.qty} € ×${item.qty}</div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" title="Retirer">✕</button>
    `;
    cartItems.appendChild(div);
  });

  // Remove listeners
  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      cart = cart.filter(i => i.id !== id);
      saveCart();
      updateCartUI();
    });
  });
}

// Add to cart buttons
document.querySelectorAll('.product-add-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id    = parseInt(btn.dataset.id);
    const name  = btn.dataset.name;
    const price = parseInt(btn.dataset.price);
    const img   = btn.dataset.img || 'assets/collection.png';
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++;
    else cart.push({ id, name, price, qty: 1, img });
    saveCart();
    updateCartUI();
    showToast(`${name} ajouté au panier !`);
  });
});

checkoutBtn && checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) { showToast('Votre panier est vide !'); return; }
  saveCart();
  window.location.href = 'payment.html';
});

// ─── TOAST ────────────────────────────────────
const toast   = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;

function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── NEWSLETTER ───────────────────────────────
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm && newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  if (email) {
    showToast('Merci ! Tu es maintenant inscrit(e). 🎉');
    newsletterForm.reset();
  }
});

// ─── SMOOTH SCROLL ────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

// ─── PARALLAX QUOTE ───────────────────────────
const quoteBgImg = document.querySelector('.quote-bg-img');
if (quoteBgImg) {
  window.addEventListener('scroll', () => {
    const section = document.getElementById('quoteSection');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const pct  = (rect.top / window.innerHeight);
    quoteBgImg.style.transform = `translateY(${pct * 40}px) scale(1.1)`;
  }, { passive: true });
}

// ─── PRODUCT CARD TILT ────────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── CART SHOP BTN ────────────────────────────
const cartShopBtn = document.getElementById('cartShopBtn');
if (cartShopBtn) cartShopBtn.addEventListener('click', closeCart);

// ─── INIT ─────────────────────────────────────
updateCartUI();

console.log('%c OMINIRA ', 'background: #C4956A; color: #0E0D0C; font-size: 20px; font-weight: bold; padding: 8px 16px; border-radius: 4px;');
console.log('%c Libère ton Style ', 'color: #C4B098; font-size: 12px; letter-spacing: 4px;');
