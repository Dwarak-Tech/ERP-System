import { Request, Response } from 'express';
import { PrismaClient, EnquiryStatus, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const convertQuotationToOrder = async (req: Request, res: Response) => {
  try {
    const { quotationId } = req.body;

    if (!quotationId) {
      return res.status(400).json({ error: 'quotationId is required.' });
    }

    const salesOrder = await prisma.$transaction(async (tx) => {
      const quotation = await tx.quotation.findUnique({
        where: { id: quotationId },
        include: { items: true }
      });

      if (!quotation) {
        throw new Error('Quotation not found.');
      }

      const existingOrder = await tx.salesOrder.findUnique({
        where: { quotationId }
      });

      if (existingOrder) {
        throw new Error('Sales order already exists for this quotation.');
      }

      for (const item of quotation.items) {
        const inventory = await tx.$queryRaw<any[]>`
          SELECT * FROM "Inventory" WHERE "productId" = ${item.productId} FOR UPDATE
        `;

        if (!inventory || inventory.length === 0) {
          throw new Error(`Inventory record not found for product: ${item.productId}`);
        }

        const currentInv = inventory[0];
        const available = currentInv.physicalQuantity - currentInv.reservedQuantity;

        if (available < item.quantity) {
          throw new Error(`Insufficient available stock for product: ${item.productId}`);
        }

        await tx.inventory.update({
          where: { productId: item.productId },
          data: { reservedQuantity: { increment: item.quantity } }
        });
      }

      const newOrder = await tx.salesOrder.create({
        data: {
          orderNumber: `SO-${Date.now()}`,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          totalAmount: quotation.grandTotal,
          status: OrderStatus.PENDING,
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        },
        include: { items: true }
      });

      await tx.enquiry.update({
        where: { id: quotation.enquiryId },
        data: { status: EnquiryStatus.WON }
      });

      return newOrder;
    });

    return res.status(201).json({ message: 'Quotation converted to Sales Order successfully', salesOrder });
  } catch (error: any) {
    console.error('Error converting quotation:', error);
    return res.status(400).json({ error: error.message || 'Failed to convert quotation.' });
  }
};