import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, successUrl, cancelUrl } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }

    const line_items = items.map((it) => ({ price_data: { currency: it.currency || 'usd', product_data: { name: it.name }, unit_amount: Math.round((it.amount || 0) * 100) }, quantity: it.quantity || 1 }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-cancel`,
    });

    res.status(200).json({ success: true, url: session.url });
    try {
      const { logEvent } = await import('../utils/audit.js');
      logEvent({ action: 'checkout_session_created', sessionId: session.id, user: req.user?.id || null });
    } catch (e) {
      // ignore
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
