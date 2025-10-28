export class CreateReimbursementDto {
  serviceProviderID?: number;
  companyID?: number;
  branchesID?: number;
  manageEmployeeID?: number;
  date?: string;
  status?: string;
  approvalType?: string;
  salaryPeriod?: string; // Add this field
  voucherCode?: string;  // Add this field
  voucherDate?: string;  // Add this field
  items?: ReimbursementItemDto[];
}

export class ReimbursementItemDto {
  reimbursementType?: string;
  amount?: string;
  description?: string;
}