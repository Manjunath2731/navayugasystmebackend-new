import SHG from '../models/SHG';

/**
 * Generates a unique SHG number in the format NAV{YYYY}{0001}
 * Example: NAV20250001, NAV20250002, NAV20260001, etc.
 */
export async function generateUniqueSHGNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `NAV${currentYear}`;

  // Find the highest SHG number for this year
  const existingSHGs = await SHG.find({
    shgNumber: { $regex: `^${yearPrefix}` }
  })
    .sort({ shgNumber: -1 })
    .limit(1);

  let nextSequence = 1;

  if (existingSHGs.length > 0) {
    const lastSHGNumber = existingSHGs[0].shgNumber;
    // Extract the sequence number (last 4 digits)
    const lastSequence = parseInt(lastSHGNumber.slice(-4), 10);
    if (!isNaN(lastSequence)) {
      nextSequence = lastSequence + 1;
    }
  }

  // Format sequence as 4-digit zero-padded number
  const sequenceStr = nextSequence.toString().padStart(4, '0');
  const shgNumber = `${yearPrefix}${sequenceStr}`;

  // Double-check uniqueness (in case of race condition)
  const exists = await SHG.findOne({ shgNumber });
  if (exists) {
    // If exists, try next number
    return generateUniqueSHGNumber();
  }

  return shgNumber;
}

