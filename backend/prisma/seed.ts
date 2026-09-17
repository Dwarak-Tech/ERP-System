import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {},
    create: { email: 'admin@erp.com', password: 'admin123', name: 'Admin User', role: Role.ADMIN }
  });

  const products = [
    { code: 'STEEL-001', name: 'Industrial Steel Sheet', category: 'Raw Material', unit: 'Piece', basePrice: 2450 },
    { code: 'BEAR-002', name: 'Heavy Duty Bearing', category: 'Components', unit: 'Piece', basePrice: 890 },
    { code: 'MOTOR-003', name: 'Three Phase Motor', category: 'Equipment', unit: 'Piece', basePrice: 18500 }
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { code: productData.code },
      update: productData,
      create: productData
    });
    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: { productId: product.id, physicalQuantity: 100, reservedQuantity: 0 }
    });
  }

  await prisma.customer.upsert({
    where: { id: 'demo-customer-001' },
    update: {},
    create: {
      id: 'demo-customer-001',
      companyName: 'Apex Manufacturing',
      contactPerson: 'Priya Sharma',
      mobile: '9876543210',
      email: 'purchasing@apex.example',
      city: 'Pune'
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
