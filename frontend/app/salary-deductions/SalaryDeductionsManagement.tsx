"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface SalaryDeduction {
  id: string;
  serviceProvider: string;
  companyName: string;
  branchName: string;
  deductionName: string;
  deductionType: "Fixed" | "Percentage";
  value: number;
  perMonthLimit: number;
  createdAt: string;
}

type ApiSalaryDeduction = {
  id: number;
  serviceProviderID: number | null;
  companyID: number | null;
  branchesID: number | null;
  salaryDeductionName: string | null;
  salaryDeductionType: string | null; // "Fixed" | "Percentage"
  salaryDeductionValue: string | null; // stored as string
  salaryDeductionMonthLimit: string | null; // stored as string
  serviceProvider?: { id: number; companyName?: string | null } | null;
  company?: { id: number; companyName?: string | null } | null;
  branches?: { id: number; branchName?: string | null } | null;
  createdAt?: string;
};

type SP = { id: number; companyName?: string | null };
type CO = { id: number; companyName?: string | null };
type BR = { id: number; branchName?: string | null };

// ---- API endpoints ----
const API = {
  deduction: "http://localhost:8000/salary-deduction",
  serviceProviders: "http://localhost:8000/service-provider",
  companies: "http://localhost:8000/company",
  branches: "http://localhost:8000/branches",
};

const MIN_CHARS = 1;

export function SalaryDeductionsManagement() {
  const [deductions, setDeductions] = useState<SalaryDeduction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<SalaryDeduction | null>(null);

  // ---- Form state: store IDs + autocomplete strings + fields ----
  const [formData, setFormData] = useState({
    serviceProviderID: null as number | null,
    companyID: null as number | null,
    branchesID: null as number | null,
    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",
    deductionName: "",
    deductionType: "Fixed" as "Fixed" | "Percentage",
    value: 0,
    perMonthLimit: 0,
  });

  // ---- Autocomplete lists/flags + refs for click-outside ----
  const [spList, setSpList] = useState<SP[]>([]);
  const [coList, setCoList] = useState<CO[]>([]);
  const [brList, setBrList] = useState<BR[]>([]);
  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [brLoading, setBrLoading] = useState(false);

  const spRef = useRef<HTMLDivElement | null>(null);
  const coRef = useRef<HTMLDivElement | null>(null);
  const brRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node;
      if (spRef.current && !spRef.current.contains(t)) setSpList([]);
      if (coRef.current && !coRef.current.contains(t)) setCoList([]);
      if (brRef.current && !brRef.current.contains(t)) setBrList([]);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---- Initial load ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API.deduction);
        const data: ApiSalaryDeduction[] = await res.json();
        setDeductions(data.map(mapApiToUi));
      } catch (e) {
        console.error("Failed to load salary deductions", e);
      }
    })();
  }, []);

  // ---- Helpers ----
  function safeNum(v: string | null | undefined, d = 0) {
    const n = parseFloat(v ?? "");
    return Number.isFinite(n) ? n : d;
  }

  function mapApiToUi(x: ApiSalaryDeduction): SalaryDeduction {
    return {
      id: String(x.id),
      serviceProvider: x.serviceProvider?.companyName ?? "-",
      companyName: x.company?.companyName ?? "-",
      branchName: x.branches?.branchName ?? "-",
      deductionName: x.salaryDeductionName ?? "-",
      deductionType:
        ((x.salaryDeductionType ?? "Fixed") === "Percentage" ? "Percentage" : "Fixed") as
          | "Fixed"
          | "Percentage",
      value: safeNum(x.salaryDeductionValue, 0),
      perMonthLimit: safeNum(x.salaryDeductionMonthLimit, 0),
      createdAt: x.createdAt ? x.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
    };
  }

  function mapUiToPayload(fd: typeof formData) {
    return {
      serviceProviderID: fd.serviceProviderID,
      companyID: fd.companyID,
      branchesID: fd.branchesID,
      salaryDeductionName: fd.deductionName,
      salaryDeductionType: fd.deductionType, // store as string
      salaryDeductionValue: String(fd.value ?? 0),
      salaryDeductionMonthLimit: String(fd.perMonthLimit ?? 0),
    };
  }

  async function robustGet(url: string, q?: string) {
    try {
      const res = await fetch(q ? `${url}?q=${encodeURIComponent(q)}` : url);
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    } catch {
      const res2 = await fetch(url);
      if (!res2.ok) throw new Error(String(res2.status));
      return res2.json();
    }
  }

  // ---- Debounced FK fetchers ----
  const runFetchSP = debounce(async (val: string) => {
    if (!val || val.length < MIN_CHARS) return setSpList([]);
    setSpLoading(true);
    try {
      const list: SP[] = await robustGet(API.serviceProviders, val);
      const filtered = list.filter((x) => (x.companyName ?? "").toLowerCase().includes(val.toLowerCase()));
      setSpList(filtered.slice(0, 50));
    } catch (e) {
      console.error("SP fetch error", e);
      setSpList([]);
    } finally {
      setSpLoading(false);
    }
  }, 250);

  const runFetchCO = debounce(async (val: string) => {
    if (!val || val.length < MIN_CHARS) return setCoList([]);
    setCoLoading(true);
    try {
      const list: CO[] = await robustGet(API.companies, val);
      const filtered = list.filter((x) => (x.companyName ?? "").toLowerCase().includes(val.toLowerCase()));
      setCoList(filtered.slice(0, 50));
    } catch (e) {
      console.error("CO fetch error", e);
      setCoList([]);
    } finally {
      setCoLoading(false);
    }
  }, 250);

  const runFetchBR = debounce(async (val: string) => {
    if (!val || val.length < MIN_CHARS) return setBrList([]);
    setBrLoading(true);
    try {
      const list: BR[] = await robustGet(API.branches, val);
      const filtered = list.filter((x) => (x.branchName ?? "").toLowerCase().includes(val.toLowerCase()));
      setBrList(filtered.slice(0, 50));
    } catch (e) {
      console.error("BR fetch error", e);
      setBrList([]);
    } finally {
      setBrLoading(false);
    }
  }, 250);

  // ---- CRUD ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = mapUiToPayload(formData);

    try {
      if (editingDeduction) {
        const res = await fetch(`${API.deduction}/${editingDeduction.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const updated: ApiSalaryDeduction = await res.json();
        setDeductions((prev) => prev.map((d) => (d.id === String(updated.id) ? mapApiToUi(updated) : d)));
      } else {
        const res = await fetch(API.deduction, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created: ApiSalaryDeduction = await res.json();
        setDeductions((prev) => [mapApiToUi(created), ...prev]);
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleEdit = (deduction: SalaryDeduction) => {
    setFormData((p) => ({
      ...p,
      serviceProviderID: null,
      companyID: null,
      branchesID: null,
      spAutocomplete: deduction.serviceProvider || "",
      coAutocomplete: deduction.companyName || "",
      brAutocomplete: deduction.branchName || "",
      deductionName: deduction.deductionName,
      deductionType: deduction.deductionType,
      value: deduction.value,
      perMonthLimit: deduction.perMonthLimit,
    }));
    setEditingDeduction(deduction);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API.deduction}/${id}`, { method: "DELETE" });
      setDeductions((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const resetForm = () => {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchesID: null,
      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",
      deductionName: "",
      deductionType: "Fixed",
      value: 0,
      perMonthLimit: 0,
    });
    setEditingDeduction(null);
    setSpList([]);
    setCoList([]);
    setBrList([]);
  };

  const filteredDeductions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return deductions.filter(
      (d) =>
        d.deductionName.toLowerCase().includes(q) ||
        d.serviceProvider.toLowerCase().includes(q) ||
        d.companyName.toLowerCase().includes(q) ||
        d.branchName.toLowerCase().includes(q)
    );
  }, [deductions, searchTerm]);

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Salary Deductions</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage salary deductions and withholdings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Salary Deduction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDeduction ? "Edit Salary Deduction" : "Add New Salary Deduction"}
              </DialogTitle>
              <DialogDescription>
                {editingDeduction
                  ? "Update the salary deduction information below."
                  : "Fill in the details to add a new salary deduction."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-3 gap-4">
                {/* Service Provider Autocomplete */}
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

                {/* Company Autocomplete */}
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

                {/* Branch Autocomplete */}
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

              <div className="space-y-2">
                <Label htmlFor="deductionName">Deduction Name *</Label>
                <Input
                  id="deductionName"
                  value={formData.deductionName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deductionName: e.target.value }))}
                  placeholder="Enter deduction name"
                  required
                />
              </div>

              {/* Deduction Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deduction Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="deductionType">Deduction Type *</Label>
                  <select
                    id="deductionType"
                    value={formData.deductionType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, deductionType: e.target.value as "Fixed" | "Percentage" }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">
                        {formData.deductionType === "Percentage" ? "%" : "₹"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.deductionType === "Percentage"
                        ? "Percentage of base salary"
                        : "Fixed amount in currency"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perMonthLimit">Per Month Limit *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="perMonthLimit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.perMonthLimit}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            perMonthLimit: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">₹</span>
                    </div>
                    <p className="text-xs text-gray-500">Maximum deduction per month</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingDeduction ? "Update Salary Deduction" : "Add Salary Deduction"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search salary deductions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredDeductions.length} deductions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Deductions Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-minus" className="w-5 h-5" />
            Salary Deductions List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[120px]">Branch Name</TableHead>
                  <TableHead className="w-[150px]">Deduction Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Value</TableHead>
                  <TableHead className="w-[120px]">Per Month Limit</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeductions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-minus" className="w-12 h-12 text-gray-300" />
                        <p>No salary deductions found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeductions.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell className="whitespace-nowrap">{deduction.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{deduction.deductionName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={deduction.deductionType === "Fixed" ? "default" : "secondary"}>
                          {deduction.deductionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {deduction.deductionType === "Percentage" ? `${deduction.value}%` : `₹${deduction.value}`}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{deduction.perMonthLimit}</TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(deduction)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deduction.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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

/** simple debounce */
function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
