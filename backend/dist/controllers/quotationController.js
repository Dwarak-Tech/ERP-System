"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuotation = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createQuotation = async (req, res) => {
    try {
        const { enquiryId, items, validUntil } = req.body;
        if (!enquiryId || !Array.isArray(items) || items.length === 0 || !validUntil) {
            return res.status(400).json({ error: 'enquiryId, items and validUntil are required.' });
        }
        const enquiry = await prisma.enquiry.findUnique({ where: { id: enquiryId } });
        if (!enquiry) {
            return res.status(400).json({ error: 'Enquiry not found.' });
        }
        const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } } });
        const productById = new Map(products.map((product) => [product.id, product]));
        const quotationItems = items.map((item) => {
            const product = productById.get(item.productId);
            if (!product || Number(item.quantity) < 1)
                throw new Error('Each quotation item must contain a valid product and quantity.');
            const quantity = Number(item.quantity);
            const discountPct = Number(item.discountPct) || 0;
            const gstPct = Number(item.gstPct) || 0;
            const unitPrice = Number(product.basePrice);
            const lineAmount = unitPrice * quantity * (1 - discountPct / 100) * (1 + gstPct / 100);
            return { productId: product.id, quantity, unitPrice, discountPct, gstPct, lineAmount };
        });
        const grandTotal = quotationItems.reduce((total, item) => total + item.lineAmount, 0);
        const qtnNum = `QTN-${Math.floor(1000 + Math.random() * 9000)}`;
        const quotation = await prisma.quotation.create({
            data: {
                quotationNumber: qtnNum,
                enquiryId: enquiry.id,
                customerId: enquiry.customerId,
                grandTotal,
                validUntil: new Date(validUntil),
                items: { create: quotationItems }
            },
            include: { items: true }
        });
        return res.status(201).json({ quotation, subtotal: grandTotal });
    }
    catch (error) {
        console.error('Error creating quotation:', error);
        return res.status(400).json({ error: error.message || 'Failed to create quotation.' });
    }
};
exports.createQuotation = createQuotation;
