const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// 1. Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nordika_furniture';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['customer', 'super_admin', 'product_manager', 'sales_manager', 'support', 'admin', 'agent'],
      default: 'customer',
    },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLogin: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const ADMIN_USERS = [
  {
    name: 'Astrid Lindgren (Super Admin)',
    email: 'admin@nordika.com',
    role: 'super_admin',
    phone: '+1 (206) 555-0100',
    notes: 'Primary executive administrator with unrestricted platform privileges.',
  },
  {
    name: 'Henrik Vanger (Product Lead)',
    email: 'pm@nordika.com',
    role: 'product_manager',
    phone: '+1 (206) 555-0101',
    notes: 'Manages catalog inventory, category tree, supplier specs, and promotional banners.',
  },
  {
    name: 'Elin Blomqvist (Sales Director)',
    email: 'sales@nordika.com',
    role: 'sales_manager',
    phone: '+1 (206) 555-0102',
    notes: 'Oversees trade accounts, custom order pipeline, agent network, and order fulfillment.',
  },
  {
    name: 'Linnea Holm (Customer Concierge)',
    email: 'support@nordika.com',
    role: 'support',
    phone: '+1 (206) 555-0103',
    notes: 'Handles order tracking questions, return inquiries, and customer care CRM notes.',
  },
];

async function seedAdmin() {
  console.log('Connecting to MongoDB for Admin User Seeding...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const passwordHash = await bcrypt.hash('password123', 10);

    for (const admin of ADMIN_USERS) {
      const existing = await User.findOne({ email: admin.email });
      if (existing) {
        existing.name = admin.name;
        existing.role = admin.role;
        existing.phone = admin.phone;
        existing.notes = admin.notes;
        existing.passwordHash = passwordHash;
        existing.status = 'active';
        await existing.save();
        console.log(`Updated admin: ${admin.name} (${admin.email}) -> Role: ${admin.role}`);
      } else {
        await User.create({
          ...admin,
          passwordHash,
          status: 'active',
        });
        console.log(`Created admin: ${admin.name} (${admin.email}) -> Role: ${admin.role}`);
      }
    }

    console.log('\nAll admin accounts seeded successfully! Password for all: password123\n');
    process.exit(0);
  } catch (err) {
    console.error('Admin seeding failed:', err);
    process.exit(1);
  }
}

seedAdmin();
