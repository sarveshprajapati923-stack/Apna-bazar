const products = [
  {
    id: 1,
    name: 'Wheel Active 2 in 1 Detergent Powder - 1kg',
    price: 75,
    category: 'Household',
    image: '/images/wheel.jpg'
  },
  {
    id: 2,
    name: 'Ghadi Detergent Powder - 3kg',
    price: 210,
    category: 'Household',
    image: '/images/ghadi.jpg'
  },
  {
    id: 3,
    name: 'Tide Naturals Detergent Powder - 3kg',
    price: 235,
    category: 'Household',
    image: '/images/tide.jpg'
  },
  {
    id: 4,
    name: 'Closeup Toothpaste - 300g Pack of 2',
    price: 160,
    category: 'Personal Care',
    image: '/images/closeup.jpg'
  }
];

export default function handler(req, res) {
  res.status(200).json(products);
}
