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

/** ========= Types aligned to backend ========= */
type ID = number;

// Core name types used in suggestions
interface SP { id: ID; companyName?: string | null }
interface CO { id: ID; companyName?: string | null }
interface BR { id: ID; branchName?: string | null }
interface Dept { id: ID; departmentName?: string | null }
interface Desg { id: ID; designantion?: string | null }

// Minimal employee row for suggestions
interface EmpRow {
  id: ID;
  employeeID?: string | null;
  employeeFirstName?: string | null;
  employeeLastName?: string | null;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;
  employmentType?: string | null;
  employmentStatus?: string | null;
  salaryPayGradeType?: string | null;
  departmentNameID?: ID | null;
  designationID?: ID | null;
   departments?: { id: ID; departmentName?: string | null } | null;
  designations?: { id: ID; designantion?: string | null } | null;
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

// Promotion request row (PromotionRequest)
interface PromotionReq {
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
  departments_promotionRequest_currentDepartmentIDTodepartments?: { id: ID; departmentName?: string | null } | null;
  designations_promotionRequest_currentDesignationIDTodesignations?: { id: ID; designantion?: string | null } | null;
  departments_promotionRequest_proposedDepartmentIDTodepartments?: { id: ID; departmentName?: string | null } | null;
  designations_promotionRequest_proposedDesignationIDTodesignations?: { id: ID; designantion?: string | null } | null;
}

/** ========= API endpoints ========= */
const API = {
  serviceProviders: "http://localhost:8000/service-provider",
  companies: "http://localhost:8000/company",
  branches: "http://localhost:8000/branches",
  manageEmp: "http://localhost:8000/manage-emp",
  empCurrent: "http://localhost:8000/emp-current-position",
  promotionReq: "http://localhost:8000/promotion-request",
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

// --- helpers to safely read nested names ---
const getDeptName = (obj: any): string =>
  (obj?.departments?.departmentName ?? "").toString().trim();

const getDesgName = (obj: any): string =>
  (obj?.designations?.designantion ?? "").toString().trim();


function classNames(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

/** ========= Component ========= */
export function EmployeesPromotionsManagement() {
  /** ========== table data (show list of promotion requests) ========== */
  const [rows, setRows] = useState<PromotionReq[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /** dialog state */
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRow, setViewRow] = useState<PromotionReq | null>(null);
  const [editingRow, setEditingRow] = useState<{ current?: CurrentPos | null; promo?: PromotionReq | null } | null>(null);

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

  /** form state */
  const [formData, setFormData] = useState({
    // SP/CO/BR + employee selection
    serviceProviderID: null as ID | null,
    companyID: null as ID | null,
    branchesID: null as ID | null,
    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",

    manageEmployeeID: null as ID | null,
    empAutocomplete: "", // shows "First Last - EMP001"

    empID: "", // employee string id for promotion table

    /** current (EmpCurrentPosition) */
    existingDepartmentID: null as ID | null,
    existingDesignationID: null as ID | null,
    existingMonthlyPayGradeID: null as ID | null,
    existingHourlyPayGradeID: null as ID | null,
    existingSalaryCtc: "",
    existingEmploymentType: "", // store as string => convert to number if needed
    effectiveFrom: "",
    effectiveTo: "",

    // typed display names for current section
    deptCurrAutocomplete: "",
    desgCurrAutocomplete: "",

    /** new/current (PromotionRequest: "new*") */
    newDepartmentID: null as ID | null,
    newDesignationID: null as ID | null,
    newMonthlyPayGradeID: null as ID | null,
    newHourlyPayGradeID: null as ID | null,
    newSalaryCtc: "",
    newEmploymentType: "", // string => convert

    deptNewAutocomplete: "",
    desgNewAutocomplete: "",

    /** proposed (PromotionRequest: "proposed*") */
    proposedDepartmentID: null as ID | null,
    proposedDesignationID: null as ID | null,
    proposedMonthlyPayGradeID: null as ID | null,
    proposedHourlyPayGradeID: null as ID | null,
    proposedSalaryCtc: "",
    proposedEmploymentType: "", // string => convert

    deptPropAutocomplete: "",
    desgPropAutocomplete: "",

    description: "",
    promotionDate: "",
    status: "Not Applied", // or "Applied"

    // READ-ONLY current position (from /manage-emp)
    currentDeptIdDisplay: "" as string,   // from departmentNameID
    currentDesgIdDisplay: "" as string,  // from designationID    
    currentDeptNameDisplay: "" as string,
    currentDesgNameDisplay: "" as string,
    currentSalaryPayGradeTypeDisplay: "" as string, // from salaryPayGradeType
    currentEmploymentTypeDisplay: "" as string,     // from employmentType
    currentEmploymentStatusDisplay: "" as string,    // from employmentStatus

  });

  /** ======= load list ======= */
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await fetchJSONSafe<PromotionReq[]>(API.promotionReq);
      setRows(data ?? []);
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

  const runFetchDeptCurr = (q: string) =>
    debouncedFetch<Dept>({
      q, timerRef: deptCurrTimerRef, abortRef: deptCurrAbortRef,
      setLoading: setDeptCurrLoading, setList: setDeptCurrList,
      endpoint: API.departments,
      proj: (raw) => raw as Dept[],
      filter: (d) => (d.departmentName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchDesgCurr = (q: string) =>
    debouncedFetch<Desg>({
      q, timerRef: desgCurrTimerRef, abortRef: desgCurrAbortRef,
      setLoading: setDesgCurrLoading, setList: setDesgCurrList,
      endpoint: API.designations,
      proj: (raw) => raw as Desg[],
      filter: (d) => (d.designantion ?? "").toLowerCase().includes(q.toLowerCase()),
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

  const runFetchDeptProp = (q: string) =>
    debouncedFetch<Dept>({
      q, timerRef: deptPropTimerRef, abortRef: deptPropAbortRef,
      setLoading: setDeptPropLoading, setList: setDeptPropList,
      endpoint: API.departments,
      proj: (raw) => raw as Dept[],
      filter: (d) => (d.departmentName ?? "").toLowerCase().includes(q.toLowerCase()),
    });

  const runFetchDesgProp = (q: string) =>
    debouncedFetch<Desg>({
      q, timerRef: desgPropTimerRef, abortRef: desgPropAbortRef,
      setLoading: setDesgPropLoading, setList: setDesgPropList,
      endpoint: API.designations,
      proj: (raw) => raw as Desg[],
      filter: (d) => (d.designantion ?? "").toLowerCase().includes(q.toLowerCase()),
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
    };
  }, []);

  /** ======= helpers ======= */
  const spName = (r: PromotionReq) => {
    // may come only in current table include; leaving blank if not present
    return "—";
  };

  const filteredRows = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => {
      const name = r.empID ?? "";
      const status = r.status ?? "";
      const deptN = ""; // we don't have normalized names unless backend includes; filter by id as string
      return [name, status, String(r.newDepartmentID ?? ""), String(r.proposedDepartmentID ?? "")]
        .map((x) => (x ?? "").toLowerCase())
        .some((f) => f.includes(t));
    });
  }, [rows, searchTerm]);

  /** ======= when employee selected, prefill “Current Position Information” ======= */
const prefillFromEmployee = async (emp: EmpRow) => {
  // names from /manage-emp (if the payload included nested objects)
  const deptNameFromEmp = emp.departments?.departmentName?.trim() ?? "";
  const desgNameFromEmp = emp.designations?.designantion?.trim() ?? "";

  // set base + read-only displays + FK IDs that must be saved
  setFormData((p) => ({
    ...p,
    manageEmployeeID: emp.id,
    empAutocomplete: `${emp.employeeFirstName ?? ""} ${emp.employeeLastName ?? ""} - ${emp.employeeID ?? ""}`.trim(),
    empID: emp.employeeID ?? "",
    serviceProviderID: emp.serviceProviderID ?? p.serviceProviderID,
    companyID: emp.companyID ?? p.companyID,
    branchesID: emp.branchesID ?? p.branchesID,

    // read-only displays (IDs + names)
    currentDeptIdDisplay: emp.departmentNameID != null ? String(emp.departmentNameID) : "",
    currentDesgIdDisplay: emp.designationID != null ? String(emp.designationID) : "",
    currentDeptNameDisplay: deptNameFromEmp,
    currentDesgNameDisplay: desgNameFromEmp,
    currentSalaryPayGradeTypeDisplay: emp.salaryPayGradeType ?? "",
    currentEmploymentTypeDisplay: emp.employmentType ?? "",
    currentEmploymentStatusDisplay: emp.employmentStatus ?? "",

    // make sure current-position FKs are primed (so save won't be null)
    existingDepartmentID: emp.departmentNameID ?? null,
    existingDesignationID: emp.designationID ?? null,

    // optional: keep edit autocompletes in sync
    deptCurrAutocomplete: deptNameFromEmp || p.deptCurrAutocomplete,
    desgCurrAutocomplete: desgNameFromEmp || p.desgCurrAutocomplete,
  }));

  // 1) Try latest emp-current-position for salary/effective and (if included) names
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
        existingSalaryCtc: current.existingSalaryCtc != null ? String(current.existingSalaryCtc) : p.existingSalaryCtc,
        existingEmploymentType: current.existingEmploymentType != null ? String(current.existingEmploymentType) : p.existingEmploymentType,
        effectiveFrom: current.effectiveFrom ?? p.effectiveFrom,
        effectiveTo: current.effectiveTo ?? p.effectiveTo,

        // prefer names coming from current-position include; otherwise keep what we already set
        currentDeptNameDisplay: current.departments?.departmentName?.trim() || p.currentDeptNameDisplay,
        currentDesgNameDisplay: current.designations?.designantion?.trim() || p.currentDesgNameDisplay,

        // keep edit autocompletes aligned
        deptCurrAutocomplete: current.departments?.departmentName?.trim() || p.deptCurrAutocomplete,
        desgCurrAutocomplete: current.designations?.designantion?.trim() || p.desgCurrAutocomplete,
      }));
    }
  } catch (e) {
    console.warn("Could not prefill current position:", e);
  }

  // 2) Fallback: if names are still empty but we have IDs, fetch them by ID once
  try {
    const needDeptName = !deptNameFromEmp && !!emp.departmentNameID;
    const needDesgName = !desgNameFromEmp && !!emp.designationID;
    if (!needDeptName && !needDesgName) return;

    const [deptRes, desgRes] = await Promise.all([
      needDeptName ? fetchJSONSafe<any>(`${API.departments}/${emp.departmentNameID}`) : Promise.resolve(null),
      needDesgName ? fetchJSONSafe<any>(`${API.designations}/${emp.designationID}`) : Promise.resolve(null),
    ]);

    setFormData((p) => ({
      ...p,
      currentDeptNameDisplay: p.currentDeptNameDisplay || deptRes?.departmentName?.trim() || "",
      currentDesgNameDisplay: p.currentDesgNameDisplay || desgRes?.designantion?.trim() || "",
      // also keep editable fields in sync if they were empty
      deptCurrAutocomplete: p.deptCurrAutocomplete || deptRes?.departmentName?.trim() || "",
      desgCurrAutocomplete: p.desgCurrAutocomplete || desgRes?.designantion?.trim() || "",
    }));
  } catch {
    // ignore fallback errors; IDs are still shown
  }
};


  /** ======= CRUD submit (create/update both tables) ======= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // 1) Upsert CURRENT (EmpCurrentPosition)
      const curPayload: any = {
        serviceProviderID: formData.serviceProviderID ?? undefined,
        companyID: formData.companyID ?? undefined,
        branchesID: formData.branchesID ?? undefined,
        manageEmployeeID: formData.manageEmployeeID ?? undefined,

        existingDepartmentID: formData.existingDepartmentID ?? undefined,
        existingDesignationID: formData.existingDesignationID ?? undefined,
        existingMonthlyPayGradeID: formData.existingMonthlyPayGradeID ?? undefined,
        existingHourlyPayGradeID: formData.existingHourlyPayGradeID ?? undefined,
        existingSalaryCtc: formData.existingSalaryCtc ? Number(formData.existingSalaryCtc) : undefined,
        existingEmploymentType: formData.existingEmploymentType ? Number(formData.existingEmploymentType) : undefined,

        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveTo: formData.effectiveTo || undefined,
      };

      // If we’re editing and had a current row loaded, PATCH it; else POST a new one
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

      // 2) Upsert PROMOTION (PromotionRequest)
      const promoPayload: any = {
        manageEmployeeID: formData.manageEmployeeID ?? undefined,
        empID: formData.empID || undefined,

        newDepartmentID: formData.newDepartmentID ?? undefined,
        newDesignationID: formData.newDesignationID ?? undefined,
        newMonthlyPayGradeID: formData.newMonthlyPayGradeID ?? undefined,
        newHourlyPayGradeID: formData.newHourlyPayGradeID ?? undefined,
        newSalaryCtc: formData.newSalaryCtc ? Number(formData.newSalaryCtc) : undefined,
        newEmploymentType: formData.newEmploymentType ? Number(formData.newEmploymentType) : undefined,
        newEmployementStatus: formData.status || undefined,

        proposedDepartmentID: formData.proposedDepartmentID ?? undefined,
        proposedDesignationID: formData.proposedDesignationID ?? undefined,
        proposedMonthlyPayGradeID: formData.proposedMonthlyPayGradeID ?? undefined,
        proposedHourlyPayGradeID: formData.proposedHourlyPayGradeID ?? undefined,
        proposedSalaryCtc: formData.proposedSalaryCtc ? Number(formData.proposedSalaryCtc) : undefined,
        proposedEmploymentType: formData.proposedEmploymentType ? Number(formData.proposedEmploymentType) : undefined,

        description: formData.description || undefined,
        promotionDate: formData.promotionDate || undefined,
        status: formData.status || undefined,
      };

      if (editingRow?.promo?.id) {
        const res = await fetch(`${API.promotionReq}/${editingRow.promo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promoPayload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(API.promotionReq, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promoPayload),
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

  /** ======= edit/view/delete ======= */
  const handleEdit = async (promo: PromotionReq) => {
    // Try to fetch the current row for that employee
    let current: CurrentPos | null = null;
    if (promo.manageEmployeeID) {
      try {
        const list = await fetchJSONSafe<CurrentPos[]>(
          `${API.empCurrent}?manageEmployeeID=${promo.manageEmployeeID}&take=1&skip=0`
        );
        current = list?.[0] ?? null;
      } catch (_) { }
    }

    setEditingRow({ current, promo });

    setFormData((p) => ({
      ...p,
      // If you also store SP/CO/BR in current, use those IDs:
      serviceProviderID: current?.serviceProviderID ?? p.serviceProviderID,
      companyID: current?.companyID ?? p.companyID,
      branchesID: current?.branchesID ?? p.branchesID,
      spAutocomplete: current?.serviceProvider?.companyName ?? p.spAutocomplete,
      coAutocomplete: current?.company?.companyName ?? p.coAutocomplete,
      brAutocomplete: current?.branches?.branchName ?? p.brAutocomplete,
      currentDeptNameDisplay: current?.departments?.departmentName ?? "",
      currentDesgNameDisplay: current?.designations?.designantion ?? "",


      manageEmployeeID: promo.manageEmployeeID ?? null,
      empAutocomplete: promo.empID ? promo.empID : p.empAutocomplete,
      empID: promo.empID ?? "",

      existingDepartmentID: current?.existingDepartmentID ?? null,
      existingDesignationID: current?.existingDesignationID ?? null,
      existingMonthlyPayGradeID: current?.existingMonthlyPayGradeID ?? null,
      existingHourlyPayGradeID: current?.existingHourlyPayGradeID ?? null,
      existingSalaryCtc: current?.existingSalaryCtc != null ? String(current.existingSalaryCtc) : "",
      existingEmploymentType: current?.existingEmploymentType != null ? String(current.existingEmploymentType) : "",
      effectiveFrom: current?.effectiveFrom ?? "",
      effectiveTo: current?.effectiveTo ?? "",

      deptCurrAutocomplete: current?.departments?.departmentName ?? "",
      desgCurrAutocomplete: current?.designations?.designantion ?? "",

      newDepartmentID: promo.newDepartmentID ?? null,
      newDesignationID: promo.newDesignationID ?? null,
      newMonthlyPayGradeID: promo.newMonthlyPayGradeID ?? null,
      newHourlyPayGradeID: promo.newHourlyPayGradeID ?? null,
      newSalaryCtc: promo.newSalaryCtc != null ? String(promo.newSalaryCtc) : "",
      newEmploymentType: promo.newEmploymentType != null ? String(promo.newEmploymentType) : "",

      proposedDepartmentID: promo.proposedDepartmentID ?? null,
      proposedDesignationID: promo.proposedDesignationID ?? null,
      proposedMonthlyPayGradeID: promo.proposedMonthlyPayGradeID ?? null,
      proposedHourlyPayGradeID: promo.proposedHourlyPayGradeID ?? null,
      proposedSalaryCtc: promo.proposedSalaryCtc != null ? String(promo.proposedSalaryCtc) : "",
      proposedEmploymentType: promo.proposedEmploymentType != null ? String(promo.proposedEmploymentType) : "",

      description: promo.description ?? "",
      promotionDate: promo.promotionDate ?? "",
      status: promo.status ?? "Not Applied",
    }));

    setIsDialogOpen(true);
  };

  const handleView = (promo: PromotionReq) => {
    setViewRow(promo);
    setIsViewOpen(true);
  };

  const handleDelete = async (id: ID) => {
    if (!confirm("Delete this promotion request?")) return;
    try {
      const res = await fetch(`${API.promotionReq}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await fetchRows();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
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
      currentDesgIdDisplay: "",
      currentDeptNameDisplay: "",
      currentDesgNameDisplay: "",
      currentSalaryPayGradeTypeDisplay: "",
      currentEmploymentTypeDisplay: "",
      currentEmploymentStatusDisplay: "",

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
                    <Label>Current Paygrade</Label>
                    <Input
                      value={formData.currentSalaryPayGradeTypeDisplay}
                      readOnly
                      className="bg-gray-50"
                      placeholder="—"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Current Salary (CTC)</Label>
                    <Input
                      value={formData.existingSalaryCtc}
                      onChange={(e) => setFormData((p) => ({ ...p, existingSalaryCtc: e.target.value }))}
                      placeholder="e.g. 500000"
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
                </div>

                <div className="grid grid-cols-3 gap-4">
                  

                 
                </div>
              </div>

              {/* PROMOTION REQUEST (new/proposed) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Promotion Request</h3>

                {/* NEW (current target) */}
                <div className="grid grid-cols-3 gap-4">
                  {/* dept new */}
                  <div ref={deptNewRef} className="space-y-2 relative">
                    <Label>Promoted Department</Label>
                    <Input
                      value={formData.deptNewAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, deptNewAutocomplete: val, newDepartmentID: null }));
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
                              setFormData((p) => ({ ...p, newDepartmentID: d.id, deptNewAutocomplete: d.departmentName ?? "" }));
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
                  <div ref={desgNewRef} className="space-y-2 relative">
                    <Label>Promoted Designation</Label>
                    <Input
                      value={formData.desgNewAutocomplete}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((p) => ({ ...p, desgNewAutocomplete: val, newDesignationID: null }));
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
                              setFormData((p) => ({ ...p, newDesignationID: d.id, desgNewAutocomplete: d.designantion ?? "" }));
                              setDesgNewList([]);
                            }}
                          >
                            {d.designantion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Promoted Salary</Label>
                    <Input
                      value={formData.newSalaryCtc}
                      onChange={(e) => setFormData((p) => ({ ...p, newSalaryCtc: e.target.value }))}
                      placeholder="e.g. 600000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>New Salary (CTC)</Label>
                    <Input
                      value={formData.newSalaryCtc}
                      onChange={(e) => setFormData((p) => ({ ...p, newSalaryCtc: e.target.value }))}
                      placeholder="e.g. 600000"
                    />
                  </div>
                </div>

                {/* PROPOSED (approval target) */}
                <div className="grid grid-cols-3 gap-4">
                  {/* dept proposed */}
                 

                 
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
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:trending-up" className="w-12 h-12 text-gray-300" />
                        <p>No promotion requests found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={r.status === "Applied" ? "default" : "secondary"}>{r.status ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{r.empID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.newDepartmentID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.newDesignationID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.proposedDepartmentID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.proposedDesignationID ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.promotionDate ?? "—"}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "Applied" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                // quick set to Applied
                                try {
                                  const res = await fetch(`${API.promotionReq}/${r.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "Applied" }),
                                  });
                                  if (!res.ok) throw new Error(await res.text());
                                  await fetchRows();
                                } catch (e: any) {
                                  alert(e?.message || "Failed to apply");
                                }
                              }}
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Mark as Applied"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
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
