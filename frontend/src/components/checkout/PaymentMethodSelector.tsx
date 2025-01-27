import React from 'react';
import { PaymentMethod } from '../../types/payment';

interface Props {
  methods: PaymentMethod[];
  selectedMethod: string;
  onSelect: (methodId: string) => void;
}

export const PaymentMethodSelector: React.FC<Props> = ({
  methods,
  selectedMethod,
  onSelect
}) => {
  return (
    <div className="payment-methods">
      <h3>Odaberite način plaćanja</h3>
      <div className="methods-grid">
        {methods.map(method => (
          <div
            key={method.id}
            className={`method-card ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => onSelect(method.id)}
          >
            <div className="method-icon">
              <img src={`/images/payment/${method.code}.svg`} alt={method.name} />
            </div>
            <div className="method-info">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 