import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { login, register } from './controllers/authController';
import { getProducts, getInventory, getCustomers, getQuotations } from './controllers/catalogController';
import { createEnquiry, getEnquiries } from './controllers/enquiryController';
import { createQuotation } from './controllers/quotationController';
import { convertQuotationToOrder } from './controllers/orderController';
import { createDispatch } from './controllers/dispatchController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth
app.post('/api/auth/login', login);
app.post('/api/auth/register', register);

// Core Modules
app.get('/api/products', getProducts);
app.get('/api/inventory', getInventory);
app.get('/api/customers', getCustomers);
app.get('/api/quotations', getQuotations);
app.post('/api/enquiries', createEnquiry);
app.get('/api/enquiries', getEnquiries);
app.post('/api/quotations', createQuotation);
app.post('/api/orders/convert-quotation', convertQuotationToOrder);
app.post('/api/dispatch', createDispatch);

app.listen(PORT, () => {
  console.log(`[server]: ERP Backend Server is running at http://localhost:${PORT}`);
});