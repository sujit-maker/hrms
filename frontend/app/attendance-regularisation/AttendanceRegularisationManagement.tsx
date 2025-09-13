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
import { Plus, Search, Edit, Trash2, Clock, Check, X } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface AttendanceRegularisation {
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
  attendanceDate: string
  checkInTime: string
  checkOutTime: string
  remarks?: string
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

export function AttendanceRegularisationManagement() {
  const [regularisations, setRegularisations] = useState<AttendanceRegularisation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRegularisation, setEditingRegularisation] = useState<AttendanceRegularisation | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeName: "",
    attendanceDate: "",
    checkInTime: "",
    checkOutTime: "",
    remarks: "",
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

  // Load attendance regularisations on component mount
  useEffect(() => {
    loadAttendanceRegularisations()
  }, [])

  const loadAttendanceRegularisations = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/emp-attendance-regularise`, {
        cache: "no-store",
      })
      const data = await res.json()
      const regularisationsData = (Array.isArray(data) ? data : []).map(
        (regularisation: any) => ({
          id: regularisation.id.toString(),
          serviceProviderID: regularisation.serviceProviderID,
          companyID: regularisation.companyID,
          branchesID: regularisation.branchesID,
          manageEmployeeID: regularisation.manageEmployeeID,
          serviceProvider: regularisation.serviceProvider?.companyName || "",
          companyName: regularisation.company?.companyName || "",
          branchName: regularisation.branches?.branchName || "",
          employeeId: regularisation.manageEmployee?.employeeID || "",
          employeeName: regularisation.manageEmployee ? 
            `${regularisation.manageEmployee.employeeFirstName || ""} ${regularisation.manageEmployee.employeeLastName || ""}`.trim() : "",
          attendanceDate: regularisation.attendanceDate
            ? new Date(regularisation.attendanceDate).toISOString().split("T")[0]
            : "",
          checkInTime: regularisation.checkInTime
            ? new Date(regularisation.checkInTime).toTimeString().split(' ')[0]
            : "",
          checkOutTime: regularisation.checkOutTime
            ? new Date(regularisation.checkOutTime).toTimeString().split(' ')[0]
            : "",
          remarks: regularisation.remarks,
          status: "Pending" as "Pending" | "Approved" | "Rejected",
          createdAt: regularisation.createdAt
            ? new Date(regularisation.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
      )
      setRegularisations(regularisationsData)
    } catch (error) {
      console.error("Error loading attendance regularisations:", error)
    }
  }

  const filteredRegularisations = regularisations.filter(regularisation =>
    (regularisation.serviceProvider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regularisation.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regularisation.branchName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regularisation.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regularisation.employeeId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (regularisation.attendanceDate || "").toLowerCase().includes(searchTerm.toLowerCase())
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
    setSelectedEmployee(employee)
    setFormData((prev) => ({
      ...prev,
      employeeName: selected.display,
      manageEmployeeID: selected.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const attendanceRegularisationData = {
        serviceProviderID: formData.serviceProviderID,
        companyID: formData.companyID,
        branchesID: formData.branchesID,
        manageEmployeeID: formData.manageEmployeeID,
        attendanceDate: formData.attendanceDate ? new Date(formData.attendanceDate) : null,
        checkInTime: formData.checkInTime ? new Date(`2000-01-01T${formData.checkInTime}`) : null,
        checkOutTime: formData.checkOutTime ? new Date(`2000-01-01T${formData.checkOutTime}`) : null,
        remarks: formData.remarks,
      }

      const url = editingRegularisation
        ? `${BACKEND_URL}/emp-attendance-regularise/${editingRegularisation.id}`
        : `${BACKEND_URL}/emp-attendance-regularise`
      const method = editingRegularisation ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceRegularisationData),
      })
      if (!res.ok) {
        throw new Error(`Failed to save attendance regularisation: ${res.status}`)
      }

      await loadAttendanceRegularisations()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving attendance regularisation:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeName: "",
      attendanceDate: "",
      checkInTime: "",
      checkOutTime: "",
      remarks: "",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      manageEmployeeID: undefined,
    })
    setSelectedEmployee(null)
    setEditingRegularisation(null)
  }

  const handleEdit = (regularisation: AttendanceRegularisation) => {
    setFormData({
      serviceProvider: regularisation.serviceProvider || "",
      companyName: regularisation.companyName || "",
      branchName: regularisation.branchName || "",
      employeeName: regularisation.employeeName || "",
      attendanceDate: regularisation.attendanceDate,
      checkInTime: regularisation.checkInTime,
      checkOutTime: regularisation.checkOutTime,
      remarks: regularisation.remarks || "",
      serviceProviderID: regularisation.serviceProviderID,
      companyID: regularisation.companyID,
      branchesID: regularisation.branchesID,
      manageEmployeeID: regularisation.manageEmployeeID,
    })
    setSelectedEmployee({
      employeeID: regularisation.employeeId,
      employeeFirstName: regularisation.employeeName?.split(' ')[0] || "",
      employeeLastName: regularisation.employeeName?.split(' ').slice(1).join(' ') || "",
    })
    setEditingRegularisation(regularisation)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/emp-attendance-regularise/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`Failed to delete attendance regularisation: ${res.status}`)
      }
      await loadAttendanceRegularisations()
    } catch (error) {
      console.error("Error deleting attendance regularisation:", error)
    }
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

                {/* Attendance Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendance Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="attendanceDate">Attendance Date *</Label>
                    <Input
                      id="attendanceDate"
                      type="date"
                      value={formData.attendanceDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendanceDate: e.target.value }))}
                      className="w-full"
                      required
                    />
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
                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Input
                      id="remarks"
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                      placeholder="Enter remarks for attendance regularisation"
                      className="w-full"
                    />
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
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">#</TableHead>
                  <TableHead className="w-[120px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[120px]">Branch Name</TableHead>
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[120px]">Attendance Date</TableHead>
                  <TableHead className="w-[120px]">Check-In Time</TableHead>
                  <TableHead className="w-[120px]">Check-Out Time</TableHead>
                  <TableHead className="w-[150px]">Remarks</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegularisations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-edit" className="w-12 h-12 text-gray-300" />
                        <p>No attendance regularisations found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegularisations.map((regularisation, index) => (
                    <TableRow key={regularisation.id}>
                      <TableCell className="font-medium whitespace-nowrap">{index + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.attendanceDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.checkInTime}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.checkOutTime}</TableCell>
                      <TableCell className="whitespace-nowrap">{regularisation.remarks}</TableCell>
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
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(regularisation.id)}
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
