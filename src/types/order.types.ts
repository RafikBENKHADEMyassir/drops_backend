import { Request } from 'express';

export interface CreateOrderRequest extends Request {
  params: {
    postalDropId: string;
  };
  body: {
    shippingMethod: string;
    paymentMethod: string;
    currency?: string;
  };
  user: {
    userId: string;
  };
}