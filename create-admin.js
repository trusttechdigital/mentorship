const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      email: 'admin@mentorship.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
  process.exit(0);
}

createAdmin();
