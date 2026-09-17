import supertest from 'supertest';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import { authenticateToken, requireRole } from '../src/middleware/auth';
import { login } from '../src/controllers/authController';
import { createQuotation } from '../src/controllers/quotationController';
import { createSalesOrderFromQuotation } from '../src/controllers/orderController';

const prisma = new PrismaClient();

// Setup lightweight test app
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', login);
app.post('/api/quotations', authenticateToken, requireRole(['ADMIN', 'SALES_USER']), createQuotation);
app.post('/api/orders/convert-quotation', authenticateToken, requireRole(['ADMIN', 'SALES_USER']), createSalesOrderFromQuotation);

const request = supertest(app);

describe('ERP Backend Integration & Concurrency Tests', () => {
  let token: string;
  let testProductId: string;
  let testCustomerId: string;
  let testEnquiryId: string;

  beforeAll(async () => {
    // Generate valid test JWT token
    token = jwt.sign(
      { userId: 'test-user-id', role: 'ADMIN' },
      process.env.JWT_SECRET || 'super_secret_erp_jwt_key_2026',
      { expiresIn: '1h' }
    );

    // Fetch seed data references
    const product = await prisma.product.findFirst();
    const customer = await prisma.customer.findFirst();

    if (!product || !customer) {
      throw new Error('Database must be seeded prior to running integration tests.');
    }

    testProductId = product.id;
    testCustomerId = customer.id;

    // Create a dummy enquiry using explicit type assertion to bypass Prisma Enum export bugs
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber: `TEST-ENQ-${Date.now()}`,
        customerId: testCustomerId,
        status: 'PENDING' as any,
        items: {
          create: [
            {
              productId: testProductId,
              quantity: 2
            }
          ]
        }
      }
    });

    testEnquiryId = enquiry.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Financial Calculation Verification Test
  test('POST /api/quotations - Should compute line totals server-side and ignore client amounts', async () => {
    const res = await request
      .post('/api/quotations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        enquiryId: testEnquiryId,
        customerId: testCustomerId,
        items: [
          {
            productId: testProductId,
            quantity: 2,
            discountPct: 10,
            gstPct: 18,
            unitPrice: 1 // Malicious client attempt to override price
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.quotation).toBeDefined();

    const product = await prisma.product.findUnique({ where: { id: testProductId } });
    const expectedBase = Number(product!.basePrice) * 2;
    const expectedDiscount = expectedBase * 0.10;
    const expectedTaxable = expectedBase - expectedDiscount;
    const expectedGst = expectedTaxable * 0.18;
    const expectedTotal = expectedTaxable + expectedGst;

    expect(Number(res.body.quotation.grandTotal)).toBeCloseTo(expectedTotal, 2);
  });

  // 2. Concurrency & Inventory Reservation Test
  test('POST /api/orders/convert-quotation - Concurrent requests should preserve row locking', async () => {
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber: `LOCK-ENQ-${Date.now()}`,
        customerId: testCustomerId,
        status: 'PENDING' as any,
        items: {
          create: [
            {
              productId: testProductId,
              quantity: 1
            }
          ]
        }
      }
    });

    const quoteRes = await request
      .post('/api/quotations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        enquiryId: enquiry.id,
        customerId: testCustomerId,
        items: [
          {
            productId: testProductId,
            quantity: 1,
            discountPct: 0,
            gstPct: 18
          }
        ]
      });

    const quotationId = quoteRes.body.quotation.id;

    // Simulate two simultaneous conversion calls for the same quotation
    const [res1, res2] = await Promise.all([
      request
        .post('/api/orders/convert-quotation')
        .set('Authorization', `Bearer ${token}`)
        .send({ quotationId }),
      request
        .post('/api/orders/convert-quotation')
        .set('Authorization', `Bearer ${token}`)
        .send({ quotationId })
    ]);

    // Exactly one call must succeed (201), and the other must be rejected (400) due to 1:1 constraint/locks
    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 400]);
  });
});