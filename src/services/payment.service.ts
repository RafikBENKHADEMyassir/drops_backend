// import Stripe from 'stripe';
// import { PrismaClient } from '@prisma/client';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2025-03-31.basil', // Use the appropriate Stripe API version
// });

// const prisma = new PrismaClient();

// interface PaymentResult {
//   clientSecret: string;
//   paymentIntentId: string;
// }

// interface PriceCalculation {
//   qrCodePrice: number;
//   shippingCost: number;
//   totalAmount: number;
// }

// /**
//  * Payment Service
//  */
// class PaymentService {
//   /**
//    * Create a payment intent with Stripe
//    * @param amount - Amount to charge
//    * @param currency - Currency code (e.g., 'usd')
//    * @param orderId - ID of the order
//    */
//   async createPaymentIntent(amount: number, currency: string = 'usd', orderId: string): Promise<PaymentResult> {
//     try {
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // Stripe expects amount in cents
//         currency,
//         metadata: {
//           orderId
//         }
//       });
      
//       return {
//         clientSecret: paymentIntent.client_secret!,
//         paymentIntentId: paymentIntent.id
//       };
//     } catch (error) {
//       console.error('Error creating payment intent:', error);
//       throw new Error('Failed to create payment intent');
//     }
//   }
  
//   /**
//    * Process a payment webhook from Stripe
//    * @param event - Stripe webhook event
//    */
//   async processPaymentWebhook(event: Stripe.Event): Promise<void> {
//     try {
//       switch (event.type) {
//         case 'payment_intent.succeeded':
//           await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
//           break;
//         case 'payment_intent.payment_failed':
//           await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
//           break;
//         // Handle other events as needed
//       }
//     } catch (error) {
//       console.error('Error processing payment webhook:', error);
//       throw error;
//     }
//   }
  
//   /**
//    * Handle successful payment
//    * @param paymentIntent - Stripe payment intent object
//    */
//   async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
//     try {
//       const orderId = paymentIntent.metadata.orderId;
      
//       // Update order status
//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           paymentStatus: 'paid',
//           updatedAt: new Date()
//         }
//       });
      
//       // Update postal drop status
//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: { postalDrop: true }
//       });
      
//       if (order && order.postalDrop) {
//         await prisma.postalDrop.update({
//           where: { id: order.postalDrop.id },
//           data: {
//             status: 'ordered',
//             updatedAt: new Date()
//           }
//         });
//       }
      
//       // Here you would add code to initiate the printing process
//       // This could involve calling a printing service API
//     } catch (error) {
//       console.error('Error handling successful payment:', error);
//       throw error;
//     }
//   }
  
//   /**
//    * Handle failed payment
//    * @param paymentIntent - Stripe payment intent object
//    */
//   async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
//     try {
//       const orderId = paymentIntent.metadata.orderId;
      
//       // Update order status
//       await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           paymentStatus: 'failed',
//           updatedAt: new Date()
//         }
//       });
//     } catch (error) {
//       console.error('Error handling failed payment:', error);
//       throw error;
//     }
//   }
  
//   /**
//    * Calculate total price for a postal drop order
//    * @param qrCodeType - Type of QR code (static/dynamic)
//    * @param shippingMethod - Shipping method
//    */
//   calculateOrderTotal(qrCodeType: 'static' | 'dynamic', shippingMethod: string): PriceCalculation {
//     // QR code prices
//     const qrCodePrices = {
//       static: 3.99,
//       dynamic: 5.99
//     };
    
//     // Shipping costs
//     const shippingCosts: Record<string, number> = {
//       standard: 1.50,
//       express: 3.99,
//       priority: 6.99
//     };
    
//     const qrCodePrice = qrCodePrices[qrCodeType] || qrCodePrices.static;
//     const shippingCost = shippingCosts[shippingMethod] || shippingCosts.standard;
    
//     return {
//       qrCodePrice,
//       shippingCost,
//       totalAmount: qrCodePrice + shippingCost
//     };
//   }
// }

// export default new PaymentService();