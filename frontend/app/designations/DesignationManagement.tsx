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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

// ---------------------------
// Types aligned to backend
// ---------------------------
type ID = number;

interface DesignationRead {
  id: ID;
  serviceProviderID?: ID | null;
  companyID?: ID | null;
  branchesID?: ID | null;
  designantion?: string | null;        // <- matches your prisma field spelling
  createdAt?: string | null;

  // optional nested if API includes them
  serviceProvider?: { id: ID; companyName?: string | null } | null;
  company?: { id: ID; companyName?: string | null } | null;
  branches?: { id: ID; branchName?: string | null } | null;

  // optional denormalized name fallbacks
  serviceProviderName?: string | null;
  companyName?: string | null;
  branchName?: string | null;
}

interface ServiceProvider { id: ID; companyName: string; }
interface Company { id: ID; companyName: string; }
interface Branch { id: ID; branchName: string; }

// ---------------------------
/* Config & helpers */
// ---------------------------
const API = {
  designations: "http://localhost:8000/designations",
  serviceProviders: "http://localhost:8000/service-provider",
  companies: "http://localhost:8000/company",
  branches: "http://localhost:8000/branches",
};

const MIN_CHARS = 1;
const DEBOUNCE_MS = 250;

async function fetchJSONSafe<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const raw = await res.json();
  return (raw?.data ?? raw) as T;
}

// ---------------------------
// Component
// ---------------------------
export function DesignationManagement() {
  // Data
  const [rows, setRows] = useState<DesignationRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [editing, setEditing] = useState<DesignationRead | null>(null);
  const [viewRow, setViewRow] = useState<DesignationRead | null>(null);

  // Suggestions refs/state
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

  // lookup maps (fallback names if API doesn’t include relations)
  const [spMap, setSpMap] = useState<Record<number, string>>({});
  const [coMap, setCoMap] = useState<Record<number, string>>({});
  const [brMap, setBrMap] = useState<Record<number, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    serviceProviderID: null as ID | null,
    companyID: null as ID | null,
    branchesID: null as ID | null,

    designantion: "",

    spAutocomplete: "",
    coAutocomplete: "",
    brAutocomplete: "",
  });

  // ---------------------------
  // Load data + lookups
  // ---------------------------
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await fetchJSONSafe<DesignationRead[]>(API.designations);
      setRows(data ?? []);
    } catch (e: any) {
      setError(e?.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  async function fetchLookups() {
    const [sps, cos, brs] = await Promise.all([
      fetchJSONSafe<ServiceProvider[]>(API.serviceProviders),
      fetchJSONSafe<Company[]>(API.companies),
      fetchJSONSafe<Branch[]>(API.branches),
    ]);
    setSpMap(Object.fromEntries((sps || []).map(s => [s.id, s.companyName ?? ""])));
    setCoMap(Object.fromEntries((cos || []).map(c => [c.id, c.companyName ?? "" ])));
    setBrMap(Object.fromEntries((brs || []).map(b => [b.id, b.branchName ?? "" ])));
  }

  useEffect(() => {
    fetchRows();
    fetchLookups();
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
      designantion: "",
      spAutocomplete: "",
      coAutocomplete: "",
      brAutocomplete: "",
    });
    setEditing(null);
    setSpList([]);
    setCoList([]);
    setBrList([]);
    setError(null);
  };

  const handleEdit = (r: DesignationRead) => {
    setEditing(r);
    setFormData({
      serviceProviderID: r.serviceProviderID ?? r.serviceProvider?.id ?? null,
      companyID: r.companyID ?? r.company?.id ?? null,
      branchesID: r.branchesID ?? r.branches?.id ?? null,

      designantion: r.designantion ?? "",

      spAutocomplete: r.serviceProvider?.companyName
        ?? r.serviceProviderName
        ?? (r.serviceProviderID != null ? spMap[r.serviceProviderID] ?? "" : ""),

      coAutocomplete: r.company?.companyName
        ?? r.companyName
        ?? (r.companyID != null ? coMap[r.companyID] ?? "" : ""),

      brAutocomplete: r.branches?.branchName
        ?? r.branchName
        ?? (r.branchesID != null ? brMap[r.branchesID] ?? "" : ""),
    });
    setIsDialogOpen(true);
  };

  const handleView = (r: DesignationRead) => {
    setViewRow(r);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (id: ID) => {
    if (!confirm("Delete this designation?")) return;
    try {
      const res = await fetch(`${API.designations}/${id}`, { method: "DELETE" });
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

    const payload: any = {
      serviceProviderID: formData.serviceProviderID ?? undefined,
      companyID: formData.companyID ?? undefined,
      branchesID: formData.branchesID ?? undefined,
      designantion: formData.designantion || undefined,
    };

    try {
      if (editing) {
        const res = await fetch(`${API.designations}/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        const res = await fetch(API.designations, {
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
    const spNameOf = (r: DesignationRead) =>
      r.serviceProvider?.companyName ?? r.serviceProviderName ?? (r.serviceProviderID != null ? spMap[r.serviceProviderID] : "");
    const coNameOf = (r: DesignationRead) =>
      r.company?.companyName ?? r.companyName ?? (r.companyID != null ? coMap[r.companyID] : "");
    const brNameOf = (r: DesignationRead) =>
      r.branches?.branchName ?? r.branchName ?? (r.branchesID != null ? brMap[r.branchesID] : "");
    return rows.filter((r) =>
      [
        r.designantion,
        spNameOf(r),
        coNameOf(r),
        brNameOf(r),
      ]
        .filter(Boolean)
        .map((x) => (x ?? "").toLowerCase())
        .some((f) => f.includes(t))
    );
  }, [rows, searchTerm, spMap, coMap, brMap]);

  // ---------------------------
  // Name helpers for table
  // ---------------------------
  const spName = (r: DesignationRead) =>
    r.serviceProvider?.companyName
    ?? r.serviceProviderName
    ?? (r.serviceProviderID != null ? (spMap[r.serviceProviderID] ?? "—") : "—");

  const coName = (r: DesignationRead) =>
    r.company?.companyName
    ?? r.companyName
    ?? (r.companyID != null ? (coMap[r.companyID] ?? "—") : "—");

  const brName = (r: DesignationRead) =>
    r.branches?.branchName
    ?? r.branchName
    ?? (r.branchesID != null ? (brMap[r.branchesID] ?? "—") : "—");

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Designations</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage designation records</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" /> Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Designation" : "Add New Designation"}</DialogTitle>
              <DialogDescription>
                {editing ? "Update designation details below." : "Fill in details to add a new designation."}
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
                  onFocus={() => {
                    if (!formData.companyID && formData.coAutocomplete.length >= MIN_CHARS) {
                      runFetchCompanies(formData.coAutocomplete);
                    }
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
                  onFocus={() => {
                    if (!formData.branchesID && formData.brAutocomplete.length >= MIN_CHARS) {
                      runFetchBranches(formData.brAutocomplete);
                    }
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

              {/* Designation Name */}
              <div className="space-y-2">
                <Label>Designation *</Label>
                <Input
                  value={formData.designantion}
                  onChange={(e) => setFormData((p) => ({ ...p, designantion: e.target.value }))}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Designation" : "Add Designation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Designation Details</DialogTitle>
            <DialogDescription>Read-only details</DialogDescription>
          </DialogHeader>
          {viewRow && (
            <div className="space-y-3">
              <p><strong>Designation:</strong> {viewRow.designantion || "—"}</p>
              <p><strong>Service Provider:</strong> {spName(viewRow)}</p>
              <p><strong>Company:</strong> {coName(viewRow)}</p>
              <p><strong>Branch:</strong> {brName(viewRow)}</p>
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
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
            {filtered.length} designations
          </Badge>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:id-card" className="w-5 h-5" /> Designation List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Designation</TableHead>
                  <TableHead>Service Provider</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-300" />
                        <p>No designations found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{r.designantion || "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">{spName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{coName(r)}</TableCell>
                      <TableCell className="whitespace-nowrap">{brName(r)}</TableCell>
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
