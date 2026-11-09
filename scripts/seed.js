import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Rol, Usuario } from '../models/index.js';

await mongoose.connect(process.env.MONGODB_URI);
const roles = { admin: 'Administrador', supervisor: 'Supervisor', chofer: 'Chofer' };
for (const [codigo, nombre] of Object.entries(roles)) await Rol.updateOne({ codigo }, { codigo, nombre }, { upsert: true });

const admin = await Rol.findOne({ codigo: 'admin' });
const email = process.env.ADMIN_EMAIL.toLowerCase();
await Usuario.updateOne({ email }, { $setOnInsert: {
  email, nombre: 'Admin', apellido: 'Sistema', rol: admin._id,
  password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
} }, { upsert: true });

console.log('Roles y usuario administrador listos.');
await mongoose.disconnect();
