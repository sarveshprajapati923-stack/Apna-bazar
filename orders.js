export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const order = { id: Date.now(), createdAt: new Date().toISOString(), ...req.body };
  // Demo only: Vercel functions are stateless. Use MongoDB/Supabase/Postgres for real orders.
  console.log('NEW ORDER', JSON.stringify(order));
  res.status(201).json({success:true, orderId: order.id});
}
