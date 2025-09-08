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
import { Plus, Search, Edit, Trash2, X } from "lucide-react"

interface EducationalQualification {
  id: string
  instituteName: string
  degree: string
  passingYear: string
  marks: string
  gpaCgpa: string
  class: string
}

interface ProfessionalExperience {
  id: string
  organisationName: string
  designation: string
  fromDate: string
  toDate: string
  responsibility: string
  skill: string
}

interface DeviceMapping {
  id: string
  serviceProviderName: string
  companyName: string
  branchName: string
  deviceName: string
  deviceEmployeeCode: string
}

interface Employee {
  id: string
  status: "Active" | "Inactive"
  serviceProvider: string
  companyName: string
  branchName: string
  firstName: string
  lastName: string
  employeeId: string
  departmentName: string
  designation: string
  managerName: string
  dateOfJoining: string
  employmentType: "Company" | "Contract"
  employmentStatus: "Probation" | "Permanent"
  contractor: string
  probationPeriod: string
  workShift: string
  attendancePolicy: string
  leavePolicy: string
  salaryPayGradeType: "Monthly" | "Hourly"
  monthlyPayGrade: string
  hourlyPayGrade: string
  businessPhoneNumber: string
  businessEmailAddress: string
  personalPhoneNumber: string
  personalEmailAddress: string
  emergencyContactNumber: string
  presentAddress: string
  permanentAddress: string
  photo: string
  gender: "Male" | "Female" | "Transgender"
  dob: string
  bloodGroup: string
  maritalStatus: "Single" | "Married"
  fatherName: string
  motherName: string
  spouseName: string
  educationalQualifications: EducationalQualification[]
  professionalExperiences: ProfessionalExperience[]
  deviceMappings: DeviceMapping[]
  createdAt: string
}

export function ManageEmployeesManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    status: "Active" as "Active" | "Inactive",
    serviceProvider: "",
    companyName: "",
    branchName: "",
    firstName: "",
    lastName: "",
    employeeId: "",
    departmentName: "",
    designation: "",
    managerName: "",
    dateOfJoining: "",
    employmentType: "Company" as "Company" | "Contract",
    employmentStatus: "Probation" as "Probation" | "Permanent",
    contractor: "",
    probationPeriod: "",
    workShift: "",
    attendancePolicy: "",
    leavePolicy: "",
    salaryPayGradeType: "Monthly" as "Monthly" | "Hourly",
    monthlyPayGrade: "",
    hourlyPayGrade: "",
    businessPhoneNumber: "",
    businessEmailAddress: "",
    personalPhoneNumber: "",
    personalEmailAddress: "",
    emergencyContactNumber: "",
    presentAddress: "",
    permanentAddress: "",
    photo: "",
    gender: "Male" as "Male" | "Female" | "Transgender",
    dob: "",
    bloodGroup: "",
    maritalStatus: "Single" as "Single" | "Married",
    fatherName: "",
    motherName: "",
    spouseName: "",
    educationalQualifications: [] as EducationalQualification[],
    professionalExperiences: [] as ProfessionalExperience[],
    deviceMappings: [] as DeviceMapping[]
  })

  const filteredEmployees = employees.filter(employee =>
    employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.businessEmailAddress.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingEmployee) {
      setEmployees(prev => 
        prev.map(employee => 
          employee.id === editingEmployee.id 
            ? { ...employee, ...formData, id: editingEmployee.id, createdAt: editingEmployee.createdAt }
            : employee
        )
      )
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setEmployees(prev => [...prev, newEmployee])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      status: "Active",
      serviceProvider: "",
      companyName: "",
      branchName: "",
      firstName: "",
      lastName: "",
      employeeId: "",
      departmentName: "",
      designation: "",
      managerName: "",
      dateOfJoining: "",
      employmentType: "Company",
      employmentStatus: "Probation",
      contractor: "",
      probationPeriod: "",
      workShift: "",
      attendancePolicy: "",
      leavePolicy: "",
      salaryPayGradeType: "Monthly",
      monthlyPayGrade: "",
      hourlyPayGrade: "",
      businessPhoneNumber: "",
      businessEmailAddress: "",
      personalPhoneNumber: "",
      personalEmailAddress: "",
      emergencyContactNumber: "",
      presentAddress: "",
      permanentAddress: "",
      photo: "",
      gender: "Male",
      dob: "",
      bloodGroup: "",
      maritalStatus: "Single",
      fatherName: "",
      motherName: "",
      spouseName: "",
      educationalQualifications: [],
      professionalExperiences: [],
      deviceMappings: []
    })
    setEditingEmployee(null)
  }

  const handleEdit = (employee: Employee) => {
    setFormData({
      status: employee.status,
      serviceProvider: employee.serviceProvider,
      companyName: employee.companyName,
      branchName: employee.branchName,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeId: employee.employeeId,
      departmentName: employee.departmentName,
      designation: employee.designation,
      managerName: employee.managerName,
      dateOfJoining: employee.dateOfJoining,
      employmentType: employee.employmentType,
      employmentStatus: employee.employmentStatus,
      contractor: employee.contractor,
      probationPeriod: employee.probationPeriod,
      workShift: employee.workShift,
      attendancePolicy: employee.attendancePolicy,
      leavePolicy: employee.leavePolicy,
      salaryPayGradeType: employee.salaryPayGradeType,
      monthlyPayGrade: employee.monthlyPayGrade,
      hourlyPayGrade: employee.hourlyPayGrade,
      businessPhoneNumber: employee.businessPhoneNumber,
      businessEmailAddress: employee.businessEmailAddress,
      personalPhoneNumber: employee.personalPhoneNumber,
      personalEmailAddress: employee.personalEmailAddress,
      emergencyContactNumber: employee.emergencyContactNumber,
      presentAddress: employee.presentAddress,
      permanentAddress: employee.permanentAddress,
      photo: employee.photo,
      gender: employee.gender,
      dob: employee.dob,
      bloodGroup: employee.bloodGroup,
      maritalStatus: employee.maritalStatus,
      fatherName: employee.fatherName,
      motherName: employee.motherName,
      spouseName: employee.spouseName,
      educationalQualifications: employee.educationalQualifications,
      professionalExperiences: employee.professionalExperiences,
      deviceMappings: employee.deviceMappings
    })
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id))
  }

  const addEducationalQualification = () => {
    const newQualification: EducationalQualification = {
      id: Date.now().toString(),
      instituteName: "",
      degree: "",
      passingYear: "",
      marks: "",
      gpaCgpa: "",
      class: ""
    }
    setFormData(prev => ({
      ...prev,
      educationalQualifications: [...prev.educationalQualifications, newQualification]
    }))
  }

  const removeEducationalQualification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.filter(q => q.id !== id)
    }))
  }

  const addProfessionalExperience = () => {
    const newExperience: ProfessionalExperience = {
      id: Date.now().toString(),
      organisationName: "",
      designation: "",
      fromDate: "",
      toDate: "",
      responsibility: "",
      skill: ""
    }
    setFormData(prev => ({
      ...prev,
      professionalExperiences: [...prev.professionalExperiences, newExperience]
    }))
  }

  const removeProfessionalExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      professionalExperiences: prev.professionalExperiences.filter(e => e.id !== id)
    }))
  }

  const addDeviceMapping = () => {
    const newMapping: DeviceMapping = {
      id: Date.now().toString(),
      serviceProviderName: "",
      companyName: "",
      branchName: "",
      deviceName: "",
      deviceEmployeeCode: ""
    }
    setFormData(prev => ({
      ...prev,
      deviceMappings: [...prev.deviceMappings, newMapping]
    }))
  }

  const removeDeviceMapping = (id: string) => {
    setFormData(prev => ({
      ...prev,
      deviceMappings: prev.deviceMappings.filter(m => m.id !== id)
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Employees</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your employees</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee 
                  ? "Update the employee information below." 
                  : "Fill in the details to add a new employee."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

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

              {/* Personal Information */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="Enter employee ID"
                    required
                  />
                </div>
              </div>

              {/* Job Information */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentName">Department Name *</Label>
                  <select
                    id="departmentName"
                    value={formData.departmentName}
                    onChange={(e) => setFormData(prev => ({ ...prev, departmentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation *</Label>
                  <select
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Designation</option>
                    <option value="Manager">Manager</option>
                    <option value="Developer">Developer</option>
                    <option value="Analyst">Analyst</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerName">Manager Name *</Label>
                  <select
                    id="managerName"
                    value={formData.managerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, managerName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Manager</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                  </select>
                </div>
              </div>

              {/* Employment Details */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfJoining: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <select
                    id="employmentType"
                    value={formData.employmentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value as "Company" | "Contract" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Company">Company</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <select
                    id="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, employmentStatus: e.target.value as "Probation" | "Permanent" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Probation">Probation</option>
                    <option value="Permanent">Permanent</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhoneNumber">Business Phone Number *</Label>
                  <Input
                    id="businessPhoneNumber"
                    value={formData.businessPhoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessPhoneNumber: e.target.value }))}
                    placeholder="Enter business phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmailAddress">Business Email Address *</Label>
                  <Input
                    id="businessEmailAddress"
                    type="email"
                    value={formData.businessEmailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessEmailAddress: e.target.value }))}
                    placeholder="Enter business email address"
                    required
                  />
                </div>
              </div>

              {/* Educational Qualifications Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Educational Qualifications</h3>
                  <Button type="button" onClick={addEducationalQualification} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Qualification
                  </Button>
                </div>
                {formData.educationalQualifications.map((qualification, index) => (
                  <div key={qualification.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Qualification {index + 1}</h4>
                      <Button type="button" onClick={() => removeEducationalQualification(qualification.id)} variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Institute Name</Label>
                        <Input
                          value={qualification.instituteName}
                          onChange={(e) => {
                            const updated = formData.educationalQualifications.map(q => 
                              q.id === qualification.id ? { ...q, instituteName: e.target.value } : q
                            )
                            setFormData(prev => ({ ...prev, educationalQualifications: updated }))
                          }}
                          placeholder="Enter institute name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={qualification.degree}
                          onChange={(e) => {
                            const updated = formData.educationalQualifications.map(q => 
                              q.id === qualification.id ? { ...q, degree: e.target.value } : q
                            )
                            setFormData(prev => ({ ...prev, educationalQualifications: updated }))
                          }}
                          placeholder="Enter degree"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passing Year</Label>
                        <Input
                          value={qualification.passingYear}
                          onChange={(e) => {
                            const updated = formData.educationalQualifications.map(q => 
                              q.id === qualification.id ? { ...q, passingYear: e.target.value } : q
                            )
                            setFormData(prev => ({ ...prev, educationalQualifications: updated }))
                          }}
                          placeholder="YYYY"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingEmployee ? "Update Employee" : "Add Employee"}
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredEmployees.length} employees
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-group" className="w-5 h-5" />
            Employee List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[120px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead className="w-[120px]">Department</TableHead>
                  <TableHead className="w-[120px]">Designation</TableHead>
                  <TableHead className="w-[120px]">Company</TableHead>
                  <TableHead className="w-[120px]">Branch</TableHead>
                  <TableHead className="w-[140px]">Email</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-group-outline" className="w-12 h-12 text-gray-300" />
                        <p>No employees found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={employee.status === "Active" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{employee.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.firstName} {employee.lastName}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.departmentName}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.designation}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.businessEmailAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{employee.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
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
