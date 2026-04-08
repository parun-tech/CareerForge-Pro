const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyCheckoutSession, stripeWebhook } = require('../controllers/stripeController');
const { protect } = require('../middleware/auth');

router.post('/create-checkout', protect, createCheckoutSession);
router.get('/verify-session', protect, verifyCheckoutSession);
// Webhook needs raw body, no protect middleware needed
// Handled in server.js directly if required, but here we can define it
// In server.js we mapped this directly: app.use('/api/stripe/webhook', express.raw(), stripeWebhook)
// No, server.js says: app.use('/api/stripe', require('./routes/stripeRoutes'))
// But app.use('/api/stripe/webhook', express.raw({ type: 'application/json' })); is defined BEFORE express.json()
// So this route is hit and the body is raw.
router.post('/webhook', stripeWebhook);

module.exports = router;
