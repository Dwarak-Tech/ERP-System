"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuotations = exports.getCustomers = exports.getInventory = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        return res.status(200).json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: 'Internal server error while fetching products.' });
    }
};
exports.getProducts = getProducts;
const getInventory = async (req, res) => {
    try {
        const inventoryItems = await prisma.inventory.findMany({
            include: {
                product: true
            }
        });
        const formattedInventory = inventoryItems.map((item) => {
            const physical = item.physicalQuantity;
            const reserved = item.reservedQuantity;
            const available = physical - reserved;
            return {
                id: item.id,
                productId: item.productId,
                sku: item.product.code,
                code: item.product.code,
                name: item.product.name,
                basePrice: item.product.basePrice,
                physicalQuantity: physical,
                reservedQuantity: reserved,
                availableQuantity: available
            };
        });
        return res.status(200).json(formattedInventory);
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        return res.status(500).json({ error: 'Internal server error while fetching inventory.' });
    }
};
exports.getInventory = getInventory;
const getCustomers = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { companyName: 'asc' }
        });
        return res.status(200).json(customers);
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({ error: 'Internal server error while fetching customers.' });
    }
};
exports.getCustomers = getCustomers;
const getQuotations = async (req, res) => {
    try {
        const quotations = await prisma.quotation.findMany({
            include: { enquiry: { include: { customer: true } } },
            orderBy: { quotationNumber: 'desc' }
        });
        return res.status(200).json(quotations);
    }
    catch (error) {
        console.error('Error fetching quotations:', error);
        return res.status(500).json({ error: 'Internal server error while fetching quotations.' });
    }
};
exports.getQuotations = getQuotations;
