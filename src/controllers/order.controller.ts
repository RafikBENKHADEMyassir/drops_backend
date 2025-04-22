import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// import paymentService from '../services/payment.service';
import printingService from '../services/printing.service';
// import Stripe from 'stripe';

const prisma = new PrismaClient();

interface CreateOrderRequest extends Request {
  params: {
    postalDropId: string;
  }
  body: {
    shippingMethod: string;
    paymentMethod: string;
    currency: string;
  }
  user: {
    userId: string;
  }
}


/**
 * Order Controller
 */
class OrderController {
  /**
   * Create a new order for a postal drop
   */
  async createOrder(req: CreateOrderRequest, res: Response) {
    try {
      const { postalDropId } = req.params;
      const { shippingMethod, paymentMethod, currency = 'usd' } = req.body;
      const userId = req.user.userId;
      
      // Verify ownership of the postal drop
      const postalDrop = await prisma.postalDrop.findUnique({
        where: { id: postalDropId },
        include: { 
          qrCode: true,
          order: true
        }
      });
      
      if (!postalDrop) {
        return res.status(404).json({
          success: false,
          message: 'Postal drop not found'
        });
      }
      
      if (postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this postal drop'
        });
      }
      
      // Check if an order already exists
      if (postalDrop.order) {
        return res.status(400).json({
          success: false,
          message: 'This postal drop already has an order'
        });
      }
      
      // Check if a QR code exists
      if (!postalDrop.qrCode) {
        return res.status(400).json({
          success: false,
          message: 'Postal drop must have a QR code before ordering'
        });
      }
      
      // Calculate order total
      // const { shippingCost, totalAmount } = 
      //   paymentService.calculateOrderTotal(
      //     postalDrop.qrCode.type as 'static' | 'dynamic', 
      //     shippingMethod
      //   );
      
      // Create the order
      const order = await prisma.order.create({
        data: {
          postalDropId,
          amount: 5,//totalAmount,
          currency,
          shippingMethod,
          shippingCost:2,
          paymentMethod,
          paymentStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Create a payment intent
      // const paymentIntent = await paymentService.createPaymentIntent(
      //   totalAmount,
      //   currency,
      //   order.id
      // );
      
      res.status(201).json({
        success: true,
        order,
        payment: {
          clientSecret: 'fdff',// paymentIntent.clientSecret,
          amount:7,// totalAmount,
          currency
        }
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
    return; // Ensure all code paths return a value
  }
  
  /**
   * Process payment webhook from payment provider
   */
  async processPaymentWebhook(_req: Request, res: Response): Promise<void> {
    try {
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const signature = req.headers['stripe-signature'] as string;
      // const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  
      // let event: Stripe.Event;
  
      try {
        // For Stripe webhooks, need to use raw body
        // const rawBody = (req as any).rawBody || req.body;
        // event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed',
          error: err.message
        });
        return;
      }
  
      // await paymentService.processPaymentWebhook(event);
      
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error processing payment webhook:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook error',
        error: error.message
      });
    }
  }
  
  /**
   * Get order status
   */
  async getOrderStatus(req: Request<{ orderId: string }>, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = (req as any).user.userId;
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          postalDrop: true
        }
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      // Verify ownership via postal drop
      if (order.postalDrop.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this order'
        });
      }
      
      // Get print status if applicable
      let printStatus = null;
      if (order.paymentStatus === 'paid') {
        printStatus = await printingService.checkPrintStatus(order.postalDropId);
      }
      
      return res.status(200).json({
        success: true,
        order,
        printStatus
      });
    } catch (error: any) {
      console.error('Error retrieving order status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve order status',
        error: error.message
      });
    }
  }
  
  /**
   * Get all orders for a user
   */
  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      
      const orders = await prisma.order.findMany({
        where: {
          postalDrop: {
            userId
          }
        },
        include: {
          postalDrop: {
            include: {
              qrCode: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // res.status(200).json({
      //   success: true,
      //   orders
      // });
      res.status(200).json(
        orders
      );
    } catch (error: any) {
      console.error('Error retrieving user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error.message
      });
    }
  }
}

export default new OrderController();