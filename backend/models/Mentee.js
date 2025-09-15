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
      validate: { isEmail: true }
    },
    hypeId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    court: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true // Digital Ocean Spaces URL
    },
    photoFileKey: {
        type: DataTypes.STRING,
        allowNull: true // Key for the file in Digital Ocean Spaces
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    offenceType: {
      type: DataTypes.ENUM(
        'Vandalism',
        'Criminal Trespass', 
        'Burglary',
        'Arson',
        'Theft/Shoplifting',
        'Motor Vehicle Theft',
        'Assault/Battery',
        'Robbery',
        'Harassment', 
        'Sexual Assault',
        'Drug Possession',
        'Underage Drinking',
        'Drug Law Violations',
        'Disorderly Conduct',
        'Curfew Violations',
        'Truancy',
        'Wandering'
      ),
      allowNull: true
    },
    schoolOrganization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    formGrade: {
      type: DataTypes.STRING,
      allowNull: true
    },
    probationOfficer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('Active', 'On-Hold', 'Completed', 'Discharged', 'Pending'),
      defaultValue: 'Pending'
    },
    phone: { type: DataTypes.STRING },
    mentorId: {
      type: DataTypes.UUID,
      references: { model: 'staff', key: 'id' }
    },
    programStartDate: { type: DataTypes.DATE, allowNull: false },
    programEndDate: { type: DataTypes.DATE },
    goals: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    notes: { type: DataTypes.TEXT }
  }, {
    timestamps: true,
    tableName: 'mentees'
  });

  return Mentee;
};