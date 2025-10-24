"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Search, Edit, Trash2, Check, X, Plus, PlusCircle, MinusCircle } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface ReimbursementItem {
  id?: number
  reimbursementType: string
  amount: string
  description: string
}

interface Reimbursement {
  id: string
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  manageEmployeeID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  employeeName?: string
  date: string
  // Header-level fields (optional for compatibility)
  reimbursementType?: string
  amount?: string
  description?: string
  status: string
  items?: ReimbursementItem[]
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

interface Company {
  id: number
  companyName: string
  financialYearStart: string
}

interface SalaryCycle {
  id: number
  monthStartDay: string
  companyID: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// ---------- Financial Year and Salary Period Logic ----------
const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function clampDay(d: number) {
  if (!Number.isFinite(d)) return 1;
  return Math.max(1, Math.min(28, Math.floor(d)));
}

/**
 * Build salary period labels based on FY start and cycle day
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

export function ReimbursementManagement() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Reimbursement | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [salaryCycles, setSalaryCycles] = useState<SalaryCycle[]>([])

  // Salary Period states
  const [selectedCompanyFYStart, setSelectedCompanyFYStart] = useState<string | null>(null)
  const [selectedCompanyStartDay, setSelectedCompanyStartDay] = useState<string>("1")
  const [salaryPeriodOptions, setSalaryPeriodOptions] = useState<string[]>([])

  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeName: "",
    date: "", // This will store the salary period string
    status: "Pending",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    manageEmployeeID: undefined as number | undefined,
  })

  const [items, setItems] = useState<ReimbursementItem[]>([
    { reimbursementType: "", amount: "", description: "" },
  ])

  // ---------- APIs ----------
  async function robustGet<T = any>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
  }
  
  async function robustFetch(url: string, init?: RequestInit) {
    const res = await fetch(url, init)
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json().catch(() => ({}))
  }

  const fetchServiceProviders = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/service-provider`)
    return data.filter((d) => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchCompanies = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/company`)
    return data.filter((d) => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchBranches = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/branches`)
    return data.filter((d) => (d.branchName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchEmployees = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/manage-emp`)
    return data.filter((d) => {
      const name = `${d.employeeFirstName || ""} ${d.employeeLastName || ""}`.trim().toLowerCase()
      return name.includes(q.toLowerCase()) || (d.employeeID || "").toLowerCase().includes(q.toLowerCase())
    })
  }

  // Load companies and salary cycles on component mount
  useEffect(() => {
    loadCompanies()
    loadSalaryCycles()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await robustGet<Company[]>(`${BACKEND_URL}/company`)
      setCompanies(data)
    } catch (error) {
      console.error("Failed to load companies:", error)
    }
  }

  const loadSalaryCycles = async () => {
    try {
      const data = await robustGet<SalaryCycle[]>(`${BACKEND_URL}/salary-cycle`)
      setSalaryCycles(data)
    } catch (error) {
      console.error("Failed to load salary cycles:", error)
    }
  }

  // ---------- Load ----------
  useEffect(() => { loadReimbursements() }, [])
  
  const loadReimbursements = async () => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/reimbursement`)
    setReimbursements(
      data.map((r) => ({
        id: String(r.id),
        serviceProviderID: r.serviceProviderID,
        companyID: r.companyID,
        branchesID: r.branchesID,
        manageEmployeeID: r.manageEmployeeID,
        serviceProvider: r.serviceProvider?.companyName || "",
        companyName: r.company?.companyName || "",
        branchName: r.branches?.branchName || "",
        employeeName: r.manageEmployee
          ? `${r.manageEmployee.employeeFirstName || ""} ${r.manageEmployee.employeeLastName || ""} (${r.manageEmployee.employeeID})`
          : "",
        date: r.date || "", // This will now contain the salary period string
        reimbursementType: r.reimbursementType || "",
        amount: r.amount || "",
        description: r.description || "",
        status: r.status || "Pending",
        items: Array.isArray(r.items)
          ? r.items.map((it: any) => ({
            id: it.id,
            reimbursementType: it.reimbursementType || "",
            amount: it.amount || "",
            description: it.description || "",
          }))
          : [],
      }))
    )
  }

  // ---------- Salary Period Handlers ----------
  const refreshSalaryPeriodOptions = async (companyId: number) => {
    try {
      // Get company financial year start
      const company = companies.find(c => c.id === companyId)
      const fyStart = company?.financialYearStart || "1st April"
      setSelectedCompanyFYStart(fyStart)

      // Get salary cycle for company
      const companySalaryCycles = salaryCycles.filter(sc => sc.companyID === companyId)
      const latestCycle = companySalaryCycles[0] // Get the first/latest cycle
      const startDay = latestCycle?.monthStartDay || "1"
      setSelectedCompanyStartDay(startDay)

      // Build period options
      const periodOptions = buildSalaryPeriodLabels(fyStart, startDay)
      setSalaryPeriodOptions(periodOptions)

      // Auto-select the first salary period option if available
      setFormData(prev => ({
        ...prev,
        date: periodOptions[0] || "" // Store in date field
      }))

    } catch (error) {
      console.error("Failed to refresh salary period options:", error)
      setSelectedCompanyFYStart(null)
      setSelectedCompanyStartDay("1")
      setSalaryPeriodOptions([])
      setFormData(prev => ({ ...prev, date: "" }))
    }
  }

  // ---------- Form handlers ----------
  const handleEmployeeSelect = (selected: SelectedItem) => {
    const emp = selected.item
    setFormData((p) => ({
      ...p,
      employeeName: selected.display,
      manageEmployeeID: selected.value,
    }))
  }

  const handleCompanySelect = (selected: SelectedItem) => {
    const company = selected.item
    setFormData((p) => ({
      ...p,
      companyName: selected.display,
      companyID: selected.value,
    }))
    
    // Refresh salary period options when company is selected
    if (selected.value) {
      refreshSalaryPeriodOptions(selected.value)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeName: "",
      date: "",
      status: "Pending",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      manageEmployeeID: undefined,
    })
    setItems([{ reimbursementType: "", amount: "", description: "" }])
    setEditing(null)
    setSelectedCompanyFYStart(null)
    setSelectedCompanyStartDay("1")
    setSalaryPeriodOptions([])
  }

  const addItemRow = () => setItems((p) => [...p, { reimbursementType: "", amount: "", description: "" }])
  const removeItemRow = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx))
  const updateItemRow = (idx: number, key: keyof ReimbursementItem, val: string) =>
    setItems((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)))

  // ---------- CRUD actions ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.date) { alert("Please select Salary Period"); return }
                                              
    const payload = {
      serviceProviderID: formData.serviceProviderID,
      companyID: formData.companyID,
      branchesID: formData.branchesID,
      manageEmployeeID: formData.manageEmployeeID,
      date: formData.date, // This now contains the salary period string
      status: formData.status,
      // optional header fields can be left blank; we rely on items
      items: items.map(i => ({
        reimbursementType: i.reimbursementType,
        amount: i.amount,
        description: i.description,
      })),
    }

    if (editing) {
      await robustFetch(`${BACKEND_URL}/reimbursement/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await robustFetch(`${BACKEND_URL}/reimbursement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    await loadReimbursements()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = async (row: Reimbursement) => {
    // Optionally re-fetch single record to ensure fresh items
    try {
      const fresh = await robustGet<any>(`${BACKEND_URL}/reimbursement/${row.id}`)
      setFormData({
        serviceProvider: fresh.serviceProvider?.companyName || row.serviceProvider || "",
        companyName: fresh.company?.companyName || row.companyName || "",
        branchName: fresh.branches?.branchName || row.branchName || "",
        employeeName: fresh.manageEmployee
          ? `${fresh.manageEmployee.employeeFirstName || ""} ${fresh.manageEmployee.employeeLastName || ""} (${fresh.manageEmployee.employeeID})`
          : row.employeeName || "",
        date: fresh.date || row.date || "", // This contains the salary period
        status: fresh.status || row.status || "Pending",
        serviceProviderID: fresh.serviceProviderID ?? row.serviceProviderID,
        companyID: fresh.companyID ?? row.companyID,
        branchesID: fresh.branchesID ?? row.branchesID,
        manageEmployeeID: fresh.manageEmployeeID ?? row.manageEmployeeID,
      })
      setItems(
        (fresh.items || row.items || []).map((it: any) => ({
          id: it.id,
          reimbursementType: it.reimbursementType || "",
          amount: it.amount || "",
          description: it.description || "",
        }))
      )

      // Refresh salary period options if editing has a company
      if (fresh.companyID || row.companyID) {
        await refreshSalaryPeriodOptions((fresh.companyID || row.companyID)!)
      }
    } catch {
      // fallback to existing row
      setFormData({
        serviceProvider: row.serviceProvider || "",
        companyName: row.companyName || "",
        branchName: row.branchName || "",
        employeeName: row.employeeName || "",
        date: row.date || "", // This contains the salary period
        status: row.status || "Pending",
        serviceProviderID: row.serviceProviderID,
        companyID: row.companyID,
        branchesID: row.branchesID,
        manageEmployeeID: row.manageEmployeeID,
      })
      setItems(row.items && row.items.length ? row.items : [{ reimbursementType: "", amount: "", description: "" }])
    }
    setEditing(row)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, { method: "DELETE" })
    await loadReimbursements()
  }

  const handleApprove = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    })
    await loadReimbursements()
  }

  const handleReject = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" }),
    })
    await loadReimbursements()
  }

  // ---------- Filter ----------
  const filtered = reimbursements.filter(
    (r) =>
      (r.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.date || "").toLowerCase().includes(searchTerm.toLowerCase()) // Search in salary period too
  )

  // ---------- UI ----------
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reimbursements</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Add Reimbursement
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Reimbursement" : "Add Reimbursement"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Selection */}
              <div className="grid grid-cols-3 gap-4">
                <SearchSuggestInput
                  label="Service Provider"
                  placeholder="Select Service Provider"
                  value={formData.serviceProvider}
                  onChange={(v) => setFormData((p) => ({ ...p, serviceProvider: v }))}
                  onSelect={(s) => setFormData((p) => ({ ...p, serviceProvider: s.display, serviceProviderID: s.value }))}
                  fetchData={fetchServiceProviders}
                  displayField="companyName"
                  valueField="id"
                  required
                />
                <SearchSuggestInput
                  label="Company"
                  placeholder="Select Company"
                  value={formData.companyName}
                  onChange={(v) => setFormData((p) => ({ ...p, companyName: v }))}
                  onSelect={handleCompanySelect}
                  fetchData={fetchCompanies}
                  displayField="companyName"
                  valueField="id"
                  required
                />
                <SearchSuggestInput
                  label="Branch"
                  placeholder="Select Branch"
                  value={formData.branchName}
                  onChange={(v) => setFormData((p) => ({ ...p, branchName: v }))}
                  onSelect={(s) => setFormData((p) => ({ ...p, branchName: s.display, branchesID: s.value }))}
                  fetchData={fetchBranches}
                  displayField="branchName"
                  valueField="id"
                  required
                />
              </div>

              {/* Employee */}
              <SearchSuggestInput
                label="Employee"
                placeholder="Select Employee"
                value={formData.employeeName}
                onChange={(v) => setFormData((p) => ({ ...p, employeeName: v }))}
                onSelect={handleEmployeeSelect}
                fetchData={async (q: string) => {
                  const data = await fetchEmployees(q)
                  return data.map((emp: any) => ({
                    ...emp,
                    display: `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""} (${emp.employeeID})`,
                    value: emp.id,
                  }))
                }}
                displayField="display"
                valueField="value"
                required
              />

              {/* Salary Period (replaces Date) */}
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">Salary Period *</Label>
                <select
                  id="salaryPeriod"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.companyID}
                >
                  <option value="">
                    {formData.companyID
                      ? (salaryPeriodOptions.length ? "Select Salary Period" : "No period found")
                      : "Select Company first"}
                  </option>
                  {salaryPeriodOptions.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
                {formData.companyID && (
                  <p className="text-xs text-gray-500">
                    FY: <b>{selectedCompanyFYStart ?? "-"}</b> | Cycle day: <b>{selectedCompanyStartDay}</b>
                  </p>
                )}
              </div>

              {/* Items (Multiple lines inside single reimbursement) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                <Button 
  type="button"  // Add this line
  variant="outline" 
  size="sm" 
  onClick={addItemRow}
>
  <PlusCircle className="w-4 h-4 mr-1" /> Add Item
</Button>
                </div>

                {items.length === 0 && (
                  <p className="text-sm text-gray-500">No items yet. Click "Add Item".</p>
                )}

                {items.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                    <div className="col-span-4">
                      <Label>Type</Label>
                      <Input
                        placeholder="e.g. Travel, Food"
                        value={row.reimbursementType}
                        onChange={(e) => updateItemRow(idx, "reimbursementType", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Amount</Label>
                      <Input
                        type="text"
                        placeholder="₹"
                        value={row.amount}
                        onChange={(e) => updateItemRow(idx, "amount", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Label>Description</Label>
                      <Input
                        placeholder="Short description"
                        value={row.description}
                        onChange={(e) => updateItemRow(idx, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeItemRow(idx)}
                        title="Remove"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editing ? "Update Reimbursement" : "Create Reimbursement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Table */}
      <Card>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <Input
              placeholder="Search reimbursements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Badge variant="secondary" className="ml-3">
              {filtered.length} reimbursements
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Salary Period</TableHead>
                <TableHead>Items (Type → Amount)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.companyName}</TableCell>
                  <TableCell>{r.employeeName}</TableCell>
                  <TableCell>{r.date}</TableCell> {/* This now shows salary period */}

                  {/* Show a compact list of item lines */}
                  <TableCell className="whitespace-pre-wrap">
                    {(r.items && r.items.length
                      ? r.items
                      : (r.reimbursementType || r.amount) ? [{ reimbursementType: r.reimbursementType!, amount: r.amount!, description: r.description || "" }] : []
                    ).map((it, i) => (
                      <div key={i}>
                        <span className="font-medium">{it.reimbursementType || "-"}</span>
                        {" "}→{" "}
                        <span>₹{it.amount || "0"}</span>
                        {it.description ? <span className="text-gray-500"> — {it.description}</span> : null}
                      </div>
                    ))}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        r.status === "Approved"
                          ? "bg-green-600"
                          : r.status === "Rejected"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-1">
                    {r.status === "Pending" && (
                      <>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApprove(r.id)} title="Approve">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleReject(r.id)} title="Reject">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(r)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}