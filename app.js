const API = '/api';

let products = [];
let cart = JSON.parse(localStorage.getItem('apna_cart') || '[]');
let category = 'All';

const $ = s => document.querySelector(s);


/* LOAD PRODUCTS */
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
}


/* SHOW PRODUCTS */
function render() {

  const q = ($('#search')?.value || '').toLowerCase();

  const filteredProducts = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(q)
  );

  $('#products').innerHTML = filteredProducts.length
    ? filteredProducts.map(p => `

      <article class="card">

        <div class="pic">
          ${
            p.image
              ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.innerHTML='🛒';">`
              : '🛒'
          }
        </div>

        <h3>${p.name}</h3>

        <div class="muted">
          ${p.category}
        </div>

        <div class="price">
          ₹${p.price}
        </div>

        <button
          class="add"
          onclick="add(${p.id})">
          Add to cart
        </button>

      </article>

    `).join('')
    : '<p>No products found.</p>';
}


/* ADD TO CART */
function add(id) {

  const p = products.find(x => x.id === id);

  if (!p) return;

  const x = cart.find(x => x.id === id);

  if (x) {
    x.qty++;
  } else {
    cart.push({
      ...p,
      qty: 1
    });
  }

  save();

  $('#cartPanel').classList.add('open');

}


/* SAVE CART */
function save() {

  localStorage.setItem(
    'apna_cart',
    JSON.stringify(cart)
  );

  updateCart();
  renderCart();

}


/* UPDATE CART COUNT */
function updateCart() {

  $('#cartCount').textContent =
    cart.reduce((a, x) => a + x.qty, 0);

}


/* SHOW CART */
function renderCart() {

  $('#cartItems').innerHTML = cart.length

    ? cart.map(x => `

      <div class="cartRow">

        <div>

          ${
            x.image
              ? `<img src="${x.image}"
                   style="width:55px;height:55px;object-fit:contain;border-radius:8px;background:#f4f4f4;margin-bottom:5px;"
                   onerror="this.style.display='none';">`
              : ''
          }

          <strong>${x.name}</strong>

          <br>

          <small>
            ₹${x.price} × ${x.qty}
          </small>

        </div>

        <div>

          <button onclick="change(${x.id},-1)">
            −
          </button>

          ${x.qty}

          <button onclick="change(${x.id},1)">
            +
          </button>

        </div>

      </div>

    `).join('')

    : '<p>Your cart is empty.</p>';


  $('#total').textContent =
    cart.reduce(
      (a, x) => a + x.price * x.qty,
      0
    );

}


/* CHANGE QUANTITY */
function change(id, n) {

  const x = cart.find(x => x.id === id);

  if (!x) return;

  x.qty += n;

  if (x.qty <= 0) {
    cart = cart.filter(y => y.id !== id);
  }

  save();

}


/* CATEGORY BUTTONS */
document.querySelectorAll('.cat').forEach(b => {

  b.onclick = () => {

    document
      .querySelectorAll('.cat')
      .forEach(x =>
        x.classList.remove('active')
      );

    b.classList.add('active');

    category = b.dataset.cat;

    render();

  };

});


/* SEARCH */
$('#search').oninput = render;


/* OPEN CART */
$('#cartBtn').onclick = () => {

  $('#cartPanel').classList.add('open');

  renderCart();

};


/* CLOSE CART */
$('#closeCart').onclick = () => {

  $('#cartPanel').classList.remove('open');

};


/* CHECKOUT */
$('#checkout').onclick = () => {

  if (!cart.length) {
    return alert('Cart is empty');
  }

  $('#modal').classList.add('show');

};


/* CLOSE CHECKOUT */
$('#closeModal').onclick = () => {

  $('#modal').classList.remove('show');

};


/* PLACE ORDER */
$('#orderForm').onsubmit = async e => {

  e.preventDefault();

  const f = new FormData(e.target);

  const order = {

    customer: Object.fromEntries(f),

    items: cart,

    total: cart.reduce(
      (a, x) => a + x.price * x.qty,
      0
    )

  };


  try {

    await fetch(API + '/orders', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(order)

    });

  } catch (error) {

    console.log(error);

  }


  $('#orderMessage').textContent =
    'Order received! We will contact you shortly.';


  cart = [];

  save();

  e.target.reset();

};


/* START */
load();
