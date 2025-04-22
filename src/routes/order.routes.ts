import express, { Request } from 'express';
import orderController from '../controllers/order.controller';
import { authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
// Process payment webhook
router.post('/webhook', orderController.processPaymentWebhook);

// Protected routes
router.use(authenticateUser);

// Create a new order for a postal drop
router.post('/:postalDropId', (req: Request, res) => {
    // Type assertion to ensure req has the user property
    const enhancedReq = req as any;
    orderController.createOrder(enhancedReq, res);
  });
// Get order status
router.get('/:orderId/status', (req, res) => {
    orderController.getOrderStatus(req, res);
  });
// Get all orders for current user
router.get('/', orderController.getUserOrders);

export default router;