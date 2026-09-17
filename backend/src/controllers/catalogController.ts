import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    return res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error while fetching products.' });
  }
};

export const getInventory = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return res.status(500).json({ error: 'Internal server error while fetching inventory.' });
  }
};

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { companyName: 'asc' }
    });
    return res.status(200).json(customers);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({ error: 'Internal server error while fetching customers.' });
  }
};

export const getQuotations = async (req: Request, res: Response) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: { enquiry: { include: { customer: true } } },
      orderBy: { quotationNumber: 'desc' }
    });
    return res.status(200).json(quotations);
  } catch (error: any) {
    console.error('Error fetching quotations:', error);
    return res.status(500).json({ error: 'Internal server error while fetching quotations.' });
  }
};