/**
 * Reset admin password:
 * node src/scripts/resetAdmin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Run seedAdmin.js first.');
      process.exit(1);
    }

    // Reset password to what's in .env
    admin.password = process.env.ADMIN_PASSWORD || 'changeme123';
    await admin.save();

    console.log('Admin password reset successfully!');
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'changeme123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();
