// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const staffRoutes = require('./routes/staff');
const menteeRoutes = require('./routes/mentees');
const documentRoutes = require('./routes/documents');
const receiptRoutes = require('./routes/receipts');
const invoiceRoutes = require('./routes/invoices');
const inventoryRoutes = require('./routes/inventory');
const auditRoutes = require('./routes/audit');
const dashboardRoutes = require('./routes/dashboard');
const therapyNotesRoutes = require('./routes/therapyNotes');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust the first proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/mentees', menteeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/therapy-notes', therapyNotesRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Create initial admin user function
const createInitialAdmin = async () => {
  try {
    const { User } = require('./models');
    
    // Check if any admin user exists
    const adminExists = await User.findOne({ 
      where: { 
        role: 'admin' 
      } 
    });
    
    if (!adminExists) {
      console.log('No admin user found. Creating initial admin user...');
      
      // Create initial admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await User.create({
        email: 'admin@mentorship.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Initial admin user created successfully');
      console.log('📧 Email: admin@mentorship.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Failed to create initial admin user:', error);
    
    // Don't exit the process, just log the error
    // The application can still run, but login won't work until user is created manually
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 You can create an admin user manually using the register endpoint:');
      console.log('curl -X POST http://localhost:3001/api/auth/register \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log("  -d '{\"email\":\"admin@mentorship.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"admin\"}'");
    }
  }
};

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Database connection has been established successfully.');
    
    // Sync database (use { force: true } only in development to reset DB)
    await sequelize.sync({ alter: true });
    console.log('🗄️  Database synchronized');
    
    // Create initial admin user after database sync
    await createInitialAdmin();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`💻 Backend API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
