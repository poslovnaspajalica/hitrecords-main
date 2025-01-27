export interface CheckoutItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
}

export interface PaymentData {
  methodId: string;
  returnUrl?: string;
  cancelUrl?: string;
  // Dodatni podaci specifični za način plaćanja
  paypalEmail?: string;
  cardholderName?: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  shippingMethod: {
    id: string;
    price: number;
  };
  payment: PaymentData;
  totalAmount: number;
} 