// models/index.js
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

// Define associations
Staff.hasMany(Mentee, { foreignKey: 'mentorId', as: 'mentees' });
Mentee.belongsTo(Staff, { foreignKey: 'mentorId', as: 'mentor' });

User.hasMany(Document, { foreignKey: 'uploadedBy', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Receipt, { foreignKey: 'uploadedBy', as: 'receipts' });
Receipt.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Invoice, { foreignKey: 'createdBy', as: 'invoices' });
Invoice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Staff,
  Mentee,
  Document,
  Receipt,
  Invoice,
  Inventory,
  AuditLog
};