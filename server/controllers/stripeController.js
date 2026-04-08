const Stripe = require('stripe');
const User = require('../models/User');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Checkout Session
// @route   POST /api/stripe/create-checkout
// @access  Private
const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // using one-time payment for pro upgrade
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CareerForge Pro Plan',
              description: 'Unlimited ATS optimized resumes, cover letters, and premium templates.',
            },
            unit_amount: 1999, // $19.99
          },
          quantity: 1,
        },
      ],
      client_reference_id: req.user.id,
      success_url: `${req.headers.origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Verify Checkout Session (Local Workaround)
// @route   GET /api/stripe/verify-session
// @access  Private
const verifyCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'No session id provided' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid') {
      const userId = session.client_reference_id;
      await User.findByIdAndUpdate(userId, { plan: 'pro' });
      return res.json({ message: 'Success', plan: 'pro' });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Stripe Webhook
// @route   POST /api/stripe/webhook
// @access  Public (Called by Stripe)
const stripeWebhook = async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Fulfill the purchase, update user plan
    const userId = session.client_reference_id;
    try {
      await User.findByIdAndUpdate(userId, { plan: 'pro' });
    } catch (err) {
      console.error('Error updating user plan:', err);
    }
  }

  res.status(200).end();
};

module.exports = {
  createCheckoutSession,
  verifyCheckoutSession,
  stripeWebhook
};
