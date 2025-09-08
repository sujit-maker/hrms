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
import { Plus, Search, Edit, Trash2, Clock } from "lucide-react"

interface AttendanceRegularisation {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeId: string
  employeeName: string
  attendanceDate: string
  checkInTime: string
  checkOutTime: string
  status: "Pending" | "Approved" | "Rejected"
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

const mockEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
  { id: "EMP003", name: "Mike Johnson" },
  { id: "EMP004", name: "Sarah Wilson" },
  { id: "EMP005", name: "David Brown" }
]

// Generate dates for the last 30 days
const generateAttendanceDates = () => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

const mockAttendanceDates = generateAttendanceDates()

export function AttendanceRegularisationManagement() {
  const [regularisations, setRegularisations] = useState<AttendanceRegularisation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRegularisation, setEditingRegularisation] = useState<AttendanceRegularisation | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeId: "",
    attendanceDate: "",
    checkInTime: "",
    checkOutTime: ""
  })

  const filteredRegularisations = regularisations.filter(regularisation =>
    regularisation.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regularisation.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regularisation.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regularisation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    regularisation.attendanceDate.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingRegularisation) {
      setRegularisations(prev => 
        prev.map(regularisation => 
          regularisation.id === editingRegularisation.id 
            ? { ...regularisation, ...formData, id: editingRegularisation.id, createdAt: editingRegularisation.createdAt }
            : regularisation
        )
      )
    } else {
      const employee = mockEmployees.find(emp => emp.id === formData.employeeId)
      const newRegularisation: AttendanceRegularisation = {
        id: Date.now().toString(),
        ...formData,
        employeeName: employee?.name || "",
        status: "Pending",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setRegularisations(prev => [...prev, newRegularisation])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeId: "",
      attendanceDate: "",
      checkInTime: "",
      checkOutTime: ""
    })
    setEditingRegularisation(null)
  }

  const handleEdit = (regularisation: AttendanceRegularisation) => {
    setFormData({
      serviceProvider: regularisation.serviceProvider,
      companyName: regularisation.companyName,
      branchName: regularisation.branchName,
      employeeId: regularisation.employeeId,
      attendanceDate: regularisation.attendanceDate,
      checkInTime: regularisation.checkInTime,
      checkOutTime: regularisation.checkOutTime
    })
    setEditingRegularisation(regularisation)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setRegularisations(prev => prev.filter(regularisation => regularisation.id !== id))
  }

  const handleApprove = (id: string) => {
    setRegularisations(prev => 
      prev.map(regularisation => 
        regularisation.id === id 
          ? { ...regularisation, status: "Approved" as const }
          : regularisation
      )
    )
  }

  const handleReject = (id: string) => {
    setRegularisations(prev => 
      prev.map(regularisation => 
        regularisation.id === id 
          ? { ...regularisation, status: "Rejected" as const }
          : regularisation
      )
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Regularisation</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage attendance corrections and time adjustments</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Submit Regularisation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRegularisation ? "Edit Attendance Regularisation" : "Submit Attendance Regularisation"}
                </DialogTitle>
                <DialogDescription>
                  {editingRegularisation 
                    ? "Update the attendance regularisation information below." 
                    : "Fill in the details to submit a new attendance regularisation."
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

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employee Selection</h3>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee Name *</Label>
                    <select
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {mockEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Show FirstName + LastName + Emp ID</p>
                  </div>
                  {formData.employeeId && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Employee ID: {formData.employeeId}</h4>
                      <p className="text-sm text-gray-600">Fetch by Name</p>
                    </div>
                  )}
                </div>

                {/* Attendance Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendance Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="attendanceDate">Attendance Date *</Label>
                    <select
                      id="attendanceDate"
                      value={formData.attendanceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendanceDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Attendance Date</option>
                      {mockAttendanceDates.map((date) => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInTime">Check-In Time *</Label>
                      <Input
                        id="checkInTime"
                        type="time"
                        value={formData.checkInTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                        className="w-full"
                        required
                      />
                      <p className="text-xs text-gray-500">Format: 0:00:00</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutTime">Check-Out Time *</Label>
                      <Input
                        id="checkOutTime"
                        type="time"
                        value={formData.checkOutTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
                        className="w-full"
                        required
                      />
                      <p className="text-xs text-gray-500">Format: 0:00:00</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingRegularisation ? "Update Regularisation" : "Submit Regularisation"}
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
                placeholder="Search attendance regularisations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredRegularisations.length} regularisations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Regularisations Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-edit" className="w-5 h-5" />
            Attendance Regularisations List
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
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[120px]">Attendance Date</TableHead>
                  <TableHead className="w-[120px]">Check-In Time</TableHead>
                  <TableHead className="w-[120px]">Check-Out Time</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegularisations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-edit" className="w-12 h-12 text-gray-300" />
                        <p>No attendance regularisations found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegularisations.map((regularisation) => (
                    <TableRow key={regularisation.id}>
                      <TableCell className="font-medium whitespace-nowrap">{regularisation.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.attendanceDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.checkInTime}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.checkOutTime}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                          regularisation.status === "Approved" ? "default" : 
                          regularisation.status === "Rejected" ? "destructive" : "secondary"
                        }>
                          {regularisation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {regularisation.status === "Pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(regularisation.id)}
                                className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(regularisation.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                              >
                                <Clock className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(regularisation)}
                            className="h-7 w-7 p-0"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(regularisation.id)}
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
  )
}
