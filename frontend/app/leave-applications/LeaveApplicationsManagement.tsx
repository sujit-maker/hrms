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
import { Plus, Search, Edit, Trash2, Check, X } from "lucide-react"

interface LeaveApplication {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeId: string
  employeeName: string
  applicationDate: string
  leaveType: string
  fromDate: string
  toDate: string
  noOfDays: number
  purpose: string
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
  { id: "EMP001", name: "John Doe", sickLeave: 12, casualLeave: 8, earnedLeave: 15 },
  { id: "EMP002", name: "Jane Smith", sickLeave: 10, casualLeave: 6, earnedLeave: 12 },
  { id: "EMP003", name: "Mike Johnson", sickLeave: 15, casualLeave: 10, earnedLeave: 18 },
  { id: "EMP004", name: "Sarah Wilson", sickLeave: 8, casualLeave: 5, earnedLeave: 10 },
  { id: "EMP005", name: "David Brown", sickLeave: 20, casualLeave: 12, earnedLeave: 25 }
]

const mockLeaveTypes = [
  "Sick",
  "Casual",
  "Earned",
  "LoP"
]

export function LeaveApplicationsManagement() {
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<LeaveApplication | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeId: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    purpose: ""
  })

  const [selectedEmployee, setSelectedEmployee] = useState<typeof mockEmployees[0] | null>(null)

  const filteredApplications = leaveApplications.filter(application =>
    application.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    application.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(emp => emp.id === employeeId)
    setSelectedEmployee(employee || null)
    setFormData(prev => ({ ...prev, employeeId }))
  }

  const calculateDays = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0
    const start = new Date(fromDate)
    const end = new Date(toDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const noOfDays = calculateDays(formData.fromDate, formData.toDate)
    const employee = mockEmployees.find(emp => emp.id === formData.employeeId)
    
    if (editingApplication) {
      setLeaveApplications(prev => 
        prev.map(application => 
          application.id === editingApplication.id 
            ? { 
                ...application, 
                ...formData, 
                id: editingApplication.id, 
                createdAt: editingApplication.createdAt,
                noOfDays,
                employeeName: employee?.name || ""
              }
            : application
        )
      )
    } else {
      const newApplication: LeaveApplication = {
        id: Date.now().toString(),
        ...formData,
        employeeName: employee?.name || "",
        applicationDate: new Date().toISOString().split('T')[0],
        noOfDays,
        status: "Pending",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setLeaveApplications(prev => [...prev, newApplication])
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
      leaveType: "",
      fromDate: "",
      toDate: "",
      purpose: ""
    })
    setSelectedEmployee(null)
    setEditingApplication(null)
  }

  const handleEdit = (application: LeaveApplication) => {
    const employee = mockEmployees.find(emp => emp.id === application.employeeId)
    setFormData({
      serviceProvider: application.serviceProvider,
      companyName: application.companyName,
      branchName: application.branchName,
      employeeId: application.employeeId,
      leaveType: application.leaveType,
      fromDate: application.fromDate,
      toDate: application.toDate,
      purpose: application.purpose
    })
    setSelectedEmployee(employee || null)
    setEditingApplication(application)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setLeaveApplications(prev => prev.filter(application => application.id !== id))
  }

  const handleApprove = (id: string) => {
    setLeaveApplications(prev => 
      prev.map(application => 
        application.id === id 
          ? { ...application, status: "Approved" as const }
          : application
      )
    )
  }

  const handleReject = (id: string) => {
    setLeaveApplications(prev => 
      prev.map(application => 
        application.id === id 
          ? { ...application, status: "Rejected" as const }
          : application
      )
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Leave Applications</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage employee leave applications and approvals</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Submit Application
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingApplication ? "Edit Leave Application" : "Submit Leave Application"}
                </DialogTitle>
                <DialogDescription>
                  {editingApplication 
                    ? "Update the leave application information below." 
                    : "Fill in the details to submit a new leave application."
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
                      onChange={(e) => handleEmployeeChange(e.target.value)}
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
                  {selectedEmployee && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Employee ID: {selectedEmployee.id}</h4>
                      <p className="text-sm text-gray-600">Fetch by Name</p>
                    </div>
                  )}
                </div>

                {/* Leave Balance Display */}
                {selectedEmployee && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Leave Balance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-blue-900">Sick Leave</h4>
                        <p className="text-2xl font-bold text-blue-600">{selectedEmployee.sickLeave}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-green-900">Casual Leave</h4>
                        <p className="text-2xl font-bold text-green-600">{selectedEmployee.casualLeave}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-purple-900">Earned Leave</h4>
                        <p className="text-2xl font-bold text-purple-600">{selectedEmployee.earnedLeave}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leave Application Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Leave Application Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaveType">Leave Type *</Label>
                      <select
                        id="leaveType"
                        value={formData.leaveType}
                        onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Leave Type</option>
                        {mockLeaveTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Calculated Days</Label>
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                        {calculateDays(formData.fromDate, formData.toDate)} days
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDate">From Date *</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={formData.fromDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toDate">To Date *</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={formData.toDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Input
                      id="purpose"
                      type="text"
                      value={formData.purpose}
                      onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                      placeholder="Enter purpose for leave"
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingApplication ? "Update Application" : "Submit Application"}
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
                placeholder="Search leave applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredApplications.length} applications
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Leave Applications Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:calendar-clock" className="w-5 h-5" />
            Leave Application Request
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead className="w-[120px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[120px]">Branch Name</TableHead>
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[120px]">Application Date</TableHead>
                  <TableHead className="w-[100px]">Leave Type</TableHead>
                  <TableHead className="w-[100px]">From Date</TableHead>
                  <TableHead className="w-[100px]">To Date</TableHead>
                  <TableHead className="w-[100px]">No of Days</TableHead>
                  <TableHead className="w-[150px]">Purpose</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:calendar-clock" className="w-12 h-12 text-gray-300" />
                        <p>No leave applications found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((application, index) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium whitespace-nowrap">{index + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.applicationDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.leaveType}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.fromDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.toDate}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{application.noOfDays}</TableCell>
                      <TableCell className="whitespace-nowrap">{application.purpose}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                          application.status === "Approved" ? "default" : 
                          application.status === "Rejected" ? "destructive" : "secondary"
                        }>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {application.status === "Pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(application.id)}
                                className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(application.id)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(application)}
                            className="h-7 w-7 p-0"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(application.id)}
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
