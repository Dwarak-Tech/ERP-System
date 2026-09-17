"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
};
exports.login = login;
const register = async (req, res) => {
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
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error during registration.' });
    }
};
exports.register = register;
