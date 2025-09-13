// models/AuditLog.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUID
    },
    details: {
      type: DataTypes.JSONB
    },
    ipAddress: {
      type: DataTypes.STRING
    },
    userAgent: {
      type: DataTypes.STRING
    },
    // Make sessionId nullable to allow existing records
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,  // Changed from false to true
      defaultValue: 'legacy-session'  // Provide default for existing records
    }
  }, {
    timestamps: true,
    tableName: 'audit_logs'
  });

  return AuditLog;
};