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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

// ---------------------------
// Types aligned to backend
// ---------------------------
type ID = number;

interface ContractorRead {
  id: ID;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;

  contractorName?: string | null;
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
  financialYearStart?: string | null;
  contactNo?: string | null;
  emailAdd?: string | null;
  companyLogoUrl?: string | null;
  SignatureUrl?: string | null;
  createdAt?: string | null;

  // optional nested (if your backend includes them)
  serviceProvider?: { id: ID; companyName?: string | null } | null;
  company?: { id: ID; companyName?: string | null } | null;
  branches?: { id: ID; branchName?: string | null } | null;

  // fallback denormalized names (if your API returns them)
  serviceProviderName?: string | null;
  companyName?: string | null;
  branchName?: string | null;
}

interface ServiceProvider {
  id: ID;
  companyName: string;
}
interface Company {
  id: ID;
  companyName: string;
}
interface Branch {
  id: ID;
  branchName: string;
}

// ---------------------------
// Config & helpers
// ---------------------------
const API = {
  contractors: "http://192.168.29.225:8000/contractors",
  serviceProviders: "http://192.168.29.225:8000/service-provider",
  companies: "http://192.168.29.225:8000/company",
  branches: "http://192.168.29.225:8000/branches",
  upload: "http://192.168.29.225:8000/files/upload",
};

const MIN_CHARS = 1;
const DEBOUNCE_MS = 250;

async function fetchJSONSafe<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const raw = await res.json();
  return (raw?.data ?? raw) as T;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(API.upload, { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  // return absolute URL if backend returns relative
  return data.url?.startsWith("http") ? data.url : `http://192.168.29.225:8000${data.url}`;
}

// ---------------------------
// Component
// ---------------------------
export function ContractorManagement() {
  // Data
  const [rows, setRows] = useState<ContractorRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [editing, setEditing] = useState<ContractorRead | null>(null);
  const [viewRow, setViewRow] = useState<ContractorRead | null>(null);

  // Suggestions state/refs
  const spRef = useRef<HTMLDivElement>(null);
  const coRef = useRef<HTMLDivElement>(null);
  const brRef = useRef<HTMLDivElement>(null);

  const [spList, setSpList] = useState<ServiceProvider[]>([]);
  const [coList, setCoList] = useState<Company[]>([]);
  const [brList, setBrList] = useState<Branch[]>([]);
  const [spLoading, setSpLoading] = useState(false);
  const [coLoading, setCoLoading] = useState(false);
  const [brLoading, setBrLoading] = useState(false);

  const spAbortRef = useRef<AbortController | null>(null);
  const coAbortRef = useRef<AbortController | null>(null);
  const brAbortRef = useRef<AbortController | null>(null);

  const spTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const brTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Files (optional uploads)
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceProviderID: null as ID | null,
    companyID: null as ID | null,
    branchesID: null as ID | null,

    contractorName: "",
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
    financialYearStart: "",
    contactNo: "",
    emailAdd: "",
    companyLogoUrl: "",
    SignatureUrl: "",

    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",
  });

  // ---------------------------
  // Load contractors
  // ---------------------------
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await fetchJSONSafe<ContractorRead[]>(API.contractors);
      setRows(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load contractors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
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

  const runFetchBranches = (query: string) => {
    if (brTimerRef.current) clearTimeout(brTimerRef.current);
    brTimerRef.current = setTimeout(async () => {
      if (query.length < MIN_CHARS) {
        setBrList([]);
        return;
      }
      if (brAbortRef.current) brAbortRef.current.abort();
      const ctrl = new AbortController();
      brAbortRef.current = ctrl;
      setBrLoading(true);
      try {
        const all = await fetchJSONSafe<Branch[]>(API.branches, ctrl.signal);
        const filtered = (all || []).filter(b =>
          (b.branchName ?? "").toLowerCase().includes(query.toLowerCase())
        );
        setBrList(filtered.slice(0, 20));
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error("Branches fetch error:", e);
      } finally {
        setBrLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  // Close suggestion popovers on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (spRef.current && !spRef.current.contains(e.target as any)) setSpList([]);
      if (coRef.current && !coRef.current.contains(e.target as any)) setCoList([]);
      if (brRef.current && !brRef.current.contains(e.target as any)) setBrList([]);
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
      spAbortRef.current?.abort();
      coAbortRef.current?.abort();
      brAbortRef.current?.abort();
    };
  }, []);

  // ---------------------------
  // Form helpers
  // ---------------------------
  const resetForm = () => {
    setFormData({
      serviceProviderID: null,
      companyID: null,
      branchesID: null,

      contractorName: "",
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
      financialYearStart: "",
      contactNo: "",
      emailAdd: "",
      companyLogoUrl: "",
      SignatureUrl: "",

      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",
    });
    setLogoFile(null);
    setSignatureFile(null);
    setEditing(null);
    setSpList([]);
    setCoList([]);
    setBrList([]);
    setError(null);
  };

  const handleEdit = (r: ContractorRead) => {
    setEditing(r);
    setFormData({
      serviceProviderID: r.serviceProviderID ?? r.serviceProvider?.id ?? null,
      companyID: r.companyID ?? r.company?.id ?? null,
      branchesID: r.branchesID ?? r.branches?.id ?? null,

      contractorName: r.contractorName ?? "",
      address: r.address ?? "",
      country: r.country ?? "",
      state: r.state ?? "",
      timeZone: r.timeZone ?? "",
      currency: r.currency ?? "",
      pfNo: r.pfNo ?? "",
      tanNo: r.tanNo ?? "",
      esiNo: r.esiNo ?? "",
      linNo: r.linNo ?? "",
      gstNo: r.gstNo ?? "",
      shopRegNo: r.shopRegNo ?? "",
      financialYearStart: r.financialYearStart ?? "",
      contactNo: r.contactNo ?? "",
      emailAdd: r.emailAdd ?? "",
      companyLogoUrl: r.companyLogoUrl ?? "",
      SignatureUrl: r.SignatureUrl ?? "",

      spAutocomplete: r.serviceProvider?.companyName ?? r.serviceProviderName ?? "",
      coAutocomplete: r.company?.companyName ?? r.companyName ?? "",
      brAutocomplete: r.branches?.branchName ?? r.branchName ?? "",
    });
    setLogoFile(null);
    setSignatureFile(null);
    setIsDialogOpen(true);
  };

  const handleView = (r: ContractorRead) => {
    setViewRow(r);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: ID) => {
    if (!confirm("Delete this contractor?")) return;
    try {
      const res = await fetch(`${API.contractors}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await fetchRows();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    }
  };

  // ---------------------------
  // Submit (Create/Update)
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // upload files if chosen
      let logoUrl = formData.companyLogoUrl || "";
      let sigUrl = formData.SignatureUrl || "";
      if (logoFile) logoUrl = await uploadFile(logoFile);
      if (signatureFile) sigUrl = await uploadFile(signatureFile);

      const payload: any = {
        serviceProviderID: formData.serviceProviderID ?? undefined,
        companyID: formData.companyID ?? undefined,
        branchesID: formData.branchesID ?? undefined,

        contractorName: formData.contractorName || undefined,
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
        financialYearStart: formData.financialYearStart || undefined,
        contactNo: formData.contactNo || undefined,
        emailAdd: formData.emailAdd || undefined,
        companyLogoUrl: logoUrl || undefined,
        SignatureUrl: sigUrl || undefined,
      };

      if (editing) {
        const res = await fetch(`${API.contractors}/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(API.contractors, {
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

  // ---------------------------
  // Search
  // ---------------------------
  const filtered = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return rows;
    const spNameOf = (r: ContractorRead) => r.serviceProvider?.companyName ?? r.serviceProviderName ?? "";
    const coNameOf = (r: ContractorRead) => r.company?.companyName ?? r.companyName ?? "";
    const brNameOf = (r: ContractorRead) => r.branches?.branchName ?? r.branchName ?? "";
    return rows.filter((r) =>
      [
        r.contractorName,
        r.address,
        r.country,
        r.state,
        r.timeZone,
        r.currency,
        r.contactNo,
        r.emailAdd,
        r.gstNo,
        spNameOf(r),
        coNameOf(r),
        brNameOf(r),
      ]
        .filter(Boolean)
        .map((x) => (x ?? "").toLowerCase())
        .some((f) => f.includes(t))
    );
  }, [rows, searchTerm]);

  // ---------------------------
  // Helpers for table names
  // ---------------------------
  const spName = (r: ContractorRead) => r.serviceProvider?.companyName ?? r.serviceProviderName ?? "—";
  const coName = (r: ContractorRead) => r.company?.companyName ?? r.companyName ?? "—";
  const brName = (r: ContractorRead) => r.branches?.branchName ?? r.branchName ?? "—";

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage contractor records</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" /> Add Contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Contractor" : "Add New Contractor"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update contractor details below." : "Fill in details to add a new contractor."}
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
  onFocus={() => {
    // Only show suggestions on focus if no selection yet
    if (!formData.serviceProviderID && formData.spAutocomplete.length >= MIN_CHARS) {
      runFetchServiceProviders(formData.spAutocomplete);
    }
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

              {/* Branch Autocomplete */}
              <div ref={brRef} className="space-y-2 relative">
                <Label>Branch *</Label>
                <Input
                  value={formData.brAutocomplete}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((p) => ({ ...p, brAutocomplete: val, branchesID: null }));
                    runFetchBranches(val);
                  }}
                  onFocus={(e) => {
                    const val = e.target.value;
                    if (val.length >= MIN_CHARS) runFetchBranches(val);
                  }}
                  placeholder="Start typing branch..."
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
                            brAutocomplete: br.branchName,
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

              {/* Core fields */}
              <div className="space-y-2">
                <Label>Contractor Name</Label>
                <Input
                  value={formData.contractorName}
                  onChange={(e) => setFormData((p) => ({ ...p, contractorName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>PF No</Label><Input value={formData.pfNo} onChange={(e) => setFormData((p) => ({ ...p, pfNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>TAN No</Label><Input value={formData.tanNo} onChange={(e) => setFormData((p) => ({ ...p, tanNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>ESI No</Label><Input value={formData.esiNo} onChange={(e) => setFormData((p) => ({ ...p, esiNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>LIN No</Label><Input value={formData.linNo} onChange={(e) => setFormData((p) => ({ ...p, linNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>GST No</Label><Input value={formData.gstNo} onChange={(e) => setFormData((p) => ({ ...p, gstNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Shop Reg No</Label><Input value={formData.shopRegNo} onChange={(e) => setFormData((p) => ({ ...p, shopRegNo: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label>Financial Year Start</Label>
                <Input type="date" value={formData.financialYearStart} onChange={(e) => setFormData((p) => ({ ...p, financialYearStart: e.target.value }))} />
              </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={formData.contactNo} onChange={(e) => setFormData((p) => ({ ...p, contactNo: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={formData.emailAdd} onChange={(e) => setFormData((p) => ({ ...p, emailAdd: e.target.value }))} />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste logo URL or use Browse"
                      value={formData.companyLogoUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, companyLogoUrl: e.target.value }))}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Signature Upload</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste signature URL or use Browse"
                      value={formData.SignatureUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, SignatureUrl: e.target.value }))}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Contractor" : "Add Contractor"}
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
            <DialogTitle>Contractor Details</DialogTitle>
            <DialogDescription>Read-only details</DialogDescription>
          </DialogHeader>
          {viewRow && (
            <div className="space-y-3">
              <p><strong>Name:</strong> {viewRow.contractorName || "—"}</p>
              <p><strong>Address:</strong> {viewRow.address || "—"}</p>
              <p><strong>Country:</strong> {viewRow.country || "—"}</p>
              <p><strong>State:</strong> {viewRow.state || "—"}</p>
              <p><strong>TimeZone:</strong> {viewRow.timeZone || "—"}</p>
              <p><strong>Currency:</strong> {viewRow.currency || "—"}</p>
              <p><strong>PF:</strong> {viewRow.pfNo || "—"}</p>
              <p><strong>TAN:</strong> {viewRow.tanNo || "—"}</p>
              <p><strong>ESI:</strong> {viewRow.esiNo || "—"}</p>
              <p><strong>LIN:</strong> {viewRow.linNo || "—"}</p>
              <p><strong>GST:</strong> {viewRow.gstNo || "—"}</p>
              <p><strong>Shop Reg:</strong> {viewRow.shopRegNo || "—"}</p>
              <p><strong>FY Start:</strong> {viewRow.financialYearStart || "—"}</p>
              <p><strong>Contact:</strong> {viewRow.contactNo || "—"}</p>
              <p><strong>Email:</strong> {viewRow.emailAdd || "—"}</p>
              {viewRow.companyLogoUrl && <p><strong>Logo:</strong> <a className="text-blue-600 underline" href={viewRow.companyLogoUrl} target="_blank">Open</a></p>}
              {viewRow.SignatureUrl && <p><strong>Signature:</strong> <a className="text-blue-600 underline" href={viewRow.SignatureUrl} target="_blank">Open</a></p>}
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
              placeholder="Search contractors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
            {filtered.length} contractors
          </Badge>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-hard-hat" className="w-5 h-5" /> Contractor List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-300" />
                        <p>No contractors found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{r.contractorName || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{spName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{coName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{brName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.emailAdd || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.contactNo || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{r.gstNo || "—"}</TableCell>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
