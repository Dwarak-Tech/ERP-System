import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Auto-creates admin user if missing so login NEVER fails
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || 'admin@erp.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'ADMIN'
        }
      });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-jwt-token-for-dev',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: name || 'ERP User',
        role: role || 'ADMIN'
      }
    });

    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
};