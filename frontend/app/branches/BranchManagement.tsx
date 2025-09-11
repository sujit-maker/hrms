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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

// ---------------------------
// Types aligned to backend
// ---------------------------
type ID = number;

interface BankDetailRead {
  id: ID;
  bankName?: string | null;
  bankBranchName?: string | null;
  accountNo?: string | null;
  ifscCode?: string | null;
}

interface BankDetailForm {
  id?: ID;            // present for existing rows
  _localId: string;   // for React key handling
  bankName: string;
  branchName: string; // UI label maps to bankBranchName
  accountNo: string;
  ifscCode: string;
}

interface BranchRead {
  id: ID;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchName?: string | null;
  address?: string | null;
  country?: string | null;
  state?: string | null;
  timeZone?: string | null;
  currency?: string | null;
  pfNo?: string | null;
  tanNo?: string | null;
  esiNo?: string | null;
  linNo?: string | null;
  gstNo?: string | null;
  shopRegNo?: string | null;
  contactNo?: string | null;
  emailAdd?: string | null;
  companyLogoUrl?: string | null;
  SignatureUrl?: string | null;
  financialYearStart?: string | null;
  createdAt?: string | null;
  bankDetails?: BankDetailRead[];
}

interface ServiceProvider {
  id: ID;
  companyName: string; // using companyName as you asked
}

interface Company {
  id: ID;
  companyName: string;
}

// ---------------------------
// Config & helpers
// ---------------------------
const API = {
  branches: "http://localhost:8000/branches",
  serviceProviders: "http://localhost:8000/service-provider",
  companies: "http://localhost:8000/company",
};

const MIN_CHARS = 1;
const DEBOUNCE_MS = 250;

const uid = () => Math.random().toString(36).slice(2, 10);

async function fetchJSONSafe<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const raw = await res.json();
  return (raw?.data ?? raw) as T; // handle { data: [...] } or [...]
}

// ---------------------------
// Component
// ---------------------------
export function BranchManagement() {
  // Data
  const [branches, setBranches] = useState<BranchRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [editingBranch, setEditingBranch] = useState<BranchRead | null>(null);
  const [viewBranch, setViewBranch] = useState<BranchRead | null>(null);

  // Suggestions state/refs
  const spRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<HTMLDivElement>(null);

  const [spList, setSpList] = useState<ServiceProvider[]>([]);
  const [coList, setCoList] = useState<Company[]>([]);
  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const spAbortRef = useRef<AbortController | null>(null);
  const coAbortRef = useRef<AbortController | null>(null);
  const spTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const [logoFile, setLogoFile] = useState<File | null>(null);
const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceProviderID: null as ID | null,
    companyID: null as ID | null,

    branchName: "",
    address: "",
    country: "",
    state: "",
    timeZone: "",
    currency: "",
    pfNo: "",
    tanNo: "",
    esiNo: "",
    linNo: "",
    gstNo: "",
    shopRegNo: "",
    contactNo: "",
    emailAdd: "",
    companyLogoUrl: "",
    SignatureUrl: "",
    financialYearStart: "",

    spAutocomplete: "",
    coAutocomplete: "",

    bankDetailsForm: [] as BankDetailForm[],
  });

  // Track original bank IDs on edit to compute deletions
  const [originalBankIds, setOriginalBankIds] = useState<ID[]>([]);

  // ---------------------------
  // Load branches
  // ---------------------------
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await fetchJSONSafe<BranchRead[]>(API.branches);
      setBranches(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ---------------------------
  // Debounced suggestions
  // ---------------------------
  const runFetchServiceProviders = (query: string) => {
    if (spTimerRef.current) clearTimeout(spTimerRef.current);
    spTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) {
        setSpList([]);
        return;
      }
      if (spAbortRef.current) spAbortRef.current.abort();
      const ctrl = new AbortController();
      spAbortRef.current = ctrl;
      setSpLoading(true);
      try {
        const all = await fetchJSONSafe<ServiceProvider[]>(API.serviceProviders, ctrl.signal);
        const filtered = (all || []).filter(sp =>
          (sp.companyName ?? "").toLowerCase().includes(query.toLowerCase())
        );
        setSpList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("SP fetch error:", e);
      } finally {
        setSpLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const runFetchCompanies = (query: string) => {
    if (coTimerRef.current) clearTimeout(coTimerRef.current);
    coTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) {
        setCoList([]);
        return;
      }
      if (coAbortRef.current) coAbortRef.current.abort();
      const ctrl = new AbortController();
      coAbortRef.current = ctrl;
      setCoLoading(true);
      try {
        const all = await fetchJSONSafe<Company[]>(API.companies, ctrl.signal);
        const filtered = (all || []).filter(c =>
          (c.companyName ?? "").toLowerCase().includes(query.toLowerCase())
        );
        setCoList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("Company fetch error:", e);
      } finally {
        setCoLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  // Close suggestion popovers on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (spRef.current && !spRef.current.contains(e.target as any)) setSpList([]);
      if (coRef.current && !coRef.current.contains(e.target as any)) setCoList([]);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Cleanup timers/aborts on unmount
  useEffect(() => {
    return () => {
      if (spTimerRef.current) clearTimeout(spTimerRef.current);
      if (coTimerRef.current) clearTimeout(coTimerRef.current);
      spAbortRef.current?.abort();
      coAbortRef.current?.abort();
    };
  }, []);

  // ---------------------------
  // Form helpers
  // ---------------------------
  const resetForm = () => {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchName: "",
      address: "",
      country: "",
      state: "",
      timeZone: "",
      currency: "",
      pfNo: "",
      tanNo: "",
      esiNo: "",
      linNo: "",
      gstNo: "",
      shopRegNo: "",
      contactNo: "",
      emailAdd: "",
      companyLogoUrl: "",
      SignatureUrl: "",
      financialYearStart: "",
      spAutocomplete: "",
      coAutocomplete: "",
      bankDetailsForm: [],
    });
    setOriginalBankIds([]);
    setEditingBranch(null);
    setSpList([]);
    setCoList([]);
    setError(null);
  };

  const addBankDetail = () => {
    setFormData((p) => ({
      ...p,
      bankDetailsForm: [
        ...p.bankDetailsForm,
        {
          _localId: uid(),
          bankName: "",
          branchName: "",
          accountNo: "",
          ifscCode: "",
        },
      ],
    }));
  };

  const removeBankDetail = (localId: string) => {
    setFormData((p) => ({
      ...p,
      bankDetailsForm: p.bankDetailsForm.filter((x) => x._localId !== localId),
    }));
  };

  const updateBankDetail = (localId: string, key: keyof BankDetailForm, val: string) => {
    setFormData((p) => ({
      ...p,
      bankDetailsForm: p.bankDetailsForm.map((x) =>
        x._localId === localId ? { ...x, [key]: val } : x
      ),
    }));
  };

  // ---------------------------
  // CRUD submit
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // map UI bankDetails to API shape
    const apiBankDetails = formData.bankDetailsForm.map((b) => ({
      id: b.id, // present for existing rows
      bankName: b.bankName || undefined,
      bankBranchName: b.branchName || undefined,
      accountNo: b.accountNo || undefined,
      ifscCode: b.ifscCode || undefined,
    }));

    // compute deletions (only in edit mode)
    const remainingIds = new Set(apiBankDetails.filter(x => x.id != null).map(x => x.id as number));
    const idsToDelete = editingBranch
      ? originalBankIds.filter(id => !remainingIds.has(id))
      : [];

    const payload: any = {
      serviceProviderID: formData.serviceProviderID ?? undefined,
      companyID: formData.companyID ?? undefined,

      branchName: formData.branchName || undefined,
      address: formData.address || undefined,
      country: formData.country || undefined,
      state: formData.state || undefined,
      timeZone: formData.timeZone || undefined,
      currency: formData.currency || undefined,
      pfNo: formData.pfNo || undefined,
      tanNo: formData.tanNo || undefined,
      esiNo: formData.esiNo || undefined,
      linNo: formData.linNo || undefined,
      gstNo: formData.gstNo || undefined,
      shopRegNo: formData.shopRegNo || undefined,
      contactNo: formData.contactNo || undefined,
      emailAdd: formData.emailAdd || undefined,
      companyLogoUrl: formData.companyLogoUrl || undefined,
      SignatureUrl: formData.SignatureUrl || undefined,
      financialYearStart: formData.financialYearStart || undefined,

      bankDetails: apiBankDetails,
      ...(idsToDelete.length ? { idsToDelete } : {}),
    };

    try {
      if (editingBranch) {
        const res = await fetch(`${API.branches}/${editingBranch.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(API.branches, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      }

      await fetchBranches();
      resetForm();
      setIsDialogOpen(false);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b: BranchRead) => {
    setEditingBranch(b);

    const bankDetailsForm: BankDetailForm[] = (b.bankDetails ?? []).map((bd) => ({
      id: bd.id,
      _localId: uid(),
      bankName: bd.bankName ?? "",
      branchName: bd.bankBranchName ?? "",
      accountNo: bd.accountNo ?? "",
      ifscCode: bd.ifscCode ?? "",
    }));

    setFormData({
      serviceProviderID: b.serviceProviderID ?? null,
      companyID: b.companyID ?? null,

      branchName: b.branchName ?? "",
      address: b.address ?? "",
      country: b.country ?? "",
      state: b.state ?? "",
      timeZone: b.timeZone ?? "",
      currency: b.currency ?? "",
      pfNo: b.pfNo ?? "",
      tanNo: b.tanNo ?? "",
      esiNo: b.esiNo ?? "",
      linNo: b.linNo ?? "",
      gstNo: b.gstNo ?? "",
      shopRegNo: b.shopRegNo ?? "",
      contactNo: b.contactNo ?? "",
      emailAdd: b.emailAdd ?? "",
      companyLogoUrl: b.companyLogoUrl ?? "",
      SignatureUrl: b.SignatureUrl ?? "",
      financialYearStart: b.financialYearStart ?? "",     

      spAutocomplete: "", // we fetch lists by typing; leave blank initially
      coAutocomplete: "",

      bankDetailsForm,
    });

    setOriginalBankIds(bankDetailsForm.filter(x => x.id != null).map(x => x.id!) );
    setIsDialogOpen(true);
  };

  const handleView = (b: BranchRead) => {
    setViewBranch(b);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: ID) => {
    if (!confirm("Delete this branch?")) return;
    try {
      const res = await fetch(`${API.branches}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await fetchBranches();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  };

  // ---------------------------
  // Search
  // ---------------------------
  const filteredBranches = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return branches;
    return branches.filter((b) =>
      [
        b.branchName,
        b.address,
        b.country,
        b.state,
        b.emailAdd,
        b.gstNo,
      ]
        .filter(Boolean)
        .map((x) => (x ?? "").toLowerCase())
        .some((f) => f.includes(t))
    );
  }, [branches, searchTerm]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage branch records</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" /> Add Branch
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBranch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
              <DialogDescription>
                {editingBranch ? "Update branch details below." : "Fill in details to add a new branch."}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Service Provider Autocomplete */}
              <div ref={spRef} className="space-y-2 relative">
                <Label>Service Provider *</Label>
                <Input
                  value={formData.spAutocomplete}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({ ...p, spAutocomplete: val, serviceProviderID: null }));
                    runFetchServiceProviders(val);
                  }}
                  onFocus={(e) => {
                    const val = e.target.value;
                    if (val.length >= MIN_CHARS) runFetchServiceProviders(val);
                  }}
                  placeholder="Start typing service provider..."
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
                            spAutocomplete: sp.companyName,
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
                    runFetchCompanies(val);
                  }}
                  onFocus={(e) => {
                    const val = e.target.value;
                    if (val.length >= MIN_CHARS) runFetchCompanies(val);
                  }}
                  placeholder="Start typing company..."
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
                            coAutocomplete: co.companyName,
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

              {/* Core fields */}
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  value={formData.branchName}
                  onChange={(e) => setFormData((p) => ({ ...p, branchName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Branch Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={formData.state} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Input value={formData.timeZone} onChange={(e) => setFormData((p) => ({ ...p, timeZone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={formData.currency} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>PF No</Label><Input value={formData.pfNo} onChange={(e) => setFormData((p) => ({ ...p, pfNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>TAN No</Label><Input value={formData.tanNo} onChange={(e) => setFormData((p) => ({ ...p, tanNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>ESI No</Label><Input value={formData.esiNo} onChange={(e) => setFormData((p) => ({ ...p, esiNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>LIN No</Label><Input value={formData.linNo} onChange={(e) => setFormData((p) => ({ ...p, linNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>GST No</Label><Input value={formData.gstNo} onChange={(e) => setFormData((p) => ({ ...p, gstNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Shop Registration Certificate No</Label><Input value={formData.shopRegNo} onChange={(e) => setFormData((p) => ({ ...p, shopRegNo: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={formData.contactNo} onChange={(e) => setFormData((p) => ({ ...p, contactNo: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={formData.emailAdd} onChange={(e) => setFormData((p) => ({ ...p, emailAdd: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                
                {/* Logo & Signature Upload */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Company Logo</Label>
    <Input
      type="file"
      accept="image/*"
      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
    />
    {logoFile && <p className="text-sm text-gray-500">{logoFile.name}</p>}
  </div>

  <div className="space-y-2">
    <Label>Signature Upload</Label>
    <Input
      type="file"
      accept="image/*"
      onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
    />
    {signatureFile && <p className="text-sm text-gray-500">{signatureFile.name}</p>}
  </div>
</div>

              </div>

              <div className="space-y-2">
                <Label>Financial Year Start</Label>
                <Input type="date" value={formData.financialYearStart} onChange={(e) => setFormData((p) => ({ ...p, financialYearStart: e.target.value }))} />
              </div>

        

              {/* Bank Details repeater */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Bank Details</h3>
                  <Button variant="outline" size="sm" type="button" onClick={addBankDetail}>
                    <Plus className="w-4 h-4 mr-1" /> Add Bank Detail
                  </Button>
                </div>

                {formData.bankDetailsForm.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                    <Icon icon="mdi:bank" className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No bank details added yet</p>
                    <p className="text-sm">Click "Add Bank Detail" to add bank information</p>
                  </div>
                ) : (
                  formData.bankDetailsForm.map((bank) => (
                    <div key={bank._localId} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Bank Detail</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBankDetail(bank._localId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon icon="mdi:close" className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input
                            value={bank.bankName}
                            onChange={(e) => updateBankDetail(bank._localId, "bankName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Branch Name</Label>
                          <Input
                            value={bank.branchName}
                            onChange={(e) => updateBankDetail(bank._localId, "branchName", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Account No</Label>
                          <Input
                            value={bank.accountNo}
                            onChange={(e) => updateBankDetail(bank._localId, "accountNo", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>IFSC Code</Label>
                          <Input
                            value={bank.ifscCode}
                            onChange={(e) => updateBankDetail(bank._localId, "ifscCode", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? "Saving..." : editingBranch ? "Update Branch" : "Add Branch"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Branch Details</DialogTitle>
            <DialogDescription>Read-only details</DialogDescription>
          </DialogHeader>
          {viewBranch && (
            <div className="space-y-3">
              <p><strong>Name:</strong> {viewBranch.branchName}</p>
              <p><strong>Address:</strong> {viewBranch.address}</p>
              <p><strong>Country:</strong> {viewBranch.country}</p>
              <p><strong>State:</strong> {viewBranch.state}</p>
              <p><strong>GST No:</strong> {viewBranch.gstNo}</p>
              <p><strong>Contact:</strong> {viewBranch.contactNo}</p>
              <p><strong>Email:</strong> {viewBranch.emailAdd}</p>
              <p><strong>Currency:</strong> {viewBranch.currency}</p>
              <p><strong>TimeZone:</strong> {viewBranch.timeZone}</p>
              <p><strong>PF:</strong> {viewBranch.pfNo}</p>
              <p><strong>TAN:</strong> {viewBranch.tanNo}</p>
              <p><strong>ESI:</strong> {viewBranch.esiNo}</p>
              <p><strong>LIN:</strong> {viewBranch.linNo}</p>
              <p><strong>Shop Reg:</strong> {viewBranch.shopRegNo}</p>
              {viewBranch.bankDetails && viewBranch.bankDetails.length > 0 && (
                <div>
                  <p className="font-semibold mt-2">Bank Accounts:</p>
                  <div className="mt-1 space-y-1 text-sm">
                    {viewBranch.bankDetails.map((bd) => (
                      <div key={bd.id} className="border rounded p-2">
                        <div><strong>{bd.bankName}</strong> — {bd.bankBranchName}</div>
                        <div>Acct: {bd.accountNo}</div>
                        <div>IFSC: {bd.ifscCode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <Card>
        <CardContent className="p-6 flex items-center space-x-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
            {filteredBranches.length} branches
          </Badge>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building-multiple" className="w-5 h-5" /> Branch List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-300" />
                        <p>No branches found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.branchName || "—"}</TableCell>
                      <TableCell>{b.country || "—"}</TableCell>
                      <TableCell>{b.state || "—"}</TableCell>
                      <TableCell>{b.emailAdd || "—"}</TableCell>
                      <TableCell>{b.contactNo || "—"}</TableCell>
                      <TableCell>{b.gstNo || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(b)} className="h-7 w-7 p-0" title="View">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(b)} className="h-7 w-7 p-0" title="Edit">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(b.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
