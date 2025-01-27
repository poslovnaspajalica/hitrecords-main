import { default as axios } from 'axios';
import { 
  ShippingProvider, 
  CreateShipmentData, 
  ShipmentResponse,
  TrackingResponse,
  ShippingRate,
  RateCalculationData
} from '../../interfaces/shipping';

export class DHLProvider implements ShippingProvider {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;

  constructor(apiKey: string, apiSecret: string, isDevelopment = false) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiUrl = isDevelopment 
      ? 'https://api-sandbox.dhl.com/express/v1'
      : 'https://api.dhl.com/express/v1';
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${this.apiUrl}${endpoint}`,
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`DHL API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  async createShipment(data: CreateShipmentData): Promise<ShipmentResponse> {
    const payload = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false,
        pickupLocation: {
          companyName: process.env.COMPANY_NAME,
          address: {
            streetLines: [process.env.COMPANY_STREET],
            city: process.env.COMPANY_CITY,
            postalCode: process.env.COMPANY_POSTAL_CODE,
            countryCode: 'HR'
          },
          contactInformation: {
            email: process.env.COMPANY_EMAIL,
            phone: process.env.COMPANY_PHONE,
            companyName: process.env.COMPANY_NAME,
            fullName: process.env.COMPANY_CONTACT
          }
        }
      },
      productCode: 'P', // Express Worldwide
      accounts: [{
        typeCode: 'shipper',
        number: process.env.DHL_ACCOUNT_NUMBER
      }],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            streetLines: [process.env.COMPANY_STREET],
            city: process.env.COMPANY_CITY,
            postalCode: process.env.COMPANY_POSTAL_CODE,
            countryCode: 'HR'
          },
          contactInformation: {
            email: process.env.COMPANY_EMAIL,
            phone: process.env.COMPANY_PHONE,
            companyName: process.env.COMPANY_NAME,
            fullName: process.env.COMPANY_CONTACT
          }
        },
        receiverDetails: {
          postalAddress: {
            streetLines: [data.address.street],
            city: data.address.city,
            postalCode: data.address.postalCode,
            countryCode: data.address.countryCode
          },
          contactInformation: {
            email: data.recipientEmail,
            phone: data.recipientPhone,
            fullName: data.recipientName
          }
        }
      },
      content: {
        packages: data.packages.map(pkg => ({
          weight: pkg.weight,
          dimensions: {
            length: pkg.length || 30,
            width: pkg.width || 30,
            height: pkg.height || 30
          }
        })),
        isCustomsDeclarable: data.address.countryCode !== 'HR',
        description: 'Music equipment and accessories',
        incoterm: 'DAP'
      }
    };

    const response = await this.request('POST', '/shipments', payload);

    return {
      shipmentId: response.shipmentTrackingNumber,
      trackingNumber: response.shipmentTrackingNumber,
      labelUrl: response.documents.find((doc: any) => doc.typeCode === 'label').contentUrl,
      estimatedDeliveryDate: new Date(response.estimatedDeliveryDate)
    };
  }

  async getLabel(shipmentId: string): Promise<string> {
    const response = await this.request('GET', `/shipments/${shipmentId}/documents`);
    return response.documents.find((doc: any) => doc.typeCode === 'label').contentUrl;
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    const response = await this.request('GET', `/tracking/${trackingNumber}`);
    const shipment = response.shipments[0];

    return {
      status: this.mapStatus(shipment.status.statusCode),
      statusDate: new Date(shipment.status.timestamp),
      location: shipment.status.location?.address?.addressLocality,
      events: shipment.events.map((event: any) => ({
        status: this.mapStatus(event.statusCode),
        date: new Date(event.timestamp),
        location: event.location?.address?.addressLocality || '',
        description: event.description
      })),
      isDelivered: shipment.status.statusCode === 'delivered',
      deliveryDate: shipment.status.statusCode === 'delivered' 
        ? new Date(shipment.status.timestamp) 
        : undefined
    };
  }

  private mapStatus(dhlStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'pre-transit': 'pending',
      'transit': 'processing',
      'out-for-delivery': 'shipped',
      'delivered': 'delivered',
      'failure': 'cancelled'
    };
    return statusMap[dhlStatus] || dhlStatus;
  }

  async calculateRates(data: RateCalculationData): Promise<ShippingRate[]> {
    const payload = {
      customerDetails: {
        shipperDetails: {
          postalCode: data.fromPostalCode,
          countryCode: 'HR'
        },
        receiverDetails: {
          postalCode: data.toPostalCode,
          countryCode: data.toCountryCode
        }
      },
      plannedShippingDate: new Date().toISOString().split('T')[0],
      unitOfMeasurement: 'metric',
      packages: [{
        weight: data.weight,
        dimensions: {
          length: 30,
          width: 30,
          height: 30
        }
      }]
    };

    const response = await this.request('POST', '/rates', payload);

    return response.products.map((product: any) => ({
      id: product.productCode,
      name: product.productName,
      price: product.totalPrice,
      currency: product.totalPriceCurrency,
      estimatedDays: product.deliveryCapabilities.estimatedDeliveryDateAndTime 
        ? Math.ceil((new Date(product.deliveryCapabilities.estimatedDeliveryDateAndTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 3,
      provider: 'dhl'
    }));
  }
} 