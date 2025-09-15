module.exports = (sequelize, DataTypes) => {
  const ReceiptItem = sequelize.define('ReceiptItem', {
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  return ReceiptItem;
};
