import React from 'react';
import { RouteObject } from 'react-router-dom';
import { CheckoutSuccessPage } from '../pages/checkout/CheckoutSuccessPage';
import { CheckoutErrorPage } from '../pages/checkout/CheckoutErrorPage';

const routes: RouteObject[] = [
  {
    path: '/checkout/success',
    element: <CheckoutSuccessPage />
  },
  {
    path: '/checkout/error',
    element: <CheckoutErrorPage />
  }
];

export default routes; 