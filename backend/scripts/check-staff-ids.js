// scripts/check-staff-ids.js
const { Staff } = require('../models');
const sequelize = require('../config/database');

async function checkStaffIds() {
  try {
    const staffMembers = await Staff.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      raw: true,
    });

    if (staffMembers.length === 0) {
      console.log('No staff members found.');
    } else {
      console.log('--- Staff IDs ---');
      staffMembers.forEach(staff => {
        console.log(`ID: ${staff.id} | Name: ${staff.firstName} ${staff.lastName}`);
      });
      console.log('-------------------');
    }
  } catch (error) {
    console.error('Error checking staff IDs:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

checkStaffIds();
