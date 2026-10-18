const API = '/api';

const SUPABASE_URL = 'https://jmumhmkodbwirtpfvokn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YSwxb3pUBiQEOn66wtvmsg_W_A1yT2e';

let supabase;
let products = [];
let cart = JSON.parse(localStorage.getItem('apna_cart') || '[]');
let category = 'All';

// Shop owner's WhatsApp number
const SHOP_WHATSAPP = '917800632404';

const $ = s => document.querySelector(s);

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function money(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  });
}

// ===============================
// LOAD PRODUCTS FROM SUPABASE
// ===============================

async function load() {
  try {
    const { createClient } = await import(
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
    );

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await supabase
      .from('products')
      .select('id,name,description,price,category,image_url,stock,is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    products = (data || []).map(p => ({
      ...p,
      id: String(p.id),
      price: Number(p.price),
      stock: Number(p.stock),
      image: p.image_url || ''
    }));

    // Remove products that are no longer available.
    cart = cart.filter(item =>
      products.some(p => p.id === String(item.id))
    );

    // Refresh cart details using current product prices.
    cart = cart.map(item => {
      const product = products.find(p => p.id === String(item.id));
      return {
        ...product,
        qty: Math.min(
          Math.max(1, Number(item.qty) || 1),
          Math.max(0, product.stock)
        )
      };
    }).filter(item => item.stock > 0 && item.qty > 0);

    save();

    render();
    setOrderButtonState();

  } catch (error) {
    console.error('Product loading error:', error);
    products = [];
    render();
    alert('Supabase Error: ' + error.message);
  }
}

// ===============================
// DISPLAY PRODUCTS
// ===============================

function render() {
  const container = $('#products');
  if (!container) return;

  const searchBox = $('#search');
  const q = searchBox ? searchBox.value.trim().toLowerCase() : '';

  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    container.innerHTML = '<p>No products available.</p>';
    return;
  }

  container.innerHTML = filtered.map(p => {
    const outOfStock = p.stock <= 0;

    return `
      <article class="card">
        <div class="pic">
          ${
            p.image
              ? `<img src="${escapeHTML(p.image)}"
                   alt="${escapeHTML(p.name)}"
                   loading="lazy"
                   onerror="this.style.display='none';this.parentElement.innerHTML='🛒';">`
              : '🛒'
          }
        </div>

        <h3>${escapeHTML(p.name)}</h3>

        <div class="muted">${escapeHTML(p.category || 'General')}</div>

        <div class="price">₹${money(p.price)}</div>

        <p class="muted">
          ${outOfStock ? 'Out of Stock' : `Stock: ${p.stock}`}
        </p>

        ${
          outOfStock
            ? `<button class="add" disabled>Out of Stock</button>`
            : `
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                <button class="add"
                  onclick="add('${p.id}')">
                  Add to Cart
                </button>

                <button class="add"
                  onclick="buyNow('${p.id}')">
                  Buy Now
                </button>
              </div>
            `
        }
      </article>
    `;
  }).join('');
}

// ===============================
// ADD TO CART
// ===============================

function add(id) {
  const p = products.find(x => x.id === String(id));

  if (!p || p.stock <= 0) {
    alert('Ye product abhi stock mein nahi hai.');
    return;
  }

  const existing = cart.find(x => String(x.id) === String(id));

  if (existing) {
    if (existing.qty >= p.stock) {
      alert(`Sirf ${p.stock} item stock mein hain.`);
      return;
    }

    existing.qty++;
  } else {
    cart.push({
      ...p,
      qty: 1
    });
  }

  save();

  if ($('#cartPanel')) {
    $('#cartPanel').classList.add('open');
  }

  renderCart();
}

// ===============================
// BUY NOW
// ===============================

function buyNow(id) {
  const p = products.find(x => x.id === String(id));

  if (!p || p.stock <= 0) {
    alert('Ye product abhi stock mein nahi hai.');
    return;
  }

  // If the product is already in the cart, keep its quantity.
  const existing = cart.find(x => String(x.id) === String(id));

  if (existing) {
    if (existing.qty > p.stock) {
      existing.qty = p.stock;
    }
  } else {
    cart.push({
      ...p,
      qty: 1
    });
  }

  save();

  // Go directly to checkout.
  if ($('#modal')) {
    $('#modal').classList.add('show');
  } else if ($('#cartPanel')) {
    $('#cartPanel').classList.add('open');
  }
}

// ===============================
// CART FUNCTIONS
// ===============================

function save() {
  localStorage.setItem('apna_cart', JSON.stringify(cart));
  updateCart();
  renderCart();
}

function updateCart() {
  const count = $('#cartCount');

  if (count) {
    count.textContent = cart.reduce(
      (total, item) => total + item.qty,
      0
    );
  }
}

function renderCart() {
  const itemsContainer = $('#cartItems');
  const totalContainer = $('#total');

  if (!itemsContainer || !totalContainer) return;

  itemsContainer.innerHTML = cart.length
    ? cart.map(item => `
        <div class="cartRow">
          <div>
            <strong>${escapeHTML(item.name)}</strong>
            <br>
            <small>₹${money(item.price)} × ${item.qty}</small>
          </div>

          <div>
            <button onclick="change('${item.id}', -1)">−</button>
            ${item.qty}
            <button
              onclick="change('${item.id}', 1)"
              ${item.qty >= item.stock ? 'disabled' : ''}>+</button>
          </div>
        </div>
      `).join('')
    : '<p>Your cart is empty.</p>';

  totalContainer.textContent = money(
    cart.reduce(
      (total, item) => total + item.price * item.qty,
      0
    )
  );

  setOrderButtonState();
}

function setOrderButtonState() {
  const checkout = $('#checkout');

  if (checkout) {
    checkout.disabled = cart.length === 0;
  }
}

function change(id, amount) {
  const item = cart.find(x => String(x.id) === String(id));

  if (!item) return;

  const product = products.find(x => String(x.id) === String(id));

  if (!product) {
    cart = cart.filter(x => String(x.id) !== String(id));
    save();
    return;
  }

  const nextQty = item.qty + amount;

  if (nextQty > product.stock) {
    alert(`Sirf ${product.stock} item stock mein hain.`);
    return;
  }

  if (nextQty <= 0) {
    cart = cart.filter(x => String(x.id) !== String(id));
  } else {
    item.qty = nextQty;
  }

  save();
}

// ===============================
// CATEGORY FILTER
// ===============================

document.querySelectorAll('.cat').forEach(button => {
  button.onclick = () => {
    document.querySelectorAll('.cat').forEach(x =>
      x.classList.remove('active')
    );

    button.classList.add('active');
    category = button.dataset.cat;

    render();
  };
});

// ===============================
// SEARCH AND CART BUTTONS
// ===============================

if ($('#search')) {
  $('#search').oninput = render;
}

if ($('#cartBtn')) {
  $('#cartBtn').onclick = () => {
    $('#cartPanel')?.classList.add('open');
    renderCart();
  };
}

if ($('#closeCart')) {
  $('#closeCart').onclick = () => {
    $('#cartPanel')?.classList.remove('open');
  };
}

if ($('#checkout')) {
  $('#checkout').onclick = () => {
    if (!cart.length) {
      alert('Cart is empty');
      return;
    }

    $('#modal')?.classList.add('show');
  };
}

if ($('#closeModal')) {
  $('#closeModal').onclick = () => {
    $('#modal')?.classList.remove('show');
  };
}

// ===============================
// WHATSAPP ORDER SYSTEM
// ===============================

if ($('#orderForm')) {
  $('#orderForm').onsubmit = async e => {
    e.preventDefault();

    if (!cart.length) {
      alert('Cart is empty');
      return;
    }

    const form = new FormData(e.target);

    const customerName = String(form.get('name') || '').trim();
    const mobile = String(form.get('phone') || '').trim();
    const address = String(form.get('address') || '').trim();
    const payment = String(form.get('payment') || 'Cash on Delivery');

    if (!customerName || !mobile || !address) {
      alert('Please fill in your name, mobile number and address.');
      return;
    }

    // Verify latest prices and stock before submitting.
    const { data: latestProducts, error: stockError } = await supabase
      .from('products')
      .select('id,name,price,stock,is_active')
      .in('id', cart.map(item => Number(item.id)));

    if (stockError) {
      alert('Products verify nahi ho paye. Please try again.');
      return;
    }

    for (const item of cart) {
      const current = latestProducts.find(
        p => String(p.id) === String(item.id)
      );

      if (
        !current ||
        !current.is_active ||
        Number(current.stock) < item.qty
      ) {
        alert(`${item.name} ka stock badal gaya hai. Cart refresh karke dobara try karein.`);
        await load();
        return;
      }

      item.name = current.name;
      item.price = Number(current.price);
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const orderId = 'APB-' + Date.now().toString().slice(-6);

    const itemLines = cart.map((item, index) => {
      const itemTotal = item.price * item.qty;

      return `${index + 1}. ${item.name}
Qty: ${item.qty} × ₹${item.price} = ₹${itemTotal}`;
    }).join('\n\n');

    const message =
`🛒 *NEW ORDER - APNA BAZAAR*

🆔 Order ID: ${orderId}

👤 Customer: ${customerName}
📱 Mobile: ${mobile}

📍 Delivery Address:
${address}

🛍️ *ORDER ITEMS*

${itemLines}

💰 *TOTAL: ₹${total}*

💵 Payment: ${payment}

Please confirm this order with the customer.`;

    const submitButton = e.target.querySelector('[type="submit"]');

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(API + '/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          customer: {
            name: customerName,
            mobile,
            address,
            payment
          },
          items: cart,
          total
        })
      });

      if (!response.ok) {
        throw new Error('Order could not be saved.');
      }

      const whatsappURL =
        `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, '_blank');

      if ($('#orderMessage')) {
        $('#orderMessage').textContent =
          `Order ${orderId} created! Please send the WhatsApp message to complete your order.`;
      }

      cart = [];
      save();
      e.target.reset();

      $('#modal')?.classList.remove('show');
      $('#cartPanel')?.classList.remove('open');

    } catch (error) {
      console.error('Order error:', error);
      alert('Order save nahi ho paya. Please try again.');
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  };
}

// Start the website
load();

// Allow inline HTML buttons to call these functions.
window.add = add;
window.buyNow = buyNow;
window.change = change;
