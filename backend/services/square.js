const { Client, Environment } = require('squareup');

// Returns a no-op Square client that logs warnings and returns mock responses
const createNoOpSquareClient = () => {
  console.info('[Square] Square service disabled – env vars missing');
  return {
    paymentsApi: {
      createPayment: () => {
        console.warn('[Square] Cannot process payment - service is disabled');
        return Promise.resolve({ result: { payment: { id: 'mock-payment-id' } } });
      },
    },
    customersApi: {
      createCustomer: () => {
        console.warn('[Square] Cannot create customer - service is disabled');
        return Promise.resolve({ result: { customer: { id: 'mock-customer-id' } } });
      },
      searchCustomers: () => {
        console.warn('[Square] Cannot search customers - service is disabled');
        return Promise.resolve({ result: { customers: [] } });
      },
    },
  };
};

// Returns a real Square client configured for sandbox environment
const createSquareClient = () => {
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox,
  });
  
  console.info(`[Square] Initialized in ${process.env.SQUARE_ENVIRONMENT || 'sandbox'} mode`);
  return client;
};

// Create a real Square client only if credentials are set, otherwise create a no-op client
const squareClient = (process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_APPLICATION_ID)
  ? createSquareClient()
  : createNoOpSquareClient();

// Helper function to create a payment
const createPayment = async (paymentData) => {
  try {
    const response = await squareClient.paymentsApi.createPayment(paymentData);
    return response.result;
  } catch (error) {
    console.error('[Square] Payment creation failed:', error);
    throw error;
  }
};

// Helper function to create a customer
const createCustomer = async (customerData) => {
  try {
    const response = await squareClient.customersApi.createCustomer(customerData);
    return response.result;
  } catch (error) {
    console.error('[Square] Customer creation failed:', error);
    throw error;
  }
};

// Helper function to search customers
const searchCustomers = async (searchQuery) => {
  try {
    const response = await squareClient.customersApi.searchCustomers(searchQuery);
    return response.result;
  } catch (error) {
    console.error('[Square] Customer search failed:', error);
    throw error;
  }
};

module.exports = {
  squareClient,
  createPayment,
  createCustomer,
  searchCustomers,
};