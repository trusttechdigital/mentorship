// models/Mentee.js
module.exports = (sequelize, DataTypes) => {
  const Mentee = sequelize.define('Mentee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    mentorId: {
      type: DataTypes.UUID,
      references: {
        model: 'staff',
        key: 'id'
      }
    },
    programStartDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    programEndDate: {
      type: DataTypes.DATE
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'on-hold', 'dropped'),
      defaultValue: 'active'
    },
    goals: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    tableName: 'mentees'
  });

  return Mentee;
};