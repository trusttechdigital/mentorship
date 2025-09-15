module.exports = (sequelize, DataTypes) => {
  const TherapyNote = sequelize.define('TherapyNote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menteeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'mentees', // Corrected: Changed from 'Mentees' to 'mentees'
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    sessionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sessionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: false,
    },
    therapistName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sessionNotes: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    progressObservations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goalsAddressed: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    nextSteps: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'low',
    },
    moodRating: {
      type: DataTypes.INTEGER, // e.g., 1-5 scale
      allowNull: true,
    },
    confidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'TherapyNotes',
    timestamps: true,
  });

  TherapyNote.associate = (models) => {
    TherapyNote.belongsTo(models.Mentee, {
      foreignKey: 'menteeId',
      as: 'mentee',
    });
  };

  return TherapyNote;
};