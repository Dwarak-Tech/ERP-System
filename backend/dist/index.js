"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authController_1 = require("./controllers/authController");
const catalogController_1 = require("./controllers/catalogController");
const enquiryController_1 = require("./controllers/enquiryController");
const quotationController_1 = require("./controllers/quotationController");
const orderController_1 = require("./controllers/orderController");
const dispatchController_1 = require("./controllers/dispatchController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Auth
app.post('/api/auth/login', authController_1.login);
app.post('/api/auth/register', authController_1.register);
// Core Modules
app.get('/api/products', catalogController_1.getProducts);
app.get('/api/inventory', catalogController_1.getInventory);
app.get('/api/customers', catalogController_1.getCustomers);
app.get('/api/quotations', catalogController_1.getQuotations);
app.post('/api/enquiries', enquiryController_1.createEnquiry);
app.get('/api/enquiries', enquiryController_1.getEnquiries);
app.post('/api/quotations', quotationController_1.createQuotation);
app.post('/api/orders/convert-quotation', orderController_1.convertQuotationToOrder);
app.post('/api/dispatch', dispatchController_1.createDispatch);
app.listen(PORT, () => {
    console.log(`[server]: ERP Backend Server is running at http://localhost:${PORT}`);
});
