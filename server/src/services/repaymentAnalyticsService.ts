import SHG from '../models/SHG';
import MonthlyRepayment from '../models/MonthlyRepayment';
import { startOfDay, endOfDay, addDays, differenceInDays } from 'date-fns';

export interface UpcomingRepayment {
  shgId: string;
  shgName: string;
  repaymentDate: Date;
  monthlyRepaymentAmount: number;
  daysUntil: number;
  branch: string;
  fieldOfficerName: string;
}

export interface RepaymentAnalytics {
  totalSHGs: number;
  totalRepayments: number;
  totalAmountCollected: number;
  averageRepaymentAmount: number;
  repaymentsByMethod: {
    upi: number;
    cash: number;
  };
  repaymentsByType: {
    full: number;
    half: number;
  };
  upcomingRepayments: {
    today: UpcomingRepayment[];
    tomorrow: UpcomingRepayment[];
    in2Days: UpcomingRepayment[];
    in3Days: UpcomingRepayment[];
  };
  mismatchedRepayments: {
    shgId: string;
    shgName: string;
    expectedAmount: number;
    actualAmount: number;
    repaymentDate: Date;
  }[];
}

export const getRepaymentAnalytics = async (): Promise<RepaymentAnalytics> => {
  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(today, 1));
  const in2Days = startOfDay(addDays(today, 2));
  const in3Days = startOfDay(addDays(today, 3));
  const in4Days = startOfDay(addDays(today, 4));

  // Get all SHGs
  const allSHGs = await SHG.find()
    .populate('fieldOfficerId', 'firstName lastName');

  // Get all repayments
  const allRepayments = await MonthlyRepayment.find()
    .populate('shgId', 'shgName monthlyRepaymentAmount');

  // Calculate basic stats
  const totalSHGs = allSHGs.length;
  const totalRepayments = allRepayments.length;
  const totalAmountCollected = allRepayments.reduce((sum, r) => sum + r.amount, 0);
  const averageRepaymentAmount = totalRepayments > 0 ? totalAmountCollected / totalRepayments : 0;

  // Repayments by method
  const repaymentsByMethod = {
    upi: allRepayments.filter(r => r.paymentMethod === 'upi').length,
    cash: allRepayments.filter(r => r.paymentMethod === 'cash').length
  };

  // Repayments by type
  const repaymentsByType = {
    full: allRepayments.filter(r => r.paymentType === 'full').length,
    half: allRepayments.filter(r => r.paymentType === 'half').length
  };

  // Find upcoming repayments
  const upcomingRepayments = {
    today: [] as UpcomingRepayment[],
    tomorrow: [] as UpcomingRepayment[],
    in2Days: [] as UpcomingRepayment[],
    in3Days: [] as UpcomingRepayment[]
  };

  for (const shg of allSHGs) {
    const repaymentDate = startOfDay(shg.repaymentDate);
    const daysUntil = differenceInDays(repaymentDate, today);
    
    if (daysUntil >= 0 && daysUntil <= 3) {
      const fieldOfficer = shg.fieldOfficerId as any;
      const repayment: UpcomingRepayment = {
        shgId: (shg._id as any).toString(),
        shgName: shg.shgName,
        repaymentDate: shg.repaymentDate,
        monthlyRepaymentAmount: shg.monthlyRepaymentAmount,
        daysUntil,
        branch: shg.branch,
        fieldOfficerName: `${fieldOfficer.firstName} ${fieldOfficer.lastName}`
      };

      if (daysUntil === 0) {
        upcomingRepayments.today.push(repayment);
      } else if (daysUntil === 1) {
        upcomingRepayments.tomorrow.push(repayment);
      } else if (daysUntil === 2) {
        upcomingRepayments.in2Days.push(repayment);
      } else if (daysUntil === 3) {
        upcomingRepayments.in3Days.push(repayment);
      }
    }
  }

  // Find mismatched repayments (where actual amount doesn't match expected)
  const mismatchedRepayments: RepaymentAnalytics['mismatchedRepayments'] = [];
  
  // Group repayments by SHG and date
  const repaymentsBySHGAndDate = new Map<string, { shg: any; date: Date; totalAmount: number; expectedAmount: number }>();
  
  for (const repayment of allRepayments) {
    const shg = repayment.shgId as any;
    const repaymentDate = startOfDay(repayment.repaymentDate);
    const key = `${repayment.shgId}_${repaymentDate.toISOString()}`;
    
    if (!repaymentsBySHGAndDate.has(key)) {
      repaymentsBySHGAndDate.set(key, {
        shg,
        date: repaymentDate,
        totalAmount: 0,
        expectedAmount: shg.monthlyRepaymentAmount
      });
    }
    
    const entry = repaymentsBySHGAndDate.get(key)!;
    entry.totalAmount += repayment.amount;
  }

  // Check for mismatches
  for (const [key, entry] of repaymentsBySHGAndDate) {
    if (Math.abs(entry.totalAmount - entry.expectedAmount) > 0.01) { // Allow small floating point differences
      mismatchedRepayments.push({
        shgId: (entry.shg._id as any).toString(),
        shgName: entry.shg.shgName,
        expectedAmount: entry.expectedAmount,
        actualAmount: entry.totalAmount,
        repaymentDate: entry.date
      });
    }
  }

  return {
    totalSHGs,
    totalRepayments,
    totalAmountCollected,
    averageRepaymentAmount,
    repaymentsByMethod,
    repaymentsByType,
    upcomingRepayments,
    mismatchedRepayments
  };
};

