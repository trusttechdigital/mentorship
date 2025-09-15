// models/Invoice.js
module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dueDate: {
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
    paidDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    description: {
      type: DataTypes.TEXT
    },
    createdBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    },
    filePath: {
      type: DataTypes.STRING
    },
    fileKey: {
      type: DataTypes.STRING
    }
  }, {
    timestamps: true,
    tableName: 'invoices'
  });

  Invoice.associate = (models) => {
    Invoice.hasMany(models.InvoiceItem, {
      foreignKey: 'invoiceId',
      as: 'lineItems',
      onDelete: 'CASCADE',
    });
  };

  return Invoice;
};
