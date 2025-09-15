// models/Receipt.js
module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    receiptNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    vat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    filename: {
      type: DataTypes.STRING
    },
    path: {
      type: DataTypes.STRING
    },
    uploadedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    }
  }, {
    timestamps: true,
    tableName: 'receipts'
  });

  Receipt.associate = (models) => {
    Receipt.hasMany(models.LineItem, {
      foreignKey: 'receiptId',
      as: 'lineItems',
      onDelete: 'CASCADE',
    });
  };

  return Receipt;
};
