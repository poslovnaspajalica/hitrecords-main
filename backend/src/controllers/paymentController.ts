import { Request, Response } from 'express';
import { paymentService } from '../services/payment/paymentService';
import { confirmBankTransfer, getBankTransferPayments } from '../services/payment/bankTransferConfirmation';

// Get available payment methods
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const methods = await paymentService.getPaymentMethods();
    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
};

// Initialize payment for order
export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, methodId, amount } = req.body;

    if (!orderId || !methodId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await paymentService.initializePayment(orderId, methodId, amount);
    res.json(result);
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ message: error.message || 'Error initializing payment' });
  }
};

// Process payment (for client-side confirmations)
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const result = await paymentService.processPayment(paymentId, req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: error.message || 'Error processing payment' });
  }
};

// Get payment details
export const getPaymentDetails = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPaymentDetails(paymentId);
    res.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    res.status(404).json({ message: error.message || 'Payment not found' });
  }
};

// Admin: Confirm bank transfer
export const confirmBankTransferPayment = async (req: Request, res: Response) => {
  try {
    const result = await confirmBankTransfer(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('Error confirming bank transfer:', error);
    res.status(500).json({ message: error.message || 'Error confirming bank transfer' });
  }
};

// Admin: Get bank transfer payments
export const getBankTransferPaymentsList = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const payments = await getBankTransferPayments(status as string);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching bank transfer payments:', error);
    res.status(500).json({ message: 'Error fetching bank transfer payments' });
  }
}; 