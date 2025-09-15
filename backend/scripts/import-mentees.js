const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { Mentee, sequelize } = require('../models');

// CORRECTED: Updated to handle DD-Mon-YYYY and other string formats
const convertExcelDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) { // Check if the date is invalid
      // Attempt to parse numeric Excel date as a fallback
      const excelDate = parseFloat(dateString);
      if (!isNaN(excelDate)) {
        const newDate = new Date((excelDate - 25569) * 86400 * 1000);
        if (!isNaN(newDate.getTime())) {
          return newDate.toISOString().split('T')[0];
        }
      }
      return null; // Return null if parsing fails
    } else {
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
  } catch (error) {
    return null;
  }
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
    
    const csvFilePath = path.join(__dirname, 'HYPE Mentee Information - Sheet1.csv');
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      // CORRECTED: Now removes spaces AND slashes from headers
      transformHeader: (header) => header.trim().toLowerCase().replace(/[\s/]+/g, '')
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
      return;
    }

    console.log(`Found ${parseResult.data.length} mentees in CSV`);

    let importedCount = 0;
    let skippedCount = 0;

    for (const [index, row] of parseResult.data.entries()) {
      try {
        if (!row.firstname || !row.lastname) {
          skippedCount++;
          continue;
        }

        const dateOfBirth = row.dateofbirth ? convertExcelDate(row.dateofbirth) : null;
        const programStartDate = row.startdate ? convertExcelDate(row.startdate) : new Date().toISOString().split('T')[0];
        const programEndDate = row.enddate ? convertExcelDate(row.enddate) : null;
        
        // CORRECTED: Removes spaces from names when creating email to prevent validation errors
        const emailFirstName = row.firstname.toLowerCase().trim().replace(/\s+/g, '');
        const emailLastName = row.lastname.toLowerCase().trim().replace(/\s+/g, '');

        const menteeData = {
          hypeId: row.hypeid || `HYPE-${Date.now()}-${importedCount}`,
          firstName: row.firstname.trim(),
          lastName: row.lastname.trim(),
          email: `${emailFirstName}.${emailLastName}@hype.mentee.gd`,
          court: row.court || null,
          photoUrl: null,
          gender: row.gender || null,
          dateOfBirth: dateOfBirth,
          age: dateOfBirth ? calculateAge(dateOfBirth) : (row.age ? parseInt(row.age) : null),
          offenceType: row.offence || null,
          schoolOrganization: row.schoolorganization || null,
          formGrade: row.formgrade || null,
          probationOfficer: row.probationofficer || null,
          status: row.status || 'Pending',
          mentorId: null,
          programStartDate: programStartDate,
          programEndDate: programEndDate,
          goals: [],
          notes: `Imported from CSV on ${new Date().toISOString().split('T')[0]}`
        };

        const existingMentee = await Mentee.findOne({
          where: { hypeId: menteeData.hypeId }
        });

        if (existingMentee) {
          skippedCount++;
          continue;
        }

        await Mentee.create(menteeData);
        importedCount++;

      } catch (error) {
        console.error(`Result: FAILED on row ${index + 1}. Full Error:`, error);
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