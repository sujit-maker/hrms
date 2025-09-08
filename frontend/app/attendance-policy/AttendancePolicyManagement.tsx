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

interface AttendancePolicy {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  attendancePolicyName: string
  workingHours: "Fixed" | "Flexible"
  checkInBeginBefore: number
  checkOutEndAfter: number
  checkInGraceTime: number
  minimumWorkHoursForHalfDay: number
  allowEmployeeToMarkAttendanceFromDashboard: boolean
  allowManagerToUpdateOT: boolean
  maximumOTHoursPerDay: number
  createdAt: string
}

export function AttendancePolicyManagement() {
  const [policies, setPolicies] = useState<AttendancePolicy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    attendancePolicyName: "",
    workingHours: "Fixed" as "Fixed" | "Flexible",
    checkInBeginBefore: 0,
    checkOutEndAfter: 0,
    checkInGraceTime: 0,
    minimumWorkHoursForHalfDay: 0,
    allowEmployeeToMarkAttendanceFromDashboard: false,
    allowManagerToUpdateOT: false,
    maximumOTHoursPerDay: 0
  })

  const filteredPolicies = policies.filter(policy =>
    policy.attendancePolicyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPolicy) {
      setPolicies(prev => 
        prev.map(policy => 
          policy.id === editingPolicy.id 
            ? { ...policy, ...formData, id: editingPolicy.id, createdAt: editingPolicy.createdAt }
            : policy
        )
      )
    } else {
      const newPolicy: AttendancePolicy = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPolicies(prev => [...prev, newPolicy])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      attendancePolicyName: "",
      workingHours: "Fixed",
      checkInBeginBefore: 0,
      checkOutEndAfter: 0,
      checkInGraceTime: 0,
      minimumWorkHoursForHalfDay: 0,
      allowEmployeeToMarkAttendanceFromDashboard: false,
      allowManagerToUpdateOT: false,
      maximumOTHoursPerDay: 0
    })
    setEditingPolicy(null)
  }

  const handleEdit = (policy: AttendancePolicy) => {
    setFormData({
      serviceProvider: policy.serviceProvider,
      companyName: policy.companyName,
      branchName: policy.branchName,
      attendancePolicyName: policy.attendancePolicyName,
      workingHours: policy.workingHours,
      checkInBeginBefore: policy.checkInBeginBefore,
      checkOutEndAfter: policy.checkOutEndAfter,
      checkInGraceTime: policy.checkInGraceTime,
      minimumWorkHoursForHalfDay: policy.minimumWorkHoursForHalfDay,
      allowEmployeeToMarkAttendanceFromDashboard: policy.allowEmployeeToMarkAttendanceFromDashboard,
      allowManagerToUpdateOT: policy.allowManagerToUpdateOT,
      maximumOTHoursPerDay: policy.maximumOTHoursPerDay
    })
    setEditingPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Policy</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage attendance policies and rules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Attendance Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit Attendance Policy" : "Add New Attendance Policy"}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy 
                  ? "Update the attendance policy information below." 
                  : "Fill in the details to add a new attendance policy."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
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
                    <option value="Provider 1">Provider 1</option>
                    <option value="Provider 2">Provider 2</option>
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
                    <option value="Company 1">Company 1</option>
                    <option value="Company 2">Company 2</option>
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
                    <option value="Branch 1">Branch 1</option>
                    <option value="Branch 2">Branch 2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendancePolicyName">Attendance Policy Name *</Label>
                <Input
                  id="attendancePolicyName"
                  value={formData.attendancePolicyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendancePolicyName: e.target.value }))}
                  placeholder="Enter attendance policy name"
                  required
                />
              </div>

              {/* Working Hours Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Working Hours Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="workingHours">Working Hours *</Label>
                  <select
                    id="workingHours"
                    value={formData.workingHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value as "Fixed" | "Flexible" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Check-In/Check-Out Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Check-In/Check-Out Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInBeginBefore">Check-In Begin Before (Minutes) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="checkInBeginBefore"
                        type="number"
                        min="0"
                        value={formData.checkInBeginBefore}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkInBeginBefore: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOutEndAfter">Check-Out End After (Minutes) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="checkOutEndAfter"
                        type="number"
                        min="0"
                        value={formData.checkOutEndAfter}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkOutEndAfter: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>
                </div>
              </div>

              {/* Grace Time and Minimum Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Grace Time and Minimum Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkInGraceTime">Check-In Grace Time (Minutes) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="checkInGraceTime"
                        type="number"
                        min="0"
                        value={formData.checkInGraceTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkInGraceTime: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed Shift</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumWorkHoursForHalfDay">Minimum Work Hours for Half Day (Minutes) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="minimumWorkHoursForHalfDay"
                        type="number"
                        min="0"
                        value={formData.minimumWorkHoursForHalfDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumWorkHoursForHalfDay: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>
                </div>
              </div>

              {/* Employee Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employee Permissions</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowEmployeeToMarkAttendanceFromDashboard"
                      checked={formData.allowEmployeeToMarkAttendanceFromDashboard}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowEmployeeToMarkAttendanceFromDashboard: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="allowEmployeeToMarkAttendanceFromDashboard">
                      Allow employee to mark attendance from Dashboard
                    </Label>
                  </div>
                </div>
              </div>

              {/* Overtime Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Overtime Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowManagerToUpdateOT"
                      checked={formData.allowManagerToUpdateOT}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowManagerToUpdateOT: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <Label htmlFor="allowManagerToUpdateOT">
                      Allow Manager to Update OT (Yes/No)
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximumOTHoursPerDay">Maximum OT Hours / Per Day (Minutes) *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="maximumOTHoursPerDay"
                        type="number"
                        min="0"
                        value={formData.maximumOTHoursPerDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, maximumOTHoursPerDay: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPolicy ? "Update Attendance Policy" : "Add Attendance Policy"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search attendance policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredPolicies.length} policies
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Policy Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-check" className="w-5 h-5" />
            Attendance Policy List
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
                  <TableHead className="w-[150px]">Policy Name</TableHead>
                  <TableHead className="w-[100px]">Working Hours</TableHead>
                  <TableHead className="w-[100px]">Check-In Grace</TableHead>
                  <TableHead className="w-[100px]">Min Half Day</TableHead>
                  <TableHead className="w-[100px]">Max OT/Day</TableHead>
                  <TableHead className="w-[100px]">Dashboard Access</TableHead>
                  <TableHead className="w-[100px]">Manager OT</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-check" className="w-12 h-12 text-gray-300" />
                        <p>No attendance policies found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="whitespace-nowrap">{policy.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{policy.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{policy.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{policy.attendancePolicyName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={policy.workingHours === "Fixed" ? "default" : "secondary"}>
                          {policy.workingHours}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.checkInGraceTime}m</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.minimumWorkHoursForHalfDay}m</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.maximumOTHoursPerDay}m</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant={policy.allowEmployeeToMarkAttendanceFromDashboard ? "default" : "secondary"}>
                          {policy.allowEmployeeToMarkAttendanceFromDashboard ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant={policy.allowManagerToUpdateOT ? "default" : "secondary"}>
                          {policy.allowManagerToUpdateOT ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{policy.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(policy)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(policy.id)}
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
