"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
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
import { Plus, Search, Edit, Trash2, CheckCircle } from "lucide-react"

interface EmployeePromotion {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeName: string
  employeeId: string
  currentDepartment: string
  currentDesignation: string
  currentPaygrade: string
  currentSalary: string
  employmentType: "Company" | "Contract"
  employmentStatus: "Probation" | "Permanent"
  promotedDepartment: string
  promotedDesignation: string
  promotedPaygrade: string
  promotedEmploymentType: "Company" | "Contract"
  promotedEmploymentStatus: "Probation" | "Permanent"
  promotedNewSalary: string
  description: string
  promotionDate: string
  status: "Not Applied" | "Applied"
  createdAt: string
}

export function EmployeesPromotionsManagement() {
  const [promotions, setPromotions] = useState<EmployeePromotion[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<EmployeePromotion | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeName: "",
    employeeId: "",
    currentDepartment: "",
    currentDesignation: "",
    currentPaygrade: "",
    currentSalary: "",
    employmentType: "Company" as "Company" | "Contract",
    employmentStatus: "Probation" as "Probation" | "Permanent",
    promotedDepartment: "",
    promotedDesignation: "",
    promotedPaygrade: "",
    promotedEmploymentType: "Company" as "Company" | "Contract",
    promotedEmploymentStatus: "Probation" as "Probation" | "Permanent",
    promotedNewSalary: "",
    description: "",
    promotionDate: "",
    status: "Not Applied" as "Not Applied" | "Applied"
  })

  const filteredPromotions = promotions.filter(promotion =>
    promotion.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.currentDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    promotion.promotedDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPromotion) {
      setPromotions(prev => 
        prev.map(promotion => 
          promotion.id === editingPromotion.id 
            ? { ...promotion, ...formData, id: editingPromotion.id, createdAt: editingPromotion.createdAt }
            : promotion
        )
      )
    } else {
      const newPromotion: EmployeePromotion = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPromotions(prev => [...prev, newPromotion])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeName: "",
      employeeId: "",
      currentDepartment: "",
      currentDesignation: "",
      currentPaygrade: "",
      currentSalary: "",
      employmentType: "Company",
      employmentStatus: "Probation",
      promotedDepartment: "",
      promotedDesignation: "",
      promotedPaygrade: "",
      promotedEmploymentType: "Company",
      promotedEmploymentStatus: "Probation",
      promotedNewSalary: "",
      description: "",
      promotionDate: "",
      status: "Not Applied"
    })
    setEditingPromotion(null)
  }

  const handleEdit = (promotion: EmployeePromotion) => {
    setFormData({
      serviceProvider: promotion.serviceProvider,
      companyName: promotion.companyName,
      branchName: promotion.branchName,
      employeeName: promotion.employeeName,
      employeeId: promotion.employeeId,
      currentDepartment: promotion.currentDepartment,
      currentDesignation: promotion.currentDesignation,
      currentPaygrade: promotion.currentPaygrade,
      currentSalary: promotion.currentSalary,
      employmentType: promotion.employmentType,
      employmentStatus: promotion.employmentStatus,
      promotedDepartment: promotion.promotedDepartment,
      promotedDesignation: promotion.promotedDesignation,
      promotedPaygrade: promotion.promotedPaygrade,
      promotedEmploymentType: promotion.promotedEmploymentType,
      promotedEmploymentStatus: promotion.promotedEmploymentStatus,
      promotedNewSalary: promotion.promotedNewSalary,
      description: promotion.description,
      promotionDate: promotion.promotionDate,
      status: promotion.status
    })
    setEditingPromotion(promotion)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPromotions(prev => prev.filter(promotion => promotion.id !== id))
  }

  const handleApprove = (id: string) => {
    setPromotions(prev => 
      prev.map(promotion => 
        promotion.id === id 
          ? { ...promotion, status: "Applied" as "Applied" }
          : promotion
      )
    )
  }

  const handleEmployeeSelect = (employeeName: string) => {
    // Simulate fetching employee data
    const mockEmployeeData = {
      employeeId: "EMP001",
      currentDepartment: "IT",
      currentDesignation: "Developer",
      currentPaygrade: "Grade 3",
      currentSalary: "50000",
      employmentType: "Company" as "Company" | "Contract",
      employmentStatus: "Permanent" as "Probation" | "Permanent"
    }
    
    setFormData(prev => ({
      ...prev,
      employeeName,
      employeeId: mockEmployeeData.employeeId,
      currentDepartment: mockEmployeeData.currentDepartment,
      currentDesignation: mockEmployeeData.currentDesignation,
      currentPaygrade: mockEmployeeData.currentPaygrade,
      currentSalary: mockEmployeeData.currentSalary,
      employmentType: mockEmployeeData.employmentType,
      employmentStatus: mockEmployeeData.employmentStatus
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Employees Promotions</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage employee promotions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Edit Promotion" : "Add New Promotion"}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion 
                  ? "Update the promotion information below." 
                  : "Fill in the details to add a new promotion."
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

              {/* Employee Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name *</Label>
                  <select
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, employeeName: e.target.value }))
                      handleEmployeeSelect(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    <option value="John Doe - EMP001">John Doe - EMP001</option>
                    <option value="Jane Smith - EMP002">Jane Smith - EMP002</option>
                    <option value="Mike Johnson - EMP003">Mike Johnson - EMP003</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    readOnly
                    className="bg-gray-50"
                    placeholder="Auto-filled from employee selection"
                  />
                </div>
              </div>

              {/* Current Position Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Position Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentDepartment">Current Department</Label>
                    <Input
                      id="currentDepartment"
                      value={formData.currentDepartment}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentDesignation">Current Designation</Label>
                    <Input
                      id="currentDesignation"
                      value={formData.currentDesignation}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentPaygrade">Current Paygrade</Label>
                    <Input
                      id="currentPaygrade"
                      value={formData.currentPaygrade}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentSalary">Current Salary</Label>
                    <Input
                      id="currentSalary"
                      value={formData.currentSalary}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Input
                      id="employmentType"
                      value={formData.employmentType}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employmentStatus">Employment Status</Label>
                    <Input
                      id="employmentStatus"
                      value={formData.employmentStatus}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Promoted Position Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Promoted Position Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promotedDepartment">Promoted Department *</Label>
                    <select
                      id="promotedDepartment"
                      value={formData.promotedDepartment}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedDepartment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="IT">IT</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotedDesignation">Promoted Designation *</Label>
                    <select
                      id="promotedDesignation"
                      value={formData.promotedDesignation}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedDesignation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Designation</option>
                      <option value="Senior Developer">Senior Developer</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Manager">Manager</option>
                      <option value="Senior Manager">Senior Manager</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotedPaygrade">Promoted Paygrade *</Label>
                    <select
                      id="promotedPaygrade"
                      value={formData.promotedPaygrade}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedPaygrade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Paygrade</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promotedEmploymentType">Employment Type *</Label>
                    <select
                      id="promotedEmploymentType"
                      value={formData.promotedEmploymentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedEmploymentType: e.target.value as "Company" | "Contract" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Company">Company</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotedEmploymentStatus">Employment Status *</Label>
                    <select
                      id="promotedEmploymentStatus"
                      value={formData.promotedEmploymentStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedEmploymentStatus: e.target.value as "Probation" | "Permanent" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Probation">Probation</option>
                      <option value="Permanent">Permanent</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotedNewSalary">Promoted New Salary *</Label>
                    <Input
                      id="promotedNewSalary"
                      value={formData.promotedNewSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotedNewSalary: e.target.value }))}
                      placeholder="Enter new salary"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter promotion description"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promotionDate">Promotion Date *</Label>
                    <Input
                      id="promotionDate"
                      type="date"
                      value={formData.promotionDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, promotionDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Not Applied" | "Applied" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Not Applied">Not Applied</option>
                      <option value="Applied">Applied</option>
                    </select>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPromotion ? "Update Promotion" : "Add Promotion"}
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
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredPromotions.length} promotions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trending-up" className="w-5 h-5" />
            Promotion List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[120px]">Current Dept</TableHead>
                  <TableHead className="w-[120px]">Promoted Dept</TableHead>
                  <TableHead className="w-[120px]">Current Designation</TableHead>
                  <TableHead className="w-[120px]">Promoted Designation</TableHead>
                  <TableHead className="w-[100px]">Current Salary</TableHead>
                  <TableHead className="w-[100px]">New Salary</TableHead>
                  <TableHead className="w-[100px]">Promotion Date</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:trending-up" className="w-12 h-12 text-gray-300" />
                        <p>No promotions found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={promotion.status === "Applied" ? "default" : "secondary"}>
                          {promotion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{promotion.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.currentDepartment}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.promotedDepartment}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.currentDesignation}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.promotedDesignation}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.currentSalary}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.promotedNewSalary}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.promotionDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{promotion.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {promotion.status === "Not Applied" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApprove(promotion.id)}
                              className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Set as Approved"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(promotion)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(promotion.id)}
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
