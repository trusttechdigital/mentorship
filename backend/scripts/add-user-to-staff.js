const { User, Staff } = require('../models');
const sequelize = require('../config/database');

async function addUserToStaff() {
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email: 'admin@mentorship.com' } });

    if (!user) {
      console.error('❌ Error: Admin user with email "admin@mentorship.com" not found.');
      return;
    }

    // Check if a staff record already exists for this user
    const existingStaff = await Staff.findOne({ where: { email: user.email } });

    if (existingStaff) {
      console.log('ℹ️ Staff member already exists for this user.');
      return;
    }

    // Create a new staff member using the user's information
    const newStaffMember = await Staff.create({
      // The ID will be generated automatically as a UUID
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: '+1-473-555-0001', // Placeholder phone
      role: user.role,
      department: 'Administration', // Default department
      hireDate: new Date(),
      isActive: true,
      bio: 'System administrator with extensive experience in mentorship programs.',
      skills: ['Leadership', 'Project Management', 'System Administration'],
    });

    console.log('✅ Staff member created successfully!');
    console.log(`ID: ${newStaffMember.id}`);
    console.log(`Name: ${newStaffMember.firstName} ${newStaffMember.lastName}`);

  } catch (error) {
    console.error('❌ Error creating staff member:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

addUserToStaff();
