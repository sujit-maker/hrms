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
import { Plus, Search, Edit, Trash2, Check, X } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface LeaveApplication {
  id: string
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  manageEmployeeID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  employeeId?: string
  employeeName?: string
  remainingSickLeave?: number
  remainingCasualLeave?: number
  remainingEarnedLeave?: number
  appliedLeaveType?: string
  fromDate: string
  toDate: string
  purpose?: string
  status?: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

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
    employeeName: "",
    leaveType: "",
    fromDate: "",
    toDate: "",
    purpose: "",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    manageEmployeeID: undefined as number | undefined,
  })

  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)

  // API functions for search and suggest
  const fetchServiceProviders = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/service-provider`, {
        cache: "no-store",
      })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching service providers:", error)
      return []
    }
  }

  const fetchCompanies = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/company`, { cache: "no-store" })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching companies:", error)
      return []
    }
  }

  const fetchBranches = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, { cache: "no-store" })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.branchName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching branches:", error)
      return []
    }
  }

  const fetchEmployees = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/manage-emp`, { cache: "no-store" })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) => {
            const fullName = `${item?.employeeFirstName || ""} ${item?.employeeLastName || ""}`.trim().toLowerCase()
            const employeeId = (item?.employeeID || "").toLowerCase()
            return fullName.includes(q) || employeeId.includes(q)
          }).map((item: any) => ({
            ...item,
            displayName: `${item?.employeeFirstName || ""} ${item?.employeeLastName || ""}`.trim() + (item?.employeeID ? ` (${item.employeeID})` : "")
          }))
        : []
    } catch (error) {
      console.error("Error fetching employees:", error)
      return []
    }
  }

  // Load leave applications on component mount
  useEffect(() => {
    loadLeaveApplications()
  }, [])

  const loadLeaveApplications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/leave-application`, {
        cache: "no-store",
      })
      const data = await res.json()
      const leaveApplicationsData = (Array.isArray(data) ? data : []).map(
        (application: any) => ({
          id: application.id.toString(),
          serviceProviderID: application.serviceProviderID,
          companyID: application.companyID,
          branchesID: application.branchesID,
          manageEmployeeID: application.manageEmployeeID,
          serviceProvider: application.serviceProvider?.companyName || "",
          companyName: application.company?.companyName || "",
          branchName: application.branches?.branchName || "",
          employeeId: application.manageEmployee?.employeeID || "",
          employeeName: application.manageEmployee ? 
            `${application.manageEmployee.employeeFirstName || ""} ${application.manageEmployee.employeeLastName || ""}`.trim() : "",
          remainingSickLeave: application.remainingSickLeave,
          remainingCasualLeave: application.remainingCasualLeave,
          remainingEarnedLeave: application.remainingEarnedLeave,
          appliedLeaveType: application.appliedLeaveType,
          fromDate: application.fromDate
            ? new Date(application.fromDate).toISOString().split("T")[0]
            : "",
          toDate: application.toDate
            ? new Date(application.toDate).toISOString().split("T")[0]
            : "",
          purpose: application.purpose,
          status: (application.status || "Pending") as "Pending" | "Approved" | "Rejected",
          createdAt: application.createdAt
            ? new Date(application.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
      )
      setLeaveApplications(leaveApplicationsData)
    } catch (error) {
      console.error("Error loading leave applications:", error)
    }
  }

  const filteredApplications = leaveApplications.filter(application =>
    (application.serviceProvider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (application.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (application.branchName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (application.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (application.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (application.appliedLeaveType || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleServiceProviderSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      serviceProvider: selected.display,
      serviceProviderID: selected.value,
    }))
  }

  const handleCompanySelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      companyName: selected.display,
      companyID: selected.value,
    }))
  }

  const handleBranchSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      branchName: selected.display,
      branchesID: selected.value,
    }))
  }

  const handleEmployeeSelect = (selected: SelectedItem) => {
    const employee = selected.item
    const fullName = `${employee?.employeeFirstName || ""} ${employee?.employeeLastName || ""}`.trim()
    setSelectedEmployee(employee)
    setFormData((prev) => ({
      ...prev,
      employeeName: selected.display,
      manageEmployeeID: selected.value,
    }))
  }

  const calculateDays = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0
    const start = new Date(fromDate)
    const end = new Date(toDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const leaveApplicationData = {
        serviceProviderID: formData.serviceProviderID,
        companyID: formData.companyID,
        branchesID: formData.branchesID,
        manageEmployeeID: formData.manageEmployeeID,
        remainingSickLeave: selectedEmployee?.remainingSickLeave || 0,
        remainingCasualLeave: selectedEmployee?.remainingCasualLeave || 0,
        remainingEarnedLeave: selectedEmployee?.remainingEarnedLeave || 0,
        appliedLeaveType: formData.leaveType,
        fromDate: formData.fromDate ? new Date(formData.fromDate) : null,
        toDate: formData.toDate ? new Date(formData.toDate) : null,
        purpose: formData.purpose,
      }

      const url = editingApplication
        ? `${BACKEND_URL}/leave-application/${editingApplication.id}`
        : `${BACKEND_URL}/leave-application`
      const method = editingApplication ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leaveApplicationData),
      })
      if (!res.ok) {
        throw new Error(`Failed to save leave application: ${res.status}`)
      }

      await loadLeaveApplications()
    resetForm()
    setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving leave application:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeName: "",
      leaveType: "",
      fromDate: "",
      toDate: "",
      purpose: "",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      manageEmployeeID: undefined,
    })
    setSelectedEmployee(null)
    setEditingApplication(null)
  }

  const handleEdit = (application: LeaveApplication) => {
    setFormData({
      serviceProvider: application.serviceProvider || "",
      companyName: application.companyName || "",
      branchName: application.branchName || "",
      employeeName: application.employeeName || "",
      leaveType: application.appliedLeaveType || "",
      fromDate: application.fromDate,
      toDate: application.toDate,
      purpose: application.purpose || "",
      serviceProviderID: application.serviceProviderID,
      companyID: application.companyID,
      branchesID: application.branchesID,
      manageEmployeeID: application.manageEmployeeID,
    })
    setSelectedEmployee({
      remainingSickLeave: application.remainingSickLeave,
      remainingCasualLeave: application.remainingCasualLeave,
      remainingEarnedLeave: application.remainingEarnedLeave,
    })
    setEditingApplication(application)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/leave-application/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`Failed to delete leave application: ${res.status}`)
      }
      await loadLeaveApplications()
    } catch (error) {
      console.error("Error deleting leave application:", error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/leave-application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }),
      })
      if (!res.ok) {
        throw new Error(`Failed to approve leave application: ${res.status}`)
      }
      await loadLeaveApplications()
    } catch (error) {
      console.error("Error approving leave application:", error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/leave-application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }),
      })
      if (!res.ok) {
        throw new Error(`Failed to reject leave application: ${res.status}`)
      }
      await loadLeaveApplications()
    } catch (error) {
      console.error("Error rejecting leave application:", error)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-full mx-auto px-4 overflow-hidden">
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
                    <SearchSuggestInput
                      label="Service Provider"
                      placeholder="Select Service Provider"
                        value={formData.serviceProvider}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, serviceProvider: value }))
                      }
                      onSelect={handleServiceProviderSelect}
                      fetchData={fetchServiceProviders}
                      displayField="companyName"
                      valueField="id"
                        required
                    />
                    <SearchSuggestInput
                      label="Company Name"
                      placeholder="Select Company"
                        value={formData.companyName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, companyName: value }))
                      }
                      onSelect={handleCompanySelect}
                      fetchData={fetchCompanies}
                      displayField="companyName"
                      valueField="id"
                        required
                    />
                    <SearchSuggestInput
                      label="Branch Name"
                      placeholder="Select Branch"
                        value={formData.branchName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, branchName: value }))
                      }
                      onSelect={handleBranchSelect}
                      fetchData={fetchBranches}
                      displayField="branchName"
                      valueField="id"
                        required
                    />
                  </div>
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employee Selection</h3>
                  <div className="space-y-2">
                    <SearchSuggestInput
                      label="Employee Name"
                      placeholder="Select Employee"
                      value={formData.employeeName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, employeeName: value }))
                      }
                      onSelect={handleEmployeeSelect}
                      fetchData={fetchEmployees}
                      displayField="displayName"
                      valueField="id"
                      required
                    />
                    <p className="text-xs text-gray-500">Show FirstName + LastName + Emp ID</p>
                  </div>
                  {/* {selectedEmployee && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Employee ID: {selectedEmployee.employeeID}</h4>
                      <p className="text-sm text-gray-600">Fetch by Name</p>
                    </div>
                  )} */}
                </div>

                {/* Leave Balance Display
                {selectedEmployee && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Leave Balance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-blue-900">Sick Leave</h4>
                        <p className="text-2xl font-bold text-blue-600">{selectedEmployee.remainingSickLeave || 0}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-green-900">Casual Leave</h4>
                        <p className="text-2xl font-bold text-green-600">{selectedEmployee.remainingCasualLeave || 0}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-md text-center">
                        <h4 className="font-medium text-purple-900">Earned Leave</h4>
                        <p className="text-2xl font-bold text-purple-600">{selectedEmployee.remainingEarnedLeave || 0}</p>
                        <p className="text-xs text-gray-500">Show remaining</p>
                      </div>
                    </div>
                  </div>
                )} */}

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
        <CardContent className="p-0">
          <div className="overflow-x-auto max-w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="w-[90px]">Service Provider</TableHead>
                  <TableHead className="w-[80px]">Company Name</TableHead>
                  <TableHead className="w-[80px]">Branch Name</TableHead>
                  <TableHead className="w-[70px]">Employee ID</TableHead>
                  <TableHead className="w-[100px]">Employee Name</TableHead>
                  <TableHead className="w-[70px]">Leave Type</TableHead>
                  <TableHead className="w-[70px]">From Date</TableHead>
                  <TableHead className="w-[70px]">To Date</TableHead>
                  <TableHead className="w-[60px]">No of Days</TableHead>
                  <TableHead className="w-[80px]">Purpose</TableHead>
                  <TableHead className="w-[70px]">Status</TableHead>
                  <TableHead className="w-[80px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-gray-500">
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
                      <TableCell className="font-medium truncate">{index + 1}</TableCell>
                      <TableCell className="truncate" title={application.serviceProvider}>{application.serviceProvider}</TableCell>
                      <TableCell className="truncate" title={application.companyName}>{application.companyName}</TableCell>
                      <TableCell className="truncate" title={application.branchName}>{application.branchName}</TableCell>
                      <TableCell className="truncate">{application.employeeId}</TableCell>
                      <TableCell className="truncate" title={application.employeeName}>{application.employeeName}</TableCell>
                      <TableCell className="truncate">{application.appliedLeaveType}</TableCell>
                      <TableCell className="truncate">{application.fromDate}</TableCell>
                      <TableCell className="truncate">{application.toDate}</TableCell>
                      <TableCell className="truncate text-center">{calculateDays(application.fromDate, application.toDate)}</TableCell>
                      <TableCell className="truncate" title={application.purpose}>{application.purpose}</TableCell>
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
