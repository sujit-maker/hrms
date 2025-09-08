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

interface Department {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  departmentName: string
  createdAt: string
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    departmentName: ""
  })

  const filteredDepartments = departments.filter(department =>
    department.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingDepartment) {
      // Update existing department
      setDepartments(prev => 
        prev.map(department => 
          department.id === editingDepartment.id 
            ? { 
                ...department, 
                ...formData,
                id: editingDepartment.id,
                createdAt: editingDepartment.createdAt
              }
            : department
        )
      )
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setDepartments(prev => [...prev, newDepartment])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      departmentName: ""
    })
    setEditingDepartment(null)
  }

  const handleEdit = (department: Department) => {
    setFormData({
      serviceProvider: department.serviceProvider,
      companyName: department.companyName,
      branchName: department.branchName,
      departmentName: department.departmentName
    })
    setEditingDepartment(department)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(department => department.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your departments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment 
                  ? "Update the department information below." 
                  : "Fill in the details to add a new department."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <option value="Provider 3">Provider 3</option>
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
                  <option value="Company 3">Company 3</option>
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
                  <option value="Branch 3">Branch 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentName">Department Name *</Label>
                <Input
                  id="departmentName"
                  value={formData.departmentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, departmentName: e.target.value }))}
                  placeholder="Enter department name"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingDepartment ? "Update Department" : "Add Department"}
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
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredDepartments.length} departments
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Department Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building" className="w-5 h-5" />
            Department List
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
                  <TableHead className="w-[150px]">Department Name</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:office-building-outline" className="w-12 h-12 text-gray-300" />
                        <p>No departments found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="whitespace-nowrap">{department.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{department.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{department.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{department.departmentName}</TableCell>
                      <TableCell className="whitespace-nowrap">{department.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(department)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(department.id)}
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
