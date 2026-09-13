const API = '/api';

let products = [];
let cart = JSON.parse(localStorage.getItem('apna_cart') || '[]');
let category = 'All';

// APNA BAZAAR SHOP OWNER WHATSAPP NUMBER
const SHOP_WHATSAPP = '917800632404';

const $ = s => document.querySelector(s);

async function load() {
  try {
    const response = await fetch(API + '/products');

    if (!response.ok) {
      throw new Error('Products API failed');
    }

    products = await response.json();
  } catch (e) {
    products = [];
  }

  render();
  updateCart();
  renderCart();
}

function render() {
  const searchBox = $('#search');
  const q = searchBox ? searchBox.value.toLowerCase() : '';

  $('#products').innerHTML = products
    .filter(p =>
      (category === 'All' || p.category === category) &&
      p.name.toLowerCase().includes(q)
    )
    .map(p => `
      <article class="card">

        <div class="pic">
          ${
            p.image
              ? `<img src="${p.image}" alt="${p.name}"
                  onerror="this.style.display='none';this.parentElement.innerHTML='🛒';">`
              : '🛒'
          }
        </div>

        <h3>${p.name}</h3>

        <div class="muted">${p.category}</div>

        <div class="price">₹${p.price}</div>

        <button class="add" onclick="add(${p.id})">
          Add to cart
        </button>

      </article>
    `)
    .join('');
}

function add(id) {
  const p = products.find(x => x.id === id);

  if (!p) return;

  const existing = cart.find(x => x.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      ...p,
      qty: 1
    });
  }

  save();

  // Open cart after adding product
  $('#cartPanel').classList.add('open');
  renderCart();
}

function save() {
  localStorage.setItem('apna_cart', JSON.stringify(cart));
  updateCart();
  renderCart();
}

function updateCart() {
  $('#cartCount').textContent =
    cart.reduce((total, item) => total + item.qty, 0);
}

function renderCart() {
  $('#cartItems').innerHTML = cart.length
    ? cart.map(item => `
        <div class="cartRow">

          <div>
            <strong>${item.name}</strong>
            <br>
            <small>₹${item.price} × ${item.qty}</small>
          </div>

          <div>
            <button onclick="change(${item.id}, -1)">−</button>
            ${item.qty}
            <button onclick="change(${item.id}, 1)">+</button>
          </div>

        </div>
      `).join('')
    : '<p>Your cart is empty.</p>';

  $('#total').textContent =
    cart.reduce((total, item) => total + item.price * item.qty, 0);
}

function change(id, amount) {
  const item = cart.find(x => x.id === id);

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(x => x.id !== id);
  }

  save();
}

document.querySelectorAll('.cat').forEach(button => {
  button.onclick = () => {

    document
      .querySelectorAll('.cat')
      .forEach(x => x.classList.remove('active'));

    button.classList.add('active');

    category = button.dataset.cat;

    render();
  };
});

$('#search').oninput = render;

$('#cartBtn').onclick = () => {
  $('#cartPanel').classList.add('open');
  renderCart();
};

$('#closeCart').onclick = () => {
  $('#cartPanel').classList.remove('open');
};

$('#checkout').onclick = () => {

  if (!cart.length) {
    alert('Cart is empty');
    return;
  }

  $('#modal').classList.add('show');
};

$('#closeModal').onclick = () => {
  $('#modal').classList.remove('show');
};


// ===============================
// WHATSAPP ORDER SYSTEM
// ===============================

$('#orderForm').onsubmit = async e => {

  e.preventDefault();

  if (!cart.length) {
    alert('Cart is empty');
    return;
  }

  const form = new FormData(e.target);

  const customerName = form.get('name') || '';
  const mobile = form.get('mobile') || '';
  const address = form.get('address') || '';
  const payment = form.get('payment') || 'Cash on Delivery';

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  // Generate order ID
  const orderId =
    'APB-' + Date.now().toString().slice(-6);

  // Create item list
  const itemLines = cart.map((item, index) => {

    const itemTotal = item.price * item.qty;

    return `${index + 1}. ${item.name}
Qty: ${item.qty} × ₹${item.price} = ₹${itemTotal}`;

  }).join('\n\n');


  // WhatsApp message
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

  // Save order to API
  try {

    await fetch(API + '/orders', {
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

  } catch (error) {
    console.log('Order API error:', error);
  }


  // WhatsApp URL
  const whatsappURL =
    `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;

  // Open WhatsApp
  window.open(whatsappURL, '_blank');


  // Customer confirmation
  $('#orderMessage').innerHTML =
    `<strong>Order ${orderId} created!</strong><br>
     Please send the WhatsApp message to complete your order.`;

  // Clear cart
  cart = [];
  save();

  // Reset form
  e.target.reset();
};

load();
