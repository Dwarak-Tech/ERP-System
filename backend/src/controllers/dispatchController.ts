import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createDispatch = async (req: Request, res: Response) => {
  try {
    const { salesOrderId, vehicleNumber, driverName } = req.body;

    if (!salesOrderId) {
      return res.status(400).json({ error: 'salesOrderId is required.' });
    }

    const dispatchResult = await prisma.$transaction(async (tx) => {
      // Fetch sales order with line items
      const salesOrder = await tx.salesOrder.findUnique({
        where: { id: salesOrderId },
        include: { items: true }
      });

      if (!salesOrder) {
        throw new Error('Sales order not found.');
      }

      if (salesOrder.status === OrderStatus.DISPATCHED) {
        throw new Error('Sales order is already dispatched.');
      }

      // Deduct physical inventory & clear reservations for each item
      for (const item of salesOrder.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (!inventory) {
          throw new Error(`Inventory record missing for product ID: ${item.productId}`);
        }

        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            physicalQuantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity }
          }
        });
      }

      // Create dispatch record with required metadata
      const dispatchNote = await tx.dispatch.create({
        data: {
          dispatchNumber: `DSP-${Date.now()}`,
          salesOrderId: salesOrder.id,
          vehicleNumber: vehicleNumber || 'TRUCK-01',
          driverName: driverName || 'Default Driver'
        }
      });

      // Update Sales Order status to DISPATCHED
      await tx.salesOrder.update({
        where: { id: salesOrderId },
        data: { status: OrderStatus.DISPATCHED }
      });

      return dispatchNote;
    });

    return res.status(201).json({
      message: 'Dispatch processed and inventory settled successfully.',
      dispatchNote: dispatchResult
    });
  } catch (error: any) {
    console.error('Error processing dispatch:', error);
    return res.status(400).json({ error: error.message || 'Failed to process dispatch.' });
  }
};