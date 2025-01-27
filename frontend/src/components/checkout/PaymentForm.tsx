import React from 'react';
import { useForm } from 'react-hook-form';
import { PaymentMethod, PaymentFormData } from '../../types/payment';

interface Props {
  method: PaymentMethod;
  onSubmit: (data: PaymentFormData) => void;
}

export const PaymentForm: React.FC<Props> = ({ method, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>();

  const renderFields = () => {
    switch (method.code) {
      case 'paypal':
        return (
          <div className="form-group">
            <label htmlFor="paypalEmail">PayPal Email</label>
            <input
              type="email"
              id="paypalEmail"
              {...register('paypalEmail', { required: true })}
            />
            {errors.paypalEmail && <span className="error">Email je obavezan</span>}
          </div>
        );

      case 'payway':
        return (
          <div className="form-group">
            <label htmlFor="cardholderName">Ime na kartici</label>
            <input
              type="text"
              id="cardholderName"
              {...register('cardholderName', { required: true })}
            />
            {errors.cardholderName && <span className="error">Ime je obavezno</span>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
      <input type="hidden" {...register('methodId')} value={method.id} />
      {renderFields()}
      <button type="submit" className="btn btn-primary">
        Nastavi na plaćanje
      </button>
    </form>
  );
}; 