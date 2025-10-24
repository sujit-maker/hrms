"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";
import { Plus, Search, Edit, Trash2, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


/* =======================
   Types (aligned to API)
   ======================= */

interface SP { id: number; companyName?: string }
interface CO { id: number; companyName?: string; financialYearStart?: string }
interface BR { id: number; branchName?: string }
interface Emp {
  id: number
  employeeID?: string
  employeeFirstName?: string
  employeeLastName?: string
  attendancePolicyID?: number
  workShiftID?: number
  monthlyPayGradeID?: number
  // salary fields (various names supported)
  monthlyGrossSalary?: number
  grossSalary?: number
  monthlySalary?: number
  ctcMonthly?: number
  ctc?: number
  salary?: number
  totalSalary?: number
  payrollSalary?: number
    departments?: {
    id: number
    serviceProviderID?: number
    companyID?: number
    branchesID?: number
    departmentName?: string
  }
  designations?: {
    id: number
    serviceProviderID?: number
    companyID?: number
    branchesID?: number
    desgination?: string  // Note: typo in API field name
  }
}

interface SalaryAdvanceRepayment {
  id: number;
  salaryAdvanceID: number;
  approvedAmount: string;
  startMonth: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  salaryAdvance: {
    id: number;
    serviceProviderID: number;
    companyID: number;
    branchesID: number;
    manageEmployeeID: number;
    previousAdvancesDue: string;
    advanceAmount: string;
    reason: string;
    repaymentTanure: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface GenerateSalaryDTO {
  serviceProviderID?: number | null
  companyID?: number | null
  branchesID?: number | null
  employeeID: number
  monthPeriod: string
}

interface GenerateSalaryRow {
  id: number
  serviceProviderID?: number | null
  companyID?: number | null
  branchesID?: number | null
  employeeID: number
  monthPeriod: string
  serviceProvider?: { companyName?: string }
  company?: { companyName?: string }
  branches?: { branchName?: string }
  manageEmployee?: Emp
  createdAt?: string
}

type SalaryCycleRow = {
  id: number
  companyID: number
  monthStartDay?: string | number | null
  salaryCycleName?: string | null
}

/* =======================
   Constants / helpers
   ======================= */

   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const API = {
  sp: "http://localhost:8000/service-provider",
  co: "http://localhost:8000/company",
  br: "http://localhost:8000/branches",
  emp: "http://localhost:8000/manage-emp",
  salaryCycleByCompany: (companyId: number) => `http://localhost:8000/salary-cycle/company/${companyId}`,
  generateSalary: "http://localhost:8000/generate-salary",
  salaryAdvanceRepayment: "http://localhost:8000/salary-advance-repayment", // Add this
  reimbursement: "http://localhost:8000/reimbursement", // Add this
};

const MIN_CHARS = 1;



function empName(e?: Emp | null) {
  const f = (e?.employeeFirstName ?? "").trim();
  const l = (e?.employeeLastName ?? "").trim();
  return [f, l].filter(Boolean).join(" ");
}

const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function clampDay(d: number) {
  if (!Number.isFinite(d)) return 1;
  return Math.max(1, Math.min(28, Math.floor(d)));
}

/**
 * Build 12 salary-period labels based on FY start and cycle day.
 */
function buildSalaryPeriodLabels(fyStart?: string | null, dayStr?: string | number | null): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const day = clampDay(Number(dayStr ?? 1));
  const fyIsJan = (fyStart ?? "").trim().toLowerCase() === "1st jan";
  const fyIsApr = (fyStart ?? "").trim().toLowerCase() === "1st april";

  const addMonths = (y: number, m: number, delta: number) => {
    const n = m + delta;
    const y2 = y + Math.floor(n / 12);
    const m2 = ((n % 12) + 12) % 12;
    return { y: y2, m: m2 };
  };

  const makeDate = (y: number, m: number, d: number) => new Date(y, m, d);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${monthsFull[d.getMonth()]} ${d.getFullYear()}`;

  if (day === 1) {
    if (fyIsJan) {
      return Array.from({ length: 12 }).map((_, i) => `${monthsFull[i]} ${currentYear}`);
    }
    const out: string[] = [];
    for (let i = 3; i <= 11; i++) out.push(`${monthsFull[i]} ${currentYear}`);
    out.push(`January ${currentYear + 1}`, `February ${currentYear + 1}`, `March ${currentYear + 1}`);
    return out;
  }

  const periods: string[] = [];

  if (fyIsJan) {
    const start0 = makeDate(currentYear - 1, 11, day);
    for (let i = 0; i < 12; i++) {
      const start = addMonths(start0.getFullYear(), start0.getMonth(), i);
      const startDate = makeDate(start.y, start.m, day);
      const end = addMonths(startDate.getFullYear(), startDate.getMonth(), 1);
      const endDate = makeDate(end.y, end.m, day - 1);
      periods.push(`${fmt(startDate)} to ${fmt(endDate)}`);
    }
    return periods;
  }

  const start0 = makeDate(currentYear, 2, day); // March
  for (let i = 0; i < 12; i++) {
    const start = addMonths(start0.getFullYear(), start0.getMonth(), i);
    const startDate = makeDate(start.y, start.m, day);
    const end = addMonths(startDate.getFullYear(), startDate.getMonth(), 1);
    const endDate = makeDate(end.y, end.m, day - 1);
    periods.push(`${fmt(startDate)} to ${fmt(endDate)}`);
  }
  return periods;
}

/* =======================
   Utility functions
   ======================= */

const ymd2 = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Parse "DD Month YYYY to DD Month YYYY" → start/end Date */
function parseCycle(label: string) {
  const monthNum = (name: string) => {
    const m = monthsFull;
    return String(m.indexOf(name) + 1).padStart(2, "0");
  };
  const [left, right] = label.split(" to ").map(s => s.trim());
  const [sDay, sMonth, sYear] = left.split(" ");
  const [eDay, eMonth, eYear] = right.split(" ");
  const start = new Date(`${sYear}-${monthNum(sMonth)}-${sDay}T00:00:00`);
  const end = new Date(`${eYear}-${monthNum(eMonth)}-${eDay}T23:59:59`);
  return { start, end };
}

/** SAFE inclusive date iterator returning array (avoids generator/downlevel issues) */
function daysIterArray(start: Date, end: Date): Date[] {
  const arr: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    arr.push(new Date(d));
  }
  return arr;
}

/* =======================
   Data helpers (HTTP)
   ======================= */

async function robustGet(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/* =======================
   Salary calculation helpers
   ======================= */


   async function getSalaryAdvanceRepayments(
  employeeId: number, 
  selectedMonthLabel: string
): Promise<{ name: string; amount: number }[]> {
  try {
    // Parse the selected month to get the start date
    const { start } = parseCycle(selectedMonthLabel);
    const selectedMonthStart = new Date(start.getFullYear(), start.getMonth(), 1); // First day of the month
    
    // Fetch all repayments
    const repayments: SalaryAdvanceRepayment[] = await robustGet(API.salaryAdvanceRepayment);
    
    // Filter repayments for this employee and matching month
    const employeeRepayments = repayments.filter(repayment => 
      repayment.salaryAdvance.manageEmployeeID === employeeId
    );
    
    if (employeeRepayments.length === 0) {
      return [];
    }
    
    // Group by startMonth and sum amounts for the same month
    const monthlyRepayments = new Map<string, number>();
    
    employeeRepayments.forEach(repayment => {
      const repaymentDate = new Date(repayment.startMonth);
      const repaymentMonthStart = new Date(repaymentDate.getFullYear(), repaymentDate.getMonth(), 1);
      
      // Check if this repayment matches the selected month
      if (repaymentMonthStart.getTime() === selectedMonthStart.getTime()) {
        const amount = Number(repayment.amount) || 0;
        const key = repaymentMonthStart.toISOString();
        
        if (monthlyRepayments.has(key)) {
          monthlyRepayments.set(key, monthlyRepayments.get(key)! + amount);
        } else {
          monthlyRepayments.set(key, amount);
        }
      }
    });
    
    // Convert to deduction format
    const deductions: { name: string; amount: number }[] = [];
    monthlyRepayments.forEach((amount, monthKey) => {
      if (amount > 0) {
        deductions.push({
          name: "Salary Advance Repayment",
          amount: Math.round(amount)
        });
      }
    });
    
    return deductions;
    
  } catch (error) {
    console.error("Error fetching salary advance repayments:", error);
    return [];
  }
}

/** Find a monthly pay grade for company + branch (or by emp.monthlyPayGradeID if present) */
async function getMonthlyPayGrade(companyId: number, branchId: number, emp?: any) {
  const grades: any[] = await robustGet("http://localhost:8000/monthly-pay-grade");
  if (emp?.monthlyPayGradeID) {
    const g = grades.find(x => x.id === emp.monthlyPayGradeID);
    if (g) return g;
  }
  const g2 = grades.find(x => x.companyID === companyId && x.branchesID === branchId);
  if (!g2) throw new Error("Monthly Pay Grade not found for this company/branch.");
  return g2;
}

/** Get company + branch names */
async function getCompanyAndBranch(companyId: number, branchId: number) {
  const companies: any[] = await robustGet("http://localhost:8000/company");
  const branches: any[] = await robustGet("http://localhost:8000/branches");
  const company = companies.find((c: any) => c.id === companyId) || {};
  const branch = branches.find((b: any) => b.id === branchId) || {};
  return {
    companyName: company.companyName || company.name || `Company #${companyId}`,
    branchName: branch.branchName || branch.name || `Branch #${branchId}`
  };
}

/** Get shift-days for an employee (to count weekly-off occurrences) */
async function getShiftDays(emp: any) {
  const workShifts: any[] = await robustGet("http://localhost:8000/work-shift");
  const empShift = workShifts.find(ws => ws.id === emp.workShiftID);
  return empShift?.workShiftDay || [];
}

/** Count weekly-off occurrences in the cycle (these are paid) */
function countWeeklyOffOccurrences(shiftDays: any[], start: Date, end: Date) {
  const offNames = new Set(shiftDays.filter((d: any) => d.weeklyOff).map((d: any) => d.weekDay));
  let count = 0;
  for (const d of daysIterArray(start, end)) {
    const wd = d.toLocaleString("en-US", { weekday: "long" });
    if (offNames.has(wd)) count++;
  }
  return count;
}

/** Public holiday days for branch within cycle */
async function getHolidayCount(branchId: number, start: Date, end: Date) {
  const holidays: any[] = await robustGet("http://localhost:8000/public-holiday");
  const branchHolidays = holidays.filter((h: any) => h.branchesID === branchId);
  let set = new Set<string>();
  branchHolidays.forEach((h: any) => {
    const hs = new Date(h.startDate), he = new Date(h.endDate);
    for (let d = new Date(hs); d <= he; d.setDate(d.getDate() + 1)) {
      if (d >= start && d <= end) set.add(ymd2(d));
    }
  });
  return set.size;
}

/** Split approved leaves to Non-LoP vs LoP (in days) within cycle */
async function getLeaveBreakdown(employeeId: number, start: Date, end: Date) {
  const leaves: any[] = await robustGet("http://localhost:8000/leave-application");
  const empLeaves = leaves.filter(l => l.manageEmployeeID === employeeId && l.status === "Approved");
  let nonLoP = 0, lop = 0;
  empLeaves.forEach(l => {
    const ls = new Date(l.fromDate), le = new Date(l.toDate);
    for (let d = new Date(ls); d <= le; d.setDate(d.getDate() + 1)) {
      if (d >= start && d <= end) {
        if (String(l.appliedLeaveType).toLowerCase() === "lop") lop++;
        else nonLoP++;
      }
    }
  });
  return { nonLoPDays: nonLoP, lopDays: lop };
}

/** Get employee gross monthly salary from common fields */
function getGrossFromEmp(emp: any): number {
  // First, check if employee has a nested monthlyPayGrade with grossSalary
  if (emp?.monthlyPayGrade?.grossSalary) {
    const v = Number(emp.monthlyPayGrade.grossSalary);
    if (Number.isFinite(v) && v > 0) return v;
  }

  // Fallback to other possible employee fields
  const fields = [
    "monthlyGrossSalary", "grossSalary", "monthlySalary", "ctcMonthly",
    "ctc", "salary", "totalSalary", "payrollSalary"
  ];
  for (const f of fields) {
    const v = Number(emp?.[f]);
    if (Number.isFinite(v) && v > 0) return v;
  }

  throw new Error("Gross salary not found (expected in emp.monthlyPayGrade.grossSalary or employee fields).");
}

/** Get total reimbursement amount for employee in selected period */
/** Get total reimbursement amount for employee in selected period */
async function getReimbursementAmount(employeeId: number, selectedMonthLabel: string): Promise<number> {
  try {
    const reimbursements: any[] = await robustGet(`${BACKEND_URL}/reimbursement`);
    
    // Parse the selected salary period to get start and end dates
    const { start: periodStart, end: periodEnd } = parseCycle(selectedMonthLabel);
    
    // Filter reimbursements for this employee where the reimbursement period overlaps with salary period
    const employeeReimbursements = reimbursements.filter(reimbursement => {
      // Check if reimbursement has a date field and it's in the expected format
      if (!reimbursement.date || typeof reimbursement.date !== 'string') return false;
      
      // Parse the reimbursement period
      const { start: reimbStart, end: reimbEnd } = parseCycle(reimbursement.date);
      
      // Check if reimbursement period overlaps with salary period
      const overlaps = (
        reimbStart <= periodEnd && 
        reimbEnd >= periodStart &&
        reimbursement.manageEmployeeID === employeeId &&
        reimbursement.status === "Approved"
      );
      
      return overlaps;
    });
    
    if (employeeReimbursements.length === 0) {
      return 0;
    }
    
    // Sum all amounts from all items across all matching reimbursements
    let totalAmount = 0;
    
    employeeReimbursements.forEach(reimbursement => {
      if (reimbursement.items && Array.isArray(reimbursement.items)) {
        reimbursement.items.forEach((item: any) => {
          const amount = Number(item.amount) || 0;
          totalAmount += amount;
        });
      }
    });
    
    return Math.round(totalAmount);
    
  } catch (error) {
    console.error("Error fetching reimbursements:", error);
    return 0;
  }
}

/** Compute earnings from Pay Grade + Reimbursements */
/** Compute earnings from Pay Grade + Reimbursements */
async function computeEarnings(gross: number, grade: any, employeeId: number, selectedMonthLabel: string) {
  const basic = Math.round(gross * 0.50);
  const allowances: { name: string, amount: number }[] = [];
  const list = grade?.monthlyPayGradeAllowanceList || [];
  
  // Add regular allowances from pay grade
  list.forEach((item: any) => {
    const a = item.salaryAllowance || {};
    const name = (a.salaryAllowanceName || "").trim();
    const type = (a.salaryAllowanceType || "").toLowerCase();
    const value = Number(a.salaryAllowanceValue || 0);
    let amt = 0;
    if (type === "fixed") amt = value;
    else {
      const base = name.toLowerCase().includes("hra") ? basic : gross;
      amt = Math.round((base * value) / 100);
    }
    allowances.push({ name, amount: amt });
  });
  
  // Add reimbursements as a separate earning item
  const reimbursementAmount = await getReimbursementAmount(employeeId, selectedMonthLabel);
  
  // Create the final earnings array that includes both allowances and reimbursement
  const earningsForPDF = [...allowances];
  
  // Add reimbursement as a separate earning item if it exists
  // Show reimbursement only when present (> 0)
  if (reimbursementAmount > 0) {
    earningsForPDF.push({
      name: "Reimbursement",
      amount: reimbursementAmount
    });
  }
  
  const earningsTotal = basic + earningsForPDF.reduce((s, x) => s + x.amount, 0);
  
  return { 
    basic, 
    allowances: earningsForPDF, // Return the updated array with reimbursement
    earningsTotal 
  };
}

/** Compute grade deductions (PF % on Basic by name, otherwise % on Gross) */
async function computeDeductions(
  gross: number, 
  basic: number, 
  grade: any, 
  employeeId: number, 
  selectedMonthLabel: string
) {
  const list = grade?.monthlyPayGradeDeductionList || [];
  const deductions: { name: string; amount: number }[] = [];
  
  // Add regular deductions from pay grade
  list.forEach((item: any) => {
    const d = item.salaryDeduction || {};
    const name = (d.salaryDeductionName || "").trim();
    const type = (d.salaryDeductionType || "").toLowerCase();
    const value = Number(d.salaryDeductionValue || 0);
    let amt = 0;
    if (type === "fixed") amt = value;
    else {
      const base = name.toLowerCase().includes("pf") ? basic : gross;
      amt = Math.round((base * value) / 100);
    }
    deductions.push({ name, amount: amt });
  });
  
  // Add salary advance repayments as deductions
  const advanceRepayments = await getSalaryAdvanceRepayments(employeeId, selectedMonthLabel);
  deductions.push(...advanceRepayments);
  
  const deductionsTotal = deductions.reduce((s, x) => s + x.amount, 0);
  return { deductions, deductionsTotal };
}

/* =======================
   Attendance counter (MUST be above usage)
   ======================= */

async function fetchAllLogs(): Promise<any[]> {
  const all: any[] = [];
  try {
    const res: any[] = await robustGet(`http://localhost:8000/emp-attendance-logs`);
    all.push(...res);
  } catch (err) {
    console.error("Failed to fetch /emp-attendance-logs", err);
  }
  return all;
}

/**
 * calculateSalaryCounts - produces attendance summary for an employee over a salary period.
 * (This is the central function used by handleSubmit and handleDownloadSalarySlip)
 */
async function calculateSalaryCounts(
  employeeId: number,
  monthLabel: string,
  companyId: number,
  branchId: number
) {
  try {
    const monthNum = (name: string) => String(monthsFull.indexOf(name) + 1).padStart(2, "0");
    const toMinutesMaybeHours = (v: any) => {
      const n = Number(v ?? 0);
      if (!Number.isFinite(n)) return 0;
      return n <= 24 ? n * 60 : n;
    };
    const readNum = (obj: any, ...keys: string[]) => {
      for (let i = 0; i < keys.length; i++) {
        const raw = obj ? obj[keys[i]] : undefined;
        if (raw === undefined || raw === null) continue;
        const n = Number(raw);
        if (!Number.isNaN(n)) return n;
      }
      return undefined;
    };
    const ymd = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayName = (d: Date) => d.toLocaleString("en-US", { weekday: "long" });
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const tHM = (d: Date | null) => d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "–";
    const formatHrs = (min: number) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      if (m === 0) return `${h}h`;
      return `${h}h ${m}m`;
    };

    const parseCDataTs = (s: string) => {
      const isoish = s.includes("T") ? s : s.replace(" ", "T");
      return new Date(isoish);
    };

    // EMPLOYEE
    const empList: any[] = await robustGet(API.emp);
    const emp = empList.find((e) => e.id === employeeId);
    if (!emp) throw new Error("Employee not found");

    // PERIOD
    const left = monthLabel.split(" to ")[0].trim().split(" ");
    const right = monthLabel.split(" to ")[1].trim().split(" ");
    const sDay = left[0], sMonth = left[1], sYear = left[2];
    const eDay = right[0], eMonth = right[1], eYear = right[2];

    const startDate = new Date(`${sYear}-${monthNum(sMonth)}-${sDay}T00:00:00`);
    const endDate = new Date(`${eYear}-${monthNum(eMonth)}-${eDay}T23:59:59`);

    // ATTENDANCE POLICY
    const policies: any[] = await robustGet("http://localhost:8000/attendance-policy");
    const policy = policies.find((p: any) => p.id === emp.attendancePolicyID) ?? {};
    const workingTypeRaw = (policy?.workingHoursType ?? "").toString();
    const workingType = workingTypeRaw.toLowerCase().replace(/\s+/g, "");
    const isFlexible = workingType.startsWith("flex");

    const checkinBeginBeforeMin = readNum(policy, "checkin_begin_before_min") ?? 0;
    const checkinGraceMin = readNum(policy, "checkin_grace_time_min") ?? 0;
    const maxLateCheckInMin = readNum(policy, "max_late_check_in_time") ?? 0;
    const checkoutEndAfterMin = readNum(policy, "checkout_end_after_min") ?? 0;
    const earlyCheckoutBeforeEndMin = readNum(policy, "early_checkout_before_end_min") ?? 0;
    const halfDayMin = toMinutesMaybeHours(readNum(policy, "min_work_hours_half_day_min") ?? 0);
    const lateMarkCount = Number(policy?.lateMarkCount ?? 0);
    const markAsAction = (policy?.markAs ?? "Half Day").toString().toLowerCase();

    // WORK SHIFT
    const workShifts: any[] = await robustGet("http://localhost:8000/work-shift");
    const empShift = workShifts.find((ws: any) => ws.id === emp.workShiftID);
    const shiftDays: any[] = empShift?.workShiftDay ?? [];
    const weeklyOffDays = new Set(shiftDays.filter((d: any) => d.weeklyOff).map((d: any) => d.weekDay));

    const getShiftFrame = (d: Date) => {
      const sd = shiftDays.find((x: any) => x.weekDay === dayName(d));
      if (!sd) return null;
      const st = new Date(sd.startTime);
      const et = new Date(sd.endTime);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), st.getUTCHours(), st.getUTCMinutes(), 0, 0);
      let end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), et.getUTCHours(), et.getUTCMinutes(), 0, 0);
      if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
      const earliestIn = new Date(start.getTime() - checkinBeginBeforeMin * 60000);
      const latestOut = new Date(end.getTime() + checkoutEndAfterMin * 60000);
      const fullMinutes = Number(sd.totalMinutes ?? Math.round((end.getTime() - start.getTime()) / 60000));
      return { weeklyOff: !!sd.weeklyOff, start, end, earliestIn, latestOut, fullMinutes, weekDay: sd.weekDay };
    };

    // HOLIDAYS
    const holidays: any[] = await robustGet("http://localhost:8000/public-holiday");
    const branchHolidays = holidays.filter((h: any) => h.branchesID === branchId);
    const holidaySet = new Set<string>();
    for (const h of branchHolidays) {
      const hs = new Date(h.startDate), he = new Date(h.endDate);
      for (let d = new Date(hs); d <= he; d.setDate(d.getDate() + 1)) {
        if (d >= startDate && d <= endDate) holidaySet.add(ymd(d));
      }
    }

    // LEAVES
    const leaves: any[] = await robustGet("http://localhost:8000/leave-application");
    const empLeaves = leaves.filter((l) => l.manageEmployeeID === employeeId);
    const leaveMap = new Map<string, any>();
    for (const lv of empLeaves) {
      const ls = new Date(lv.fromDate), le = new Date(lv.toDate);
      for (let d = new Date(ls); d <= le; d.setDate(d.getDate() + 1)) {
        const key = ymd(d);
        leaveMap.set(key, lv);
      }
    }

    // LOGS
    const allLogs = await fetchAllLogs();
    const logs = allLogs
      .filter((l: any) => String(l.employeeID) === String(emp.id))
      .map((l: any) => ({ ...l, t: parseCDataTs(l.punchTimeStamp) }))
      .filter((l: any) => l.t >= startDate && l.t <= endDate)
      .sort((a: any, b: any) => a.t.getTime() - b.t.getTime());

    const logsByDate = new Map<string, Date[]>();
    for (const l of logs) {
      const key = ymd(l.t);
      if (!logsByDate.has(key)) logsByDate.set(key, []);
      logsByDate.get(key)!.push(l.t);
    }

    // REGULARISATIONS
    const regs: any[] = await robustGet("http://localhost:8000/emp-attendance-regularise");
    const empRegs = regs.filter((r) => r.manageEmployeeID === employeeId && r.status === "Approved");
    const regulariseMap = new Map<string, any>();
    for (const r of empRegs) {
      const key = ymd(new Date(r.attendanceDate));
      regulariseMap.set(key, r);
    }

    // COUNTERS
    let flex_fullDayPresent = 0, flex_halfDayPresent = 0, flex_earlyCheckoutPresent = 0, flex_absent = 0;
    let regFull = 0, regHalf = 0, regAbsent = 0;
    let leaveFull = 0, leaveAbsent = 0, leaveIgnored = 0;
    let logFull = 0, logHalf = 0, logEarly = 0, logAbsent = 0;
    let lateMarksUsed = 0;

    // iterate days
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const key = ymd(d);
      const wd = dayName(d);
      const frame = getShiftFrame(d);
      if (!frame) continue;

      let inTime: Date | null = null, outTime: Date | null = null;
      let workedMin = 0;

      // Weekly off / Holiday
      if (frame.weeklyOff) continue;
      if (holidaySet.has(key)) { flex_fullDayPresent++; continue; }

      // Regularisation
      if (regulariseMap.has(key)) {
        const r = regulariseMap.get(key);
        if (r.day === "fullday") { flex_fullDayPresent++; regFull++; }
        else if (r.day === "halfday") { flex_halfDayPresent++; regHalf++; }
        else if (r.day === "absent") { flex_absent++; regAbsent++; }
        continue;
      }

      // Leave
      if (leaveMap.has(key)) {
        const lv = leaveMap.get(key);
        if (lv.status === "Approved") {
          if (lv.appliedLeaveType === "LoP") { flex_absent++; leaveAbsent++; }
          else { flex_fullDayPresent++; leaveFull++; }
        } else { leaveIgnored++; }
        continue;
      }

      // Logs
      const dayLogs = (logsByDate.get(key) || []).filter((t: Date) => t >= frame.earliestIn && t <= frame.latestOut);
      if (dayLogs.length === 0) { flex_absent++; logAbsent++; continue; }
      if (dayLogs.length === 1) { flex_absent++; logAbsent++; continue; }

      dayLogs.sort((a: Date, b: Date) => a.getTime() - b.getTime());
      inTime = dayLogs[0]; outTime = dayLogs[dayLogs.length - 1];
      workedMin = Math.max(0, Math.round((outTime.getTime() - inTime.getTime()) / 60000));

      if (isFlexible) {
        if (workedMin >= frame.fullMinutes) { flex_fullDayPresent++; logFull++; }
        else if (workedMin >= halfDayMin) { flex_halfDayPresent++; logHalf++; }
        else { flex_absent++; logAbsent++; }
      } else {
        let todayMarks = 0;
        const graceEnd = new Date(frame.start.getTime() + checkinGraceMin * 60000);
        const maxLateEnd = new Date(frame.start.getTime() + maxLateCheckInMin * 60000);
        const earlyOutAllowed = new Date(frame.end.getTime() - earlyCheckoutBeforeEndMin * 60000);

        const onTimeIn = inTime <= graceEnd;
        const lateWithin = inTime > graceEnd && inTime <= maxLateEnd;
        const veryLate = inTime > maxLateEnd;

        const onOrAfterEnd = outTime >= frame.end;
        const withinEarlyOut = outTime >= earlyOutAllowed && outTime < frame.end;
        const tooEarlyOut = outTime < earlyOutAllowed;

        let baseClass: "full" | "half" | "absent" | null = null;

        if (onTimeIn) {
          if (onOrAfterEnd) baseClass = "full";
          else if (withinEarlyOut) { todayMarks++; baseClass = "full"; }
          else if (workedMin >= halfDayMin) baseClass = "half";
          else baseClass = "absent";
        } else if (lateWithin) {
          todayMarks++;
          if (onOrAfterEnd) baseClass = "full";
          else if (withinEarlyOut) { todayMarks++; baseClass = "full"; }
          else if (workedMin >= halfDayMin) baseClass = "half";
          else baseClass = "absent";
        } else if (veryLate) {
          if (workedMin >= halfDayMin) baseClass = "half";
          else baseClass = "absent";
        }

        let penalty = false;
        if (todayMarks > 0 && lateMarkCount > 0) {
          if (lateMarksUsed + todayMarks >= lateMarkCount) {
            if (markAsAction.includes("absent")) baseClass = "absent"; else baseClass = "half";
            lateMarksUsed = 0; penalty = true;
          } else {
            lateMarksUsed += todayMarks;
          }
        }

        if (baseClass === "full") { flex_fullDayPresent++; logFull++; }
        else if (baseClass === "half") { flex_halfDayPresent++; logHalf++; }
        else { flex_absent++; logAbsent++; }
      }
    }

    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
    return {
      startDate: startDate.toDateString(),
      endDate: endDate.toDateString(),
      totalDays,
      totalLogs: logs.length,
      weeklyOffCount: weeklyOffDays.size,
      publicHolidayCount: holidaySet.size,
      leaveCount: Array.from(leaveMap.values()).filter((l: any) => l.status === "Approved").length,
      fullDayCount: regFull,
      halfDayCount: regHalf,
      flex_fullDayPresent,
      flex_halfDayPresent,
      flex_earlyCheckoutPresent,
      flex_absent,
    };
  } catch (err) {
    console.error("Error calculating salary counts:", err);
    return null;
  }
}

/* =======================
   PDF generation
   ======================= */


   function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };

  return inWords(Math.floor(num)) + " Rupees Only";
}



function downloadSalarySlipPDF(payload: {
  companyName: string;
  branchName: string;
  employee: any;
  monthLabel: string;
  start: Date;
  end: Date;
  cycleDays: number;
  paidUnits: number;
  lopDays: number;
  nonLoPLeaveDays: number;
  weeklyOffDays: number;
  holidays: number;
  halfDaysUnits: number;
  gross: number;
  basic: number;
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  lopAmount: number;
  earningsTotal: number;
  deductionsTotal: number;
  netPay: number;
}) {




  const logoBase64 ="iVBORw0KGgoAAAANSUhEUgAAAu4AAAEsCAYAAACc1TboAAAACXBIWXMAAC4jAAAuIwF4pT92AAAUYmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMC0xMS0xM1QxMzozNDoxMiswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjEtMDEtMTdUMTQ6Mjc6MDMrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjEtMDEtMTdUMTQ6Mjc6MDMrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MjY4NjRhZGQtNzk3NS03MjRhLTgyMWQtNDI5NjkwNDQ5NDY3IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NzEyZGVjZTUtZjhlMy00YjRlLWI4YmUtMzUxYjU0ZmMyMDQ2IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NjMyNWMyMWEtNzdlYi1mZjRlLTliNzEtYmIzNWQ1ZTI2ZjllIj4gPHBob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cmRmOkJhZz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJFbGVjdHJvaGVscHMgTmV0d29ya3MiIHBob3Rvc2hvcDpMYXllclRleHQ9IkVsZWN0cm9oZWxwcyBOZXR3b3JrcyIvPiA8cmRmOmxpIHBob3Rvc2hvcDpMYXllck5hbWU9IlB2dCBMdGQiIHBob3Rvc2hvcDpMYXllclRleHQ9IlB2dCBMdGQiLz4gPHJkZjpsaSBwaG90b3Nob3A6TGF5ZXJOYW1lPSJTb2x1dGlvbiB8IENsb3VkIHwgQ29uc3VsdCB8IEFzc2lzdCIgcGhvdG9zaG9wOkxheWVyVGV4dD0iU29sdXRpb24gfCBDbG91ZCB8IENvbnN1bHQgfCBBc3Npc3QiLz4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpUZXh0TGF5ZXJzPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT4yNzE4RjdCRUY4MERBNTQwQ0M1RjYzODZEODQzNzZBRDwvcmRmOmxpPiA8cmRmOmxpPjY1NTg1QTcwNDgwM0U2RTVCOTVDQ0ZFNDAxRjZEMzNDPC9yZGY6bGk+IDxyZGY6bGk+ODc5RUZFMDUyRDU0RUNBMzAxNzE5NUVEM0Y1RjA0RjQ8L3JkZjpsaT4gPHJkZjpsaT5ERUE0MzdCQkMyMDlDREU1Q0U1QURGOTg1RjU4MjIyRTwvcmRmOmxpPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDowMzk1YTY1YS1lZjM3LTZiNDItOTM3OC1jN2VmODRiODI0Nzc8L3JkZjpsaT4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6MzBiZjFkZTItN2E4YS0wYjQyLWE0NzItMDRmYWEwMGMzMDNjPC9yZGY6bGk+IDxyZGY6bGk+eG1wLmRpZDo2MzI1YzIxYS03N2ViLWZmNGUtOWI3MS1iYjM1ZDVlMjZmOWU8L3JkZjpsaT4gPHJkZjpsaT54bXAuZGlkOjlkODRmYzhmLTNhMDUtNjc0Yy04YTMxLWU4ZjEwNThjMjA1YTwvcmRmOmxpPiA8cmRmOmxpPnhtcC5kaWQ6Y2JkYWM2NDEtZmI0OC0zNjQxLWE4MGYtNjhhMjI3NWRlMDM0PC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NjMyNWMyMWEtNzdlYi1mZjRlLTliNzEtYmIzNWQ1ZTI2ZjllIiBzdEV2dDp3aGVuPSIyMDIwLTExLTEzVDEzOjM0OjEyKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNmZGYxYjU1LTVmZTMtOGU0ZC05MzA1LThkNzkyZjRhMzcxMyIgc3RFdnQ6d2hlbj0iMjAyMC0xMS0xNFQxNDoxNTozOCswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiMjVmYTE1Yi04MzljLTQ4NGUtOGMzMS1iZjQ5N2JmNzMyNzciIHN0RXZ0OndoZW49IjIwMjAtMTEtMThUMjI6MzE6NTQrMDU6MzAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmU2NzNmOGNhLTNmZjgtYmI0MC1iMDU2LWMwZTBkYjhlNTU0NiIgc3RFdnQ6d2hlbj0iMjAyMC0xMS0xOFQyMjo1NTozMiswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpkNzliYjEyNy1hNjBlLTc1NDktYjYzYi1jZjBhOWM0YjNiM2YiIHN0RXZ0OndoZW49IjIwMjAtMTEtMThUMjM6MDY6MjkrMDU6MzAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NWUzZDEwZTMtYTgxYS1lNDRjLTllMmUtYzYxZDQ4YzM5YjlmIiBzdEV2dDp3aGVuPSIyMDIwLTExLTE4VDIzOjA2OjI5KzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmM3YTIyYWFhLTkwYWEtOWY0Zi1iNmFkLWNkNDZkNDMxOWYzNCIgc3RFdnQ6d2hlbj0iMjAyMS0wMS0xN1QxNDoxNTowMiswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvcG5nIHRvIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGltYWdlL3BuZyB0byBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjYmRhYzY0MS1mYjQ4LTM2NDEtYTgwZi02OGEyMjc1ZGUwMzQiIHN0RXZ0OndoZW49IjIwMjEtMDEtMTdUMTQ6MTU6MDIrMDU6MzAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZjZjMTY5ZjAtODM2NC0zNzRjLThjZDUtMmMxZDAyZjRhZWQyIiBzdEV2dDp3aGVuPSIyMDIxLTAxLTE3VDE0OjI3OjAzKzA1OjMwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNvbnZlcnRlZCIgc3RFdnQ6cGFyYW1ldGVycz0iZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iZGVyaXZlZCIgc3RFdnQ6cGFyYW1ldGVycz0iY29udmVydGVkIGZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjI2ODY0YWRkLTc5NzUtNzI0YS04MjFkLTQyOTY5MDQ0OTQ2NyIgc3RFdnQ6d2hlbj0iMjAyMS0wMS0xN1QxNDoyNzowMyswNTozMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpmNmMxNjlmMC04MzY0LTM3NGMtOGNkNS0yYzFkMDJmNGFlZDIiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Y2JkYWM2NDEtZmI0OC0zNjQxLWE4MGYtNjhhMjI3NWRlMDM0IiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NjMyNWMyMWEtNzdlYi1mZjRlLTliNzEtYmIzNWQ1ZTI2ZjllIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+dUKuYQAAc05JREFUeNrtnQVYFdn7xw/Yrhu/zf/uuoEiDVI2inSLYCuu3V3Y3YWKHRhgYwcGii12i2IhYgs2Bqv3/M8ZwHXZG3MvN+E7z/N5yDt35sTcz5x5z3sIpZQAAAAAAAAA9BsUAgAAAAAAABB3AAAAAAAA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"

 function numberToWords(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function numToWords(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  }

  const [rupees, paise] = amount.toFixed(2).split(".").map(Number);
  let words = `Rupees ${numToWords(rupees)}`;
  if (paise > 0) words += ` and ${numToWords(paise)} Paise`;
  return words + " Only";
}

try {
  
  

   // ========== HEADER ==========
const doc = new jsPDF("p", "mm", "a4");
const pageWidth = doc.internal.pageSize.width;
const gray: [number, number, number] = [100, 60, 150];
let y = 15;

const companyName = payload.companyName || payload.employee?.company?.companyName ;
const companyAddress = payload.employee?.company?.address || "Head Office";

// Logo
doc.addImage(logoBase64, "PNG", 15, 10, 40, 15);

// Company Name
doc.setFont("helvetica", "bold");
doc.setFontSize(15);
doc.setTextColor(gray[0], gray[1], gray[2]);
doc.text(companyName, pageWidth / 2, 20, { align: "center" });

// Address line (below company name)
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(80, 80, 80);
doc.text(companyAddress, pageWidth / 2, 25, { align: "center" });

// Tagline
doc.setFontSize(8);
doc.setTextColor(100, 100, 100);

// Salary Slip Title
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(0, 0, 0);
doc.text("Salary Slip", pageWidth / 2, 38, { align: "center" });

// Branch & Period
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.text(`Branch: ${payload.branchName}`, 15, 45);
doc.text(
  `Period: ${payload.start.toDateString()} - ${payload.end.toDateString()}`,
  pageWidth - 15,
  45,
  { align: "right" }
);

  // ========== EMPLOYEE DETAILS ==========
  const empName = `${payload.employee.employeeFirstName || ""} ${payload.employee.employeeLastName || ""}`.trim();
  const dept = payload.employee.departments?.departmentName || "N/A";
  const desg = payload.employee.designations?.desgination || "N/A";

  autoTable(doc, {
    startY: 47,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2, lineWidth: 0.1 },
    headStyles: { fillColor: gray, textColor: [255, 255, 255], halign: "center" },
    body: [
      ["Employee ID", payload.employee.employeeID || "-", "Name", empName],
      ["Department", dept, "Designation", desg],
      ["Total Paid Days", payload.paidUnits, "Approved Leaves", payload.nonLoPLeaveDays],
    ],
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30 },
      3: { cellWidth: 60 },
    },
    margin: { left: 15 },
    tableWidth: pageWidth - 30,
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ========== EARNINGS / DEDUCTIONS ==========
  const earningsRows = [
    ["Basic Pay", ` ${payload.basic.toFixed(2)}`],
    ...payload.earnings.map((e: any) => [e.name, ` ${e.amount.toFixed(2)}`]),
    ["Total Earnings", ` ${payload.earningsTotal.toFixed(2)}`],
  ];
  const dedRows = [
    ...payload.deductions.map((d: any) => [d.name, ` ${d.amount.toFixed(2)}`]),
    ["Loss of Pay", ` ${payload.lopAmount.toFixed(2)}`],
    ["Total Deductions", ` ${(payload.deductionsTotal + payload.lopAmount).toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, lineWidth: 0.1 },
    headStyles: { fillColor: gray, textColor: [255, 255, 255], halign: "center" },
    head: [
      [
        { content: "Earnings", colSpan: 2, styles: { halign: "center" } },
        { content: "Deductions", colSpan: 2, styles: { halign: "center" } },
      ],
    ],
    body: (() => {
      const rows: any[] = [];
      const max = Math.max(earningsRows.length, dedRows.length);
      for (let i = 0; i < max; i++) {
        rows.push([
          earningsRows[i]?.[0] || "",
          earningsRows[i]?.[1] || "",
          dedRows[i]?.[0] || "",
          dedRows[i]?.[1] || "",
        ]);
      }
      return rows;
    })(),
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
    margin: { left: 15 },
    tableWidth: pageWidth - 30,
  });

  y = (doc as any).lastAutoTable.finalY + 5;

  // ========== NET PAY SECTION ==========
  autoTable(doc, {
    startY: y,
    theme: "grid",
    styles: { fontSize: 10, lineWidth: 0.1, halign: "center" },
    headStyles: { fillColor: gray, textColor: [255, 255, 255] },
    head: [["Net Pay (Rounded)", "Amount ()"]],
    body: [[`Net Payable`, ` ${payload.netPay.toFixed(2)}`]],
    margin: { left: 15 },
    tableWidth: pageWidth - 30,
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ========== NET PAY IN WORDS ==========
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    `Net Payable (in words): ${numberToWords(payload.netPay)}`,
    15,
    y
  );

  // ========== SIGNATURES ==========
  y += 20;
  doc.setDrawColor(0);
  doc.line(30, y, 80, y);
  doc.line(pageWidth - 80, y, pageWidth - 30, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Employer's Signature", 35, y + 5);
  doc.text("Employee's Signature", pageWidth - 85, y + 5);

  // ========== FOOTER ==========
  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text("This is a system generated document.", pageWidth / 2, y, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, y + 4, { align: "center" });

  // ========== SAVE ==========
  const fn = `Salary_Slip_${payload.employee.employeeID || payload.employee.id}_${payload.start.getFullYear()}_${(
    payload.start.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}.pdf`;
  doc.save(fn);
}
 catch (err) {
    console.error("Error generating salary slip:", err);
    alert("Error generating salary slip. Please check console for details.");
  }
}

/* =======================
   Component
   ======================= */

export function GenerateSalaryManagement() {
  // table + UI
  const [items, setItems] = useState<GenerateSalaryRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GenerateSalaryRow | null>(null);
  const [salaryPeriod, setSalaryPeriod] = useState("");


  // suggestion states
  const [spList, setSpList] = useState<SP[]>([]);
  const [coList, setCoList] = useState<CO[]>([]);
  const [brList, setBrList] = useState<BR[]>([]);
  const [empList, setEmpList] = useState<Emp[]>([]);
  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [brLoading, setBrLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const spRef = useRef<HTMLDivElement | null>(null);
  const coRef = useRef<HTMLDivElement | null>(null);
  const brRef = useRef<HTMLDivElement | null>(null);
  const empRef = useRef<HTMLDivElement | null>(null);

  // company-driven salary cycle
  const [selectedCompanyFYStart, setSelectedCompanyFYStart] = useState<string | null>(null);
  const [selectedCompanyStartDay, setSelectedCompanyStartDay] = useState<string>("1");
  const [salaryPeriodOptions, setSalaryPeriodOptions] = useState<string[]>([]);

  // form
  const [formData, setFormData] = useState({
    serviceProviderID: null as number | null,
    companyID: null as number | null,
    branchesID: null as number | null,
    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",
    employeeDbID: null as number | null,
    employeeAutocomplete: "",
    monthLabel: "",
  });

  // close popovers on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (spRef.current && !spRef.current.contains(t)) setSpList([]);
      if (coRef.current && !coRef.current.contains(t)) setCoList([]);
      if (brRef.current && !brRef.current.contains(t)) setBrList([]);
      if (empRef.current && !empRef.current.contains(t)) setEmpList([]);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
  if (formData.companyID) {
    (async () => {
      const res = await robustGet("http://localhost:8000/salary-cycle");
      const filtered = res
        .filter((c: any) => c.companyID === Number(formData.companyID))
        .map((c: any) => `${c.startDay} ${c.startMonth} ${c.startYear} to ${c.endDay} ${c.endMonth} ${c.endYear}`);
      setSalaryPeriodOptions(filtered);
    })();
  }
}, [formData.companyID]);


  /* ====== CRUD ====== */
  async function fetchAll() {
    try {
      const raw = await robustGet(API.generateSalary);
      const list: GenerateSalaryRow[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setItems(list);
    } catch (e) {
      console.error("Failed to load GenerateSalary:", e);
    }
  }
  useEffect(() => { fetchAll(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.employeeDbID || !formData.monthLabel) return;

    const payload: GenerateSalaryDTO = {
      serviceProviderID: formData.serviceProviderID ?? undefined,
      companyID: formData.companyID ?? undefined,
      branchesID: formData.branchesID ?? undefined,
      employeeID: formData.employeeDbID,
      monthPeriod: formData.monthLabel
    };

    try {
      const res = await fetch(
        editing ? `${API.generateSalary}/${editing.id}` : API.generateSalary,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${API.generateSalary}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }

  function resetForm() {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchesID: null,
      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",
      employeeDbID: null,
      employeeAutocomplete: "",
      monthLabel: "",
    });
    setEditing(null);
    setSelectedCompanyFYStart(null);
    setSelectedCompanyStartDay("1");
    setSalaryPeriodOptions([]);
    setSpList([]); setCoList([]); setBrList([]); setEmpList([]);
  }

  async function beginEdit(row: GenerateSalaryRow) {
  setEditing(row);
  
  // Set all form data first
  const newFormData = {
    serviceProviderID: row.serviceProviderID ?? null,
    companyID: row.companyID ?? null,
    branchesID: row.branchesID ?? null,
    spAutocomplete: row.serviceProvider?.companyName ?? "",
    coAutocomplete: row.company?.companyName ?? "",
    brAutocomplete: row.branches?.branchName ?? "",
    employeeDbID: row.employeeID ?? null,
    employeeAutocomplete: row.manageEmployee ? `${empName(row.manageEmployee)} (${row.manageEmployee.employeeID ?? ""})` : "",
    monthLabel: row.monthPeriod,
  };
  
  setFormData(newFormData);
  
  // Now refresh company options if company exists
  if (row.companyID) {
    try {
      await refreshCompanyDrivenOptions(row.companyID);
    } catch (error) {
      console.error("Failed to refresh company options:", error);
    }
  } else {
    // Reset company-driven options if no company
    setSelectedCompanyFYStart(null);
    setSelectedCompanyStartDay("1");
    setSalaryPeriodOptions([]);
  }
  
  setIsDialogOpen(true);
}


  /* ====== Suggestions ====== */
  const runFetchSP = async (q: string) => {
    if (!q || q.length < MIN_CHARS) return setSpList([]);
    setSpLoading(true);
    try {
      const data: SP[] = await robustGet(API.sp);
      const filtered = data.filter((sp) => (sp.companyName ?? "").toLowerCase().includes(q.toLowerCase()));
      setSpList(filtered);
    } catch { /* noop */ }
    finally { setSpLoading(false); }
  };

  const runFetchCO = async (q: string) => {
    if (!q || q.length < MIN_CHARS) return setCoList([]);
    setCoLoading(true);
    try {
      const data: CO[] = await robustGet(API.co);
      const filtered = data.filter((co) => (co.companyName ?? "").toLowerCase().includes(q.toLowerCase()));
      setCoList(filtered);
    } catch { /* noop */ }
    finally { setCoLoading(false); }
  };

  const runFetchBR = async (q: string) => {
    setBrLoading(true);
    try {
      const url = formData.companyID ? `${API.br}?companyID=${formData.companyID}` : API.br;
      const data: BR[] = await robustGet(url);
      const filtered = (q?.length ? data.filter((b) => (b.branchName ?? "").toLowerCase().includes(q.toLowerCase())) : data);
      setBrList(filtered);
    } catch { /* noop */ }
    finally { setBrLoading(false); }
  };

  const runFetchEmp = async (q: string) => {
    if (!q || q.length < MIN_CHARS) return setEmpList([]);
    setEmpLoading(true);
    try {
      const data: Emp[] = await robustGet(API.emp);
      const low = q.toLowerCase();
      const filtered = data.filter((e) =>
        (empName(e)).toLowerCase().includes(low) ||
        (e.employeeID ?? "").toLowerCase().includes(low)
      );
      setEmpList(filtered);
    } catch { /* noop */ }
    finally { setEmpLoading(false); }
  };

  async function refreshCompanyDrivenOptions(companyId: number) {
    try {
      const company: CO = await robustGet(`${API.co}/${companyId}`);
      const fy = company?.financialYearStart ?? "1st April";
      setSelectedCompanyFYStart(fy);

      const rows: SalaryCycleRow[] = await robustGet(API.salaryCycleByCompany(companyId));
      const scoped = Array.isArray(rows) ? rows.filter(r => Number(r.companyID) === Number(companyId)) : [];

      if (!scoped.length) {
        setSelectedCompanyStartDay("1");
        setSalaryPeriodOptions([]);
        setFormData((p) => ({ ...p, monthLabel: "" }));
        return;
      }

      scoped.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      const day = String(scoped[0]?.monthStartDay ?? "1");
      setSelectedCompanyStartDay(day);

      const opts = buildSalaryPeriodLabels(fy, day);
      setSalaryPeriodOptions(opts);
      setFormData((p) => (opts.includes(p.monthLabel) ? p : { ...p, monthLabel: "" }));
    } catch (e) {
      console.error("Failed to refresh company options:", e);
      setSelectedCompanyFYStart(null);
      setSelectedCompanyStartDay("1");
      setSalaryPeriodOptions([]);
      setFormData((p) => ({ ...p, monthLabel: "" }));
    }
  }

  /* ====== Generate / Download Salary Slip (single copy) ====== */
async function handleDownloadSalarySlipForRow(row: GenerateSalaryRow) {
  try {
    const employeeId = row.employeeID;
    const companyId = Number(row.companyID);
    const branchId = Number(row.branchesID);
    const monthLabel = row.monthPeriod;

    const empList: any[] = await robustGet(API.emp);
    const emp = empList.find((e: any) => e.id === employeeId);
    if (!emp) throw new Error("Employee not found");

    const { start, end } = parseCycle(monthLabel);
    const cycleDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

    const counts = await calculateSalaryCounts(employeeId, monthLabel, companyId, branchId);
    if (!counts) throw new Error("Could not compute attendance counts");

    const shiftDays = await getShiftDays(emp);
    const weeklyOffDays = countWeeklyOffOccurrences(shiftDays, start, end);
    const holidays = await getHolidayCount(branchId, start, end);
    const { nonLoPDays, lopDays } = await getLeaveBreakdown(employeeId, start, end);

    const fullFromAttendanceOnly = Math.max(0, (counts.flex_fullDayPresent || 0) - holidays - nonLoPDays);
    const halfUnits = Number(counts.flex_halfDayPresent || 0) * 0.5;
    const paidUnits = fullFromAttendanceOnly + halfUnits + weeklyOffDays + holidays;

    const totalUnpaidLeaveDays = nonLoPDays + lopDays;
    const lossOfPayDays = Math.max(0, (cycleDays - paidUnits) + totalUnpaidLeaveDays);

    const grade = await getMonthlyPayGrade(companyId, branchId, emp);
    const { companyName, branchName } = await getCompanyAndBranch(companyId, branchId);

    const gross = getGrossFromEmp(emp);
    const { basic, allowances, earningsTotal } = await computeEarnings(gross, grade, employeeId, monthLabel);
    const { deductions, deductionsTotal } = await computeDeductions(gross, basic, grade, employeeId, monthLabel);

    const perDaySalary = gross / cycleDays;
    const lopAmount = perDaySalary * lossOfPayDays;
    const netPay = Math.max(0, earningsTotal - (deductionsTotal + lopAmount));

    downloadSalarySlipPDF({
      companyName, branchName, employee: emp, monthLabel,
      start, end, cycleDays,
      paidUnits: Number(paidUnits.toFixed(2)),
      lopDays: Number(lopDays.toFixed(2)),
      nonLoPLeaveDays: Number(nonLoPDays.toFixed(2)),
      weeklyOffDays, holidays,
      halfDaysUnits: Number(halfUnits.toFixed(2)),
      gross, basic,
      earnings: allowances, // This now includes reimbursement
      deductions, 
      lopAmount, 
      earningsTotal, 
      deductionsTotal,
      netPay
    });
  } catch (err) {
    console.error("Error generating salary slip:", err);
    alert("Error generating salary slip: " + (err instanceof Error ? err.message : String(err)));
  }
}

  /* ====== Filter for table ====== */
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((g) =>
      (g.serviceProvider?.companyName ?? "").toLowerCase().includes(q) ||
      (g.company?.companyName ?? "").toLowerCase().includes(q) ||
      (g.branches?.branchName ?? "").toLowerCase().includes(q) ||
      empName(g.manageEmployee).toLowerCase().includes(q) ||
      (g.monthPeriod ?? "").toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  /* =======================
     UI
     ======================= */
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Generate Salary</h1>
          <p className="text-gray-600 mt-1 text-sm">Generate and manage employee salary payments</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Salary Generation
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Salary Generation" : "Add New Salary Generation"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update the salary generation information below." : "Fill in the details to add a new salary generation."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Organization Selection</h3>

                <div className="grid grid-cols-3 gap-4">
                  {/* Service Provider */}
                  <div ref={spRef} className="space-y-2 relative">
                    <Label>Service Provider *</Label>
                    <Input
                      value={formData.spAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, spAutocomplete: val, serviceProviderID: null }));
                        runFetchSP(val);
                      }}
                      onFocus={(e) => {
                        const val = e.target.value;
                        if (val.length >= MIN_CHARS) runFetchSP(val);
                      }}
                      placeholder="Start typing service provider…"
                      autoComplete="off"
                      required
                    />
                    {spList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                        {spLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                        {spList.map((sp) => (
                          <div
                            key={sp.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({ ...p, serviceProviderID: sp.id, spAutocomplete: sp.companyName ?? "" }));
                              setSpList([]);
                            }}
                          >
                            {sp.companyName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Company */}
                  <div ref={coRef} className="space-y-2 relative">
                    <Label>Company Name *</Label>
                    <Input
                      value={formData.coAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, coAutocomplete: val, companyID: null }));
                        runFetchCO(val);
                      }}
                      onFocus={(e) => {
                        const val = e.target.value;
                        if (val.length >= MIN_CHARS) runFetchCO(val);
                      }}
                      placeholder="Start typing company…"
                      autoComplete="off"
                      required
                    />
                    {coList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                        {coLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                        {coList.map((co) => (
                          <div
                            key={co.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={async () => {
                              setFormData((p) => ({ ...p, companyID: co.id, coAutocomplete: co.companyName ?? "" }));
                              setCoList([]);
                              await refreshCompanyDrivenOptions(co.id);
                            }}
                          >
                            {co.companyName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Branch */}
                  <div ref={brRef} className="space-y-2 relative">
                    <Label>Branch Name *</Label>
                    <Input
                      value={formData.brAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, brAutocomplete: val, branchesID: null }));
                        runFetchBR(val);
                      }}
                      onFocus={(e) => { runFetchBR(formData.brAutocomplete); }}
                      placeholder="Start typing branch…"
                      autoComplete="off"
                      required
                    />
                    {brList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                        {brLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                        {brList.map((br) => (
                          <div
                            key={br.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({ ...p, branchesID: br.id, brAutocomplete: br.branchName ?? "" }));
                              setBrList([]);
                            }}
                          >
                            {br.branchName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employee Selection</h3>
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div ref={empRef} className="space-y-2 col-span-3 md:col-span-3 relative">
                    <Label>Select Employee *</Label>
                    <Input
                      value={formData.employeeAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, employeeAutocomplete: val, employeeDbID: null }));
                        runFetchEmp(val);
                      }}
                      onFocus={(e) => {
                        const val = e.target.value;
                        if (val.length >= MIN_CHARS) runFetchEmp(val);
                      }}
                      placeholder="Type name or employee code…"
                      autoComplete="off"
                      required
                    />
                    {empList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-56 overflow-y-auto">
                        {empLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                        {empList.map((emp) => {
                          const name = empName(emp) || "(No name)";
                          return (
                            <div
                              key={emp.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setFormData((p) => ({
                                  ...p,
                                  employeeDbID: emp.id,
                                  employeeAutocomplete: `${name} (${emp.employeeID ?? ""})`,
                                }));
                                setEmpList([]);
                              }}
                            >
                              {name} <span className="text-gray-500">({emp.employeeID})</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Fetched from /manage-emp</p>
                  </div>
                </div>
              </div>

              {/* Salary Period (month) */}
             <div className="space-y-4">
  <h3 className="text-lg font-semibold">Salary Period</h3>
  <div className="space-y-2">
    <Label htmlFor="month">Select Month *</Label>
   <select
  id="month"
  value={formData.monthLabel}
  onChange={(e) => setFormData((p) => ({ ...p, monthLabel: e.target.value }))}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  required
  disabled={!formData.companyID} // ✅ only disable when company not selected
>
  <option value="">
    {formData.companyID
      ? (salaryPeriodOptions.length ? "Select Period" : "No cycle found for company")
      : "Select Company first"}
  </option>
  {salaryPeriodOptions.map((lbl) => (
    <option key={lbl} value={lbl}>{lbl}</option>
  ))}
</select>

    {formData.companyID ? (
      <p className="text-xs text-gray-500">
        FY start: <b>{selectedCompanyFYStart ?? "-"}</b>; Day: <b>{selectedCompanyStartDay}</b>
      </p>
    ) : (
      <p className="text-xs text-gray-500">Pick a company to load its salary periods.</p>
    )}
  </div>
</div>


              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editing ? "Update Salary Generation" : "Add Salary Generation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search generated salaries…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filtered.length} records
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-check" className="w-5 h-5" />
            Salary Generation List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Service Provider</TableHead>
                  <TableHead className="w-[160px]">Company</TableHead>
                  <TableHead className="w-[160px]">Branch</TableHead>
                  <TableHead className="w-[180px]">Employee</TableHead>
                  <TableHead className="w-[160px]">Month Period</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-check" className="w-12 h-12 text-gray-300" />
                        <p>No records found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">{row.serviceProvider?.companyName ?? "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.company?.companyName ?? "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.branches?.branchName ?? "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.manageEmployee ? `${empName(row.manageEmployee)} (${row.manageEmployee.employeeID ?? ""})` : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{row.monthPeriod}</TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => beginEdit(row)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(row.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleDownloadSalarySlipForRow(row)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                         <Download className="w-3 h-3" />

                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
