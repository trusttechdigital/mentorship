
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Staff = require('./Staff')(sequelize, DataTypes);
const Mentee = require('./Mentee')(sequelize, DataTypes);
const Document = require('./Document')(sequelize, DataTypes);
const Receipt = require('./Receipt')(sequelize, DataTypes);
const Invoice = require('./Invoice')(sequelize, DataTypes);
const Inventory = require('./Inventory')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);
const TherapyNote = require('./TherapyNote')(sequelize, DataTypes);
const InvoiceItem = require('./InvoiceItem')(sequelize, DataTypes);
const ReceiptItem = require('./ReceiptItem')(sequelize, DataTypes);

// --- Define associations ---

// User and Staff (One-to-One)
// A user account can have one staff profile
User.hasOne(Staff, { foreignKey: 'userId', as: 'staffProfile' });
// A staff profile belongs to one user account
Staff.belongsTo(User, { foreignKey: 'userId', as: 'userAccount' });

// Staff and Mentees (One-to-Many)
Staff.hasMany(Mentee, { foreignKey: 'mentorId', as: 'mentees' });
Mentee.belongsTo(Staff, { foreignKey: 'mentorId', as: 'mentor' });

// User and Documents (One-to-Many)
User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// User and Receipts (One-to-Many)
User.hasMany(Receipt, { foreignKey: 'uploadedBy', as: 'receipts' });
Receipt.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// User and Invoices (One-to-Many)
User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User and AuditLogs (One-to-Many)
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Mentee and Therapy Notes (One-to-Many)
Mentee.hasMany(TherapyNote, { foreignKey: 'menteeId', as: 'therapyNotes' });
TherapyNote.belongsTo(Mentee, { foreignKey: 'menteeId', as: 'mentee' });

// Invoice and InvoiceItems (One-to-Many)
Invoice.hasMany(InvoiceItem, { foreignKey: 'invoiceId', as: 'lineItems', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// Receipt and ReceiptItems (One-to-Many)
Receipt.hasMany(ReceiptItem, { foreignKey: 'receiptId', as: 'lineItems', onDelete: 'CASCADE' });
ReceiptItem.belongsTo(Receipt, { foreignKey: 'receiptId' });


module.exports = {
  sequelize,
  User,
  Staff,
  Mentee,
  Document,
  Receipt,
  Invoice,
  Inventory,
  AuditLog,
  TherapyNote,
  InvoiceItem,
  ReceiptItem,
};
