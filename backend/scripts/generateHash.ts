// backend/scripts/generateHash.ts
import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

generateHash();