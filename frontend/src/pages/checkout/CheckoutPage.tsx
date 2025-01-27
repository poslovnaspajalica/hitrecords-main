import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethodSelector } from '../../components/checkout/PaymentMethodSelector';
import { PaymentForm } from '../../components/checkout/PaymentForm';
import { PaymentInstructions } from '../../components/checkout/PaymentInstructions';
import { PaymentMethod, PaymentFormData, PaymentResponse } from '../../types/payment';
import { paymentService } from '../../services/paymentService';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cart, totalAmount, clearCart } = useCart();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentResponse['instructions']>();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      setLoading(false);
    } catch (error) {
      showToast('Greška pri učitavanju načina plaćanja', 'error');
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    if (!cart.length) {
      showToast('Vaša košarica je prazna', 'error');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentService.processPayment({
        items: cart,
        totalAmount,
        payment: formData
      });

      // Handle different payment responses
      switch (response.status) {
        case 'redirect':
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
          break;

        case 'pending':
          if (response.instructions) {
            setPaymentInstructions(response.instructions);
            clearCart();
          }
          break;

        case 'success':
          clearCart();
          navigate(`/checkout/success?orderId=${response.orderId}`);
          break;
      }
    } catch (error: any) {
      showToast(error.message || 'Greška pri obradi plaćanja', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  if (paymentInstructions) {
    return (
      <PaymentInstructions
        instructions={paymentInstructions}
        onClose={() => navigate('/checkout/success')}
      />
    );
  }

  return (
    <div className="checkout-page">
      <h2>Plaćanje</h2>
      
      <div className="order-summary">
        <h3>Pregled narudžbe</h3>
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>{item.quantity} x {item.price} €</span>
            </div>
          ))}
        </div>
        <div className="total">
          <strong>Ukupno:</strong>
          <strong>{totalAmount} €</strong>
        </div>
      </div>

      <PaymentMethodSelector
        methods={paymentMethods}
        selectedMethod={selectedMethod}
        onSelect={setSelectedMethod}
      />

      {selectedMethod && (
        <PaymentForm
          method={paymentMethods.find(m => m.id === selectedMethod)!}
          onSubmit={handlePaymentSubmit}
        />
      )}

      {processing && <div className="processing-overlay">Obrada plaćanja...</div>}
    </div>
  );
}; 