"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";


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
import { Plus, Search, Edit, Trash2, Eye, X } from "lucide-react";

/* =========================
   Types aligned to backend
   ========================= */
type ID = number;

interface SP { id: ID; companyName?: string | null; }
interface CO { id: ID; companyName?: string | null; }
interface BR { id: ID; branchName?: string | null; }
interface Device { id: ID; deviceName?: string | null; }
interface MonthlyPG { id: ID; monthlyPayGradeName?: string | null; }
interface HourlyPG { id: ID; hourlyPayGradeName?: string | null; }


type PromotionForm = {
  id?: number;
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


interface EduRead {
  id: ID;
  instituteType?: string | null;
  instituteName?: string | null;
  degree?: string | null;
  pasingYear?: string | null;
  marks?: string | null;
  gpaCgpa?: string | null;
  class?: string | null;
}
interface ExpRead {
  id: ID;
  orgName?: string | null;
  designation?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  responsibility?: string | null;
  skill?: string | null;
}
interface DevMapRead {
  id: ID;
  manageEmployeeID?: number | null;
  deviceID?: number | null;
  deviceEmpCode?: string | null;
  device?: { id: ID; deviceName?: string | null } | null;
}

interface ManageEmpRead {
  id: ID;
  // FKs
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;
  contractorID?: ID | null;

  // Scalars
  employeeFirstName?: string | null;
  employeeLastName?: string | null;
  deviceEmpCode?: string | null;
  employeeID?: string | null;
  joiningDate?: string | null;

  // Basic position fields (now stored directly on ManageEmployee)
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

  businessPhoneNo?: string | null;
  businessEmail?: string | null;
  personalPhoneNo?: string | null;
  personalEmail?: string | null;
  emergancyContact?: string | null;
  presentAddress?: string | null;
  permenantAddress?: string | null;
  employeePhotoUrl?: string | null;

  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  maritalStatus?: string | null;
  employeeFatherName?: string | null;
  employeeMotherName?: string | null;
  employeeSpouseName?: string | null;

  // Relations for display
  serviceProvider?: { id: ID; companyName?: string | null } | null;
  contractor?: { id: ID; contractorName?: string | null } | null;
  company?: { id: ID; companyName?: string | null } | null;
  branches?: { id: ID; branchName?: string | null } | null;
  
  // Basic position relations
  departments?: { id: ID; departmentName?: string | null } | null;
  designations?: { id: ID; desgination?: string | null } | null;
  manager?: { id: ID; employeeFirstName?: string | null; employeeLastName?: string | null } | null;
  workShift?: { id: ID; workShiftName?: string | null } | null;
  attendancePolicy?: { id: ID; attendancePolicyName?: string | null } | null;
  leavePolicy?: { id: ID; leavePolicyName?: string | null } | null;
  monthlyPayGrade?: { id: ID; monthlyPayGradeName?: string | null } | null;
  hourlyPayGrade?: { id: ID; hourlyPayGradeName?: string | null } | null;

  // Nested arrays
  empEduQualification?: EduRead[];
  empProfExprience?: ExpRead[];
  empDeviceMapping?: DevMapRead[];

  createdAt?: string | null;

  // Optional denormalized:
  serviceProviderName?: string | null;
  contractorName?: string | null;
  companyName?: string | null;
  branchName?: string | null;
}

/* =========================
   Config & helpers
   ========================= */
const API = {
  manageEmp: "http://192.168.29.225:8000/manage-emp",
  serviceProviders: "http://192.168.29.225:8000/service-provider",
  companies: "http://192.168.29.225:8000/company",
  branches: "http://192.168.29.225:8000/branches",
  upload: "http://192.168.29.225:8000/files/upload",

  // NEW:
  departments: "http://192.168.29.225:8000/departments",
  designations: "http://192.168.29.225:8000/designations",
  employees: "http://192.168.29.225:8000/manage-emp",
  contractors: "http://192.168.29.225:8000/contractors",
  workShifts: "http://192.168.29.225:8000/work-shift",
  attendancePolicies: "http://192.168.29.225:8000/attendance-policy",
  leavePolicies: "http://192.168.29.225:8000/leave-policy",
  devices: "http://192.168.29.225:8000/devices",
  monthlyGrades: "http://192.168.29.225:8000/monthly-pay-grade",
  hourlyGrades: "http://192.168.29.225:8000/hourly-grade",

};

const MIN_CHARS = 1;
const DEBOUNCE_MS = 250;

async function fetchJSONSafe<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    // include the URL so you can see exactly which endpoint failed
    throw new Error(`${res.status} ${res.statusText} @ ${url}`);
  }
  const raw = await res.json();
  return (raw?.data ?? raw) as T;
}


async function fetchFirstById<T extends { id: number }>(url: string, id?: number | null) {
  if (!id) return null;
  try {
    const list = await fetchJSONSafe<T[]>(url);
    return (list || []).find((x) => x.id === id) ?? null;
  } catch {
    return null;
  }
}

async function resolveLabelsForEdit(
  r: ManageEmpRead,
  setFormData: React.Dispatch<React.SetStateAction<any>>
) {
  // Prefer explicit IDs; fall back to related object IDs if present
  const contractorId = (r as any)?.contractorID ?? (r as any)?.contractor?.id ?? null;
  // run all lookups but don't crash if any fails
  const results = await Promise.allSettled([
    fetchFirstById<{ id: ID; departmentName?: string | null }>(API.departments, r.departmentNameID),
    fetchFirstById<{ id: ID; desgination?: string | null }>(API.designations, r.designationID),
    fetchFirstById<{ id: ID; employeeFirstName?: string | null; employeeLastName?: string | null }>(API.employees, r.managerID),
    fetchFirstById<{ id: ID; workShiftName?: string | null }>(API.workShifts, r.workShiftID),
    fetchFirstById<{ id: ID; attendancePolicyName?: string | null }>(API.attendancePolicies, r.attendancePolicyID),
    fetchFirstById<{ id: ID; leavePolicyName?: string | null }>(API.leavePolicies, r.leavePolicyID),
    // devices list can 404 if route mismatch; treat as empty list
    fetchJSONSafe<any[]>(API.devices),
    fetchFirstById<{ id: ID; contractorName?: string | null }>(API.contractors, contractorId),
  ]);

  const get = <T,>(i: number, fallback: T | null = null): T | null =>
    results[i].status === "fulfilled" ? (results[i] as PromiseFulfilledResult<any>).value as T : fallback;

  const dept = get<{ departmentName?: string | null }>(0);
  const desg = get<{ desgination?: string | null }>(1);
  const mgr = get<{ employeeFirstName?: string | null; employeeLastName?: string | null }>(2);
  const ws = get<{ workShiftName?: string | null }>(3);
  const ap = get<{ attendancePolicyName?: string | null }>(4);
  const lp = get<{ leavePolicyName?: string | null }>(5);
  const devicesList = get<any[]>(6, []) || [];
  const contractor = get<{ id: ID; contractorName?: string | null }>(7);

  // Get manager name either from API lookup or from nested relation
  const mgrFull = mgr 
    ? `${mgr.employeeFirstName ?? ""} ${mgr.employeeLastName ?? ""}`.trim() 
    : r.manager 
      ? `${r.manager.employeeFirstName ?? ""} ${r.manager.employeeLastName ?? ""}`.trim()
      : "";

  setFormData((prev: any) => {
    const devMapForm = (prev.devMapForm || []).map((d: any) => {
      if (d.deviceName) return d;
      const match = devicesList.find((dv) => dv.id === Number(d.deviceID));
      return {
        ...d,
        deviceName: match?.deviceName ?? "",
        _devAutocomplete: match?.deviceName ?? "",
        deviceEmpCode: d.deviceEmpCode ?? "",
      };
    });

    return {
      ...prev,
      deptAutocomplete: dept?.departmentName ?? prev.deptAutocomplete,
      contractorID: contractor?.id ?? prev.contractorID,
      contrAutocomplete: contractor?.contractorName ?? prev.contrAutocomplete,
      desgAutocomplete: desg?.desgination ?? prev.desgAutocomplete,
      mgrAutocomplete: mgrFull || prev.mgrAutocomplete,
      wsAutocomplete: ws?.workShiftName ?? prev.wsAutocomplete,
      apAutocomplete: ap?.attendancePolicyName ?? prev.apAutocomplete,
      lpAutocomplete: lp?.leavePolicyName ?? prev.lpAutocomplete,
      devMapForm,
    };
  });
}



const uid = () => Math.random().toString(36).slice(2, 10);

/* =========================
   Component
   ========================= */
export function ManageEmployeesManagement() {
  // Data
  const [rows, setRows] = useState<ManageEmpRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<ManageEmpRead | null>(null);
  const [editingRow, setEditingRow] = useState<ManageEmpRead | null>(null);

  // Suggestion states/refs (SP/CO/BR)
  const spRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<HTMLDivElement>(null);
  const brRef = useRef<HTMLDivElement>(null);

  const monthlyPGRef = useRef<HTMLDivElement>(null);
  const hourlyPGRef = useRef<HTMLDivElement>(null);

  const [spList, setSpList] = useState<SP[]>([]);
  const [coList, setCoList] = useState<CO[]>([]);
  const [brList, setBrList] = useState<BR[]>([]);
  const [monthlyPGList, setMonthlyPGList] = useState<MonthlyPG[]>([]);
  const [hourlyPGList, setHourlyPGList] = useState<HourlyPG[]>([]);

  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [brLoading, setBrLoading] = useState(false);
  const [monthlyPGLoading, setMonthlyPGLoading] = useState(false);
  const [hourlyPGLoading, setHourlyPGLoading] = useState(false);

  const spAbortRef = useRef<AbortController | null>(null);
  const coAbortRef = useRef<AbortController | null>(null);
  const brAbortRef = useRef<AbortController | null>(null);
  const monthlyPGAbortRef = useRef<AbortController | null>(null);
  const hourlyPGAbortRef = useRef<AbortController | null>(null);

  const spTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const monthlyPGTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hourlyPGTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // refs/lists/loaders for device suggestions
  const devRef = useRef<HTMLDivElement>(null);
  const [devList, setDevList] = useState<Device[]>([]);
  const [devLoading, setDevLoading] = useState(false);
  const devAbortRef = useRef<AbortController | null>(null);
  const devTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Nested repeaters form types
  type EduForm = {
    id?: ID;
    _localId: string;
    instituteType: string;
    instituteName: string;
    degree: string;
    pasingYear: string;
    marks: string;
    gpaCgpa: string;
    class: string;
  };
  type ExpForm = {
    id?: ID;
    _localId: string;
    orgName: string;
    designation: string;
    fromDate: string;
    toDate: string;
    responsibility: string;
    skill: string;
  };
  type DevMapForm = {
    id?: ID;
    _localId: string;
    deviceID: string;       // keep as string for input, convert to number on submit
    deviceEmpCode: string;
    deviceName?: string;    // optional display only (if you want to show)
    _devAutocomplete?: string; // for device autocomplete input
  };

  // Track original child IDs to compute deletions on PATCH
  const [originalEduIds, setOriginalEduIds] = useState<ID[]>([]);
  const [originalExpIds, setOriginalExpIds] = useState<ID[]>([]);
  const [originalDevMapIds, setOriginalDevMapIds] = useState<ID[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // foreign keys + typed names for suggestions
    serviceProviderID: null as ID | null,
    companyID: null as ID | null,
    branchesID: null as ID | null,
    contractorID: null as ID | null,
    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",

    // main scalars
    employeeFirstName: "",
    employeeLastName: "",
    deviceEmpCode: "",
    employeeID: "",
    departmentNameID: null as ID | null,
    designationID: null as ID | null,
    managerID: null as ID | null,
    joiningDate: "",

    monthlyPGAutocomplete: "",
    hourlyPGAutocomplete: "",

    workShiftID: null as ID | null,
    attendancePolicyID: null as ID | null,
    leavePolicyID: null as ID | null,

    businessPhoneNo: "",
    businessEmail: "",
    personalPhoneNo: "",
    personalEmail: "",
    emergancyContact: "",
    presentAddress: "",
    permenantAddress: "",
    employeePhotoUrl: "",

    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    maritalStatus: "",
    employeeFatherName: "",
    employeeMotherName: "",
    employeeSpouseName: "",

    // add alongside your other *Autocomplete fields:
    deptAutocomplete: "",
    desgAutocomplete: "",
    contrAutocomplete: "",
    mgrAutocomplete: "",
    wsAutocomplete: "",
    apAutocomplete: "",
    lpAutocomplete: "",

    promotion: {
      id: undefined,
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
    } as PromotionForm,



    // nested arrays
    eduForm: [] as EduForm[],
    expForm: [] as ExpForm[],
    devMapForm: [] as DevMapForm[],
  });

  /* ===========
     Data load
     =========== */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await fetchJSONSafe<ManageEmpRead[]>(API.manageEmp);
      setRows(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRows(); }, []);

  /* =======================
     Debounced suggestions
     ======================= */
  const runFetchSP = (query: string) => {
    if (spTimerRef.current) clearTimeout(spTimerRef.current);
    spTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) { setSpList([]); return; }
      if (spAbortRef.current) spAbortRef.current.abort();
      const ctrl = new AbortController();
      spAbortRef.current = ctrl;
      setSpLoading(true);
      try {
        const all = await fetchJSONSafe<SP[]>(API.serviceProviders, ctrl.signal);
        const filtered = (all || []).filter(s => (s.companyName ?? "").toLowerCase().includes(query.toLowerCase()));
        setSpList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("SP fetch error:", e);
      } finally { setSpLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchMonthlyPG = (q: string) => {
    if (monthlyPGTimerRef.current) clearTimeout(monthlyPGTimerRef.current);
    monthlyPGTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setMonthlyPGList([]); return; }
      monthlyPGAbortRef.current?.abort();
      const ctrl = new AbortController(); monthlyPGAbortRef.current = ctrl;
      setMonthlyPGLoading(true);
      try {
        const all = await fetchJSONSafe<MonthlyPG[]>(API.monthlyGrades, ctrl.signal);
        const filtered = (all || []).filter(x =>
          (x.monthlyPayGradeName ?? "").toLowerCase().includes(q.toLowerCase())
        );
        setMonthlyPGList(filtered.slice(0, 20));
      } finally { setMonthlyPGLoading(false); }
    }, DEBOUNCE_MS);
  };




  const runFetchDept = (q: string) => {
    if (deptTimerRef.current) clearTimeout(deptTimerRef.current);
    deptTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setDeptList([]); return; }
      if (deptAbortRef.current) {
        deptAbortRef.current.abort();
      }
      const ctrl = new AbortController(); deptAbortRef.current = ctrl;
      setDeptLoading(true);
      try {
        const all = await fetchJSONSafe<Dept[]>(API.departments, ctrl.signal);
        const filtered = (all || []).filter(d => (d.departmentName ?? "").toLowerCase().includes(q.toLowerCase()));
        setDeptList(filtered.slice(0, 20));
      } finally { setDeptLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchDesg = (q: string) => {
    if (desgTimerRef.current) clearTimeout(desgTimerRef.current);
    desgTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setDesgList([]); return; }
      desgAbortRef.current?.abort();
      const ctrl = new AbortController(); desgAbortRef.current = ctrl;
      setDesgLoading(true);
      try {
        const all = await fetchJSONSafe<Desg[]>(API.designations, ctrl.signal);
        const filtered = (all || []).filter(d => (d.desgination ?? "").toLowerCase().includes(q.toLowerCase()));
        setDesgList(filtered.slice(0, 20));
      } finally { setDesgLoading(false); }
    }, DEBOUNCE_MS);
  };


  const runFetchContr = (q: string) => {
    if (contrTimerRef.current) clearTimeout(contrTimerRef.current);
    contrTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setContrList([]); return; }
      contrAbortRef.current?.abort();
      const ctrl = new AbortController(); contrAbortRef.current = ctrl;
      setContrLoading(true);
      try {
        const all = await fetchJSONSafe<Contr[]>(API.contractors, ctrl.signal);
        const filtered = (all || []).filter(c => (c.contractorName ?? "").toLowerCase().includes(q.toLowerCase()));
        setContrList(filtered.slice(0, 20));
      } finally { setContrLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchDev = (q: string) => {
    if (devTimerRef.current) clearTimeout(devTimerRef.current);
    devTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setDevList([]); return; }
      devAbortRef.current?.abort();
      const ctrl = new AbortController(); devAbortRef.current = ctrl;
      setDevLoading(true);
      try {
        const all = await fetchJSONSafe<Device[]>(API.devices, ctrl.signal);
        const filtered = (all || []).filter(d =>
          (d.deviceName ?? "").toLowerCase().includes(q.toLowerCase())
        );
        setDevList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("Device fetch error:", e);
      } finally {
        setDevLoading(false);
      }
    }, DEBOUNCE_MS);
  };





  const runFetchMgr = (q: string) => {
    if (mgrTimerRef.current) clearTimeout(mgrTimerRef.current);
    mgrTimerRef.current = setTimeout(async () => {
      mgrAbortRef.current?.abort();
      const ctrl = new AbortController(); mgrAbortRef.current = ctrl;
      setMgrLoading(true);
      try {
        const all = await fetchJSONSafe<Mgr[]>(API.manageEmp, ctrl.signal);
        // Fallback to already-loaded table rows if API returns empty (e.g., pagination/server filter)
        const source: any[] = Array.isArray(all) && all.length ? all : (rows as any[]);
        const ql = (q || "").trim().toLowerCase();
        const filtered = ql.length >= MIN_CHARS
          ? (source || []).filter(m => {
              const name = `${m.employeeFirstName ?? ""} ${m.employeeLastName ?? ""}`.trim().toLowerCase();
              return name.includes(ql);
            })
          : (source || []); // show initial suggestions when empty
        setMgrList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any)?.name !== "AbortError") {
          console.error("Manager fetch error:", e);
          // Fallback to table rows on error
          const ql = (q || "").trim().toLowerCase();
          const filtered = ql.length >= MIN_CHARS
            ? (rows || []).filter((m: any) => {
                const name = `${m.employeeFirstName ?? ""} ${m.employeeLastName ?? ""}`.trim().toLowerCase();
                return name.includes(ql);
              })
            : (rows || []);
          setMgrList(filtered.slice(0, 20));
        }
      } finally { setMgrLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchWS = (q: string) => {
    if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
    wsTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setWsList([]); return; }
      wsAbortRef.current?.abort();
      const ctrl = new AbortController(); wsAbortRef.current = ctrl;
      setWsLoading(true);
      try {
        const all = await fetchJSONSafe<WS[]>(API.workShifts, ctrl.signal);
        const filtered = (all || []).filter(w => (w.workShiftName ?? "").toLowerCase().includes(q.toLowerCase()));
        setWsList(filtered.slice(0, 20));
      } finally { setWsLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchAP = (q: string) => {
    if (apTimerRef.current) clearTimeout(apTimerRef.current);
    apTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setApList([]); return; }
      apAbortRef.current?.abort();
      const ctrl = new AbortController(); apAbortRef.current = ctrl;
      setApLoading(true);
      try {
        const all = await fetchJSONSafe<AP[]>(API.attendancePolicies, ctrl.signal);
        const filtered = (all || []).filter(a => (a.attendancePolicyName ?? "").toLowerCase().includes(q.toLowerCase()));
        setApList(filtered.slice(0, 20));
      } finally { setApLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchLP = (q: string) => {
    if (lpTimerRef.current) clearTimeout(lpTimerRef.current);
    lpTimerRef.current = setTimeout(async () => {
      if (q.length < MIN_CHARS) { setLpList([]); return; }
      lpAbortRef.current?.abort();
      const ctrl = new AbortController(); lpAbortRef.current = ctrl;
      setLpLoading(true);
      try {
        const all = await fetchJSONSafe<LP[]>(API.leavePolicies, ctrl.signal);
        const filtered = (all || []).filter(l => (l.leavePolicyName ?? "").toLowerCase().includes(q.toLowerCase()));
        setLpList(filtered.slice(0, 20));
      } finally { setLpLoading(false); }
    }, DEBOUNCE_MS);
  };


  const runFetchCO = (query: string) => {
    if (coTimerRef.current) clearTimeout(coTimerRef.current);
    coTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) { setCoList([]); return; }
      if (coAbortRef.current) coAbortRef.current.abort();
      const ctrl = new AbortController();
      coAbortRef.current = ctrl;
      setCoLoading(true);
      try {
        const all = await fetchJSONSafe<CO[]>(API.companies, ctrl.signal);
        const filtered = (all || []).filter(c => (c.companyName ?? "").toLowerCase().includes(query.toLowerCase()));
        setCoList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("CO fetch error:", e);
      } finally { setCoLoading(false); }
    }, DEBOUNCE_MS);
  };

  const runFetchBR = (query: string) => {
    if (brTimerRef.current) clearTimeout(brTimerRef.current);
    brTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) { setBrList([]); return; }
      if (brAbortRef.current) brAbortRef.current.abort();
      const ctrl = new AbortController();
      brAbortRef.current = ctrl;
      setBrLoading(true);
      try {
        const all = await fetchJSONSafe<BR[]>(API.branches, ctrl.signal);
        const filtered = (all || []).filter(b => (b.branchName ?? "").toLowerCase().includes(query.toLowerCase()));
        setBrList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("BR fetch error:", e);
      } finally { setBrLoading(false); }
    }, DEBOUNCE_MS);
  };


  interface Dept { id: ID; departmentName?: string | null; }
  interface Desg { id: ID; desgination?: string | null; }
  interface Contr { id: ID; contractorName?: string | null; }
  interface Mgr { id: ID; employeeFirstName?: string | null; employeeLastName?: string | null; }
  interface WS { id: ID; workShiftName?: string | null; }
  interface AP { id: ID; attendancePolicyName?: string | null; }
  interface LP { id: ID; leavePolicyName?: string | null; }




  // refs for outside-click close
  const deptRef = useRef<HTMLDivElement>(null);
  const desgRef = useRef<HTMLDivElement>(null);
  const contrRef = useRef<HTMLDivElement>(null);
  const mgrRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const apRef = useRef<HTMLDivElement>(null);
  const lpRef = useRef<HTMLDivElement>(null);

  // data lists
  const [deptList, setDeptList] = useState<Dept[]>([]);
  const [desgList, setDesgList] = useState<Desg[]>([]);
  const [contrList, setContrList] = useState<Contr[]>([]);
  const [mgrList, setMgrList] = useState<Mgr[]>([]);
  const [wsList, setWsList] = useState<WS[]>([]);
  const [apList, setApList] = useState<AP[]>([]);
  const [lpList, setLpList] = useState<LP[]>([]);

  // loaders
  const [deptLoading, setDeptLoading] = useState(false);
  const [desgLoading, setDesgLoading] = useState(false);
  const [contrLoading, setContrLoading] = useState(false);
  const [mgrLoading, setMgrLoading] = useState(false);
  const [wsLoading, setWsLoading] = useState(false);
  const [apLoading, setApLoading] = useState(false);
  const [lpLoading, setLpLoading] = useState(false);

  // abort controllers
  const deptAbortRef = useRef<AbortController | null>(null);
  const desgAbortRef = useRef<AbortController | null>(null);
  const contrAbortRef = useRef<AbortController | null>(null);
  const mgrAbortRef = useRef<AbortController | null>(null);
  const wsAbortRef = useRef<AbortController | null>(null);
  const apAbortRef = useRef<AbortController | null>(null);
  const lpAbortRef = useRef<AbortController | null>(null);

  // timers for debounce
  const deptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mgrTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Close suggestion popovers on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (spRef.current && !spRef.current.contains(e.target as any)) setSpList([]);
      if (coRef.current && !coRef.current.contains(e.target as any)) setCoList([]);
      if (brRef.current && !brRef.current.contains(e.target as any)) setBrList([]);
      if (deptRef.current && !deptRef.current.contains(e.target as any)) setDeptList([]);
      if (desgRef.current && !desgRef.current.contains(e.target as any)) setDesgList([]);
      if (contrRef.current && !contrRef.current.contains(e.target as any)) setContrList([]);
      if (mgrRef.current && !mgrRef.current.contains(e.target as any)) setMgrList([]);
      if (wsRef.current && !wsRef.current.contains(e.target as any)) setWsList([]);
      if (apRef.current && !apRef.current.contains(e.target as any)) setApList([]);
      if (lpRef.current && !lpRef.current.contains(e.target as any)) setLpList([]);
      if (devRef.current && !devRef.current.contains(e.target as any)) setDevList([]);
      if (monthlyPGRef.current && !monthlyPGRef.current.contains(e.target as any)) setMonthlyPGList([]);
      if (hourlyPGRef.current && !hourlyPGRef.current.contains(e.target as any)) setHourlyPGList([]);


    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cleanup timers/aborts on unmount
  useEffect(() => {
    return () => {
      if (spTimerRef.current) clearTimeout(spTimerRef.current);
      if (coTimerRef.current) clearTimeout(coTimerRef.current);
      if (brTimerRef.current) clearTimeout(brTimerRef.current);
      if (deptTimerRef.current) clearTimeout(deptTimerRef.current);
      if (desgTimerRef.current) clearTimeout(desgTimerRef.current);
      if (contrTimerRef.current) clearTimeout(contrTimerRef.current);
      if (mgrTimerRef.current) clearTimeout(mgrTimerRef.current);
      if (wsTimerRef.current) clearTimeout(wsTimerRef.current);
      if (apTimerRef.current) clearTimeout(apTimerRef.current);
      if (lpTimerRef.current) clearTimeout(lpTimerRef.current);
      if (devTimerRef.current) clearTimeout(devTimerRef.current);


      spAbortRef.current?.abort();
      coAbortRef.current?.abort();
      brAbortRef.current?.abort();
      deptAbortRef.current?.abort();
      desgAbortRef.current?.abort();
      contrAbortRef.current?.abort();
      mgrAbortRef.current?.abort();
      wsAbortRef.current?.abort();
      apAbortRef.current?.abort();
      lpAbortRef.current?.abort();
      devAbortRef.current?.abort();


    };
  }, []);

  /* ===============
     Photo upload
     =============== */
  const onPickPhoto = (file: File | null) => {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const uploadPhotoIfNeeded = async (): Promise<string | undefined> => {
    if (!photoFile) return undefined;
    const fd = new FormData();
    fd.append("file", photoFile);
    const res = await fetch(API.upload, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const full = data?.url?.startsWith("http") ? data.url : `http://192.168.29.225:8000${data?.url ?? ""}`;
    return full;
  };

  /* ==================
     Nested repeaters
     ================== */
  // Add row
  const addEdu = () => setFormData(p => ({
    ...p,
    eduForm: [...p.eduForm, {
      _localId: uid(),
      instituteType: "", instituteName: "", degree: "", pasingYear: "", marks: "", gpaCgpa: "", class: "",
    }]
  }));
  const addExp = () => setFormData(p => ({
    ...p,
    expForm: [...p.expForm, {
      _localId: uid(),
      orgName: "", designation: "", fromDate: "", toDate: "", responsibility: "", skill: "",
    }]
  }));
  const addDevMap = () => setFormData(p => ({
    ...p,
    devMapForm: [...p.devMapForm, {
      _localId: uid(),
      deviceID: "", deviceEmpCode: "", deviceName: "", _devAutocomplete: "",
    }]
  }));

  // Remove row (UI)
  const removeEdu = (lid: string) => setFormData(p => ({ ...p, eduForm: p.eduForm.filter(x => x._localId !== lid) }));
  const removeExp = (lid: string) => setFormData(p => ({ ...p, expForm: p.expForm.filter(x => x._localId !== lid) }));
  const removeDevMap = (lid: string) => setFormData(p => ({ ...p, devMapForm: p.devMapForm.filter(x => x._localId !== lid) }));

  // Update cell
  const updateEdu = (lid: string, key: keyof EduForm, val: string) =>
    setFormData(p => ({ ...p, eduForm: p.eduForm.map(x => x._localId === lid ? { ...x, [key]: val } : x) }));
  const updateExp = (lid: string, key: keyof ExpForm, val: string) =>
    setFormData(p => ({ ...p, expForm: p.expForm.map(x => x._localId === lid ? { ...x, [key]: val } : x) }));
  const updateDevMap = (lid: string, key: keyof DevMapForm, val: string) =>
    setFormData(p => ({ ...p, devMapForm: p.devMapForm.map(x => x._localId === lid ? { ...x, [key]: val } : x) }));

  /* ===============
     Form helpers
     =============== */
  const resetForm = () => {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchesID: null,
      contractorID: null,

      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",

      employeeFirstName: "",
      employeeLastName: "",
      deviceEmpCode: "",
      employeeID: "",
      departmentNameID: null,
      designationID: null,
      managerID: null,

      joiningDate: "",

      monthlyPGAutocomplete: "",
      hourlyPGAutocomplete: "",

      workShiftID: null,
      attendancePolicyID: null,
      leavePolicyID: null,

      businessPhoneNo: "",
      businessEmail: "",
      personalPhoneNo: "",
      personalEmail: "",
      emergancyContact: "",
      presentAddress: "",
      permenantAddress: "",
      employeePhotoUrl: "",

      gender: "",
      dateOfBirth: "",
      bloodGroup: "",
      maritalStatus: "",
      employeeFatherName: "",
      employeeMotherName: "",
      employeeSpouseName: "",

      deptAutocomplete: "",
      desgAutocomplete: "",
      contrAutocomplete: "",
      mgrAutocomplete: "",
      wsAutocomplete: "",
      apAutocomplete: "",
      lpAutocomplete: "",

      promotion: {
        id: undefined,
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


      eduForm: [],
      expForm: [],
      devMapForm: [],
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setOriginalEduIds([]); setOriginalExpIds([]); setOriginalDevMapIds([]);
    setEditingRow(null);
    setSpList([]); setCoList([]); setBrList([]);
    setError(null);
  };

  // Helpers for rendering names in table
  const spName = (r: ManageEmpRead) =>
    r.serviceProvider?.companyName ?? r.serviceProviderName ?? "—";

  const contrName = (r: ManageEmpRead) =>
    r.contractor?.contractorName ?? r.contractorName ?? "—";

  const coName = (r: ManageEmpRead) =>
    r.company?.companyName ?? r.companyName ?? "—";
  const brName = (r: ManageEmpRead) =>
    r.branches?.branchName ?? r.branchName ?? "—";




  /* ===============
     CRUD submit
     =============== */
  // Only create/update promotion when meaningful fields are filled
  const hasPromotionData = () => {
    const p = formData.promotion as any;
    if (!p) return false;
    return Boolean(
      p?.departmentNameID ||
      p?.designationID ||
      p?.managerID ||
      (p?.employmentType && String(p.employmentType).trim() !== "") ||
      (p?.employmentStatus && String(p.employmentStatus).trim() !== "") ||
      (p?.probationPeriod && String(p.probationPeriod).trim() !== "") ||
      p?.workShiftID != null ||
      p?.attendancePolicyID != null ||
      p?.leavePolicyID != null ||
      (p?.salaryPayGradeType && String(p.salaryPayGradeType).trim() !== "") ||
      p?.monthlyPayGradeID != null ||
      p?.hourlyPayGradeID != null
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const uploadedPhotoUrl = await uploadPhotoIfNeeded();


      // Map nested arrays to API contracts
      const edu = formData.eduForm.map(e => ({
        id: e.id,
        instituteType: e.instituteType || undefined,
        instituteName: e.instituteName || undefined,
        degree: e.degree || undefined,
        pasingYear: e.pasingYear || undefined,
        marks: e.marks || undefined,
        gpaCgpa: e.gpaCgpa || undefined,
        class: e.class || undefined,
      }));

      const exp = formData.expForm.map(x => ({
        id: x.id,
        orgName: x.orgName || undefined,
        designation: x.designation || undefined,
        fromDate: x.fromDate || undefined,
        toDate: x.toDate || undefined,
        responsibility: x.responsibility || undefined,
        skill: x.skill || undefined,
      }));

      const devices = formData.devMapForm.map(d => ({
        id: d.id,
        deviceID: d.deviceID ? Number(d.deviceID) : undefined,
        deviceEmpCode: d.deviceEmpCode || undefined,
      }));

      // Compute deletions (edit only)
      const eduRemaining = new Set(edu.filter(e => e.id != null).map(e => e.id as number));
      const expRemaining = new Set(exp.filter(x => x.id != null).map(x => x.id as number));
      const devRemaining = new Set(devices.filter(d => d.id != null).map(d => d.id as number));

      const type = formData.promotion?.salaryPayGradeType;


      const payload: any = {
        serviceProviderID: formData.serviceProviderID ?? undefined,
        companyID: formData.companyID ?? undefined,
        branchesID: formData.branchesID ?? undefined,
        contractorID:
          formData.promotion?.employmentType === "Contract"
            ? (formData.contractorID ?? undefined)
            : null,

        // Scalars that belong to ManageEmployee (keep only those that still live on ManageEmployee)
        employeeFirstName: formData.employeeFirstName || undefined,
        employeeLastName: formData.employeeLastName || undefined,
        employeeID: formData.employeeID || undefined,
        joiningDate: formData.joiningDate || undefined,

        // Basic position fields (now stored directly on ManageEmployee)
        departmentNameID: formData.departmentNameID ?? undefined,
        designationID: formData.designationID ?? undefined,
        managerID: formData.managerID ?? undefined,
        employmentType: formData.promotion.employmentType || undefined,
        employmentStatus: formData.promotion.employmentStatus || undefined,
        probationPeriod: formData.promotion.probationPeriod || undefined,
        workShiftID: formData.workShiftID ?? undefined,
        attendancePolicyID: formData.attendancePolicyID ?? undefined,
        leavePolicyID: formData.leavePolicyID ?? undefined,
        salaryPayGradeType: formData.promotion.salaryPayGradeType || undefined,
        monthlyPayGradeID: type === "Monthly" ? formData.promotion?.monthlyPayGradeID ?? undefined : undefined,
        hourlyPayGradeID: type === "Hourly" ? formData.promotion?.hourlyPayGradeID ?? undefined : undefined,

        businessPhoneNo: formData.businessPhoneNo || undefined,
        businessEmail: formData.businessEmail || undefined,
        personalPhoneNo: formData.personalPhoneNo || undefined,
        personalEmail: formData.personalEmail || undefined,
        emergancyContact: formData.emergancyContact || undefined,
        presentAddress: formData.presentAddress || undefined,
        permenantAddress: formData.permenantAddress || undefined,
        employeePhotoUrl: uploadedPhotoUrl ?? (formData.employeePhotoUrl || undefined),

        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        employeeFatherName: formData.employeeFatherName || undefined,
        employeeMotherName: formData.employeeMotherName || undefined,
        employeeSpouseName: formData.employeeSpouseName || undefined,

        // Nested arrays (names expected by backend DTO)
        edu,
        exp,
        devices, // <-- IMPORTANT: send as `devices`, not empDeviceMapping

        // Do not send promotion data from ManageEmployee form
        // Promotion records should only be created via Employee Promotions form

        // Deletions when editing (names expected by UpdateManageEmployeeDto)
        ...(editingRow ? {
          eduIdsToDelete: originalEduIds.filter(id => !eduRemaining.has(id)),
          expIdsToDelete: originalExpIds.filter(id => !expRemaining.has(id)),
          deviceMapIdsToDelete: originalDevMapIds.filter(id => !devRemaining.has(id)), // <-- correct key
        } : {}),
      };

      console.log("SUBMIT PAYLOAD", payload);

      if (editingRow) {
        const res = await fetch(`${API.manageEmp}/${editingRow.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(API.manageEmp, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
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

  const handleEdit = (r: ManageEmpRead) => {
    setEditingRow(r);

    const eduForm: EduForm[] = (r.empEduQualification ?? []).map(e => ({
      id: e.id,
      _localId: uid(),
      instituteType: e.instituteType ?? "",
      instituteName: e.instituteName ?? "",
      degree: e.degree ?? "",
      pasingYear: e.pasingYear ?? "",
      marks: e.marks ?? "",
      gpaCgpa: e.gpaCgpa ?? "",
      class: e.class ?? "",
    }));

    const expForm: ExpForm[] = (r.empProfExprience ?? []).map(x => ({
      id: x.id,
      _localId: uid(),
      orgName: x.orgName ?? "",
      designation: x.designation ?? "",
      fromDate: x.fromDate ?? "",
      toDate: x.toDate ?? "",
      responsibility: x.responsibility ?? "",
      skill: x.skill ?? "",
    }));

    const devMapForm: DevMapForm[] = (r.empDeviceMapping ?? []).map(d => ({
      id: d.id,
      _localId: uid(),
      deviceID: (d.deviceID ?? "").toString(),
      deviceEmpCode: d.deviceEmpCode ?? "",
      deviceName: d.device?.deviceName ?? "",
    }));

    const latestPromotion =
      (r as any).empPromotion && (r as any).empPromotion.length
        ? [...(r as any).empPromotion].sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0))[0]
        : null;

    // Use data directly from ManageEmployee record (not from promotion)
    // These fields are now stored directly on the employee record
    const effectiveDeptID = r.departmentNameID ?? null;
    const effectiveDesgID = r.designationID ?? null;
    const effectiveMgrID = r.managerID ?? null;
    const effectiveWorkShiftID = r.workShiftID ?? null;
    const effectiveAttendancePolicyID = r.attendancePolicyID ?? null;
    const effectiveLeavePolicyID = r.leavePolicyID ?? null;


    setFormData({
      serviceProviderID: r.serviceProviderID ?? r.serviceProvider?.id ?? null,
      companyID: r.companyID ?? r.company?.id ?? null,
      branchesID: r.branchesID ?? r.branches?.id ?? null,
      departmentNameID: effectiveDeptID,
      designationID: effectiveDesgID,
      managerID: effectiveMgrID,
      contractorID: r.contractorID ?? r.contractor?.id ?? null,


      spAutocomplete: r.serviceProvider?.companyName ?? r.serviceProviderName ?? "",
      coAutocomplete: r.company?.companyName ?? r.companyName ?? "",
      brAutocomplete: r.branches?.branchName ?? r.branchName ?? "",

      employeeFirstName: r.employeeFirstName ?? "",
      employeeLastName: r.employeeLastName ?? "",
      deviceEmpCode: r.deviceEmpCode ?? "",
      employeeID: r.employeeID ?? "",

      joiningDate: r.joiningDate ?? "",

      monthlyPGAutocomplete: "",
      hourlyPGAutocomplete: "",

      workShiftID: effectiveWorkShiftID,
      attendancePolicyID: effectiveAttendancePolicyID,
      leavePolicyID: effectiveLeavePolicyID,

      businessPhoneNo: r.businessPhoneNo ?? "",
      businessEmail: r.businessEmail ?? "",
      personalPhoneNo: r.personalPhoneNo ?? "",
      personalEmail: r.personalEmail ?? "",
      emergancyContact: r.emergancyContact ?? "",
      presentAddress: r.presentAddress ?? "",
      permenantAddress: r.permenantAddress ?? "",
      employeePhotoUrl: r.employeePhotoUrl ?? "",

      gender: r.gender ?? "",
      dateOfBirth: r.dateOfBirth ?? "",
      bloodGroup: r.bloodGroup ?? "",
      maritalStatus: r.maritalStatus ?? "",
      employeeFatherName: r.employeeFatherName ?? "",
      employeeMotherName: r.employeeMotherName ?? "",
      employeeSpouseName: r.employeeSpouseName ?? "",


      contrAutocomplete: "",
      wsAutocomplete: "",
      apAutocomplete: "",
      lpAutocomplete: "",

      promotion: latestPromotion ? {
        id: latestPromotion.id,
        departmentNameID: latestPromotion.departmentNameID ?? null,
        designationID: latestPromotion.designationID ?? null,
        managerID: latestPromotion.managerID ?? null,
        employmentType: latestPromotion.employmentType ?? "",
        employmentStatus: latestPromotion.employmentStatus ?? "",
        probationPeriod: latestPromotion.probationPeriod ?? "",
        workShiftID: latestPromotion.workShiftID ?? null,
        attendancePolicyID: latestPromotion.attendancePolicyID ?? null,
        leavePolicyID: latestPromotion.leavePolicyID ?? null,
        salaryPayGradeType: latestPromotion.salaryPayGradeType ?? "",
        monthlyPayGradeID: latestPromotion.monthlyPayGradeID ?? null,
        hourlyPayGradeID: latestPromotion.hourlyPayGradeID ?? null,
      } : {
        id: undefined,
        departmentNameID: effectiveDeptID,
        designationID: effectiveDesgID,
        managerID: effectiveMgrID,
        employmentType: r.employmentType ?? "",
        employmentStatus: r.employmentStatus ?? "",
        probationPeriod: r.probationPeriod ?? "",
        workShiftID: effectiveWorkShiftID,
        attendancePolicyID: effectiveAttendancePolicyID,
        leavePolicyID: effectiveLeavePolicyID,
        salaryPayGradeType: r.salaryPayGradeType ?? "",
        monthlyPayGradeID: r.monthlyPayGradeID ?? null,
        hourlyPayGradeID: r.hourlyPayGradeID ?? null,
      },

      deptAutocomplete: "",
      desgAutocomplete: "",
      mgrAutocomplete: (r.manager
        ? `${r.manager.employeeFirstName ?? ""} ${r.manager.employeeLastName ?? ""}`.trim()
        : ""),

      eduForm,
      expForm,
      devMapForm,
    });

    (async () => {
      const mpId = r.monthlyPayGradeID ?? null;
      const hpId = r.hourlyPayGradeID ?? null;

      if (mpId) {
        const m = await fetchFirstById<MonthlyPG>(API.monthlyGrades, mpId);
        setFormData((p) => ({
          ...p,
          monthlyPGAutocomplete: m?.monthlyPayGradeName ?? String(mpId),
        }));
      }
      if (hpId) {
        const h = await fetchFirstById<HourlyPG>(API.hourlyGrades, hpId);
        setFormData((p) => ({
          ...p,
          hourlyPGAutocomplete: h?.hourlyPayGradeName ?? String(hpId),
        }));
      }
    })();

    resolveLabelsForEdit(
      {
        ...r,
        departmentNameID: effectiveDeptID,
        designationID: effectiveDesgID,
        managerID: effectiveMgrID,
        contractorID: r.contractorID,
        attendancePolicyID: effectiveAttendancePolicyID,
        leavePolicyID: effectiveLeavePolicyID,
        workShiftID: effectiveWorkShiftID,
      } as any,
      setFormData
    );
    setOriginalEduIds(eduForm.filter(x => x.id != null).map(x => x.id!));
    setOriginalExpIds(expForm.filter(x => x.id != null).map(x => x.id!));
    setOriginalDevMapIds(devMapForm.filter(x => x.id != null).map(x => x.id!));

    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDialogOpen(true);
  };

  const handleView = (r: ManageEmpRead) => {
    setViewRow(r);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: ID) => {
    if (!confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`${API.manageEmp}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await fetchRows();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  };

  /* ==========
     Search
     ========== */
  const filteredRows = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) =>
      [
        r.employeeFirstName,
        r.employeeLastName,
        r.employeeID,
        r.businessEmail,
        spName(r),
        contrName(r),
        coName(r),
        brName(r),
      ]
        .filter(Boolean)
        .map((x) => (x ?? "").toLowerCase())
        .some((f) => f.includes(t))
    );
  }, [rows, searchTerm]);

  /* ==========
     UI Render
     ========== */
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Employees</h1>
          <p className="text-gray-600 mt-1 text-sm">Create, read, update and delete employees</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Employee
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >

            <DialogHeader>
              <DialogTitle>{editingRow ? "Edit Employee" : "Add New Employee"}</DialogTitle>
              <DialogDescription>
                {editingRow ? "Update the employee information below." : "Fill in the details to add a new employee."}
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
                            setFormData((p) => ({
                              ...p,
                              serviceProviderID: sp.id,
                              spAutocomplete: sp.companyName ?? "",
                            }));
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
                      {coList.map((co) => (
                        <div
                          key={co.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              companyID: co.id,
                              coAutocomplete: co.companyName ?? "",
                            }));
                            setCoList([]);
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
                      {brList.map((br) => (
                        <div
                          key={br.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              branchesID: br.id,
                              brAutocomplete: br.branchName ?? "",
                            }));
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

              {/* Basic info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={formData.employeeFirstName}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeFirstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={formData.employeeLastName}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeLastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input
                    value={formData.employeeID}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeID: e.target.value }))}
                  />
                </div>
              </div>

              {/* Codes / Date */}
              <div className="grid grid-cols-3 gap-4">

                <div className="space-y-2">
                  <Label>Joining Date</Label>
                  <Input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData((p) => ({ ...p, joiningDate: e.target.value }))}
                  />
                </div>


              </div>

              {/* IDs & employment */}
              <div className="grid grid-cols-3 gap-4">

                <div ref={deptRef} className="space-y-2 relative">
                  <Label>Department</Label>
                  <Input
                    value={formData.deptAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        deptAutocomplete: val,
                        departmentNameID: null,                          // clear root
                        promotion: { ...p.promotion, departmentNameID: null }, // clear promotion side too
                      }));
                      runFetchDept(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchDept(val);
                    }}
                    placeholder="Start typing department…"
                    autoComplete="off"
                  />
                  {deptList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {deptLoading && (
                        <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                      )}
                      {deptList.map((d) => (
                        <div
                          key={d.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              departmentNameID: d.id,
                              deptAutocomplete: d.departmentName ?? String(d.id),
                              promotion: { ...p.promotion, departmentNameID: d.id },
                            }));
                            setDeptList([]);
                          }}
                        >
                          {d.departmentName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>



                {/* Designation */}
                <div ref={desgRef} className="space-y-2 relative">
                  <Label>Designation</Label>
                  <Input
                    value={formData.desgAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        desgAutocomplete: val,
                        designationID: null,
                        promotion: { ...p.promotion, designationID: null },
                      }));
                      runFetchDesg(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchDesg(val);
                    }}
                    placeholder="Start typing designation…"
                    autoComplete="off"
                  />
                  {desgList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {desgLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {desgList.map((d) => (
                        <div
                          key={d.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              designationID: d.id,
                              desgAutocomplete: d.desgination ?? String(d.id),
                              promotion: { ...p.promotion, designationID: d.id },
                            }));
                            setDesgList([]);
                          }}
                        >
                          {d.desgination}
                        </div>
                      ))}
                    </div>
                  )}
                </div>


                <div ref={mgrRef} className="space-y-2 relative">
                  <Label>Manager</Label>
                  <Input
                    value={formData.mgrAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        mgrAutocomplete: val,
                        managerID: null,
                        promotion: { ...p.promotion, managerID: null },
                      }));
                      runFetchMgr(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      runFetchMgr(val); // show suggestions even when empty
                    }}
                    placeholder="Start typing manager…"
                    autoComplete="off"
                  />
                  {mgrList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {mgrLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {mgrList.map((m) => {
                        const full = `${m.employeeFirstName ?? ""} ${m.employeeLastName ?? ""}`.trim() || `#${m.id}`;
                        return (
                          <div
                            key={m.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                managerID: m.id,
                                mgrAutocomplete: full,
                                promotion: { ...p.promotion, managerID: m.id },
                              }));
                              setMgrList([]);
                            }}
                          >
                            {full}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>


              <div
                className={`grid gap-4 ${
                  formData.promotion.employmentType === "Contract"
                    ? formData.promotion.employmentStatus === "Probation" ? "grid-cols-4" : "grid-cols-3"
                    : formData.promotion.employmentStatus === "Probation" ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={formData.promotion.employmentType || ""}
                    onValueChange={(val) =>
                      setFormData((p) => ({
                        ...p,
                        contractorID: val === "Company" ? null : p.contractorID,
                        contrAutocomplete: val === "Company" ? "" : p.contrAutocomplete,
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

                {formData.promotion.employmentStatus === "Probation" && (
                  <div className="space-y-2">
                    <Label>Probation Period</Label>
                    <Input
                      value={formData.promotion.probationPeriod}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          promotion: { ...p.promotion, probationPeriod: e.target.value },
                        }))
                      }
                      placeholder="e.g. 6 months"
                    />
                  </div>
                )}

                {/* Contractor - Only visible when Employment Type is "Contract" */}
                {formData.promotion.employmentType === "Contract" && (
                  <div ref={contrRef} className="space-y-2 relative">
                    <Label>Contractor</Label>
                    <Input
                      value={formData.contrAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, contrAutocomplete: val, contractorID: null }));
                        runFetchContr(val);
                      }}
                      onFocus={(e) => {
                        const val = e.target.value;
                        if (val.length >= MIN_CHARS) runFetchContr(val);
                      }}
                      placeholder="Start typing contractor…"
                      autoComplete="off"
                    />
                    {contrList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                        {contrLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                        {contrList.map((c) => (
                          <div
                            key={c.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                contractorID: c.id,
                                contrAutocomplete: c.contractorName ?? String(c.id),
                                promotion: {
                                  ...p.promotion,
                                  employmentType: p.promotion.employmentType || "Contract",
                                },
                              }));
                              setContrList([]);
                            }}

                          >
                            {c.contractorName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>  

              {/* Policy / Shift IDs */}
              <div className="grid grid-cols-2 gap-4">
                {/* Salary Pay Grade Type + conditional autocompletes */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Salary Pay Grade Type</Label>
                    <Select
                      value={formData.promotion.salaryPayGradeType || ""}
                      onValueChange={(val) =>
                        setFormData((p) => ({
                          ...p,
                          salaryPayGradeType: val, // optional: keep for backward-compat
                          promotion: {
                            ...p.promotion,
                            salaryPayGradeType: val,
                            // clear the opposite side to avoid stale IDs
                            monthlyPayGradeID: val === "Monthly" ? p.promotion.monthlyPayGradeID : null,
                          },
                          // also clear the opposite autocomplete text
                          monthlyPGAutocomplete: val === "Monthly" ? p.monthlyPGAutocomplete : "",
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monthly PG (only when Monthly is selected) */}
                  <div ref={monthlyPGRef} className="space-y-2 relative">
                    <Label>Monthly Pay Grade</Label>
                    <Input
                      value={formData.monthlyPGAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          monthlyPGAutocomplete: val,
                          promotion: { ...p.promotion, monthlyPayGradeID: null }, // clear id while typing
                        }));
                        runFetchMonthlyPG(val);
                      }}
                      onFocus={(e) => {
                        const val = e.target.value;
                        if (val.length >= MIN_CHARS) runFetchMonthlyPG(val);
                      }}
                      placeholder="Start typing monthly grade…"
                      autoComplete="off"
                    />
                    {monthlyPGList.length > 0 && (
                      <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                        {monthlyPGLoading && (
                          <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>
                        )}
                        {monthlyPGList.map((g) => (
                          <div
                            key={g.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                monthlyPGAutocomplete: g.monthlyPayGradeName ?? String(g.id),
                                promotion: { ...p.promotion, monthlyPayGradeID: g.id },
                              }));
                              setMonthlyPGList([]);
                            }}
                          >
                            {g.monthlyPayGradeName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                 

                </div>

                {/* Attendance Policy */}
                <div ref={apRef} className="space-y-2 relative">
                  <Label>Attendance Policy</Label>
                  <Input
                    value={formData.apAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        apAutocomplete: val,
                        attendancePolicyID: null,
                        promotion: { ...p.promotion, attendancePolicyID: null },
                      }));
                      runFetchAP(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchAP(val);
                    }}
                    placeholder="Start typing attendance policy…"
                    autoComplete="off"
                  />
                  {apList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {apLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {apList.map((a) => (
                        <div
                          key={a.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              attendancePolicyID: a.id,
                              apAutocomplete: a.attendancePolicyName ?? String(a.id),
                              promotion: { ...p.promotion, attendancePolicyID: a.id },
                            }));
                            setApList([]);
                          }}
                        >
                          {a.attendancePolicyName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

             

              {/* Leave Policy and Work Shifts */}
              <div className="grid grid-cols-2 gap-4">

        {/* Leave Policy */}
                <div ref={lpRef} className="space-y-2 relative">
                  <Label>Leave Policy</Label>
                  <Input
                    value={formData.lpAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        lpAutocomplete: val,
                        leavePolicyID: null,
                        promotion: { ...p.promotion, leavePolicyID: null },
                      }));
                      runFetchLP(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchLP(val);
                    }}
                    placeholder="Start typing leave policy…"
                    autoComplete="off"
                  />
                  {lpList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {lpLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {lpList.map((l) => (
                        <div
                          key={l.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              leavePolicyID: l.id,
                              lpAutocomplete: l.leavePolicyName ?? String(l.id),
                              promotion: { ...p.promotion, leavePolicyID: l.id },
                            }));
                            setLpList([]);
                          }}
                        >
                          {l.leavePolicyName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Work Shifts */}
                <div ref={wsRef} className="space-y-2 relative">
                  <Label>Work Shifts</Label>
                  <Input
                    value={formData.wsAutocomplete}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((p) => ({
                        ...p,
                        wsAutocomplete: val,
                        workShiftID: null,
                        promotion: { ...p.promotion, workShiftID: null },
                      }));
                      runFetchWS(val);
                    }}
                    onFocus={(e) => {
                      const val = e.target.value;
                      if (val.length >= MIN_CHARS) runFetchWS(val);
                    }}
                    placeholder="Start typing work shifts…"
                    autoComplete="off"
                  />
                  {wsList.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                      {wsLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                      {wsList.map((a) => (
                        <div
                          key={a.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setFormData((p) => ({
                              ...p,
                              workShiftID: a.id,
                              wsAutocomplete: a.workShiftName ?? String(a.id),
                              promotion: { ...p.promotion, workShiftID: a.id },
                            }));
                            setWsList([]);
                          }}
                        >
                          {a.workShiftName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Phone</Label>
                  <Input
                    value={formData.businessPhoneNo}
                    onChange={(e) => setFormData((p) => ({ ...p, businessPhoneNo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Email</Label>
                  <Input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, businessEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Personal Phone</Label>
                  <Input
                    value={formData.personalPhoneNo}
                    onChange={(e) => setFormData((p) => ({ ...p, personalPhoneNo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Personal Email</Label>
                  <Input
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData((p) => ({ ...p, personalEmail: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input
                    value={formData.emergancyContact}
                    onChange={(e) => setFormData((p) => ({ ...p, emergancyContact: e.target.value }))}
                  />
                </div>

                {/* Probation Period moved next to Employment Status above */}

              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Present Address</Label>
                  <Textarea
                    value={formData.presentAddress}
                    onChange={(e) => setFormData((p) => ({ ...p, presentAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permanent Address</Label>
                  <Textarea
                    value={formData.permenantAddress}
                    onChange={(e) => setFormData((p) => ({ ...p, permenantAddress: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              {/* Personal */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(val) =>
                      setFormData((p) => ({
                        ...p,
                        gender: val,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Transgender">Transgender</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData((p) => ({ ...p, bloodGroup: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={formData.maritalStatus || ""}
                    onValueChange={(val) =>
                      setFormData((p) => ({
                        ...p,
                        maritalStatus: val,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select marital status…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Father's Name</Label>
                  <Input
                    value={formData.employeeFatherName}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeFatherName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name</Label>
                  <Input
                    value={formData.employeeMotherName}
                    onChange={(e) => setFormData((p) => ({ ...p, employeeMotherName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Spouse Name</Label>
                <Input
                  value={formData.employeeSpouseName}
                  onChange={(e) => setFormData((p) => ({ ...p, employeeSpouseName: e.target.value }))}
                />
              </div>

              {/* Photo upload */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onPickPhoto(e.target.files?.[0] ?? null)}
                  />
                  {photoPreview ? (
                    <img src={photoPreview} className="h-20 w-20 rounded object-cover mt-2" alt="preview" />
                  ) : formData.employeePhotoUrl ? (
                    <img src={formData.employeePhotoUrl} className="h-20 w-20 rounded object-cover mt-2" alt="photo" />
                  ) : null}
                </div>
              </div>

              {/* ==========================
                  EDUCATION (repeater)
                  ========================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button variant="outline" size="sm" type="button" onClick={addEdu}>
                    <Plus className="w-4 h-4 mr-1" /> Add Education
                  </Button>
                </div>

                {formData.eduForm.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <Icon icon="mdi:school" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p>No education rows added yet</p>
                  </div>
                ) : (
                  formData.eduForm.map((ed) => (
                    <div key={ed._localId} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Education</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEdu(ed._localId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Institute Type</Label>
                          <Input value={ed.instituteType} onChange={(e) => updateEdu(ed._localId, "instituteType", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Institute Name</Label>
                          <Input value={ed.instituteName} onChange={(e) => updateEdu(ed._localId, "instituteName", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input value={ed.degree} onChange={(e) => updateEdu(ed._localId, "degree", e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Passing Year</Label>
                          <Input value={ed.pasingYear} onChange={(e) => updateEdu(ed._localId, "pasingYear", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Marks</Label>
                          <Input value={ed.marks} onChange={(e) => updateEdu(ed._localId, "marks", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>GPA/CGPA</Label>
                          <Input value={ed.gpaCgpa} onChange={(e) => updateEdu(ed._localId, "gpaCgpa", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Class</Label>
                          <Input value={ed.class} onChange={(e) => updateEdu(ed._localId, "class", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ==========================
                  EXPERIENCE (repeater)
                  ========================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  <Button variant="outline" size="sm" type="button" onClick={addExp}>
                    <Plus className="w-4 h-4 mr-1" /> Add Experience
                  </Button>
                </div>

                {formData.expForm.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <Icon icon="mdi:briefcase" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p>No experience rows added yet</p>
                  </div>
                ) : (
                  formData.expForm.map((xp) => (
                    <div key={xp._localId} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Experience</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExp(xp._localId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Organisation</Label>
                          <Input value={xp.orgName} onChange={(e) => updateExp(xp._localId, "orgName", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Designation</Label>
                          <Input value={xp.designation} onChange={(e) => updateExp(xp._localId, "designation", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Skill</Label>
                          <Input value={xp.skill} onChange={(e) => updateExp(xp._localId, "skill", e.target.value)} />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>From</Label>
                          <Input type="date" value={xp.fromDate} onChange={(e) => updateExp(xp._localId, "fromDate", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>To</Label>
                          <Input type="date" value={xp.toDate} onChange={(e) => updateExp(xp._localId, "toDate", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Responsibility</Label>
                          <Input value={xp.responsibility} onChange={(e) => updateExp(xp._localId, "responsibility", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ==========================
                  DEVICE MAPPING (repeater)
                  ========================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Device Mapping</h3>
                  <Button variant="outline" size="sm" type="button" onClick={addDevMap}>
                    <Plus className="w-4 h-4 mr-1" /> Add Mapping
                  </Button>
                </div>

                {formData.devMapForm.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg">
                    <Icon icon="mdi:devices" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p>No device mappings added yet</p>
                  </div>
                ) : (
                  formData.devMapForm.map((dm) => (
                    <div key={dm._localId} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">Mapping</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDevMap(dm._localId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {/* Device (autocomplete) */}
                        <div ref={devRef} className="space-y-2 relative">
                          <Label>Device</Label>
                          <Input
                            value={dm._devAutocomplete ?? dm.deviceName ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDevMap(dm._localId, "_devAutocomplete", val as any);
                              updateDevMap(dm._localId, "deviceID", "" as any); // clear ID until selected
                              runFetchDev(val);
                            }}
                            placeholder="Type device name…"
                            autoComplete="off"
                          />
                          {devList.length > 0 && (
                            <div className="absolute z-10 bg-white border rounded w-full shadow max-h-48 overflow-y-auto">
                              {devLoading && <div className="px-3 py-2 text-sm text-gray-500">Loading…</div>}
                              {devList.map((dv) => (
                                <div
                                  key={dv.id}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    updateDevMap(dm._localId, "deviceID", String(dv.id) as any);
                                    updateDevMap(dm._localId, "deviceName", (dv.deviceName ?? "") as any);
                                    updateDevMap(dm._localId, "_devAutocomplete", (dv.deviceName ?? "") as any);
                                    setDevList([]);
                                  }}
                                >
                                  {dv.deviceName ?? `#${dv.id}`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {formData.devMapForm.map((d: DevMapForm) => (
                            <div key={d._localId}>
                              <Label>Device Employee Code</Label>
                              <Input
                                value={d.deviceEmpCode}
                                onChange={(e) =>
                                  updateDevMap(d._localId, "deviceEmpCode", e.target.value)
                                }
                                placeholder="Device Employee Code"
                                autoComplete="off"
                              />
                            </div>
                          ))}

                        </div>


                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? "Saving..." : editingRow ? "Update Employee" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Read-only details</DialogDescription>
          </DialogHeader>
          {viewRow && (
            <div className="space-y-3">
              <p><strong>Name:</strong> {viewRow.employeeFirstName} {viewRow.employeeLastName}</p>
              <p><strong>Employee ID:</strong> {viewRow.employeeID}</p>
              <p><strong>Service Provider:</strong> {spName(viewRow)}</p>
              <p><strong>Company:</strong> {coName(viewRow)}</p>
              <p><strong>Branch:</strong> {brName(viewRow)}</p>
              <p><strong>Business Email:</strong> {viewRow.businessEmail}</p>
              <p><strong>Business Phone:</strong> {viewRow.businessPhoneNo}</p>
              <p><strong>Present Address:</strong> {viewRow.presentAddress}</p>
              <p><strong>Permanent Address:</strong> {viewRow.permenantAddress}</p>

              {(viewRow.empEduQualification?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Education:</p>
                  <div className="text-sm space-y-1">
                    {viewRow.empEduQualification!.map(e => (
                      <div key={e.id} className="border rounded p-2">
                        <div><strong>{e.degree}</strong> — {e.instituteName}</div>
                        <div>{e.pasingYear} • {e.class} • {e.gpaCgpa}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(viewRow.empProfExprience?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Experience:</p>
                  <div className="text-sm space-y-1">
                    {viewRow.empProfExprience!.map(x => (
                      <div key={x.id} className="border rounded p-2">
                        <div><strong>{x.orgName}</strong> — {x.designation}</div>
                        <div>{x.fromDate} → {x.toDate}</div>
                        <div>{x.responsibility}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(viewRow.empDeviceMapping?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Device Mapping:</p>
                  <div className="text-sm space-y-1">
                    {viewRow.empDeviceMapping!.map(d => (
                      <div key={d.id} className="border rounded p-2">
                        <div><strong>Device ID:</strong> {d.deviceID} {d.device?.deviceName ? `— ${d.device.deviceName}` : ""}</div>
                        <div><strong>Emp Code:</strong> {d.deviceEmpCode ?? "—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewRow.employeePhotoUrl && (
                <div className="mt-2">
                  <img src={viewRow.employeePhotoUrl} className="h-24 w-24 rounded object-cover" alt="employee" />
                </div>
              )}
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
                placeholder="Search employees…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredRows.length} employees
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-group" className="w-5 h-5" />
            Employee List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company</TableHead>
                  <TableHead className="w-[110px]">Branch</TableHead>
                  <TableHead className="w-[140px]">Department</TableHead>
                  <TableHead className="w-[140px]">Designation</TableHead>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead className="w-[160px]">Business Email</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-group-outline" className="w-12 h-12 text-gray-300" />
                        <p>No employees found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{spName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{coName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{brName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.departments?.departmentName ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.designations?.desgination ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.employeeFirstName} {r.employeeLastName}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.employeeID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.businessEmail ?? "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(r)} className="h-7 w-7 p-0" title="View">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(r)} className="h-7 w-7 p-0" title="Edit">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(r.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
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
