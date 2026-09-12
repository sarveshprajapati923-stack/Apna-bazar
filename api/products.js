const products = [
  {id:1,name:'Aashirvaad Atta 5 KG',price:295,category:'Grocery',emoji:'🌾'},
  {id:2,name:'Tata Salt 1 KG',price:28,category:'Grocery',emoji:'🧂'},
  {id:3,name:'Tea 500 GM',price:210,category:'Beverages',emoji:'☕'},
  {id:4,name:'Dishwash Liquid',price:99,category:'Household',emoji:'🧴'},
  {id:5,name:'Bath Soap Pack',price:120,category:'Personal Care',emoji:'🧼'},
  {id:6,name:'Biscuits Family Pack',price:85,category:'Grocery',emoji:'🍪'}
];

export default function handler(req, res) {
  res.status(200).json(products);
}
