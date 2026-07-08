/* =============================================
   OMINIRA — Payment Page JavaScript
   ============================================= */

// ─── CUSTOM CURSOR ────────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let   mx = 0, my = 0, fx = 0, fy = 0;
document.addEventListener('mousemove', (e) => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
(function animateCF() {
  fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12;
  cursorFollower.style.left = fx + 'px'; cursorFollower.style.top = fy + 'px';
  requestAnimationFrame(animateCF);
})();
document.querySelectorAll('a, button, input, select, .delivery-option, .pay-method-tab').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorFollower.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorFollower.classList.remove('hover'); });
});

// ─── SCROLL ANIMATIONS ────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('[data-animate]').forEach(t => observer.observe(t));

// ─── LOAD CART FROM LOCALSTORAGE ──────────────
let cart = [];
try { cart = JSON.parse(localStorage.getItem('ominiraCart')) || []; } catch(e) {}
let deliveryCost = 0;
let promoDiscount = 0;

// ─── RENDER ORDER SUMMARY ─────────────────────
function renderOrderSummary() {
  const itemsEl    = document.getElementById('orderItems');
  const countEl    = document.getElementById('orderItemCount');
  const subtotalEl = document.getElementById('summarySubtotal');
  const deliveryEl = document.getElementById('summaryDelivery');
  const totalEl    = document.getElementById('summaryTotal');
  const promoLineEl = document.getElementById('promoLine');
  const promoValEl  = document.getElementById('summaryPromo');
  const payBtnTotal = document.getElementById('payBtnTotal');

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping   = cart.length === 0 ? 0 : deliveryCost;
  const total      = subtotal + shipping - promoDiscount;

  countEl.textContent = totalItems + ' article' + (totalItems > 1 ? 's' : '');

  // Items
  itemsEl.innerHTML = '';
  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:14px;padding:20px 0">Votre panier est vide.</p>';
  } else {
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'order-item';
      div.innerHTML = `
        <div class="order-item-img">
          <img src="${item.img || 'assets/collection.png'}" alt="${item.name}" loading="lazy"/>
          <div class="order-item-qty">${item.qty}</div>
        </div>
        <div class="order-item-info">
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-size">Taille: M</div>
        </div>
        <div class="order-item-price">${(item.price * item.qty)} €</div>
      `;
      itemsEl.appendChild(div);
    });
  }

  subtotalEl.textContent = subtotal + ' €';
  deliveryEl.textContent = shipping === 0 ? 'Gratuit' : shipping.toFixed(2).replace('.', ',') + ' €';

  if (promoDiscount > 0) {
    promoLineEl.style.display = 'flex';
    promoValEl.textContent    = '-' + promoDiscount + ' €';
  } else {
    promoLineEl.style.display = 'none';
  }

  totalEl.textContent   = total.toFixed(2).replace('.', ',') + ' €';
  if (payBtnTotal) payBtnTotal.textContent = '— ' + total.toFixed(2).replace('.', ',') + ' €';
}

renderOrderSummary();

// ─── DELIVERY OPTIONS ─────────────────────────
document.querySelectorAll('.delivery-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.delivery-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    deliveryCost = parseFloat(opt.dataset.price) || 0;
    renderOrderSummary();
  });
});

// ─── PAYMENT METHOD TABS ──────────────────────
const tabCard    = document.getElementById('tabCard');
const tabPaypal  = document.getElementById('tabPaypal');
const tabMobile  = document.getElementById('tabMobile');
const cardPanel   = document.getElementById('cardPanel');
const paypalPanel = document.getElementById('paypalPanel');
const mobilePanel = document.getElementById('mobilePanel');

function setTab(activeTab, activePanel) {
  [tabCard, tabPaypal, tabMobile].forEach(t => t.classList.remove('active'));
  [cardPanel, paypalPanel, mobilePanel].forEach(p => p.classList.add('hidden'));
  activeTab.classList.add('active');
  activePanel.classList.remove('hidden');
}
tabCard.addEventListener('click',   () => setTab(tabCard,   cardPanel));
tabPaypal.addEventListener('click', () => setTab(tabPaypal, paypalPanel));
tabMobile.addEventListener('click', () => setTab(tabMobile, mobilePanel));

// ─── CARD NUMBER FORMATTING ───────────────────
const cardNumberInput = document.getElementById('cardNumber');
if (cardNumberInput) {
  cardNumberInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(.{4})/g, '$1  ').trim();
    e.target.value = v;
  });
}

// ─── CARD EXPIRY FORMATTING ───────────────────
const cardExpiryInput = document.getElementById('cardExpiry');
if (cardExpiryInput) {
  cardExpiryInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
    e.target.value = v;
  });
}

// ─── PROMO CODE ───────────────────────────────
const promoApplyBtn = document.getElementById('promoApplyBtn');
const promoInput    = document.getElementById('promoInput');
const promoMsg      = document.getElementById('promoMsg');

const validPromos = {
  'LIBERTE10': { discount: 10, label: '-10€ appliqué !' },
  'OMINIRA15': { discount: 15, label: '-15€ appliqué !' },
  'BIENVENUE': { discount: 20, label: '-20€ appliqué ! Bienvenue chez OMINIRA' },
};

promoApplyBtn && promoApplyBtn.addEventListener('click', () => {
  const code = promoInput.value.trim().toUpperCase();
  if (validPromos[code]) {
    promoDiscount = validPromos[code].discount;
    promoMsg.textContent = '✓ ' + validPromos[code].label;
    promoMsg.style.display = 'block';
    promoMsg.style.color = 'var(--copper)';
    renderOrderSummary();
    showToast(validPromos[code].label);
  } else {
    promoMsg.textContent = '✗ Code invalide ou expiré';
    promoMsg.style.display = 'block';
    promoMsg.style.color = '#e05c5c';
  }
});

// ─── FORM VALIDATION ──────────────────────────
function validateForm() {
  const required = ['firstName', 'lastName', 'email', 'address', 'city', 'postal', 'country'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    } else {
      el.classList.remove('error');
    }
  });

  // Email validation
  const emailEl = document.getElementById('email');
  if (emailEl && emailEl.value && !emailEl.value.includes('@')) {
    emailEl.classList.add('error');
    valid = false;
  }

  // Active payment method validation
  const activeTab = document.querySelector('.pay-method-tab.active');
  if (activeTab && activeTab.dataset.method === 'card') {
    const cardNum = document.getElementById('cardNumber');
    const expiry  = document.getElementById('cardExpiry');
    const cvv     = document.getElementById('cardCvv');
    if (cardNum && cardNum.value.replace(/\s/g, '').length < 16) {
      cardNum.classList.add('error'); valid = false;
    } else { cardNum && cardNum.classList.remove('error'); }
    if (expiry && expiry.value.length < 7) {
      expiry.classList.add('error'); valid = false;
    } else { expiry && expiry.classList.remove('error'); }
    if (cvv && cvv.value.length < 3) {
      cvv.classList.add('error'); valid = false;
    } else { cvv && cvv.classList.remove('error'); }
  }

  if (cart.length === 0) {
    showToast('Votre panier est vide !');
    return false;
  }

  return valid;
}

// Remove error on input
document.querySelectorAll('.pay-input').forEach(input => {
  input.addEventListener('input', () => input.classList.remove('error'));
});

// ─── SUBMIT PAYMENT ───────────────────────────
const submitBtn    = document.getElementById('submitPayBtn');
const paymentMain  = document.getElementById('paymentMain');
const paymentSuccess = document.getElementById('paymentSuccess');

submitBtn && submitBtn.addEventListener('click', () => {
  if (!validateForm()) {
    showToast('Veuillez remplir tous les champs requis.');
    return;
  }

  // Simulate payment processing
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spinSlow 1s linear infinite">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Traitement en cours...
  `;

  setTimeout(() => {
    // Generate order ref
    const ref = 'OMN-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('successOrderRef').textContent = 'COMMANDE #' + ref;

    // Clear cart from localStorage
    localStorage.removeItem('ominiraCart');

    // Show success
    paymentMain.classList.add('hidden');
    paymentSuccess.classList.add('show');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 2400);
});

// ─── TOAST ────────────────────────────────────
const toast    = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;
function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ─── NAV SCROLL ───────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.add('scrolled'); // always scrolled on payment page
}, { passive: true });

console.log('%c OMINIRA CHECKOUT ', 'background:#C4956A;color:#0E0D0C;font-size:16px;font-weight:bold;padding:6px 12px;border-radius:4px;');
