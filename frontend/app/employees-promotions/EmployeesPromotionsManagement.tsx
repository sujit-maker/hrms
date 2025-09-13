"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";
import { Plus, Search, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";

/** ========= Types aligned to backend ========= */
type ID = number;

// Core name types used in suggestions
interface SP { id: ID; companyName?: string | null }
interface CO { id: ID; companyName?: string | null }
interface BR { id: ID; branchName?: string | null }
interface Dept { id: ID; departmentName?: string | null }
interface Desg { id: ID; designantion?: string | null }


// Minimal employee row for suggestions + promotions
interface EmpRow {
  id: ID;
  employeeID?: string | null;
  employeeFirstName?: string | null;
  employeeLastName?: string | null;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;

  // These were previously top-level, but now come via empPromotion. Keep optional.
  employmentType?: string | null;
  employmentStatus?: string | null;
  salaryPayGradeType?: string | null;
  departmentNameID?: ID | null;
  designationID?: ID | null;

  // Optional nested names (if your API ever includes them)
  departments?: { id: ID; departmentName?: string | null } | null;
  designations?: { id: ID; designantion?: string | null } | null;

  // 🔽 NEW: latest values live here
  empPromotion?: Array<{
    id: ID;
    manageEmployeeID?: ID | null;
    departmentNameID?: ID | null;
    designationID?: ID | null;
    managerID?: ID | null;
    employmentType?: string | null;
    employmentStatus?: string | null;
    probationPeriod?: string | null;
    workShiftID?: ID | null;
    attendancePolicyID?: ID | null;
    leavePolicyID?: ID | null;
    salaryPayGradeType?: string | null;
    monthlyPayGradeID?: ID | null;
    hourlyPayGradeID?: ID | null;
  }> | null;
}


// Current position row (EmpCurrentPosition)
interface CurrentPos {
  id: ID;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;
  manageEmployeeID?: ID | null;
  existingDepartmentID?: ID | null;
  existingDesignationID?: ID | null;
  existingMonthlyPayGradeID?: ID | null;
  existingHourlyPayGradeID?: ID | null;
  existingSalaryCtc?: number | null;
  existingEmploymentType?: number | null;
  effectiveFrom?: string | null; // ISO date
  effectiveTo?: string | null;   // ISO date
  createdAt?: string | null;

  // Optional nested (if backend includes)
  serviceProvider?: { id: ID; companyName?: string | null } | null;
  company?: { id: ID; companyName?: string | null } | null;
  branches?: { id: ID; branchName?: string | null } | null;
  departments?: { id: ID; departmentName?: string | null } | null;
  designations?: { id: ID; designantion?: string | null } | null;
}

// Promotion request row (empPromotionuest)
interface empPromotion {
  id: ID;
  manageEmployeeID?: ID | null;
  empID?: string | null;

  newDepartmentID?: ID | null;
  newDesignationID?: ID | null;
  newMonthlyPayGradeID?: ID | null;
  newHourlyPayGradeID?: ID | null;
  newSalaryCtc?: number | null;
  newEmploymentType?: number | null;
  newEmployementStatus?: string | null;

  proposedDepartmentID?: ID | null;
  proposedDesignationID?: ID | null;
  proposedMonthlyPayGradeID?: ID | null;
  proposedHourlyPayGradeID?: ID | null;
  proposedSalaryCtc?: number | null;
  proposedEmploymentType?: number | null;

  description?: string | null;
  promotionDate?: string | null; // ISO date
  status?: string | null; // "Not Applied" | "Applied"
  created_at?: string | null;

  // Optional nested names if included by your API
  departments_empPromotionuest_currentDepartmentIDTodepartments?: { id: ID; departmentName?: string | null } | null;
  designations_empPromotionuest_currentDesignationIDTodesignations?: { id: ID; designantion?: string | null } | null;
  departments_empPromotionuest_proposedDepartmentIDTodepartments?: { id: ID; departmentName?: string | null } | null;
  designations_empPromotionuest_proposedDesignationIDTodesignations?: { id: ID; designantion?: string | null } | null;
}

/** ========= API endpoints ========= */
/** ========= API endpoints ========= */
const API = {
  serviceProviders: "http://localhost:8000/service-provider",
  companies: "http://localhost:8000/company",
  branches: "http://localhost:8000/branches",
  manageEmp: "http://localhost:8000/manage-emp",
  managers: "http://localhost:8000/manage-emp",

  // ✅ fix typo + keep same path
  workShifts: "http://localhost:8000/work-shift",


  // ✅ add these three if your backend exposes them as below
  attendancePolicies: "http://localhost:8000/attendance-policy",
  leavePolicies: "http://localhost:8000/leave-policy",
  empPromotion: "http://localhost:8000/emp-promotion",


  // ✅ add monthly/hourly grade endpoints (you mentioned these names earlier)
  monthlyGrades: "http://localhost:8000/monthly-grade",
  hourlyGrades:  "http://localhost:8000/hourly-grade",

  empCurrent: "http://localhost:8000/emp-current-position",
  departments: "http://localhost:8000/departments",
  designations: "http://localhost:8000/designations",
};


const MIN_CHARS = 1;
const DEBOUNCE_MS = 250;

/** ========= helpers ========= */
async function fetchJSONSafe<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const raw = await res.json();
  return (raw?.data ?? raw) as T;
}



/** ========= Component ========= */
export function EmployeesPromotionsManagement() {
  /** ========== table data (show list of promotion requests) ========== */
const [rows, setRows] = useState<EmpPromotionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /** dialog state */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<empPromotion | null>(null);
  const [editingRow, setEditingRow] = useState<{ current?: CurrentPos | null; promo?: empPromotion | null } | null>(null);

  /** ========== autocomplete refs & state ========== */
  const spRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<HTMLDivElement>(null);
  const brRef = useRef<HTMLDivElement>(null);
  const empRef = useRef<HTMLDivElement>(null);
  const deptCurrRef = useRef<HTMLDivElement>(null);
  const desgCurrRef = useRef<HTMLDivElement>(null);
  const deptNewRef = useRef<HTMLDivElement>(null);
  const desgNewRef = useRef<HTMLDivElement>(null);
  const deptPropRef = useRef<HTMLDivElement>(null);
  const desgPropRef = useRef<HTMLDivElement>(null);
 const workShiftRef = useRef<HTMLDivElement>(null);
const attPolicyRef = useRef<HTMLDivElement>(null);
const leavePolicyRef = useRef<HTMLDivElement>(null);
const monthlyPGRef = useRef<HTMLDivElement>(null);
const hourlyPGRef = useRef<HTMLDivElement>(null);
const managerRef = useRef<HTMLDivElement>(null);





  const [spList, setSpList] = useState<SP[]>([]);
  const [coList, setCoList] = useState<CO[]>([]);
  const [brList, setBrList] = useState<BR[]>([]);
  const [empList, setEmpList] = useState<EmpRow[]>([]);
  const [deptCurrList, setDeptCurrList] = useState<Dept[]>([]);
  const [desgCurrList, setDesgCurrList] = useState<Desg[]>([]);
  const [deptNewList, setDeptNewList] = useState<Dept[]>([]);
  const [desgNewList, setDesgNewList] = useState<Desg[]>([]);
  const [deptPropList, setDeptPropList] = useState<Dept[]>([]);
  const [desgPropList, setDesgPropList] = useState<Desg[]>([]);
  const [managerList, setManagerList] = useState<any[]>([]);


  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [brLoading, setBrLoading] = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [deptCurrLoading, setDeptCurrLoading] = useState(false);
  const [desgCurrLoading, setDesgCurrLoading] = useState(false);
  const [deptNewLoading, setDeptNewLoading] = useState(false);
  const [desgNewLoading, setDesgNewLoading] = useState(false);
  const [deptPropLoading, setDeptPropLoading] = useState(false);
  const [desgPropLoading, setDesgPropLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false);


  const spAbortRef = useRef<AbortController | null>(null);
  const coAbortRef = useRef<AbortController | null>(null);
  const brAbortRef = useRef<AbortController | null>(null);
  const empAbortRef = useRef<AbortController | null>(null);
  const deptCurrAbortRef = useRef<AbortController | null>(null);
  const desgCurrAbortRef = useRef<AbortController | null>(null);
  const deptNewAbortRef = useRef<AbortController | null>(null);
  const desgNewAbortRef = useRef<AbortController | null>(null);
  const deptPropAbortRef = useRef<AbortController | null>(null);
  const desgPropAbortRef = useRef<AbortController | null>(null);
  

  const workShiftAbortRef = useRef<AbortController | null>(null);
const attPolicyAbortRef = useRef<AbortController | null>(null);
const leavePolicyAbortRef = useRef<AbortController | null>(null);
const monthlyPGAbortRef = useRef<AbortController | null>(null);
const hourlyPGAbortRef = useRef<AbortController | null>(null);
const managerAbortRef = useRef<AbortController | null>(null);


const workShiftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const attPolicyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const leavePolicyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const monthlyPGTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const hourlyPGTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const managerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const spTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const empTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deptCurrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desgCurrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deptNewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desgNewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deptPropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desgPropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [workShiftList, setWorkShiftList] = useState<any[]>([]);
const [workShiftLoading, setWorkShiftLoading] = useState(false);

const [attPolicyList, setAttPolicyList] = useState<any[]>([]);
const [attPolicyLoading, setAttPolicyLoading] = useState(false);

const [leavePolicyList, setLeavePolicyList] = useState<any[]>([]);
const [leavePolicyLoading, setLeavePolicyLoading] = useState(false);

const [monthlyPGList, setMonthlyPGList] = useState<any[]>([]);
const [monthlyPGLoading, setMonthlyPGLoading] = useState(false);

const [hourlyPGList, setHourlyPGList] = useState<any[]>([]);
const [hourlyPGLoading, setHourlyPGLoading] = useState(false);

  /** form state */
  type PromotionForm = {
    id: number | undefined;
    manageEmployeeID: number | null;
    departmentNameID: number | null;
    designationID: number | null;
    managerID: number | null;
    employmentType: string;
    employmentStatus: string;
    probationPeriod: string;
    workShiftID: number | null;
    attendancePolicyID: number | null;
    leavePolicyID: number | null;
    salaryPayGradeType: string;
    monthlyPayGradeID: number | null;
    hourlyPayGradeID: number | null;
  };

  const [formData, setFormData] = useState<{


    serviceProviderID: ID | null;
    companyID: ID | null;
    branchesID: ID | null;
    spAutocomplete: string;
    coAutocomplete: string;
    brAutocomplete: string;

workShiftAutocomplete: string;
attPolicyAutocomplete: string;
leavePolicyAutocomplete: string;
monthlyPGAutocomplete: string;
hourlyPGAutocomplete: string;
managerAutocomplete: string;



    manageEmployeeID: ID | null;
    empAutocomplete: string;
    empID: string;

    existingDepartmentID: ID | null;
    existingDesignationID: ID | null;
    existingMonthlyPayGradeID: ID | null;
    existingHourlyPayGradeID: ID | null;
    existingSalaryCtc: string;
    existingEmploymentType: string;
    effectiveFrom: string;
    effectiveTo: string;

    deptCurrAutocomplete: string;
    desgCurrAutocomplete: string;

    newDepartmentID: ID | null;
    newDesignationID: ID | null;
    newMonthlyPayGradeID: ID | null;
    newHourlyPayGradeID: ID | null;
    newSalaryCtc: string;
    newEmploymentType: string;

    deptNewAutocomplete: string;
    desgNewAutocomplete: string;

    proposedDepartmentID: ID | null;
    proposedDesignationID: ID | null;
    proposedMonthlyPayGradeID: ID | null;
    proposedHourlyPayGradeID: ID | null;
    proposedSalaryCtc: string;
    proposedEmploymentType: string;

    deptPropAutocomplete: string;
    desgPropAutocomplete: string;

    description: string;
    promotionDate: string;
    status: string;

    currentDeptIdDisplay: string;
    currentManagerIdDisplay: string;
    currentDesgIdDisplay: string;
    currentManagerNameDisplay: string;
    currentDeptNameDisplay: string;
    currentDesgNameDisplay: string;
    currentSalaryPayGradeTypeDisplay: string;
    currentEmploymentTypeDisplay: string;
    currentEmploymentStatusDisplay: string;

    promotion: PromotionForm;
  }>({
    serviceProviderID: null,
    companyID: null,
    branchesID: null,
    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",

    workShiftAutocomplete: "",
    attPolicyAutocomplete: "",
    leavePolicyAutocomplete: "",
    monthlyPGAutocomplete: "",
    hourlyPGAutocomplete: "",
    managerAutocomplete: "",


    manageEmployeeID: null,
    empAutocomplete: "",
    empID: "",

    existingDepartmentID: null,
    existingDesignationID: null,
    existingMonthlyPayGradeID: null,
    existingHourlyPayGradeID: null,
    existingSalaryCtc: "",
    existingEmploymentType: "",
    effectiveFrom: "",
    effectiveTo: "",

    deptCurrAutocomplete: "",
    desgCurrAutocomplete: "",

    newDepartmentID: null,
    newDesignationID: null,
    newMonthlyPayGradeID: null,
    newHourlyPayGradeID: null,
    newSalaryCtc: "",
    newEmploymentType: "",
    deptNewAutocomplete: "",
    desgNewAutocomplete: "",

    proposedDepartmentID: null,
    proposedDesignationID: null,
    proposedMonthlyPayGradeID: null,
    proposedHourlyPayGradeID: null,
    proposedSalaryCtc: "",
    proposedEmploymentType: "",
    deptPropAutocomplete: "",
    desgPropAutocomplete: "",

    description: "",
    promotionDate: "",
    status: "Not Applied",

    currentDeptIdDisplay: "",
    currentManagerIdDisplay: "",
    currentDesgIdDisplay: "",
    currentManagerNameDisplay: "",
    currentDeptNameDisplay: "",
    currentDesgNameDisplay: "",
    currentSalaryPayGradeTypeDisplay: "",
    currentEmploymentTypeDisplay: "",
    currentEmploymentStatusDisplay: "",
    
    

    promotion: {
      id: undefined,
      manageEmployeeID: null,
      departmentNameID: null,
      designationID: null,
      managerID: null,
      employmentType: "",
      employmentStatus: "",
      probationPeriod: "",
      workShiftID: null,
      attendancePolicyID: null,
      leavePolicyID: null,
      salaryPayGradeType: "",
      monthlyPayGradeID: null,
      hourlyPayGradeID: null,
    },
  });

  // New: row shape for GET /emp-promotion
interface EmpPromotionRow {
  id: ID;
  manageEmployeeID: ID | null;

  departmentNameID: ID | null;
  designationID: ID | null;
  managerID: ID | null;

  employmentType: string | null;   // e.g. "Contract"
  employmentStatus: string | null; // e.g. "Probation"
  probationPeriod: string | null;

  workShiftID: ID | null;
  attendancePolicyID: ID | null;
  leavePolicyID: ID | null;

  salaryPayGradeType: string | null; // "Hourly" | "Monthly" | null
  monthlyPayGradeID: ID | null;
  hourlyPayGradeID: ID | null;

  // nested names (as returned in your sample)
  departments?: { id: ID; departmentName?: string | null } | null;
  designations?: { id: ID; designantion?: string | null } | null;
  workShift?: any | null;
  attendancePolicy?: any | null;
  leavePolicy?: any | null;
  hourlyPayGrade?: any | null;
  monthlyPayGrade?: any | null;

  // nested employee for display
  manageEmployee?: {
    id: ID;
    employeeID?: string | null;
    employeeFirstName?: string | null;
    employeeLastName?: string | null;
    employeePhotoUrl?: string | null;
  } | null;
}


  /** ======= load list ======= */
const fetchRows = async () => {
  try {
    setLoading(true);
    const data = await fetchJSONSafe<EmpPromotionRow[]>(API.empPromotion); // ✅ correct type + endpoint
    setRows(Array.isArray(data) ? data : (data ?? []));
  } catch (e: any) {
    setError(e?.message || "Failed to load");
  } finally {
    setLoading(false);
  }
};
useEffect(() => { fetchRows(); }, []);


  /** ======= debounced suggestion runners (SP/CO/BR/EMP/DEPT/DESG) ======= */
  const debouncedFetch = <T,>(conf: {
    q: string;
    min?: number;
    timerRef: React.MutableRefObject<any>;
    abortRef: React.MutableRefObject<AbortController | null>;
    setLoading: (b: boolean) => void;
    setList: (v: T[]) => void;
    endpoint: string;
    proj?: (x: any) => T[];
    filter?: (x: T) => boolean;
  }) => {
    const { q, min = MIN_CHARS, timerRef, abortRef, setLoading, setList, endpoint, proj, filter } = conf;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (q.length < min) { setList([] as T[]); return; }
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const raw = await fetchJSONSafe<any[]>(endpoint, ctrl.signal);
        const arr = proj ? proj(raw) : (raw as T[]);
        const out = filter ? arr.filter(filter) : arr;
        setList(out.slice(0, 20));
      } catch (e) {
        if ((e as any)?.name !== "AbortError") console.error("fetch error", endpoint, e);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const runFetchSP = (q: string) =>
    debouncedFetch<SP>({
      q, timerRef: spTimerRef, abortRef: spAbortRef,
      setLoading: setSpLoading, setList: setSpList,
      endpoint: API.serviceProviders,
      proj: (raw) => raw as SP[],
      filter: (s) => (s.companyName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchCO = (q: string) =>
    debouncedFetch<CO>({
      q, timerRef: coTimerRef, abortRef: coAbortRef,
      setLoading: setCoLoading, setList: setCoList,
      endpoint: API.companies,
      proj: (raw) => raw as CO[],
      filter: (s) => (s.companyName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchBR = (q: string) =>
    debouncedFetch<BR>({
      q, timerRef: brTimerRef, abortRef: brAbortRef,
      setLoading: setBrLoading, setList: setBrList,
      endpoint: API.branches,
      proj: (raw) => raw as BR[],
      filter: (s) => (s.branchName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchEMP = (q: string) =>
    debouncedFetch<EmpRow>({
      q, timerRef: empTimerRef, abortRef: empAbortRef,
      setLoading: setEmpLoading, setList: setEmpList,
      endpoint: API.manageEmp,
      proj: (raw) => raw as EmpRow[],
      filter: (e) => {
        const name = `${e.employeeFirstName ?? ""} ${e.employeeLastName ?? ""}`.trim().toLowerCase();
        const eid = (e.employeeID ?? "").toLowerCase();
        const ql = q.toLowerCase();
        return name.includes(ql) || eid.includes(ql);
      },
    });



  const runFetchDeptNew = (q: string) =>
    debouncedFetch<Dept>({
      q, timerRef: deptNewTimerRef, abortRef: deptNewAbortRef,
      setLoading: setDeptNewLoading, setList: setDeptNewList,
      endpoint: API.departments,
      proj: (raw) => raw as Dept[],
      filter: (d) => (d.departmentName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchDesgNew = (q: string) =>
    debouncedFetch<Desg>({
      q, timerRef: desgNewTimerRef, abortRef: desgNewAbortRef,
      setLoading: setDesgNewLoading, setList: setDesgNewList,
      endpoint: API.designations,
      proj: (raw) => raw as Desg[],
      filter: (d) => (d.designantion ?? "").toLowerCase().includes(q.toLowerCase()),
    });

    const runFetchWorkShift = (q: string) =>
  debouncedFetch<any>({
    q, timerRef: workShiftTimerRef, abortRef: workShiftAbortRef,
    setLoading: setWorkShiftLoading, setList: setWorkShiftList,
    endpoint: API.workShifts,
    proj: (raw) => raw as any[],
    filter: (x) => (x.workShiftName ?? "").toLowerCase().includes(q.toLowerCase()),
  });


  const runFetchManager = (q: string) => {
  if (managerTimerRef.current) clearTimeout(managerTimerRef.current);
  managerTimerRef.current = setTimeout(async () => {
    if (!q || q.length < MIN_CHARS) { setManagerList([]); return; }
    managerAbortRef.current?.abort();
    const ctrl = new AbortController(); managerAbortRef.current = ctrl;
    setManagerLoading(true);
    try {
      // fetch all, filter client-side (adjust if you have a search API)
      const all = await fetchJSONSafe<any[]>(API.managers, ctrl.signal);
      const ql = q.toLowerCase();
      const filtered = (all || []).filter((m) => {
        const first = (m.employeeFirstName ?? "").toLowerCase();
        const last  = (m.employeeLastName ?? "").toLowerCase();
        const eid   = (m.employeeID ?? "").toLowerCase();
        return first.includes(ql) || last.includes(ql) || eid.includes(ql);
      });
      setManagerList(filtered.slice(0, 20));
    } catch {
      setManagerList([]);
    } finally {
      setManagerLoading(false);
    }
  }, DEBOUNCE_MS);
};


const runFetchAttPolicy = (q: string) =>
  debouncedFetch<any>({
    q, timerRef: attPolicyTimerRef, abortRef: attPolicyAbortRef,
    setLoading: setAttPolicyLoading, setList: setAttPolicyList,
    endpoint: API.attendancePolicies,
    proj: (raw) => raw as any[],
    filter: (x) => (x.policyName ?? "").toLowerCase().includes(q.toLowerCase()),
  });

const runFetchLeavePolicy = (q: string) =>
  debouncedFetch<any>({
    q, timerRef: leavePolicyTimerRef, abortRef: leavePolicyAbortRef,
    setLoading: setLeavePolicyLoading, setList: setLeavePolicyList,
    endpoint: API.leavePolicies,
    proj: (raw) => raw as any[],
    filter: (x) => (x.policyName ?? "").toLowerCase().includes(q.toLowerCase()),
  });

const runFetchMonthlyPG = (q: string) =>
  debouncedFetch<any>({
    q, timerRef: monthlyPGTimerRef, abortRef: monthlyPGAbortRef,
    setLoading: setMonthlyPGLoading, setList: setMonthlyPGList,
    endpoint: API.monthlyGrades,
    proj: (raw) => raw as any[],
    filter: (x) => (x.monthlyPayGradeName ?? "").toLowerCase().includes(q.toLowerCase()),
  });

const runFetchHourlyPG = (q: string) =>
  debouncedFetch<any>({
    q, timerRef: hourlyPGTimerRef, abortRef: hourlyPGAbortRef,
    setLoading: setHourlyPGLoading, setList: setHourlyPGList,
    endpoint: API.hourlyGrades,
    proj: (raw) => raw as any[],
    filter: (x) => (x.hourlyPayGradeName ?? "").toLowerCase().includes(q.toLowerCase()),
  });




  /** close popovers on outside click */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      [spRef, coRef, brRef, empRef, deptCurrRef, desgCurrRef, deptNewRef, desgNewRef, deptPropRef, desgPropRef].forEach((ref) => {
        if (ref.current && !ref.current.contains(t)) {
          if (ref === spRef) setSpList([]);
          if (ref === coRef) setCoList([]);
          if (ref === brRef) setBrList([]);
          if (ref === empRef) setEmpList([]);
          if (ref === deptCurrRef) setDeptCurrList([]);
          if (ref === desgCurrRef) setDesgCurrList([]);
          if (ref === deptNewRef) setDeptNewList([]);
          if (ref === desgNewRef) setDesgNewList([]);
          if (ref === deptPropRef) setDeptPropList([]);
          if (ref === desgPropRef) setDesgPropList([]);
          
          [workShiftRef, attPolicyRef, leavePolicyRef, monthlyPGRef, hourlyPGRef].forEach((ref) => {
  if (ref.current && !ref.current.contains(t)) {
    if (ref === workShiftRef) setWorkShiftList([]);
    if (ref === attPolicyRef) setAttPolicyList([]);
    if (ref === leavePolicyRef) setLeavePolicyList([]);
    if (ref === monthlyPGRef) setMonthlyPGList([]);
    if (ref === hourlyPGRef) setHourlyPGList([]);
    if (managerRef.current && !managerRef.current.contains(t)) setManagerList([]);

  }
});

        }
      });
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // cleanup timers/aborts
  useEffect(() => {
    return () => {
      [spTimerRef, coTimerRef, brTimerRef, empTimerRef, deptCurrTimerRef, desgCurrTimerRef, deptNewTimerRef, desgNewTimerRef, deptPropTimerRef, desgPropTimerRef].forEach(t => { if (t.current) clearTimeout(t.current); });
      [spAbortRef, coAbortRef, brAbortRef, empAbortRef, deptCurrAbortRef, desgCurrAbortRef, deptNewAbortRef, desgNewAbortRef, deptPropAbortRef, desgPropAbortRef].forEach(a => a.current?.abort());
      // in unmount cleanup
[ workShiftTimerRef, attPolicyTimerRef, leavePolicyTimerRef, monthlyPGTimerRef, hourlyPGTimerRef ]
  .forEach(t => { if (t.current) clearTimeout(t.current); });

[ workShiftAbortRef, attPolicyAbortRef, leavePolicyAbortRef, monthlyPGAbortRef, hourlyPGAbortRef ]
  .forEach(a => a.current?.abort());

    };
  }, []);


  const filteredRows = useMemo(() => {
  const t = searchTerm.trim().toLowerCase();
  if (!t) return rows;
  return rows.filter((r) => {
    const empName = `${r.manageEmployee?.employeeFirstName ?? ""} ${r.manageEmployee?.employeeLastName ?? ""}`.toLowerCase();
    const empId   = (r.manageEmployee?.employeeID ?? "").toLowerCase();
    const dept    = (r.departments?.departmentName ?? "").toLowerCase();
    const desg    = (r.designations?.designantion ?? "").toLowerCase();
    const etype   = (r.employmentType ?? "").toLowerCase();
    const estatus = (r.employmentStatus ?? "").toLowerCase();
    const ptype   = (r.salaryPayGradeType ?? "").toLowerCase();
    return [empName, empId, dept, desg, etype, estatus, ptype].some((x) => x.includes(t));
  });
}, [rows, searchTerm]);



  /** ======= when employee selected, prefill “Current Position Information” ======= */
  const prefillFromEmployee = async (emp: EmpRow) => {
    // 🔹 Take the latest promotion row (highest id)
    const latest =
      emp.empPromotion && emp.empPromotion.length
        ? [...emp.empPromotion].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))[0]
        : null;

    // Build full promotion object (include nulls)
    const promotionObj = latest
      ? {
        id: latest.id,
        manageEmployeeID: latest.manageEmployeeID ?? emp.id ?? null,
        departmentNameID: latest.departmentNameID ?? null,
        designationID: latest.designationID ?? null,
        managerID: latest.managerID ?? null,
        employmentType: latest.employmentType ?? "",
        employmentStatus: latest.employmentStatus ?? "",
        probationPeriod: latest.probationPeriod ?? "",
        workShiftID: latest.workShiftID ?? null,
        attendancePolicyID: latest.attendancePolicyID ?? null,
        leavePolicyID: latest.leavePolicyID ?? null,
        salaryPayGradeType: latest.salaryPayGradeType ?? "",
        monthlyPayGradeID: latest.monthlyPayGradeID ?? null,
        hourlyPayGradeID: latest.hourlyPayGradeID ?? null,
      }
      : {
        id: undefined,
        manageEmployeeID: emp.id ?? null,
        departmentNameID: null,
        designationID: null,
        managerID: null,
        employmentType: "",
        employmentStatus: "",
        probationPeriod: "",
        workShiftID: null,
        attendancePolicyID: null,
        leavePolicyID: null,
        salaryPayGradeType: "",
        monthlyPayGradeID: null,
        hourlyPayGradeID: null,
      };

    // Base identity + promotion object
    setFormData((p) => ({
      ...p,
      manageEmployeeID: emp.id,
      empAutocomplete: `${emp.employeeFirstName ?? ""} ${emp.employeeLastName ?? ""} - ${emp.employeeID ?? ""}`.trim(),
      empID: emp.employeeID ?? "",
      serviceProviderID: emp.serviceProviderID ?? p.serviceProviderID,
      companyID: emp.companyID ?? p.companyID,
      branchesID: emp.branchesID ?? p.branchesID,

      // Save full promotion object into formData
      promotion: promotionObj,

      // Displays (names resolved later)
      currentDeptIdDisplay: promotionObj.departmentNameID != null ? String(promotionObj.departmentNameID) : "",
      currentDesgIdDisplay: promotionObj.designationID != null ? String(promotionObj.designationID) : "",
      currentManagerIdDisplay: promotionObj.managerID != null ? String(promotionObj.managerID) : "",
      currentDeptNameDisplay: "",
      currentDesgNameDisplay: "",
      currentManagerNameDisplay: "",
      currentSalaryPayGradeTypeDisplay: promotionObj.salaryPayGradeType,
      currentEmploymentTypeDisplay: promotionObj.employmentType,
      currentEmploymentStatusDisplay: promotionObj.employmentStatus,
      currentProbationPeriodDisplay: promotionObj.probationPeriod,
    }));

    // 🔹 Resolve Dept / Desg / Manager names
    try {
      const [deptRes, desgRes, mgrEmp] = await Promise.all([
        promotionObj.departmentNameID
          ? fetchJSONSafe<any>(`${API.departments}/${promotionObj.departmentNameID}`)
          : Promise.resolve(null),
        promotionObj.designationID
          ? fetchJSONSafe<any>(`${API.designations}/${promotionObj.designationID}`)
          : Promise.resolve(null),
        promotionObj.managerID
          ? fetchJSONSafe<any>(`${API.manageEmp}/${promotionObj.managerID}`)
          : Promise.resolve(null),
      ]);

      const mgrName =
        mgrEmp
          ? `${mgrEmp.employeeFirstName ?? ""} ${mgrEmp.employeeLastName ?? ""}`.trim()
          : "";

      setFormData((p) => ({
        ...p,
        currentDeptNameDisplay: deptRes?.departmentName?.trim() || p.currentDeptNameDisplay,
        currentDesgNameDisplay: desgRes?.designantion?.trim() || p.currentDesgNameDisplay,
        currentManagerNameDisplay: mgrName || p.currentManagerNameDisplay,

        deptCurrAutocomplete: deptRes?.departmentName?.trim() || p.deptCurrAutocomplete,
        desgCurrAutocomplete: desgRes?.designantion?.trim() || p.desgCurrAutocomplete,
      }));
    } catch (e) {
      console.warn("Could not resolve dept/desg/manager:", e);
    }

    // 🔹 Still try latest emp-current-position for salary/effective dates
    try {
      const curr = await fetchJSONSafe<CurrentPos[]>(
        `${API.empCurrent}?manageEmployeeID=${emp.id}&take=1&skip=0`
      );
      const current = curr?.[0];
      if (current) {
        setFormData((p) => ({
          ...p,
          existingMonthlyPayGradeID: current.existingMonthlyPayGradeID ?? null,
          existingHourlyPayGradeID: current.existingHourlyPayGradeID ?? null,
          existingSalaryCtc:
            current.existingSalaryCtc != null ? String(current.existingSalaryCtc) : p.existingSalaryCtc,
          existingEmploymentType:
            current.existingEmploymentType != null ? String(current.existingEmploymentType) : p.existingEmploymentType,
          effectiveFrom: current.effectiveFrom ?? p.effectiveFrom,
          effectiveTo: current.effectiveTo ?? p.effectiveTo,
        }));
      }
    } catch (e) {
      console.warn("Could not prefill current position:", e);
    }
  };


  /** ======= CRUD submit (create/update both tables) ======= */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    /** ─────────────────────────────────────────────
     *  1) Upsert CURRENT (EmpCurrentPosition)
     *  - Keep your original mapping,
     *  - Send strings as strings (no Number(...) on employment type),
     *  - Only send defined fields.
     *  ────────────────────────────────────────────*/
    const curPayload: any = {
      serviceProviderID: formData.serviceProviderID ?? undefined,
      companyID: formData.companyID ?? undefined,
      branchesID: formData.branchesID ?? undefined,
      manageEmployeeID: formData.manageEmployeeID ?? undefined,

      existingDepartmentID: formData.existingDepartmentID ?? undefined,
      existingDesignationID: formData.existingDesignationID ?? undefined,
      existingMonthlyPayGradeID: formData.existingMonthlyPayGradeID ?? undefined,
      existingHourlyPayGradeID: formData.existingHourlyPayGradeID ?? undefined,

      // If your API expects number for CTC, keep Number(...); otherwise remove this cast.
      existingSalaryCtc:
        formData.existingSalaryCtc !== "" && formData.existingSalaryCtc != null
          ? Number(formData.existingSalaryCtc)
          : undefined,

      // IMPORTANT: send as string (e.g., "Company" / "Contract") if that's what your API expects
      existingEmploymentType:
        formData.existingEmploymentType && String(formData.existingEmploymentType).trim() !== ""
          ? String(formData.existingEmploymentType)
          : undefined,

      effectiveFrom: formData.effectiveFrom || undefined,
      effectiveTo: formData.effectiveTo || undefined,
    };

    if (editingRow?.current?.id) {
      const res = await fetch(`${API.empCurrent}/${editingRow.current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(curPayload),
      });
      if (!res.ok) throw new Error(await res.text());
    } else {
      const res = await fetch(API.empCurrent, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(curPayload),
      });
      if (!res.ok) throw new Error(await res.text());
    }

  
    const promotionType = formData.promotion.salaryPayGradeType || null;

    const resolvedDepartmentID =
      formData.promotion.departmentNameID ??
      formData.newDepartmentID ??
      formData.proposedDepartmentID ??
      null;

    const resolvedDesignationID =
      formData.promotion.designationID ??
      formData.newDesignationID ??
      formData.proposedDesignationID ??
      null;

    const resolvedMonthlyPG =
      promotionType === "Monthly"
        ? (formData.promotion.monthlyPayGradeID ??
           formData.newMonthlyPayGradeID ??
           formData.proposedMonthlyPayGradeID ??
           null)
        : null;

    const resolvedHourlyPG =
      promotionType === "Hourly"
        ? (formData.promotion.hourlyPayGradeID ??
           formData.newHourlyPayGradeID ??
           formData.proposedHourlyPayGradeID ??
           null)
        : null;

    const empPromoPayload = {
      manageEmployeeID: formData.manageEmployeeID!, // required

      departmentNameID: resolvedDepartmentID,
      designationID:   resolvedDesignationID,
      managerID:       formData.promotion.managerID ?? null,

      employmentType:   formData.promotion.employmentType   || null,   // "Company" | "Contract"
      employmentStatus: formData.promotion.employmentStatus || null,   // "Permanent" | "Probation"
      probationPeriod:  formData.promotion.probationPeriod  || null,

      workShiftID:        formData.promotion.workShiftID        ?? null,
      attendancePolicyID: formData.promotion.attendancePolicyID ?? null,
      leavePolicyID:      formData.promotion.leavePolicyID      ?? null,

      salaryPayGradeType: promotionType, // "Monthly" | "Hourly" | null
      monthlyPayGradeID:  resolvedMonthlyPG,
      hourlyPayGradeID:   resolvedHourlyPG,
    };

    if (formData.promotion.id) {
      // update existing EmpPromotion row
      const res = await fetch(`${API.empPromotion}/${formData.promotion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empPromoPayload),
      });
      if (!res.ok) throw new Error(await res.text());
    } else {
      // create new EmpPromotion row
      const res = await fetch(API.empPromotion, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empPromoPayload),
      });
      if (!res.ok) throw new Error(await res.text());

      // Optional: capture created id so future saves PATCH instead of POST
      // const created = await res.json();
      // setFormData(p => ({ ...p, promotion: { ...p.promotion, id: created?.id } }));
    }

    await fetchRows();
    resetForm();
    setIsDialogOpen(false);
  } catch (e: any) {
    setError(e?.message || "Save failed");
  } finally {
    setSaving(false);
  }
};


 
const handleEdit = async (row: EmpPromotionRow) => {
  // Keep your existing "current" + "manage-emp" prefill logic
  let current: CurrentPos | null = null;
  if (row.manageEmployeeID) {
    try {
      const list = await fetchJSONSafe<CurrentPos[]>(
        `${API.empCurrent}?manageEmployeeID=${row.manageEmployeeID}&take=1&skip=0`
      );
      current = list?.[0] ?? null;
    } catch {}
  }

  setEditingRow({ current, promo: row });

  // Reuse prefillFromEmployee to hydrate names + current values
  if (row.manageEmployeeID) {
    const emp = await fetchJSONSafe<EmpRow>(`${API.manageEmp}/${row.manageEmployeeID}`);
    await prefillFromEmployee(emp);
  }

  // Seed the form’s "promotion" block from this row
  setFormData((p) => ({
    ...p,
    manageEmployeeID: row.manageEmployeeID ?? null,
    empAutocomplete: [
      row.manageEmployee?.employeeFirstName ?? "",
      row.manageEmployee?.employeeLastName ?? "",
      row.manageEmployee?.employeeID ? `- ${row.manageEmployee?.employeeID}` : ""
    ].join(" ").replace(/\s+/g, " ").trim(),
    promotion: {
      id: row.id,
      manageEmployeeID: row.manageEmployeeID ?? null,
      departmentNameID: row.departmentNameID ?? null,
      designationID: row.designationID ?? null,
      managerID: row.managerID ?? null,
      employmentType: row.employmentType ?? "",
      employmentStatus: row.employmentStatus ?? "",
      probationPeriod: row.probationPeriod ?? "",
      workShiftID: row.workShiftID ?? null,
      attendancePolicyID: row.attendancePolicyID ?? null,
      leavePolicyID: row.leavePolicyID ?? null,
      salaryPayGradeType: row.salaryPayGradeType ?? "",
      monthlyPayGradeID: row.monthlyPayGradeID ?? null,
      hourlyPayGradeID: row.hourlyPayGradeID ?? null,
    },
    // instant display names
    currentDeptNameDisplay: row.departments?.departmentName ?? p.currentDeptNameDisplay,
    currentDesgNameDisplay: row.designations?.designantion ?? p.currentDesgNameDisplay,
  }));

  setIsDialogOpen(true);
};



  // was: const handleView = (promo: PromotionReq) => {
const handleView = (promo: EmpPromotionRow) => {
  setViewRow(promo as any); // if your view modal expects old shape, read from nested fields defensively
  setIsViewOpen(true);
};


 // was: const handleDelete = async (id: ID) => { fetch(`${API.promotionReq}/${id}`, ... }
const handleDelete = async (id: ID) => {
  if (!confirm("Delete this promotion?")) return;
  const res = await fetch(`${API.empPromotion}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  await fetchRows();
};


  /** ======= Reset ======= */
  const resetForm = () => {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchesID: null,
      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",

      manageEmployeeID: null,
      empAutocomplete: "",
      empID: "",

      existingDepartmentID: null,
      existingDesignationID: null,
      existingMonthlyPayGradeID: null,
      existingHourlyPayGradeID: null,
      existingSalaryCtc: "",
      existingEmploymentType: "",
      effectiveFrom: "",
      effectiveTo: "",

      deptCurrAutocomplete: "",
      desgCurrAutocomplete: "",

      newDepartmentID: null,
      newDesignationID: null,
      newMonthlyPayGradeID: null,
      newHourlyPayGradeID: null,
      newSalaryCtc: "",
      newEmploymentType: "",
      deptNewAutocomplete: "",
      desgNewAutocomplete: "",

      workShiftAutocomplete: "",
attPolicyAutocomplete: "",
leavePolicyAutocomplete: "",
monthlyPGAutocomplete: "",
hourlyPGAutocomplete: "",
managerAutocomplete: "",


      proposedDepartmentID: null,
      proposedDesignationID: null,
      proposedMonthlyPayGradeID: null,
      proposedHourlyPayGradeID: null,
      proposedSalaryCtc: "",
      proposedEmploymentType: "",
      deptPropAutocomplete: "",
      desgPropAutocomplete: "",

      description: "",
      promotionDate: "",
      status: "Not Applied",

      // READ-ONLY current position (from /manage-emp)
      currentDeptIdDisplay: "",
      currentManagerIdDisplay: "",
      currentDesgIdDisplay: "",
      currentManagerNameDisplay: "",
      currentDeptNameDisplay: "",
      currentDesgNameDisplay: "",
      currentSalaryPayGradeTypeDisplay: "",
      currentEmploymentTypeDisplay: "",
      currentEmploymentStatusDisplay: "",
      promotion: {
        id: undefined, manageEmployeeID: null, departmentNameID: null, designationID: null, managerID: null,
        employmentType: "", employmentStatus: "", probationPeriod: "", workShiftID: null, attendancePolicyID: null,
        leavePolicyID: null, salaryPayGradeType: "", monthlyPayGradeID: null, hourlyPayGradeID: null,
      },

    });
    setEditingRow(null);
    setError(null);
    setSpList([]); setCoList([]); setBrList([]); setEmpList([]);
    setDeptCurrList([]); setDesgCurrList([]); setDeptNewList([]); setDesgNewList([]); setDeptPropList([]); setDesgPropList([]);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Employees Promotions</h1>
          <p className="text-gray-600 mt-1 text-sm">Create, read, update, and delete promotion requests & current positions</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Promotion
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[980px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRow ? "Edit Promotion / Current Position" : "Add New Promotion"}</DialogTitle>
              <DialogDescription>
                {editingRow ? "Update both 'Current Position' and 'Promotion Request' below." : "Fill in details below to create both records."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SP / Company / Branch (autocomplete) */}
              <div className="grid grid-cols-3 gap-4">
                {/* SP */}
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
                      {spList.map((s) => (
                        <div
                          key={s.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({ ...p, serviceProviderID: s.id, spAutocomplete: s.companyName ?? "" }));
                            setSpList([]);
                          }}
                        >
                          {s.companyName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Company */}
                <div ref={coRef} className="space-y-2 relative">
                  <Label>Company *</Label>
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
                      {coList.map((c) => (
                        <div
                          key={c.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({ ...p, companyID: c.id, coAutocomplete: c.companyName ?? "" }));
                            setCoList([]);
                          }}
                        >
                          {c.companyName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Branch */}
                <div ref={brRef} className="space-y-2 relative">
                  <Label>Branch *</Label>
                  <Input
                    value={formData.brAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({ ...p, brAutocomplete: val, branchesID: null }));
                      runFetchBR(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchBR(val);
                    }}
                    placeholder="Start typing branch…"
                    autoComplete="off"
                    required
                  />
                  {brList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {brLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {brList.map((b) => (
                        <div
                          key={b.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({ ...p, branchesID: b.id, brAutocomplete: b.branchName ?? "" }));
                            setBrList([]);
                          }}
                        >
                          {b.branchName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Employee selection (autocomplete) */}
              <div className="grid grid-cols-2 gap-4">
                <div ref={empRef} className="space-y-2 relative">
                  <Label>Employee *</Label>
                  <Input
                    value={formData.empAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({ ...p, empAutocomplete: val, manageEmployeeID: null, empID: "" }));
                      runFetchEMP(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchEMP(val);
                    }}
                    placeholder="Type name or employee ID…"
                    autoComplete="off"
                    required
                  />
                  {empList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-56 overflow-y-auto">
                      {empLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {empList.map((m) => {
                        const label = `${m.employeeFirstName ?? ""} ${m.employeeLastName ?? ""}`.trim();
                        const eid = m.employeeID ?? "";
                        return (
                          <div
                            key={m.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              prefillFromEmployee(m);
                              setEmpList([]);
                            }}
                          >
                            {label} {eid ? `- ${eid}` : ""}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={formData.empID} readOnly className="bg-gray-50" />
                </div>
              </div>

              {/* CURRENT POSITION (EmpCurrentPosition) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Position Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current Department </Label>
                    <Input
                      value={formData.currentDeptNameDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Current Designation</Label>
                    <Input
                      value={formData.currentDesgNameDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Manager</Label>
                    <Input
                      value={formData.currentManagerNameDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>



                  <div className="space-y-2">
                    <Label>Current Paygrade</Label>
                    <Input
                      value={formData.currentSalaryPayGradeTypeDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Input
                      value={formData.currentEmploymentTypeDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Employment Status</Label>
                    <Input
                      value={formData.currentEmploymentStatusDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Probation Period</Label>
                    <Input
                      value={formData.promotion.probationPeriod || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, probationPeriod: e.target.value },
                        }))
                      }
                      placeholder="e.g. 6 months"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Work Shift</Label>
                    <Input
                      value={formData.promotion.workShiftID ?? ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, workShiftID: Number(e.target.value) || null },
                        }))
                      }
                      placeholder="Enter Work Shift ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attendance Policy</Label>
                    <Input
                      value={formData.promotion.attendancePolicyID ?? ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, attendancePolicyID: Number(e.target.value) || null },
                        }))
                      }
                      placeholder="Enter Attendance Policy ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Leave Policy</Label>
                    <Input
                      value={formData.promotion.leavePolicyID ?? ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, leavePolicyID: Number(e.target.value) || null },
                        }))
                      }
                      placeholder="Enter Leave Policy ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Current Salary (CTC)</Label>
                    <Input
                      value={formData.existingSalaryCtc}
                      onChange={(e) => setFormData((p) => ({ ...p, existingSalaryCtc: e.target.value }))}
                      placeholder=""
                    />
                  </div>
                </div>

              </div>

              {/* PROMOTION REQUEST (new/proposed) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Promotion Request</h3>

                {/* NEW (current target) */}
                <div className="grid grid-cols-3 gap-4">
                  {/* dept new */}
                {/* Promoted Department */}
<div ref={deptNewRef} className="space-y-2 relative">
  <Label>Promoted Department</Label>
  <Input
    value={formData.deptNewAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        deptNewAutocomplete: val,
        // ⬇️ IMPORTANT: clear the promotion field while typing
        promotion: { ...p.promotion, departmentNameID: null },
      }));
      runFetchDeptNew(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchDeptNew(val);
    }}
    placeholder="Type department…"
    autoComplete="off"
  />
  {deptNewList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {deptNewLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {deptNewList.map((d) => (
        <div
          key={d.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              deptNewAutocomplete: d.departmentName ?? "",
              // ⬇️ IMPORTANT: write to promotion
              promotion: { ...p.promotion, departmentNameID: d.id },
            }));
            setDeptNewList([]);
          }}
        >
          {d.departmentName}
        </div>
      ))}
    </div>
  )}
</div>


                  {/* desg new */}
                 {/* Promoted Designation */}
<div ref={desgNewRef} className="space-y-2 relative">
  <Label>Promoted Designation</Label>
  <Input
    value={formData.desgNewAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        desgNewAutocomplete: val,
        // ⬇️ IMPORTANT: clear the promotion field while typing
        promotion: { ...p.promotion, designationID: null },
      }));
      runFetchDesgNew(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchDesgNew(val);
    }}
    placeholder="Type designation…"
    autoComplete="off"
  />
  {desgNewList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {desgNewLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {desgNewList.map((d) => (
        <div
          key={d.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              desgNewAutocomplete: d.designantion ?? "",
              // ⬇️ IMPORTANT: write to promotion
              promotion: { ...p.promotion, designationID: d.id },
            }));
            setDesgNewList([]);
          }}
        >
          {d.designantion}
        </div>
      ))}
    </div>
  )}
</div>


               
                  {/* Promoted Manager */}
<div ref={managerRef} className="space-y-2 relative">
  <Label>Promoted Manager</Label>
  <Input
    value={formData.managerAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        managerAutocomplete: val,
        promotion: { ...p.promotion, managerID: null }, // clear while typing
      }));
      runFetchManager(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchManager(val);
    }}
    placeholder="Type manager name or employee ID…"
    autoComplete="off"
  />
  {managerList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {managerLoading && (
        <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
      )}
      {managerList.map((m) => {
        const full = `${m.employeeFirstName ?? ""} ${m.employeeLastName ?? ""}`.trim();
        return (
          <div
            key={m.id}
            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setFormData((p) => ({
                ...p,
                managerAutocomplete: full || (m.employeeID ?? String(m.id)),
                promotion: { ...p.promotion, managerID: m.id },
              }));
              setManagerList([]);
            }}
          >
            <div className="text-sm">{full || "—"}</div>
            <div className="text-xs text-gray-500">{m.employeeID ?? ""}</div>
          </div>
        );
      })}
    </div>
  )}
</div>




                 {/* Promoted Paygrade Type */}
<div className="space-y-2">
  <Label>Promoted Paygrade</Label>
  <Select
    value={formData.promotion.salaryPayGradeType || ""}
    onValueChange={(val) =>
      setFormData((p) => ({
        ...p,
        // keep a display copy if you still use it elsewhere
        currentSalaryPayGradeTypeDisplay: val,

        // update promotion and clear the opposite side to avoid stale IDs
        promotion: {
          ...p.promotion,
          salaryPayGradeType: val,
          monthlyPayGradeID: val === "Monthly" ? p.promotion.monthlyPayGradeID : null,
          hourlyPayGradeID:  val === "Hourly"  ? p.promotion.hourlyPayGradeID  : null,
        },

        // clear the opposite autocomplete label as well
        monthlyPGAutocomplete: val === "Monthly" ? p.monthlyPGAutocomplete : "",
        hourlyPGAutocomplete:  val === "Hourly"  ? p.hourlyPGAutocomplete  : "",
      }))
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select paygrade type…" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Monthly">Monthly</SelectItem>
      <SelectItem value="Hourly">Hourly</SelectItem>
    </SelectContent>
  </Select>
</div>



                  {/* Promoted Employment Type (Company / Contract) */}
<div className="space-y-2">
  <Label>Employment Type</Label>
  <Select
    value={formData.promotion.employmentType || ""}
    onValueChange={(val) =>
      setFormData((p) => ({
        ...p,
        // keep the "current" display untouched; only set the proposed/promotion value
        promotion: { ...p.promotion, employmentType: val },
      }))
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select employment type…" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Company">Company</SelectItem>
      <SelectItem value="Contract">Contract</SelectItem>
    </SelectContent>
  </Select>
</div>


                 {/* Promoted Employment Status */}
<div className="space-y-2">
  <Label>Employment Status</Label>
  <Select
    value={formData.promotion.employmentStatus || ""}
    onValueChange={(val) =>
      setFormData((p) => ({
        ...p,
        promotion: { ...p.promotion, employmentStatus: val },
      }))
    }
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select employment status…" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Permanent">Permanent</SelectItem>
      <SelectItem value="Probation">Probation</SelectItem>
    </SelectContent>
  </Select>
</div>



                  <div className="space-y-2">
                    <Label>Probation Period</Label>
                    <Input
                      value={formData.promotion.probationPeriod || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, probationPeriod: e.target.value },
                        }))
                      }
                      placeholder="e.g. 6 months"
                    />
                  </div>

               <div ref={workShiftRef} className="space-y-2 relative">
  <Label>Work Shift</Label>
  <Input
    value={formData.workShiftAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        workShiftAutocomplete: val,
        promotion: { ...p.promotion, workShiftID: null },
      }));
      runFetchWorkShift(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchWorkShift(val);
    }}
    placeholder="Type work shift…"
    autoComplete="off"
  />
  {workShiftList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {workShiftLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {workShiftList.map((ws) => (
        <div
          key={ws.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              workShiftAutocomplete: ws.workShiftName ?? String(ws.id),
              promotion: { ...p.promotion, workShiftID: ws.id },
            }));
            setWorkShiftList([]);
          }}
        >
          {ws.workShiftName}
        </div>
      ))}
    </div>
  )}
</div>


                <div ref={attPolicyRef} className="space-y-2 relative">
  <Label>Attendance Policy</Label>
  <Input
    value={formData.attPolicyAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        attPolicyAutocomplete: val,
        promotion: { ...p.promotion, attendancePolicyID: null },
      }));
      runFetchAttPolicy(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchAttPolicy(val);
    }}
    placeholder="Type attendance policy…"
    autoComplete="off"
  />
  {attPolicyList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {attPolicyLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {attPolicyList.map((ap) => (
        <div
          key={ap.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              attPolicyAutocomplete: ap.policyName ?? String(ap.id),
              promotion: { ...p.promotion, attendancePolicyID: ap.id },
            }));
            setAttPolicyList([]);
          }}
        >
          {ap.policyName}
        </div>
      ))}
    </div>
  )}
</div>

                <div ref={leavePolicyRef} className="space-y-2 relative">
  <Label>Leave Policy</Label>
  <Input
    value={formData.leavePolicyAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        leavePolicyAutocomplete: val,
        promotion: { ...p.promotion, leavePolicyID: null },
      }));
      runFetchLeavePolicy(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchLeavePolicy(val);
    }}
    placeholder="Type leave policy…"
    autoComplete="off"
  />
  {leavePolicyList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {leavePolicyLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {leavePolicyList.map((lp) => (
        <div
          key={lp.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              leavePolicyAutocomplete: lp.policyName ?? String(lp.id),
              promotion: { ...p.promotion, leavePolicyID: lp.id },
            }));
            setLeavePolicyList([]);
          }}
        >
          {lp.policyName}
        </div>
      ))}
    </div>
  )}
</div>


{formData.promotion.salaryPayGradeType === "Monthly" && /* Monthly block here */

<div ref={monthlyPGRef} className="space-y-2 relative">
  <Label>Monthly Pay Grade</Label>
  <Input
    value={formData.monthlyPGAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        monthlyPGAutocomplete: val,
        promotion: { ...p.promotion, monthlyPayGradeID: null },
      }));
      runFetchMonthlyPG(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchMonthlyPG(val);
    }}
    placeholder="Type monthly pay grade…"
    autoComplete="off"
  />
  {monthlyPGList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {monthlyPGLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {monthlyPGList.map((pg) => (
        <div
          key={pg.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              monthlyPGAutocomplete: pg.monthlyPayGradeName ?? String(pg.id),
              promotion: { ...p.promotion, monthlyPayGradeID: pg.id },
            }));
            setMonthlyPGList([]);
          }}
        >
          {pg.monthlyPayGradeName}
        </div>
      ))}
    </div>
  )}
</div>
}

{formData.promotion.salaryPayGradeType === "Hourly" && /* Hourly block here */

<div ref={hourlyPGRef} className="space-y-2 relative">
  <Label>Hourly Pay Grade</Label>
  <Input
    value={formData.hourlyPGAutocomplete}
    onChange={(e) => {
      const val = e.target.value;
      setFormData((p) => ({
        ...p,
        hourlyPGAutocomplete: val,
        promotion: { ...p.promotion, hourlyPayGradeID: null },
      }));
      runFetchHourlyPG(val);
    }}
    onFocus={(e) => {
      const val = e.target.value;
      if (val.length >= MIN_CHARS) runFetchHourlyPG(val);
    }}
    placeholder="Type hourly pay grade…"
    autoComplete="off"
  />
  {hourlyPGList.length > 0 && (
    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
      {hourlyPGLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
      {hourlyPGList.map((pg) => (
        <div
          key={pg.id}
          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setFormData((p) => ({
              ...p,
              hourlyPGAutocomplete: pg.hourlyPayGradeName ?? String(pg.id),
              promotion: { ...p.promotion, hourlyPayGradeID: pg.id },
            }));
            setHourlyPGList([]);
          }}
        >
          {pg.hourlyPayGradeName}
        </div>
      ))}
    </div>
  )}
</div>
}




                    <div className="space-y-2">
                    <Label>Promoted Salary</Label>
                    <Input
                      value={formData.newSalaryCtc}
                      onChange={(e) => setFormData((p) => ({ ...p, newSalaryCtc: e.target.value }))}
                      placeholder="e.g. 600000"
                    />
                  </div>


                </div>

              

                {/* Description / date / status */}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    placeholder="Reason / details of promotion"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Promotion Date</Label>
                    <Input
                      type="date"
                      value={formData.promotionDate}
                      onChange={(e) => setFormData((p) => ({ ...p, promotionDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Not Applied">Not Applied</option>
                      <option value="Applied">Applied</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? "Saving..." : editingRow ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promotion Request</DialogTitle>
            <DialogDescription>Read-only details</DialogDescription>
          </DialogHeader>
          {viewRow && (
            <div className="space-y-3 text-sm">
              <p><strong>Employee ID:</strong> {viewRow.empID ?? "—"}</p>
              <p><strong>Status:</strong> {viewRow.status ?? "—"}</p>
              <p><strong>New Dept/Desg:</strong> {String(viewRow.newDepartmentID ?? "—")} / {String(viewRow.newDesignationID ?? "—")}</p>
              <p><strong>Proposed Dept/Desg:</strong> {String(viewRow.proposedDepartmentID ?? "—")} / {String(viewRow.proposedDesignationID ?? "—")}</p>
              <p><strong>Promotion Date:</strong> {viewRow.promotionDate ?? "—"}</p>
              <p><strong>Description:</strong> {viewRow.description ?? "—"}</p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search promotion requests…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredRows.length} items
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trending-up" className="w-5 h-5" />
            Promotion Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead className="w-[120px]">New Dept</TableHead>
                  <TableHead className="w-[120px]">New Desg</TableHead>
                  <TableHead className="w-[120px]">Proposed Dept</TableHead>
                  <TableHead className="w-[120px]">Proposed Desg</TableHead>
                  <TableHead className="w-[120px]">Promotion Date</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
        <TableBody>
  {filteredRows.length === 0 && !loading && (
    <TableRow>
      {/* 8 columns in header => colSpan=8 */}
      <TableCell colSpan={8} className="text-center text-sm text-gray-500">
        No records
      </TableCell>
    </TableRow>
  )}

  {filteredRows.map((r) => {
    const empId   = r.manageEmployee?.employeeID ?? "—";
    const empName = `${r.manageEmployee?.employeeFirstName ?? ""} ${r.manageEmployee?.employeeLastName ?? ""}`.trim();

    const newDept = r.departments?.departmentName?.trim() ?? "—";
    const newDesg = r.designations?.designantion?.trim() ?? "—";

    // Proposed fields don't exist in /emp-promotion; show placeholders
    const proposedDept = "—";
    const proposedDesg = "—";

    // /emp-promotion has no official date; try promotionDate if present, else createdAt, else —
    const promoDate =
      (r as any)?.promotionDate
        ? new Date((r as any).promotionDate).toLocaleDateString()
        : (r as any)?.createdAt
          ? new Date((r as any).createdAt).toLocaleDateString()
          : "—";

    return (
      <TableRow key={r.id}>
        {/* Status */}
        <TableCell className="whitespace-nowrap">
          {r.employmentStatus ?? "—"}
        </TableCell>

        {/* Employee ID */}
        <TableCell className="whitespace-nowrap">
          <div className="font-medium">{empId}</div>
          <div className="text-xs text-gray-500">{empName || "\u00A0"}</div>
        </TableCell>

        {/* New Dept */}
        <TableCell className="whitespace-nowrap">{newDept}</TableCell>

        {/* New Desg */}
        <TableCell className="whitespace-nowrap">{newDesg}</TableCell>

        {/* Proposed Dept (placeholder) */}
        <TableCell className="whitespace-nowrap">{proposedDept}</TableCell>

        {/* Proposed Desg (placeholder) */}
        <TableCell className="whitespace-nowrap">{proposedDesg}</TableCell>

        {/* Promotion Date */}
        <TableCell className="whitespace-nowrap">{promoDate}</TableCell>

        {/* Actions */}
        <TableCell className="text-right space-x-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(r)} title="View">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>


            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
