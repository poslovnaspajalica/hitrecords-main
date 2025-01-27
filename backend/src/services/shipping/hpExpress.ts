import { default as axios } from 'axios';
import { 
  ShippingProvider, 
  CreateShipmentData, 
  ShipmentResponse,
  TrackingResponse,
  ShippingRate,
  RateCalculationData
} from '../../interfaces/shipping';

export class HPExpressProvider implements ShippingProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, isDevelopment = false) {
    this.apiKey = apiKey;
    this.apiUrl = isDevelopment 
      ? 'https://test.api.posta.hr/v1'
      : 'https://api.posta.hr/v1';
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
      throw new Error(`HP Express API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createShipment(data: CreateShipmentData): Promise<ShipmentResponse> {
    const payload = {
      sender: {
        name: process.env.COMPANY_NAME,
        street: process.env.COMPANY_STREET,
        city: process.env.COMPANY_CITY,
        postalCode: process.env.COMPANY_POSTAL_CODE,
        countryCode: 'HR',
        contact: process.env.COMPANY_CONTACT,
        phone: process.env.COMPANY_PHONE,
        email: process.env.COMPANY_EMAIL
      },
      recipient: {
        name: data.recipientName,
        street: data.address.street,
        city: data.address.city,
        postalCode: data.address.postalCode,
        countryCode: data.address.countryCode,
        phone: data.recipientPhone,
        email: data.recipientEmail
      },
      packages: data.packages.map(pkg => ({
        weight: pkg.weight,
        width: pkg.width || 30,
        height: pkg.height || 30,
        length: pkg.length || 30
      })),
      service: data.isPickupPoint ? 'pickup_point' : 'door_to_door',
      pickupPointId: data.pickupPointId,
      reference: data.orderId
    };

    const response = await this.request('POST', '/shipments', payload);

    return {
      shipmentId: response.shipmentId,
      trackingNumber: response.trackingNumber,
      labelUrl: response.labelUrl,
      estimatedDeliveryDate: new Date(response.estimatedDelivery)
    };
  }

  async getLabel(shipmentId: string): Promise<string> {
    const response = await this.request('GET', `/shipments/${shipmentId}/label`);
    return response.labelUrl;
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    const response = await this.request('GET', `/tracking/${trackingNumber}`);

    return {
      status: response.status,
      statusDate: new Date(response.statusDate),
      location: response.location,
      events: response.events.map((event: any) => ({
        status: event.status,
        date: new Date(event.date),
        location: event.location,
        description: event.description
      })),
      isDelivered: response.status === 'delivered',
      deliveryDate: response.status === 'delivered' ? new Date(response.statusDate) : undefined
    };
  }

  async calculateRates(data: RateCalculationData): Promise<ShippingRate[]> {
    const response = await this.request('POST', '/rates/calculate', {
      fromPostalCode: data.fromPostalCode,
      toPostalCode: data.toPostalCode,
      toCountryCode: data.toCountryCode,
      weight: data.weight,
      service: data.isPickupPoint ? 'pickup_point' : 'door_to_door'
    });

    return response.rates.map((rate: any) => ({
      id: rate.id,
      name: rate.name,
      price: rate.price,
      currency: 'EUR',
      estimatedDays: rate.estimatedDays,
      provider: 'hp_express'
    }));
  }
} 