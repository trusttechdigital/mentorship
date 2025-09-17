// models/Staff.js
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // userId is the foreign key linking to the User model
    userId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null temporarily for migration
      references: {
        model: 'users', // This is the table name
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING
    },
    hireDate: {
      type: DataTypes.DATE
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    bio: {
      type: DataTypes.TEXT
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    }
    // The password field is now managed by the User model.
    // Hooks for password hashing are also removed from here.
  }, {
    timestamps: true,
    tableName: 'staff'
  });

  // The prototype methods like validPassword should be on the User model.
  // We will define associations in the `models/index.js` file.

  return Staff;
};
