const API='/api';
let products=[],cart=JSON.parse(localStorage.getItem('apna_cart')||'[]'),category='All';
const $=s=>document.querySelector(s);

async function load(){
  try{products=await (await fetch(API+'/products')).json()}catch(e){
    products=[
      {id:1,name:'Aashirvaad Atta 5 KG',price:295,category:'Grocery',emoji:'🌾'},
      {id:2,name:'Tata Salt 1 KG',price:28,category:'Grocery',emoji:'🧂'},
      {id:3,name:'Tea 500 GM',price:210,category:'Beverages',emoji:'☕'},
      {id:4,name:'Dishwash Liquid',price:99,category:'Household',emoji:'🧴'},
      {id:5,name:'Bath Soap Pack',price:120,category:'Personal Care',emoji:'🧼'},
      {id:6,name:'Biscuits Family Pack',price:85,category:'Grocery',emoji:'🍪'}
    ];
  }
  render(); updateCart();
}
function render(){
 const q=$('#search').value.toLowerCase();
 $('#products').innerHTML=products.filter(p=>(category==='All'||p.category===category)&&p.name.toLowerCase().includes(q)).map(p=>`
 <article class="card"><div class="pic">${p.emoji||'🛒'}</div><h3>${p.name}</h3><div class="muted">${p.category}</div><div class="price">₹${p.price}</div><button class="add" onclick="add(${p.id})">Add to cart</button></article>`).join('');
}
function add(id){const p=products.find(x=>x.id===id),x=cart.find(x=>x.id===id);x?x.qty++:cart.push({...p,qty:1});save()}
function save(){localStorage.setItem('apna_cart',JSON.stringify(cart));updateCart();renderCart()}
function updateCart(){$('#cartCount').textContent=cart.reduce((a,x)=>a+x.qty,0)}
function renderCart(){
 $('#cartItems').innerHTML=cart.length?cart.map(x=>`<div class="cartRow"><div>${x.name}<br><small>₹${x.price} × ${x.qty}</small></div><div><button onclick="change(${x.id},-1)">−</button> ${x.qty} <button onclick="change(${x.id},1)">+</button></div></div>`).join(''):'<p>Your cart is empty.</p>';
 $('#total').textContent=cart.reduce((a,x)=>a+x.price*x.qty,0);
}
function change(id,n){const x=cart.find(x=>x.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(y=>y.id!==id);save()}
document.querySelectorAll('.cat').forEach(b=>b.onclick=()=>{document.querySelectorAll('.cat').forEach(x=>x.classList.remove('active'));b.classList.add('active');category=b.dataset.cat;render()});
$('#search').oninput=render;
$('#cartBtn').onclick=()=>{$('#cartPanel').classList.add('open');renderCart()};
$('#closeCart').onclick=()=>$('#cartPanel').classList.remove('open');
$('#checkout').onclick=()=>{if(!cart.length)return alert('Cart is empty');$('#modal').classList.add('show')};
$('#closeModal').onclick=()=>$('#modal').classList.remove('show');
$('#orderForm').onsubmit=async e=>{
 e.preventDefault();const f=new FormData(e.target),order={customer:Object.fromEntries(f),items:cart,total:cart.reduce((a,x)=>a+x.price*x.qty,0)};
 try{await fetch(API+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(order)})}catch{}
 $('#orderMessage').textContent='Order received! We will contact you shortly.';
 cart=[];save();e.target.reset();
};
load();
