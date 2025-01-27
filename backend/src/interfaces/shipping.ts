export interface ShippingProvider {
  createShipment(data: CreateShipmentData): Promise<ShipmentResponse>;
  getLabel(shipmentId: string): Promise<string>;
  getTracking(trackingNumber: string): Promise<TrackingResponse>;
  calculateRates(data: RateCalculationData): Promise<ShippingRate[]>;
}

export interface CreateShipmentData {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    countryCode: string;
  };
  packages: Array<{
    weight: number;
    width?: number;
    height?: number;
    length?: number;
  }>;
  isPickupPoint?: boolean;
  pickupPointId?: string;
  shippingRateId: string;
}

export interface ShipmentResponse {
  shipmentId: string;
  trackingNumber: string;
  labelUrl?: string;
  estimatedDeliveryDate?: Date;
}

export interface TrackingResponse {
  status: string;
  statusDate: Date;
  location?: string;
  events: Array<{
    status: string;
    date: Date;
    location: string;
    description: string;
  }>;
  isDelivered: boolean;
  deliveryDate?: Date;
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  currency: string;
  estimatedDays: number;
  provider: string;
}

export interface RateCalculationData {
  fromPostalCode: string;
  toPostalCode: string;
  toCountryCode: string;
  weight: number;
  isPickupPoint?: boolean;
} 