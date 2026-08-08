import api from './api';

export const createCheckout = async (items) => {
  const resp = await api.post('/payments/checkout', { items });
  return resp.data;
};
