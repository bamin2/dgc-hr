export interface PayslipData {
  id: string;
  employee: {
    id: string;
    name: string;
    code?: string;
    department: string;
    position: string;
    avatar?: string;
  };
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  earnings: {
    baseSalary: number;
    housingAllowance: number;
    transportationAllowance: number;
    otherAllowances: { name: string; amount: number }[];
    grossPay: number;
  };
  deductions: {
    gosiContribution: number;
    otherDeductions: { name: string; amount: number }[];
    totalDeductions: number;
  };
  netPay: number;
  currency: string;
  company: {
    name: string;
    legalName?: string;
    address: string;
    logo?: string;
  };
  status: string;
}
