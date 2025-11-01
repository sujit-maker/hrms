"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Icon } from "@iconify/react"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface PublicHoliday {
  id: string
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  manageHolidayID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  holidayName: string
  financialYear: string
  startDate: string
  endDate: string
  createdAt: string
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

const monthsFull = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
]

function clampDay(d:number) {
  if (!Number.isFinite(d)) return 1
  return Math.max(1, Math.min(28, Math.floor(d)))
}

function buildFinancialYearOptions(fyStart:string|null|undefined, monthStartDay:string|number|null|undefined) {
  const now = new Date()
  const y = now.getFullYear()
  const day = clampDay(Number(monthStartDay ?? 1))
  const isJan = (fyStart ?? "").toLowerCase().includes("jan")

  const out:string[] = []
  if (day === 1) {
    if (isJan) {
      out.push(`${y}`) // simple year
    } else {
      out.push(`${y}-${y+1}`) // April to March
    }
  } else {
    // Rolling cycles – 12 windows
    for (let i=0;i<12;i++) {
      const start = new Date(y, isJan?11:2, day) // Dec(prev)/Mar(curr)
      start.setMonth(start.getMonth()+i)
      const end = new Date(start)
      end.setMonth(end.getMonth()+1)
      end.setDate(day-1)
      out.push(`${start.getDate()} ${monthsFull[start.getMonth()]} ${start.getFullYear()} to ${end.getDate()} ${monthsFull[end.getMonth()]} ${end.getFullYear()}`)
    }
  }
  return out
}

export function PublicHolidayManagement() {
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null)
  const [holidayOptions, setHolidayOptions] = useState<any[]>([])
  const [financialYearOptions,setFinancialYearOptions] = useState<string[]>([])

  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    holidayName: "",
    financialYear: "",
    startDate: "",
    endDate: "",
    serviceProviderID: undefined as number|undefined,
    companyID: undefined as number|undefined,
    branchesID: undefined as number|undefined,
    manageHolidayID: undefined as number|undefined,
  })

  async function robustGet<T=any>(url:string):Promise<T>{
    const res = await fetch(url,{cache:"no-store"})
    if(!res.ok) throw new Error(`${res.status}`)
    return res.json()
  }

  const fetchServiceProviders = async (q:string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/service-provider`)
    return data.filter(d=>(d.companyName||"").toLowerCase().includes(q.toLowerCase()))
  }
  const fetchCompanies = async (q:string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/company`)
    return data.filter(d=>(d.companyName||"").toLowerCase().includes(q.toLowerCase()))
  }
  const fetchBranches = async (q:string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/branches`)
    return data.filter(d=>(d.branchName||"").toLowerCase().includes(q.toLowerCase()))
  }
  const fetchManageHolidays = async ()=> robustGet<any[]>(`${BACKEND_URL}/manage-holiday`)

  useEffect(()=>{ loadPublicHolidays(); loadHolidayOptions() },[])

  const loadHolidayOptions = async()=> setHolidayOptions(await fetchManageHolidays())
  const loadPublicHolidays = async()=> {
    const data = await robustGet<any[]>(`${BACKEND_URL}/public-holiday`)
    setPublicHolidays(data.map(h=>({
      id:String(h.id),
      serviceProviderID:h.serviceProviderID,
      companyID:h.companyID,
      branchesID:h.branchesID,
      manageHolidayID:h.manageHolidayID,
      serviceProvider:h.serviceProvider?.companyName||"",
      companyName:h.company?.companyName||"",
      branchName:h.branches?.branchName||"",
      holidayName:h.manageHoliday?.holidayName||"",
      financialYear:h.financialYear,
      startDate:h.startDate?new Date(h.startDate).toISOString().split("T")[0]:"",
      endDate:h.endDate?new Date(h.endDate).toISOString().split("T")[0]:"",
      createdAt:h.createdAt?new Date(h.createdAt).toISOString().split("T")[0]:new Date().toISOString().split("T")[0],
    })))
  }

  const handleCompanySelect = async(selected:SelectedItem)=>{
    setFormData(p=>({...p,companyName:selected.display,companyID:selected.value,financialYear:""}))
    try{
      const company = await robustGet<any>(`${BACKEND_URL}/company/${selected.value}`)
      const fyStart = company?.financialYearStart||"1st April"
      const cycles = await robustGet<any[]>(`${BACKEND_URL}/salary-cycle/company/${selected.value}`)
      let day = "1"
      if(Array.isArray(cycles)&&cycles.length>0) day = cycles[0].monthStartDay||"1"
      setFinancialYearOptions(buildFinancialYearOptions(fyStart,day))
    }catch(e){ console.error(e); setFinancialYearOptions([])}
  }

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    const data = {
      serviceProviderID: formData.serviceProviderID,
      companyID: formData.companyID,
      branchesID: formData.branchesID,
      manageHolidayID: formData.manageHolidayID,
      financialYear: formData.financialYear,
      startDate: formData.startDate?new Date(formData.startDate):null,
      endDate: formData.endDate?new Date(formData.endDate):null,
    }
    const url = editingHoliday?`${BACKEND_URL}/public-holiday/${editingHoliday.id}`:`${BACKEND_URL}/public-holiday`
    const method = editingHoliday?"PATCH":"POST"
    await fetch(url,{method,headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
    await loadPublicHolidays()
    resetForm(); setIsDialogOpen(false)
  }

  const resetForm=()=>{ setFormData({
    serviceProvider:"",companyName:"",branchName:"",holidayName:"",financialYear:"",
    startDate:"",endDate:"",serviceProviderID:undefined,companyID:undefined,branchesID:undefined,manageHolidayID:undefined
  }); setEditingHoliday(null)}

  const handleEdit=(h:PublicHoliday)=>{ setFormData({
    serviceProvider:h.serviceProvider||"",companyName:h.companyName||"",branchName:h.branchName||"",
    holidayName:h.holidayName,financialYear:h.financialYear,startDate:h.startDate,endDate:h.endDate,
    serviceProviderID:h.serviceProviderID,companyID:h.companyID,branchesID:h.branchesID,manageHolidayID:h.manageHolidayID
  }); setEditingHoliday(h); if(h.companyID) handleCompanySelect({display:h.companyName||"",value:h.companyID,item:{}}); setIsDialogOpen(true)}

  const handleDelete=async(id:string)=>{ await fetch(`${BACKEND_URL}/public-holiday/${id}`,{method:"DELETE"}); await loadPublicHolidays() }

  const filtered = publicHolidays.filter(h=>
    (h.companyName||"").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.holidayName||"").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.financialYear||"").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold">Public Holiday</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm} className="bg-blue-600">Add Public Holiday</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader><DialogTitle>{editingHoliday?"Edit":"Add New"} Public Holiday</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <SearchSuggestInput label="Service Provider" placeholder="Select Service Provider" value={formData.serviceProvider} onChange={v=>setFormData(p=>({...p,serviceProvider:v}))} onSelect={s=>setFormData(p=>({...p,serviceProvider:s.display,serviceProviderID:s.value}))} fetchData={fetchServiceProviders} displayField="companyName" valueField="id" required/>
                <SearchSuggestInput label="Company Name" placeholder="Select Company" value={formData.companyName} onChange={v=>setFormData(p=>({...p,companyName:v}))} onSelect={handleCompanySelect} fetchData={fetchCompanies} displayField="companyName" valueField="id" required/>
                <SearchSuggestInput label="Branch Name" placeholder="Select Branch" value={formData.branchName} onChange={v=>setFormData(p=>({...p,branchName:v}))} onSelect={s=>setFormData(p=>({...p,branchName:s.display,branchesID:s.value}))} fetchData={fetchBranches} displayField="branchName" valueField="id" required/>
              </div>

              {/* Holiday Config */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Holiday Name *</Label>
                  <select value={formData.holidayName} onChange={e=>{
                    const sel=holidayOptions.find(h=>h.holidayName===e.target.value)
                    setFormData(p=>({...p,holidayName:e.target.value,manageHolidayID:sel?.id}))
                  }} required className="w-full border px-2 py-1">
                    <option value="">Select Holiday</option>
                    {holidayOptions.map(h=><option key={h.id} value={h.holidayName}>{h.holidayName}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Financial Year *</Label>
                  <select value={formData.financialYear} onChange={e=>setFormData(p=>({...p,financialYear:e.target.value}))} required className="w-full border px-2 py-1" disabled={financialYearOptions.length===0}>
                    <option value="">{financialYearOptions.length?"Select Year":"Select Company first"}</option>
                    {financialYearOptions.map(opt=><option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date *</Label><Input type="date" value={formData.startDate} onChange={e=>setFormData(p=>({...p,startDate:e.target.value}))} required/></div>
                <div><Label>End Date *</Label><Input type="date" value={formData.endDate} onChange={e=>setFormData(p=>({...p,endDate:e.target.value}))} required/></div>
              </div>

              <DialogFooter><Button type="submit" className="bg-blue-600">{editingHoliday?"Update":"Add"} Public Holiday</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Table */}
      <Card>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <Input placeholder="Search holidays..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            <Badge variant="secondary" className="ml-3">{filtered.length} holidays</Badge>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Holiday</TableHead><TableHead>Year</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(h=>
              <TableRow key={h.id}>
                <TableCell>{h.companyName}</TableCell>
                <TableCell>{h.holidayName}</TableCell>
                <TableCell>{h.financialYear}</TableCell>
                <TableCell>{h.startDate}</TableCell>
                <TableCell>{h.endDate}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={()=>handleEdit(h)}><Edit className="w-4 h-4"/></Button>
                  <Button size="sm" variant="ghost" onClick={()=>handleDelete(h.id)} className="text-red-600"><Trash2 className="w-4 h-4"/></Button>
                </TableCell>
              </TableRow>)}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
