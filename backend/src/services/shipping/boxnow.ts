import { default as axios } from 'axios';
import { 
  ShippingProvider, 
  CreateShipmentData, 
  ShipmentResponse,
  TrackingResponse,
  ShippingRate,
  RateCalculationData
} from '../../interfaces/shipping';

export class BoxNowProvider implements ShippingProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, isDevelopment = false) {
    this.apiKey = apiKey;
    this.apiUrl = isDevelopment 
      ? 'https://api.sandbox.boxnow.hr/v1'
      : 'https://api.boxnow.hr/v1';
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`BoxNow API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createShipment(data: CreateShipmentData): Promise<ShipmentResponse> {
    if (!data.isPickupPoint || !data.pickupPointId) {
      throw new Error('BoxNow requires a pickup point');
    }

    const payload = {
      merchant: {
        name: process.env.COMPANY_NAME,
        address: {
          street: process.env.COMPANY_STREET,
          city: process.env.COMPANY_CITY,
          postcode: process.env.COMPANY_POSTAL_CODE,
          country: 'HR'
        },
        contact: {
          name: process.env.COMPANY_CONTACT,
          phone: process.env.COMPANY_PHONE,
          email: process.env.COMPANY_EMAIL
        }
      },
      recipient: {
        name: data.recipientName,
        phone: data.recipientPhone,
        email: data.recipientEmail
      },
      delivery: {
        boxId: data.pickupPointId
      },
      parcels: data.packages.map(pkg => ({
        weight: pkg.weight * 1000, // BoxNow očekuje težinu u gramima
        width: (pkg.width || 30) * 10, // BoxNow očekuje dimenzije u milimetrima
        height: (pkg.height || 30) * 10,
        length: (pkg.length || 30) * 10
      })),
      reference: data.orderId,
      notifications: true // Uključi SMS/email notifikacije
    };

    const response = await this.request('POST', '/shipments', payload);

    return {
      shipmentId: response.id,
      trackingNumber: response.trackingCode,
      labelUrl: response.labelUrl,
      estimatedDeliveryDate: new Date(Date.now() + response.estimatedDeliveryDays * 24 * 60 * 60 * 1000)
    };
  }

  async getLabel(shipmentId: string): Promise<string> {
    const response = await this.request('GET', `/shipments/${shipmentId}/label`);
    return response.labelUrl;
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    const response = await this.request('GET', `/tracking/${trackingNumber}`);

    return {
      status: this.mapStatus(response.status),
      statusDate: new Date(response.lastUpdate),
      location: response.currentBox?.name,
      events: response.history.map((event: any) => ({
        status: this.mapStatus(event.status),
        date: new Date(event.timestamp),
        location: event.box?.name || '',
        description: event.description
      })),
      isDelivered: response.status === 'DELIVERED',
      deliveryDate: response.status === 'DELIVERED' ? new Date(response.lastUpdate) : undefined
    };
  }

  private mapStatus(boxnowStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'pending',
      'IN_TRANSIT': 'processing',
      'IN_BOX': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RETURNED': 'cancelled'
    };
    return statusMap[boxnowStatus] || boxnowStatus;
  }

  async calculateRates(data: RateCalculationData): Promise<ShippingRate[]> {
    if (!data.isPickupPoint) {
      return []; // BoxNow radi samo s pickup points
    }

    // BoxNow ima fiksne cijene bazirane na veličini paketa
    const basePrice = 3.99;
    const weightFactor = Math.ceil(data.weight / 5); // Svakih 5kg dodatna naplata

    const price = basePrice + (weightFactor - 1) * 2;

    return [{
      id: 'boxnow_standard',
      name: 'BoxNow Standard Delivery',
      price,
      currency: 'EUR',
      estimatedDays: 2,
      provider: 'boxnow'
    }];
  }

  // Dodatna metoda specifična za BoxNow
  async getPickupPoints(postalCode: string): Promise<Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    location: {
      lat: number;
      lng: number;
    };
    workingHours: string;
  }>> {
    const response = await this.request('GET', `/boxes?postcode=${postalCode}`);
    
    return response.boxes.map((box: any) => ({
      id: box.id,
      name: box.name,
      address: box.address.street,
      city: box.address.city,
      postalCode: box.address.postcode,
      location: {
        lat: box.location.latitude,
        lng: box.location.longitude
      },
      workingHours: box.workingHours
    }));
  }
} 