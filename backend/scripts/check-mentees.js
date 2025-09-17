// scripts/check-mentees.js
const { Mentee } = require('../models');
const sequelize = require('../config/database');

async function checkMentees() {
  try {
    const mentees = await Mentee.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      raw: true,
    });

    if (mentees.length === 0) {
      console.log('No mentees found.');
    } else {
      console.log('--- Mentees ---');
      mentees.forEach(mentee => {
        console.log(`ID: ${mentee.id} | Name: ${mentee.firstName} ${mentee.lastName}`);
      });
      console.log('-------------------');
    }
  } catch (error) {
    console.error('Error checking mentees:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

checkMentees();
