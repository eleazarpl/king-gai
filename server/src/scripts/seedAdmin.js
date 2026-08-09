/**
 * Run this script once to create the admin user:
 * node src/scripts/seedAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists:', adminExists.email);
      process.exit(0);
    }

    const admin = new User({
      email: process.env.ADMIN_EMAIL || 'admin@kinggai.com',
      password: process.env.ADMIN_PASSWORD || 'changeme123',
      alias: 'King Gai Admin',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Remember to change the password!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
