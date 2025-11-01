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
import { Search, Edit, Trash2, Check, X, Plus, Settings, PlusCircle, MinusCircle, AlertCircle } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface SalaryAdvance {
  id: string
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  manageEmployeeID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  employeeName?: string
  previousAdvancesDue: string
  advanceAmount: string
  reason: string
  status: string
  createdAt: string
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

interface RepaymentRow {
  id?: number
  month: string
  amount: string
}

interface Company {
  id: number
  companyName: string
  financialYearStart: string
}

interface SalaryCycle {
  id: number
  companyID: number
  monthStartDay: string
}

interface FinancialYearOption {
  value: string
  label: string
}

interface SalaryPeriodOption {
  value: string
  label: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export function SalaryAdvanceManagement() {
  const [advances, setAdvances] = useState<SalaryAdvance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdvance, setEditingAdvance] = useState<SalaryAdvance | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeName: "",
    previousAdvancesDue: "0",
    advanceAmount: "",
    reason: "",
    status: "Pending",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    manageEmployeeID: undefined as number | undefined,
  })

  // ============ Repayment Modal State ============
  const [isRepaymentOpen, setIsRepaymentOpen] = useState(false)
  const [repaymentAdvance, setRepaymentAdvance] = useState<SalaryAdvance | null>(null)
  const [approvedAmount, setApprovedAmount] = useState("")
  const [repaymentRows, setRepaymentRows] = useState<RepaymentRow[]>([])
  const [financialYears, setFinancialYears] = useState<FinancialYearOption[]>([])
  const [salaryPeriods, setSalaryPeriods] = useState<SalaryPeriodOption[]>([])
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("")
  const [selectedSalaryPeriod, setSelectedSalaryPeriod] = useState("")

  // ---------------- API helpers ----------------
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
    return data.filter(d => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchCompanies = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/company`)
    return data.filter(d => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchBranches = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/branches`)
    return data.filter(d => (d.branchName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchEmployees = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/manage-emp`)
    return data.filter(d => {
      const name = `${d.employeeFirstName || ""} ${d.employeeLastName || ""}`.trim().toLowerCase()
      return name.includes(q.toLowerCase()) || (d.employeeID || "").toLowerCase().includes(q.toLowerCase())
    })
  }

  // ============ Financial Year & Salary Period Logic ============
  const getFinancialYearOptions = (financialYearStart: string): FinancialYearOption[] => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (financialYearStart.includes('Jan')) {
      // Calendar year (Jan-Dec)
      return [
        { value: `${currentYear}`, label: `${currentYear}` },
        { value: `${currentYear + 1}`, label: `${currentYear + 1}` }
      ]
    } else if (financialYearStart.includes('Apr')) {
      // Financial year (Apr-Mar)
      const options: FinancialYearOption[] = []
      
      // Determine current financial year
      if (currentMonth >= 4) {
        // April to December - current financial year is currentYear to currentYear+1
        options.push({ 
          value: `${currentYear}-${currentYear + 1}`, 
          label: `${currentYear}-${currentYear + 1}` 
        })
        options.push({ 
          value: `${currentYear + 1}-${currentYear + 2}`, 
          label: `${currentYear + 1}-${currentYear + 2}` 
        })
      } else {
        // January to March - current financial year is currentYear-1 to currentYear
        options.push({ 
          value: `${currentYear - 1}-${currentYear}`, 
          label: `${currentYear - 1}-${currentYear}` 
        })
        options.push({ 
          value: `${currentYear}-${currentYear + 1}`, 
          label: `${currentYear}-${currentYear + 1}` 
        })
      }
      
      return options
    }
    
    // Default to calendar year if unknown format
    return [
      { value: `${currentYear}`, label: `${currentYear}` },
      { value: `${currentYear + 1}`, label: `${currentYear + 1}` }
    ]
  }

  const getSalaryPeriodOptions = (monthStartDay: string, financialYear: string): SalaryPeriodOption[] => {
    const monthStart = parseInt(monthStartDay) || 1
    const periods: SalaryPeriodOption[] = []
    
    if (monthStart === 1) {
      // Standard month periods (1st to end of month)
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      
      if (financialYear.includes('-')) {
        // Financial year format (2024-2025)
        const [startYear, endYear] = financialYear.split('-').map(Number)
        
        // For financial year starting April
        for (let i = 0; i < 12; i++) {
          const monthIndex = (i + 3) % 12 // Start from April (index 3)
          const year = monthIndex >= 3 ? startYear : endYear
          periods.push({
            value: `${months[monthIndex]}-${year}`,
            label: `${months[monthIndex]} ${year}`
          })
        }
      } else {
        // Calendar year format
        const year = parseInt(financialYear)
        months.forEach(month => {
          periods.push({
            value: `${month}-${year}`,
            label: `${month} ${year}`
          })
        })
      }
    } else {
      // Custom month start day (e.g., 23rd)
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      
      if (financialYear.includes('-')) {
        // Financial year format (2024-2025)
        const [startYear, endYear] = financialYear.split('-').map(Number)
        
        for (let i = 0; i < 12; i++) {
          const currentMonth = (i + 3) % 12 // Start from April (index 3)
          const nextMonth = (currentMonth + 1) % 12
          const year = currentMonth >= 3 ? startYear : endYear
          const nextMonthYear = nextMonth >= 3 ? startYear : endYear
          
          periods.push({
            value: `${months[currentMonth]}-${year}`,
            label: `${monthStart} ${months[currentMonth]} to ${monthStart - 1} ${months[nextMonth]} ${nextMonthYear}`
          })
        }
      } else {
        // Calendar year format
        const year = parseInt(financialYear)
        
        for (let i = 0; i < 12; i++) {
          const currentMonth = i
          const nextMonth = (i + 1) % 12
          const nextMonthYear = nextMonth === 0 ? year + 1 : year
          
          periods.push({
            value: `${months[currentMonth]}-${year}`,
            label: `${monthStart} ${months[currentMonth]} to ${monthStart - 1} ${months[nextMonth]} ${nextMonthYear}`
          })
        }
      }
    }
    
    return periods
  }

  const loadCompanyAndSalaryCycleData = async (companyID: number) => {
    try {
      // Fetch company data
      const companyData = await robustGet<Company>(`${BACKEND_URL}/company/${companyID}`)
      
      // Fetch salary cycle data
      const salaryCycles = await robustGet<SalaryCycle[]>(`${BACKEND_URL}/salary-cycle`)
      const companySalaryCycle = salaryCycles.find(sc => sc.companyID === companyID)
      
      if (companyData && companySalaryCycle) {
        // Generate financial year options
        const fyOptions = getFinancialYearOptions(companyData.financialYearStart)
        setFinancialYears(fyOptions)
        setSelectedFinancialYear(fyOptions[0]?.value || "")
        
        // Generate salary period options for the first financial year
        if (fyOptions[0]) {
          const spOptions = getSalaryPeriodOptions(companySalaryCycle.monthStartDay, fyOptions[0].value)
          setSalaryPeriods(spOptions)
          setSelectedSalaryPeriod(spOptions[0]?.value || "")
        }
      }
    } catch (error) {
      console.error("Error loading company and salary cycle data:", error)
    }
  }

  const handleFinancialYearChange = (value: string, monthStartDay: string) => {
    setSelectedFinancialYear(value)
    const spOptions = getSalaryPeriodOptions(monthStartDay, value)
    setSalaryPeriods(spOptions)
    setSelectedSalaryPeriod(spOptions[0]?.value || "")
  }

  // ============ Validation Helpers ============
  const getUsedSalaryPeriods = (): string[] => {
    return repaymentRows.map(row => row.month).filter(Boolean)
  }

  const getAvailableSalaryPeriods = (): SalaryPeriodOption[] => {
    const usedPeriods = getUsedSalaryPeriods()
    return salaryPeriods.filter(period => !usedPeriods.includes(period.value))
  }

  const getTotalRepaymentAmount = (): number => {
    return repaymentRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
  }

  const getRemainingAmount = (): number => {
    const approved = parseFloat(approvedAmount) || 0
    return approved - getTotalRepaymentAmount()
  }

  const hasDuplicateSalaryPeriods = (): boolean => {
    const periods = getUsedSalaryPeriods()
    return new Set(periods).size !== periods.length
  }

  const isAmountExceeded = (): boolean => {
    return getRemainingAmount() < 0
  }

  const canAddMoreRows = (): boolean => {
    return getAvailableSalaryPeriods().length > 0 && getRemainingAmount() > 0
  }

  const isFormValid = (): boolean => {
    return (
      !!approvedAmount &&
      parseFloat(approvedAmount) > 0 &&
      repaymentRows.length > 0 &&
      !hasDuplicateSalaryPeriods() &&
      !isAmountExceeded() &&
      repaymentRows.every(row => row.month && row.amount && parseFloat(row.amount) > 0)
    )
  }

  // ============ Salary Advance CRUD ============
  useEffect(() => { loadAdvances() }, [])
  
  const loadAdvances = async () => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/salary-advance`)
    setAdvances(data.map(a => ({
      id: String(a.id),
      serviceProviderID: a.serviceProviderID,
      companyID: a.companyID,
      branchesID: a.branchesID,
      manageEmployeeID: a.manageEmployeeID,
      serviceProvider: a.serviceProvider?.companyName || "",
      companyName: a.company?.companyName || "",
      branchName: a.branches?.branchName || "",
      employeeName: a.manageEmployee ?
        `${a.manageEmployee.employeeFirstName || ""} ${a.manageEmployee.employeeLastName || ""} (${a.manageEmployee.employeeID})` : "",
      previousAdvancesDue: a.previousAdvancesDue || "0",
      advanceAmount: a.advanceAmount || "",
      reason: a.reason || "",
      status: a.status || "Pending",
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    })))
  }

  const handleEmployeeSelect = async (selected: SelectedItem) => {
    const emp = selected.item
    setFormData((p) => ({
      ...p,
      employeeName: selected.display,
      manageEmployeeID: selected.value,
    }))
    try {
      const data = await robustGet<any[]>(`${BACKEND_URL}/salary-advance`)
      const dues = data.filter((a) => a.manageEmployeeID === selected.value && a.status !== "Paid")
      const total = dues.reduce((sum, cur) => sum + (parseFloat(cur.advanceAmount || "0")), 0)
      setFormData((p) => ({ ...p, previousAdvancesDue: String(total) }))
    } catch {
      setFormData((p) => ({ ...p, previousAdvancesDue: "0" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      serviceProviderID: formData.serviceProviderID,
      companyID: formData.companyID,
      branchesID: formData.branchesID,
      manageEmployeeID: formData.manageEmployeeID,
      previousAdvancesDue: formData.previousAdvancesDue,
      advanceAmount: formData.advanceAmount,
      reason: formData.reason,
      status: formData.status,
    }
    const url = editingAdvance ? `${BACKEND_URL}/salary-advance/${editingAdvance.id}` : `${BACKEND_URL}/salary-advance`
    const method = editingAdvance ? "PATCH" : "POST"
    await robustFetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    await loadAdvances(); resetForm(); setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "", companyName: "", branchName: "", employeeName: "",
      previousAdvancesDue: "0", advanceAmount: "", reason: "",
      status: "Pending", serviceProviderID: undefined, companyID: undefined, branchesID: undefined, manageEmployeeID: undefined
    })
    setEditingAdvance(null)
  }

  const handleEdit = (a: SalaryAdvance) => {
    setFormData({
      serviceProvider: a.serviceProvider || "", companyName: a.companyName || "", branchName: a.branchName || "",
      employeeName: a.employeeName || "", previousAdvancesDue: a.previousAdvancesDue || "0", advanceAmount: a.advanceAmount || "",
      reason: a.reason || "", status: a.status || "Pending",
      serviceProviderID: a.serviceProviderID, companyID: a.companyID, branchesID: a.branchesID, manageEmployeeID: a.manageEmployeeID
    })
    setEditingAdvance(a); setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/salary-advance/${id}`, { method: "DELETE" })
    await loadAdvances()
  }

  const handleApprove = async (advance: SalaryAdvance) => {
    openRepaymentModal(advance, true)
  }

  const handleReject = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/salary-advance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" })
    })
    await loadAdvances()
  }

  const filtered = advances.filter(a =>
    (a.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.advanceAmount || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ============ Repayment API ============
  async function loadRepaymentsForAdvance(advanceId: number) {
    try {
      const rows = await robustGet<any[]>(`${BACKEND_URL}/salary-advance-repayment/advance/${advanceId}`)
      return rows
    } catch {
      return []
    }
  }

  async function clearRepaymentsForAdvance(existing: Array<{ id: number }>) {
    for (const r of existing) {
      await robustFetch(`${BACKEND_URL}/salary-advance-repayment/${r.id}`, { method: "DELETE" })
    }
  }

  async function saveRepaymentPlan(advanceId: number, approvedAmount: string, rows: RepaymentRow[]) {
    // Clear existing repayments
    const existing = await loadRepaymentsForAdvance(advanceId)
    if (existing && existing.length) {
      await clearRepaymentsForAdvance(existing)
    }

    // Save new repayment plan
    for (const row of rows) {
      if (!row.month || !row.amount) continue
      
      // Convert salary period to proper start month (using the first day of the month)
      const [monthName, year] = row.month.split('-')
      const monthIndex = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ].indexOf(monthName)
      
      if (monthIndex !== -1) {
        const startMonthISO = new Date(Date.UTC(parseInt(year), monthIndex, 1)).toISOString()
        
        await robustFetch(`${BACKEND_URL}/salary-advance-repayment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salaryAdvanceID: advanceId,
            approvedAmount: approvedAmount,
            startMonth: startMonthISO,
            amount: row.amount
          })
        })
      }
    }
  }

  // ============ Repayment Modal Handlers ============
  function openRepaymentModal(a: SalaryAdvance, isFromApproval: boolean = false) {
    setRepaymentAdvance(a)
    setIsRepaymentOpen(true)
    
    // Reset fields
    setApprovedAmount(a.advanceAmount || "")
    setRepaymentRows([])
    setFinancialYears([])
    setSalaryPeriods([])
    setSelectedFinancialYear("")
    setSelectedSalaryPeriod("")
    
    // Load company data for financial year and salary period logic
    if (a.companyID) {
      loadCompanyAndSalaryCycleData(a.companyID)
    }
    
    // Load existing repayment plan
    const advanceId = Number(a.id)
    if (Number.isFinite(advanceId)) {
      loadRepaymentsForAdvance(advanceId).then((rows) => {
        if (!rows || rows.length === 0) return
        
        // Set approved amount from first repayment record
        if (rows[0]?.approvedAmount) {
          setApprovedAmount(rows[0].approvedAmount)
        }
        
        // Populate repayment rows (convert existing data to new format)
        const repaymentRowsData = rows.map(r => {
          let monthValue = ""
          if (r.startMonth) {
            const d = new Date(r.startMonth)
            const monthName = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ][d.getUTCMonth()]
            const year = d.getUTCFullYear()
            monthValue = `${monthName}-${year}`
          }
          return {
            id: r.id,
            month: monthValue,
            amount: r.amount || ""
          }
        })
        
        setRepaymentRows(repaymentRowsData)
      }).catch(() => { })
    }
  }

  function addRepaymentRow() {
    if (!selectedSalaryPeriod) {
      alert("Please select a salary period first")
      return
    }
    
    if (getUsedSalaryPeriods().includes(selectedSalaryPeriod)) {
      alert("This salary period is already selected. Please choose a different one.")
      return
    }
    
    if (!canAddMoreRows()) {
      alert("Cannot add more repayment entries. Either all periods are used or approved amount is fully allocated.")
      return
    }
    
    setRepaymentRows(prev => [...prev, { month: selectedSalaryPeriod, amount: "" }])
  }
  
  function removeRepaymentRow(idx: number) {
    setRepaymentRows(prev => prev.filter((_, i) => i !== idx))
  }
  
  function updateRepaymentRow(idx: number, key: "month" | "amount", value: string) {
    setRepaymentRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r))
  }

  async function saveRepayment() {
    if (!isFormValid()) {
      alert("Please fix all validation errors before saving.")
      return
    }

    if (!repaymentAdvance) return

    const advanceId = Number(repaymentAdvance.id)
    if (!Number.isFinite(advanceId)) return

    try {
      // Save repayment plan
      await saveRepaymentPlan(advanceId, approvedAmount, repaymentRows)

      // Update the advance status to "Approved"
      await robustFetch(`${BACKEND_URL}/salary-advance/${repaymentAdvance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" })
      })

      await loadAdvances()
      setIsRepaymentOpen(false)
    } catch (error) {
      alert("Error saving repayment plan. Please try again.")
    }
  }

  // ===================== UI =====================
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Salary Advances</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600"><Plus className="w-4 h-4 mr-1" />Add Advance</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingAdvance ? "Edit" : "Add"} Salary Advance</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Org Selection */}
              <div className="grid grid-cols-3 gap-4">
                <SearchSuggestInput label="Service Provider" placeholder="Select Service Provider" value={formData.serviceProvider} onChange={v => setFormData(p => ({ ...p, serviceProvider: v }))} onSelect={s => setFormData(p => ({ ...p, serviceProvider: s.display, serviceProviderID: s.value }))} fetchData={fetchServiceProviders} displayField="companyName" valueField="id" required />
                <SearchSuggestInput label="Company" placeholder="Select Company" value={formData.companyName} onChange={v => setFormData(p => ({ ...p, companyName: v }))} onSelect={s => setFormData(p => ({ ...p, companyName: s.display, companyID: s.value }))} fetchData={fetchCompanies} displayField="companyName" valueField="id" required />
                <SearchSuggestInput label="Branch" placeholder="Select Branch" value={formData.branchName} onChange={v => setFormData(p => ({ ...p, branchName: v }))} onSelect={s => setFormData(p => ({ ...p, branchName: s.display, branchesID: s.value }))} fetchData={fetchBranches} displayField="branchName" valueField="id" required />
              </div>

              {/* Employee */}
              <SearchSuggestInput
                label="Employee"
                placeholder="Select Employee"
                value={formData.employeeName}
                onChange={(v) => setFormData((p) => ({ ...p, employeeName: v }))}
                onSelect={async (selected) => {
                  const data = await fetchEmployees("")
                  const item = data.find((d: any) => d.id === selected.value) || selected.item
                  const formatted = `${item?.employeeFirstName || ""} ${item?.employeeLastName || ""} (${item?.employeeID})`
                  await handleEmployeeSelect({ display: formatted, value: selected.value, item })
                }}
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

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Previous Advances Due</Label><Input type="text" value={formData.previousAdvancesDue} readOnly className="bg-gray-100" /></div>
                <div><Label>Advance Amount *</Label><Input type="text" value={formData.advanceAmount} onChange={e => setFormData(p => ({ ...p, advanceAmount: e.target.value }))} required /></div>
              </div>

              <div><Label>Reason *</Label><Input type="text" value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} required /></div>

              <DialogFooter><Button type="submit" className="bg-blue-600">{editingAdvance ? "Update" : "Add"} Advance</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Table */}
      <Card>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <Input placeholder="Search advances..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Badge variant="secondary" className="ml-3">{filtered.length} advances</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Prev Due</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a =>
                <TableRow key={a.id}>
                  <TableCell>{a.companyName}</TableCell>
                  <TableCell>{a.employeeName}</TableCell>
                  <TableCell>{a.previousAdvancesDue}</TableCell>
                  <TableCell>{a.advanceAmount}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        a.status === "Approved" ? "bg-green-600 hover:bg-green-600" :
                          a.status === "Rejected" ? "bg-red-600 hover:bg-red-600" :
                            "bg-yellow-500 hover:bg-yellow-500"
                      }
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-1">
                    {/* Settings (Repayment Plan) */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openRepaymentModal(a)}
                      title="Restructure Repayment"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>

                    {a.status === "Pending" && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-green-600 hover:text-green-800" 
                          onClick={() => handleApprove(a)} 
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-800" 
                          onClick={() => handleReject(a.id)} 
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(a.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Repayment Modal */}
      <Dialog open={isRepaymentOpen} onOpenChange={setIsRepaymentOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Repayment Plan</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Approved Amount */}
            <div>
              <Label>Approved Amount *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                required
                className={parseFloat(approvedAmount) <= 0 ? "border-red-500" : ""}
              />
              {parseFloat(approvedAmount) <= 0 && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Approved amount must be greater than 0
                </p>
              )}
            </div>

            {/* Amount Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-blue-700 font-semibold">Approved Amount</Label>
                  <div className="text-lg font-bold text-blue-900">{parseFloat(approvedAmount) || 0}</div>
                </div>
                <div>
                  <Label className="text-blue-700 font-semibold">Total Allocated</Label>
                  <div className={`text-lg font-bold ${isAmountExceeded() ? 'text-red-600' : 'text-blue-900'}`}>
                    {getTotalRepaymentAmount().toFixed(2)}
                  </div>
                </div>
                <div>
                  <Label className="text-blue-700 font-semibold">Remaining</Label>
                  <div className={`text-lg font-bold ${getRemainingAmount() < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {getRemainingAmount().toFixed(2)}
                  </div>
                </div>
              </div>
              
              {isAmountExceeded() && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Total allocated amount exceeds approved amount by {Math.abs(getRemainingAmount()).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Salary Period Selection */}
            {salaryPeriods.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="font-semibold">Select Salary Period</Label>
                <div className="flex gap-2 mt-2">
                  <select
                    className="flex-1 border px-2 py-2 rounded"
                    value={selectedSalaryPeriod}
                    onChange={(e) => setSelectedSalaryPeriod(e.target.value)}
                  >
                    <option value="">Choose a period...</option>
                    {getAvailableSalaryPeriods().map((sp) => (
                      <option key={sp.value} value={sp.value}>
                        {sp.label}
                      </option>
                    ))}
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addRepaymentRow}
                    disabled={!selectedSalaryPeriod || !canAddMoreRows()}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {getAvailableSalaryPeriods().length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">All salary periods have been allocated.</p>
                )}
              </div>
            )}

            {/* Repayment Schedule */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Repayment Schedule</Label>
                <div className="text-sm text-gray-500">
                  {repaymentRows.length} period(s) added
                </div>
              </div>
              
              {repaymentRows.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No repayment entries yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Select a salary period above and click "Add"</p>
                </div>
              )}
              
              {repaymentRows.map((row, idx) => {
                const periodLabel = salaryPeriods.find(sp => sp.value === row.month)?.label || row.month
                return (
                  <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-7">
                        <Label>Salary Period</Label>
                        <select
                          className="w-full border px-2 py-2 rounded mt-1"
                          value={row.month}
                          onChange={(e) => updateRepaymentRow(idx, "month", e.target.value)}
                        >
                          <option value="">Select Period</option>
                          {salaryPeriods.map((sp) => (
                            <option 
                              key={sp.value} 
                              value={sp.value}
                              disabled={getUsedSalaryPeriods().includes(sp.value) && sp.value !== row.month}
                            >
                              {sp.label}
                            </option>
                          ))}
                        </select>
                        <div className="text-sm text-gray-600 mt-1">{periodLabel}</div>
                      </div>
                      <div className="col-span-4 my-6">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.amount}
                          onChange={(e) => updateRepaymentRow(idx, "amount", e.target.value)}
                          className={parseFloat(row.amount) <= 0 ? "border-red-500" : ""}
                        />
                        {parseFloat(row.amount) <= 0 && (
                          <p className="text-red-500 text-xs mt-1">Amount must be greater than 0</p>
                        )}
                      </div>
                      <div className="col-span-1 my-6 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => removeRepaymentRow(idx)}
                          title="Remove Row"
                        >
                          <MinusCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Validation Messages */}
              {hasDuplicateSalaryPeriods() && (
                <div className="p-3 bg-red-100 border border-red-300 rounded">
                  <p className="text-red-700 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Duplicate salary periods detected. Please ensure each period is used only once.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2">
           
            
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setIsRepaymentOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 flex-1" 
                onClick={saveRepayment}
                disabled={!isFormValid()}
              >
                Save & Approve
              </Button>
            </div>
            
            {!isFormValid() && (
              <div className="w-full text-center">
                <p className="text-sm text-gray-500">
                  {!approvedAmount ? "Enter approved amount" :
                   repaymentRows.length === 0 ? "Add at least one repayment entry" :
                   hasDuplicateSalaryPeriods() ? "Fix duplicate periods" :
                   isAmountExceeded() ? "Reduce total allocated amount" :
                   "All fields must be valid"}
                </p>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}