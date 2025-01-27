import { default as axios } from 'axios';
import { 
  ShippingProvider, 
  CreateShipmentData, 
  ShipmentResponse,
  TrackingResponse,
  ShippingRate,
  RateCalculationData
} from '../../interfaces/shipping';

export class OverseasProvider implements ShippingProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, isDevelopment = false) {
    this.apiKey = apiKey;
    this.apiUrl = isDevelopment 
      ? 'https://apitest.overseas.hr/api/v1'
      : 'https://api.overseas.hr/api/v1';
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Overseas API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createShipment(data: CreateShipmentData): Promise<ShipmentResponse> {
    const payload = {
      sender: {
        name: process.env.COMPANY_NAME,
        street: process.env.COMPANY_STREET,
        city: process.env.COMPANY_CITY,
        postCode: process.env.COMPANY_POSTAL_CODE,
        country: 'HR',
        contact: process.env.COMPANY_CONTACT,
        phone: process.env.COMPANY_PHONE,
        email: process.env.COMPANY_EMAIL
      },
      receiver: {
        name: data.recipientName,
        street: data.address.street,
        city: data.address.city,
        postCode: data.address.postalCode,
        country: data.address.countryCode,
        phone: data.recipientPhone,
        email: data.recipientEmail
      },
      parcels: data.packages.map(pkg => ({
        weight: pkg.weight,
        width: pkg.width || 30,
        height: pkg.height || 30,
        length: pkg.length || 30
      })),
      service: 'express',
      reference: data.orderId,
      pickupPoint: data.isPickupPoint ? data.pickupPointId : undefined,
      cod: false
    };

    const response = await this.request('POST', '/shipments', payload);

    return {
      shipmentId: response.id,
      trackingNumber: response.trackingNumber,
      labelUrl: response.labelUrl,
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Overseas ne vraća procijenjeni datum dostave
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
      location: response.currentLocation,
      events: response.history.map((event: any) => ({
        status: this.mapStatus(event.status),
        date: new Date(event.timestamp),
        location: event.location,
        description: event.description
      })),
      isDelivered: response.status === 'DELIVERED',
      deliveryDate: response.status === 'DELIVERED' ? new Date(response.lastUpdate) : undefined
    };
  }

  private mapStatus(overseasStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'CREATED': 'pending',
      'IN_TRANSIT': 'processing',
      'OUT_FOR_DELIVERY': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    return statusMap[overseasStatus] || overseasStatus;
  }

  async calculateRates(data: RateCalculationData): Promise<ShippingRate[]> {
    const payload = {
      from: {
        postCode: data.fromPostalCode,
        country: 'HR'
      },
      to: {
        postCode: data.toPostalCode,
        country: data.toCountryCode
      },
      parcels: [{
        weight: data.weight,
        dimensions: {
          width: 30,
          height: 30,
          length: 30
        }
      }],
      pickupPoint: data.isPickupPoint
    };

    const response = await this.request('POST', '/rates', payload);

    return response.services.map((service: any) => ({
      id: service.code,
      name: service.name,
      price: service.price,
      currency: 'EUR',
      estimatedDays: service.estimatedDays || 2,
      provider: 'overseas'
    }));
  }
} 