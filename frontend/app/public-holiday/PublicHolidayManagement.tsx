"use client"

import { useState } from "react"
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

interface PublicHoliday {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  holidayName: string
  financialYear: string
  startDate: string
  endDate: string
  createdAt: string
}

// Mock data for dropdowns
const mockServiceProviders = [
  "TechCorp Solutions",
  "Global Services Ltd",
  "Enterprise Systems",
  "Digital Innovations"
]

const mockCompanies = [
  "ABC Corporation",
  "XYZ Industries",
  "Tech Solutions Inc",
  "Global Enterprises"
]

const mockBranches = [
  "Mumbai Branch",
  "Delhi Branch",
  "Bangalore Branch",
  "Chennai Branch"
]

// Mock data for holidays from Manage Holiday
const mockHolidays = [
  "New Year's Day",
  "Republic Day",
  "Independence Day",
  "Gandhi Jayanti",
  "Diwali",
  "Holi",
  "Eid",
  "Christmas",
  "Good Friday",
  "Dussehra",
  "Navratri",
  "Raksha Bandhan"
]

// Mock data for financial years
const mockFinancialYears = [
  "2023",
  "2024",
  "2025",
  "2023-24",
  "2024-25",
  "2025-26"
]

export function PublicHolidayManagement() {
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    holidayName: "",
    financialYear: "",
    startDate: "",
    endDate: ""
  })

  const filteredHolidays = publicHolidays.filter(holiday =>
    holiday.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.holidayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.financialYear.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingHoliday) {
      setPublicHolidays(prev => 
        prev.map(holiday => 
          holiday.id === editingHoliday.id 
            ? { ...holiday, ...formData, id: editingHoliday.id, createdAt: editingHoliday.createdAt }
            : holiday
        )
      )
    } else {
      const newHoliday: PublicHoliday = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPublicHolidays(prev => [...prev, newHoliday])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      holidayName: "",
      financialYear: "",
      startDate: "",
      endDate: ""
    })
    setEditingHoliday(null)
  }

  const handleEdit = (holiday: PublicHoliday) => {
    setFormData({
      serviceProvider: holiday.serviceProvider,
      companyName: holiday.companyName,
      branchName: holiday.branchName,
      holidayName: holiday.holidayName,
      financialYear: holiday.financialYear,
      startDate: holiday.startDate,
      endDate: holiday.endDate
    })
    setEditingHoliday(holiday)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPublicHolidays(prev => prev.filter(holiday => holiday.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Public Holiday</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage public holidays and special occasions</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Public Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday ? "Edit Public Holiday" : "Add New Public Holiday"}
                </DialogTitle>
                <DialogDescription>
                  {editingHoliday 
                    ? "Update the public holiday information below." 
                    : "Fill in the details to add a new public holiday."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Selection</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serviceProvider">Service Provider *</Label>
                      <select
                        id="serviceProvider"
                        value={formData.serviceProvider}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceProvider: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Service Provider</option>
                        {mockServiceProviders.map((provider) => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <select
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Company</option>
                        {mockCompanies.map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchName">Branch Name *</Label>
                      <select
                        id="branchName"
                        value={formData.branchName}
                        onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Branch</option>
                        {mockBranches.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Holiday Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Holiday Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="holidayName">Holiday Name *</Label>
                      <select
                        id="holidayName"
                        value={formData.holidayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, holidayName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Holiday</option>
                        {mockHolidays.map((holiday) => (
                          <option key={holiday} value={holiday}>{holiday}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Select from Manage Holiday</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financialYear">Financial Year *</Label>
                      <select
                        id="financialYear"
                        value={formData.financialYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, financialYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Financial Year</option>
                        {mockFinancialYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">If start on 1 Jan - YYYY, If start on 1 Apr - YYYY-YY</p>
                    </div>
                  </div>
                </div>

                {/* Date Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Date Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingHoliday ? "Update Public Holiday" : "Add Public Holiday"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search public holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredHolidays.length} holidays
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Public Holidays Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:calendar-star" className="w-5 h-5" />
            Public Holidays List
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
                  <TableHead className="w-[150px]">Holiday Name</TableHead>
                  <TableHead className="w-[100px]">Financial Year</TableHead>
                  <TableHead className="w-[100px]">Start Date</TableHead>
                  <TableHead className="w-[100px]">End Date</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:calendar-star" className="w-12 h-12 text-gray-300" />
                        <p>No public holidays found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium whitespace-nowrap">{holiday.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.holidayName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.financialYear}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.startDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.endDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(holiday.id)}
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
  )
}
