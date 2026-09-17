import { Request, Response } from 'express';
import { PrismaClient, EnquiryStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      include: { customer: true },
      orderBy: { enquiryDate: 'desc' }
    });
    return res.status(200).json(enquiries);
  } catch (error: any) {
    console.error('Error fetching enquiries:', error);
    return res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { customerId, companyName, contactPerson, mobile, email, city, requiredDate, notes, items } = req.body;

    if (!requiredDate) {
      return res.status(400).json({ error: 'requiredDate is required.' });
    }

    let customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId } }) : null;
    if (!customer && (!companyName || !contactPerson || !mobile || !email || !city)) {
      return res.status(400).json({ error: 'Customer details are required when no customer is selected.' });
    }
    if (!customer) {
      customer = await prisma.customer.create({
        data: { companyName, contactPerson, mobile, email, city }
      });
    }

    const enqNum = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber: enqNum,
        status: EnquiryStatus.NEW,
        requiredDate: new Date(requiredDate),
        notes: notes || null,
        customerId: customer.id,
        items: {
          create: Array.isArray(items) ? items.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity)
          })) : []
        }
      },
      include: { customer: true, items: true }
    });

    return res.status(201).json(enquiry);
  } catch (error: any) {
    console.error('Error creating enquiry:', error);
    return res.status(500).json({ error: error.message || 'Failed to create enquiry' });
  }
};