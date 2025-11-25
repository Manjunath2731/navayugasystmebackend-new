import * as XLSX from 'xlsx';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Linkage from '../src/models/Linkage';
import SHG from '../src/models/SHG';
import SHGMember, { MemberRole } from '../src/models/SHGMember';
import MonthlyRepayment, { PaymentMethod, PaymentType } from '../src/models/MonthlyRepayment';
import { connectDatabase } from '../src/config/database';
import { generateUniqueSHGNumber } from '../src/utils/shgNumberGenerator';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

interface ExcelRow {
  'SLNO'?: number;
  'SHG NAME'?: string;
  'ADDRESS'?: string;
  'PRATHINIDI 1'?: string;
  'PHONE NUMBER'?: string | number;
  'PRATHINIDI 2'?: string;
  'PHONE NUMBER_1'?: string | number;
  'SHG  SAVING ACCOUNT NUMBER'?: string | number;
  'LOAN ACCOUNT NUMBER'?: string | number;
  'LOAN SANCTION DATE'?: string | number;
  'REPAYMENT  DATE'?: string | number;
  'FIELD OFFICER'?: string;
  'BRANCH'?: string;
  'LOAN SANCTION AMOUNT'?: string | number;
  'NUMBER OF MONTHS'?: number;
  'MONTHLY REPAYMENT AMOUNT'?: number;
  'FIXED DEPOSIT'?: number;
  ' LINKAGE'?: string;
  'Number Of Member'?: number;
  // Monthly Repayment columns
  'MONTHLY REPAYMENT DATE'?: string | number;
  'REPAYMENT AMOUNT'?: string | number;
  'PAYMENT METHOD'?: string;
  'PAYMENT TYPE'?: string;
  'UNPAID MEMBER NAME'?: string;
  [key: string]: any;
}

// Helper function to parse date from Excel format
function parseExcelDate(dateValue: string | number): Date {
  if (typeof dateValue === 'number') {
    // Excel date serial number
    const excelEpoch = new Date(1899, 11, 30);
    const days = dateValue;
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  // Try parsing as DD/MM/YYYY
  const parts = dateValue.toString().split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  
  // Try standard date parsing
  const parsed = new Date(dateValue);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  return new Date();
}

// Helper function to parse amount (handles "5 Lakhs" format)
function parseAmount(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  
  const str = amount.toString().trim();
  if (str.toLowerCase().includes('lakh')) {
    const num = parseFloat(str.replace(/[^\d.]/g, ''));
    return num * 100000;
  }
  
  return parseFloat(str.replace(/[^\d.]/g, '')) || 0;
}

async function importSHGData() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✓ Connected to database');

    // Read Excel file
    const filePath = path.join(__dirname, '../../data/SHG(AutoRecovered) RADHA.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    console.log(`✓ Read ${data.length} rows from Excel file`);

    // Process data
    let shgCount = 0;
    let memberCount = 0;
    let linkageCount = 0;
    let repaymentCount = 0;

    // Get all field officers to create a mapping
    let allFieldOfficers = await User.find({ role: 'field_officer' });
    const fieldOfficerMap = new Map<string, any>();
    
    // Create a map of existing field officers by name
    allFieldOfficers.forEach(fo => {
      const fullName = `${fo.firstName} ${fo.lastName}`.toLowerCase();
      fieldOfficerMap.set(fullName, fo);
      fieldOfficerMap.set(fo.firstName.toLowerCase(), fo);
      fieldOfficerMap.set(fo.lastName.toLowerCase(), fo);
    });

    // Process each row (each row is one SHG with Pratini1 and Pratini2)
    for (const row of data) {
      // Skip rows without SHG name
      if (!row['SHG NAME'] || !row['SHG NAME'].toString().trim()) {
        continue;
      }

      try {
        const shgName = row['SHG NAME'].toString().trim();
        console.log(`\nProcessing SHG: ${shgName}`);

        // Find field officer by name (partial match)
        const fieldOfficerName = row['FIELD OFFICER']?.toString().trim() || '';
        let fieldOfficer = fieldOfficerMap.get(fieldOfficerName.toLowerCase());
        
        // Try partial match
        if (!fieldOfficer) {
          for (const [key, fo] of fieldOfficerMap.entries()) {
            if (key.includes(fieldOfficerName.toLowerCase()) || fieldOfficerName.toLowerCase().includes(key)) {
              fieldOfficer = fo;
              break;
            }
          }
        }

        // If still not found, create a new field officer
        if (!fieldOfficer) {
          console.log(`⚠ Field officer "${fieldOfficerName}" not found, creating new field officer...`);
          const nameParts = fieldOfficerName.split(' ');
          const firstName = nameParts[0] || fieldOfficerName;
          const lastName = nameParts.slice(1).join(' ') || fieldOfficerName;
          const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@navayuga.com`;
          
          // Check if email already exists
          let existingUser = await User.findOne({ email });
          if (existingUser) {
            fieldOfficer = existingUser;
          } else {
            fieldOfficer = new User({
              email,
              password: 'TempPassword123!', // Will need to be changed
              firstName,
              lastName,
              role: 'field_officer',
              dashboards: [],
            });
            await fieldOfficer.save();
            console.log(`✓ Created field officer: ${firstName} ${lastName} (${email})`);
            // Add to map for future lookups
            fieldOfficerMap.set(fieldOfficerName.toLowerCase(), fieldOfficer);
            fieldOfficerMap.set(firstName.toLowerCase(), fieldOfficer);
            allFieldOfficers.push(fieldOfficer);
          }
        }

        // Find or create linkage
        const linkageName = row[' LINKAGE']?.toString().trim() || 'Default Linkage';
        let linkage = await Linkage.findOne({ name: linkageName });
        if (!linkage) {
          // Try to extract amount from linkage name or use default
          const linkageAmount = 0; // Default amount
          linkage = new Linkage({
            name: linkageName,
            amount: linkageAmount,
          });
          await linkage.save();
          linkageCount++;
          console.log(`✓ Created linkage: ${linkageName}`);
        }

        // Parse dates
        const loanSanctionDateValue = row['LOAN SANCTION DATE'];
        const repaymentDateValue = row['REPAYMENT  DATE'];
        const loanSanctionDate = loanSanctionDateValue ? parseExcelDate(loanSanctionDateValue) : new Date();
        const repaymentDate = repaymentDateValue ? parseExcelDate(repaymentDateValue) : new Date();

        // Parse amounts
        const loanSanctionAmount = parseAmount(row['LOAN SANCTION AMOUNT'] || 0);
        const fixedDeposit = row['FIXED DEPOSIT'] ? parseFloat(row['FIXED DEPOSIT'].toString()) || 0 : 0;
        const numberOfMonths = row['NUMBER OF MONTHS'] || 12;
        const numberOfMembers = row['Number Of Member'] || 10;
        const monthlyRepaymentAmount = row['MONTHLY REPAYMENT AMOUNT'] 
          ? parseFloat(row['MONTHLY REPAYMENT AMOUNT'].toString()) || 0 
          : 0;

        // Create SHG with default values for missing required fields
        const savingAccountNumber = row['SHG  SAVING ACCOUNT NUMBER']?.toString().trim() || 'N/A';
        const loanAccountNumber = row['LOAN ACCOUNT NUMBER']?.toString().trim() || 'N/A';
        const branch = row['BRANCH']?.toString().trim() || 'N/A';
        const shgAddress = row['ADDRESS']?.toString().trim() || 'N/A';

        // Generate unique SHG number
        const shgNumber = await generateUniqueSHGNumber();

        const shg = new SHG({
          shgNumber,
          shgName: shgName,
          shgAddress: shgAddress,
          savingAccountNumber: savingAccountNumber,
          loanAccountNumber: loanAccountNumber,
          loanSanctionDate,
          repaymentDate,
          fieldOfficerId: fieldOfficer._id,
          branch: branch,
          loanSanctionAmount,
          numberOfMonths: numberOfMonths as number,
          monthlyRepaymentAmount,
          fixedDeposit,
          linkageId: linkage._id,
          numberOfMembers: numberOfMembers as number,
        });

        await shg.save();
        shgCount++;
        console.log(`✓ Created SHG: ${shgNumber} - ${shgName}`);

        // Create Pratini1
        const pratini1Name = row['PRATHINIDI 1']?.toString().trim();
        const pratini1Phone = row['PHONE NUMBER']?.toString().trim() || '';
        
        if (pratini1Name) {
          const pratini1 = new SHGMember({
            shgId: shg._id,
            name: pratini1Name,
            phoneNumber: pratini1Phone,
            role: MemberRole.PRATINI1,
            aadharCardFront: '',
            aadharCardBack: '',
            panCard: '',
            voidIdCard: '',
            homeRentalAgreement: '',
          });
          await pratini1.save();
          memberCount++;
          console.log(`✓ Created Pratini1: ${pratini1Name}`);
        }

        // Create Pratini2
        const pratini2Name = row['PRATHINIDI 2']?.toString().trim();
        const pratini2Phone = row['PHONE NUMBER_1']?.toString().trim() || '';
        
        if (pratini2Name) {
          const pratini2 = new SHGMember({
            shgId: shg._id,
            name: pratini2Name,
            phoneNumber: pratini2Phone,
            role: MemberRole.PRATINI2,
            aadharCardFront: '',
            aadharCardBack: '',
            panCard: '',
            voidIdCard: '',
            homeRentalAgreement: '',
          });
          await pratini2.save();
          memberCount++;
          console.log(`✓ Created Pratini2: ${pratini2Name}`);
        }

        // Note: The Excel file only has Pratini1 and Pratini2 in the main rows
        // Other members would need to be added separately or in a different format
        console.log(`✓ Processed SHG: ${shgName} (${pratini1Name ? '1' : '0'} Pratini1, ${pratini2Name ? '1' : '0'} Pratini2)`);

        // Import monthly repayment data from month-wise columns
        // Month names mapping
        const monthNames: { [key: string]: number } = {
          'january': 0, 'jan': 0,
          'february': 1, 'feb': 1,
          'march': 2, 'mar': 2,
          'april': 3, 'apr': 3,
          'may': 4,
          'june': 5, 'jun': 5,
          'july': 6, 'jul': 6,
          'august': 7, 'aug': 7,
          'september': 8, 'sep': 8, 'sept': 8,
          'october': 9, 'oct': 9,
          'november': 10, 'nov': 10,
          'december': 11, 'dec': 11
        };

        // Get the year from repayment date or use current year
        const baseYear = shg.repaymentDate ? shg.repaymentDate.getFullYear() : new Date().getFullYear();

        // Process all columns to find month-wise repayment amounts
        for (const [columnName, columnValue] of Object.entries(row)) {
          if (!columnValue || columnValue === null || columnValue === '') {
            continue;
          }

          // Check if column name contains month information
          const columnNameLower = columnName.toString().trim().toLowerCase();
          let monthIndex: number | null = null;

          // Check for month names
          for (const [monthKey, monthNum] of Object.entries(monthNames)) {
            if (columnNameLower.includes(monthKey)) {
              monthIndex = monthNum;
              break;
            }
          }

          // If not found by name, check for month numbers (1-12)
          if (monthIndex === null) {
            const monthMatch = columnNameLower.match(/\b(0?[1-9]|1[0-2])\b/);
            if (monthMatch) {
              monthIndex = parseInt(monthMatch[1]) - 1; // Convert to 0-based index
            }
          }

          // If we found a month, process the repayment amount
          if (monthIndex !== null) {
            try {
              const repaymentAmount = parseAmount(columnValue);
              
              // Only create repayment if amount is greater than 0
              if (repaymentAmount > 0) {
                // Create date for the first day of that month
                const repaymentDate = new Date(baseYear, monthIndex, 1);

                // Create monthly repayment record
                const monthlyRepayment = new MonthlyRepayment({
                  shgId: shg._id,
                  repaymentDate: repaymentDate,
                  amount: repaymentAmount,
                  receiptPhoto: 'imported', // Placeholder for imported data (no receipt photo available)
                  paymentMethod: PaymentMethod.CASH, // Always CASH
                  paymentType: PaymentType.FULL, // Always FULL
                  unpaidMemberName: '', // Empty for full payments
                  recordedBy: fieldOfficer._id, // Use the field officer as the recorder
                });

                await monthlyRepayment.save();
                repaymentCount++;
                const monthName = new Date(baseYear, monthIndex, 1).toLocaleString('default', { month: 'long' });
                console.log(`✓ Created monthly repayment: ₹${repaymentAmount} for ${shgName} - ${monthName} ${baseYear}`);
              }
            } catch (repaymentError: any) {
              console.error(`⚠ Error creating monthly repayment for ${shgName} (${columnName}):`, repaymentError.message);
            }
          }
        }
      } catch (error: any) {
        console.error(`✗ Error processing row:`, error.message);
        console.error('Row data:', JSON.stringify(row, null, 2));
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Linkages created: ${linkageCount}`);
    console.log(`SHGs created: ${shgCount}`);
    console.log(`Members created: ${memberCount}`);
    console.log(`Monthly repayments created: ${repaymentCount}`);
    console.log('✓ Import completed successfully!');

    process.exit(0);
  } catch (error: any) {
    console.error('✗ Import failed:', error);
    process.exit(1);
  }
}

// Run import
importSHGData();
