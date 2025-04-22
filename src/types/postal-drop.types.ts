
export interface Address {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  export interface DesignElement {
    type: string; // 'image', 'text', etc.
    content: string;
    position: {
      x: number;
      y: number;
    };
    size: {
      width: number;
      height: number;
    };
    rotation?: number;
    style?: Record<string, any>;
  }
  
  export interface CardDesign {
    backgroundColor?: string;
    elements: DesignElement[];
  }
  
  export interface QrCodeData {
    type: 'static' | 'dynamic';
    contentType: 'image' | 'video' | 'audio';
    contentUrl: string;
    thumbnailUrl?: string;
  }
  
  export interface OrderData {
    shippingMethod: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    shippingCost: number;
  }
  
  export interface PostalDropData {
    userId: string;
    status: 'draft' | 'ordered' | 'printing' | 'shipped' | 'delivered';
    cardType: string;
    frontDesign: CardDesign;
    backDesign: CardDesign;
    recipientAddress: Address;
    senderAddress: Address;
    personalMessage?: string;
  }