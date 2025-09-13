const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { Mentee, Staff, sequelize } = require('../models');

// Excel date conversion function
const convertExcelDate = (excelDate) => {
  if (!excelDate || isNaN(excelDate)) return null;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

async function importMentees() {
  try {
    console.log('Starting mentee import process...');
    
    // Read CSV file
    const csvFilePath = path.join(__dirname, 'HYPE Mentee Information Sheet1.csv');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Clean up header names
        const headerMap = {
          'HYPE ID': 'hypeId',
          'COURT': 'court',
          'PHOTO': 'photo',
          'First Name ': 'firstName',
          'Last Name': 'lastName',
          'Gender': 'gender',
          'Date of Birth ': 'dateOfBirth',
          'Age': 'age',
          'Offence': 'offence',
          'Status': 'status',
          'School/Organization': 'schoolOrganization',
          'Form/Grade': 'formGrade',
          'Probation Officer': 'probationOfficer',
          'Assigned Mentor': 'assignedMentor',
          'Start Date': 'startDate',
          'End Date': 'endDate'
        };
        return headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
      }
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    console.log(`Found ${parseResult.data.length} mentees in CSV`);

    // Process each row
    let importedCount = 0;
    let skippedCount = 0;

    for (const row of parseResult.data) {
      try {
        // Skip empty rows
        if (!row.firstName || !row.lastName) {
          skippedCount++;
          continue;
        }

        // Convert dates
        const dateOfBirth = row.dateOfBirth ? convertExcelDate(parseFloat(row.dateOfBirth)) : null;
        const programStartDate = row.startDate ? convertExcelDate(parseFloat(row.startDate)) : new Date().toISOString().split('T')[0];
        const programEndDate = row.endDate && row.endDate !== '' ? new Date(row.endDate).toISOString().split('T')[0] : null;

        // Create mentee data object
        const menteeData = {
          hypeId: row.hypeId || `HYPE-${Date.now()}-${importedCount}`,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          email: `${row.firstName.toLowerCase().trim()}.${row.lastName.toLowerCase().trim()}@hype.mentee.gd`,
          court: row.court || null,
          photoUrl: null, // Will be added manually later
          gender: row.gender || null,
          dateOfBirth: dateOfBirth,
          age: dateOfBirth ? calculateAge(dateOfBirth) : (row.age ? parseInt(row.age) : null),
          offenceType: row.offence || null, // Assuming CSV already has text values
          schoolOrganization: row.schoolOrganization || null,
          formGrade: row.formGrade || null,
          probationOfficer: row.probationOfficer || null,
          status: row.status || 'Pending',
          mentorId: null, // No mentors assigned initially as per requirements
          programStartDate: programStartDate,
          programEndDate: programEndDate,
          goals: [],
          notes: `Imported from CSV on ${new Date().toISOString().split('T')[0]}`
        };

        // Check if mentee already exists
        const existingMentee = await Mentee.findOne({
          where: { hypeId: menteeData.hypeId }
        });

        if (existingMentee) {
          console.log(`Mentee ${menteeData.hypeId} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Create new mentee
        await Mentee.create(menteeData);
        importedCount++;
        
        console.log(`Imported: ${menteeData.firstName} ${menteeData.lastName} (${menteeData.hypeId})`);

      } catch (error) {
        console.error(`Error importing mentee ${row.firstName} ${row.lastName}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Successfully imported: ${importedCount} mentees`);
    console.log(`Skipped: ${skippedCount} mentees`);
    console.log('Import process completed.');

  } catch (error) {
    console.error('Import process failed:', error);
  }
}

// Run the import
if (require.main === module) {
  sequelize.authenticate()
    .then(() => importMentees())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}

module.exports = { importMentees };