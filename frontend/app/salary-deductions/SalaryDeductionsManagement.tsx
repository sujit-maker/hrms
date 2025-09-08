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

interface SalaryDeduction {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  deductionName: string
  deductionType: "Fixed" | "Percentage"
  value: number
  perMonthLimit: number
  createdAt: string
}

export function SalaryDeductionsManagement() {
  const [deductions, setDeductions] = useState<SalaryDeduction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDeduction, setEditingDeduction] = useState<SalaryDeduction | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    deductionName: "",
    deductionType: "Fixed" as "Fixed" | "Percentage",
    value: 0,
    perMonthLimit: 0
  })

  const filteredDeductions = deductions.filter(deduction =>
    deduction.deductionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deduction.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deduction.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deduction.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingDeduction) {
      setDeductions(prev => 
        prev.map(deduction => 
          deduction.id === editingDeduction.id 
            ? { ...deduction, ...formData, id: editingDeduction.id, createdAt: editingDeduction.createdAt }
            : deduction
        )
      )
    } else {
      const newDeduction: SalaryDeduction = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setDeductions(prev => [...prev, newDeduction])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      deductionName: "",
      deductionType: "Fixed",
      value: 0,
      perMonthLimit: 0
    })
    setEditingDeduction(null)
  }

  const handleEdit = (deduction: SalaryDeduction) => {
    setFormData({
      serviceProvider: deduction.serviceProvider,
      companyName: deduction.companyName,
      branchName: deduction.branchName,
      deductionName: deduction.deductionName,
      deductionType: deduction.deductionType,
      value: deduction.value,
      perMonthLimit: deduction.perMonthLimit
    })
    setEditingDeduction(deduction)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeductions(prev => prev.filter(deduction => deduction.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Salary Deductions</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage salary deductions and withholdings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Salary Deduction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDeduction ? "Edit Salary Deduction" : "Add New Salary Deduction"}
              </DialogTitle>
              <DialogDescription>
                {editingDeduction 
                  ? "Update the salary deduction information below." 
                  : "Fill in the details to add a new salary deduction."
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
                <Label htmlFor="deductionName">Deduction Name *</Label>
                <Input
                  id="deductionName"
                  value={formData.deductionName}
                  onChange={(e) => setFormData(prev => ({ ...prev, deductionName: e.target.value }))}
                  placeholder="Enter deduction name"
                  required
                />
              </div>

              {/* Deduction Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deduction Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="deductionType">Deduction Type *</Label>
                  <select
                    id="deductionType"
                    value={formData.deductionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, deductionType: e.target.value as "Fixed" | "Percentage" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">
                        {formData.deductionType === "Percentage" ? "%" : "₹"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.deductionType === "Percentage" 
                        ? "Percentage of base salary" 
                        : "Fixed amount in currency"
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perMonthLimit">Per Month Limit *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="perMonthLimit"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.perMonthLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, perMonthLimit: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">₹</span>
                    </div>
                    <p className="text-xs text-gray-500">Maximum deduction per month</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingDeduction ? "Update Salary Deduction" : "Add Salary Deduction"}
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
                placeholder="Search salary deductions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredDeductions.length} deductions
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Deductions Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-minus" className="w-5 h-5" />
            Salary Deductions List
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
                  <TableHead className="w-[150px]">Deduction Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Value</TableHead>
                  <TableHead className="w-[120px]">Per Month Limit</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeductions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-minus" className="w-12 h-12 text-gray-300" />
                        <p>No salary deductions found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeductions.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell className="whitespace-nowrap">{deduction.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{deduction.deductionName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={deduction.deductionType === "Fixed" ? "default" : "secondary"}>
                          {deduction.deductionType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {deduction.deductionType === "Percentage" 
                          ? `${deduction.value}%` 
                          : `₹${deduction.value}`
                        }
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        ₹{deduction.perMonthLimit}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{deduction.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(deduction)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deduction.id)}
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
