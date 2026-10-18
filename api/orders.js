import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const body = req.body;

    if (
      !body ||
      !body.orderId ||
      !body.customer ||
      !body.customer.name ||
      !body.customer.mobile ||
      !body.customer.address ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return res.status(400).json({
        error: 'Invalid order details'
      });
    }

    const total = Number(body.total);

    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({
        error: 'Invalid total amount'
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: String(body.orderId),
        customer_name: String(body.customer.name),
        customer_phone: String(body.customer.mobile),
        customer_address: String(body.customer.address),
        items: body.items,
        total_amount: total,
        payment_method: String(
          body.customer.payment || 'Cash on Delivery'
        ),
        status: 'Pending'
      })
      .select('id, order_number')
      .single();

    if (error) {
      console.error('Supabase order error:', error);

      return res.status(500).json({
        error: 'Could not save order'
      });
    }

    return res.status(201).json({
      success: true,
      order: data
    });

  } catch (error) {
    console.error('Order API error:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
      }
