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
import { Plus, Search, Edit, Trash2 } from "lucide-react"

interface Allowance {
  id: string
  name: string
  type: "Fixed" | "Percentage"
  value: number
}

interface Deduction {
  id: string
  name: string
  type: "Fixed" | "Percentage"
  value: number
}

interface MonthlyPayGrade {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  monthlyPayGradeName: string
  grossSalary: number
  percentageOfBasic: number
  basicSalary: number
  selectedAllowances: Allowance[]
  selectedDeductions: Deduction[]
  createdAt: string
}

// Mock data for allowances and deductions
const mockAllowances: Allowance[] = [
  { id: "1", name: "House Rent Allowance", type: "Percentage", value: 40 },
  { id: "2", name: "Transport Allowance", type: "Fixed", value: 5000 },
  { id: "3", name: "Medical Allowance", type: "Fixed", value: 2000 },
  { id: "4", name: "Special Allowance", type: "Percentage", value: 20 },
  { id: "5", name: "Performance Bonus", type: "Fixed", value: 10000 },
]

const mockDeductions: Deduction[] = [
  { id: "1", name: "Provident Fund", type: "Percentage", value: 12 },
  { id: "2", name: "Professional Tax", type: "Fixed", value: 200 },
  { id: "3", name: "Income Tax", type: "Percentage", value: 10 },
  { id: "4", name: "ESI", type: "Percentage", value: 1.75 },
  { id: "5", name: "Loan Deduction", type: "Fixed", value: 5000 },
]

export function MonthlyPayGradeManagement() {
  const [payGrades, setPayGrades] = useState<MonthlyPayGrade[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayGrade, setEditingPayGrade] = useState<MonthlyPayGrade | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    monthlyPayGradeName: "",
    grossSalary: 0,
    percentageOfBasic: 0,
    basicSalary: 0,
    selectedAllowances: [] as Allowance[],
    selectedDeductions: [] as Deduction[]
  })

  // Calculate basic salary when gross salary or percentage changes
  useEffect(() => {
    if (formData.grossSalary > 0 && formData.percentageOfBasic > 0) {
      const basicSalary = (formData.grossSalary * formData.percentageOfBasic) / 100
      setFormData(prev => ({ ...prev, basicSalary: Math.round(basicSalary) }))
    }
  }, [formData.grossSalary, formData.percentageOfBasic])

  const filteredPayGrades = payGrades.filter(payGrade =>
    payGrade.monthlyPayGradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payGrade.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payGrade.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payGrade.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPayGrade) {
      setPayGrades(prev => 
        prev.map(payGrade => 
          payGrade.id === editingPayGrade.id 
            ? { ...payGrade, ...formData, id: editingPayGrade.id, createdAt: editingPayGrade.createdAt }
            : payGrade
        )
      )
    } else {
      const newPayGrade: MonthlyPayGrade = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setPayGrades(prev => [...prev, newPayGrade])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      monthlyPayGradeName: "",
      grossSalary: 0,
      percentageOfBasic: 0,
      basicSalary: 0,
      selectedAllowances: [],
      selectedDeductions: []
    })
    setEditingPayGrade(null)
  }

  const handleEdit = (payGrade: MonthlyPayGrade) => {
    setFormData({
      serviceProvider: payGrade.serviceProvider,
      companyName: payGrade.companyName,
      branchName: payGrade.branchName,
      monthlyPayGradeName: payGrade.monthlyPayGradeName,
      grossSalary: payGrade.grossSalary,
      percentageOfBasic: payGrade.percentageOfBasic,
      basicSalary: payGrade.basicSalary,
      selectedAllowances: payGrade.selectedAllowances,
      selectedDeductions: payGrade.selectedDeductions
    })
    setEditingPayGrade(payGrade)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPayGrades(prev => prev.filter(payGrade => payGrade.id !== id))
  }

  const handleAllowanceToggle = (allowance: Allowance) => {
    const isSelected = formData.selectedAllowances.some(a => a.id === allowance.id)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedAllowances: prev.selectedAllowances.filter(a => a.id !== allowance.id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedAllowances: [...prev.selectedAllowances, allowance]
      }))
    }
  }

  const handleDeductionToggle = (deduction: Deduction) => {
    const isSelected = formData.selectedDeductions.some(d => d.id === deduction.id)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        selectedDeductions: prev.selectedDeductions.filter(d => d.id !== deduction.id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        selectedDeductions: [...prev.selectedDeductions, deduction]
      }))
    }
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Pay Grade</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage monthly pay grades and salary structures</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Monthly Pay Grade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPayGrade ? "Edit Monthly Pay Grade" : "Add New Monthly Pay Grade"}
              </DialogTitle>
              <DialogDescription>
                {editingPayGrade 
                  ? "Update the monthly pay grade information below." 
                  : "Fill in the details to add a new monthly pay grade."
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
                <Label htmlFor="monthlyPayGradeName">Monthly Pay Grade Name *</Label>
                <Input
                  id="monthlyPayGradeName"
                  value={formData.monthlyPayGradeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayGradeName: e.target.value }))}
                  placeholder="Enter monthly pay grade name"
                  required
                />
              </div>

              {/* Salary Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Salary Configuration</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grossSalary">Gross Salary *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="grossSalary"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.grossSalary}
                        onChange={(e) => setFormData(prev => ({ ...prev, grossSalary: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">₹</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentageOfBasic">Percentage Of Basic *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentageOfBasic"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.percentageOfBasic}
                        onChange={(e) => setFormData(prev => ({ ...prev, percentageOfBasic: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary (Calculated)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="basicSalary"
                        type="number"
                        value={formData.basicSalary}
                        readOnly
                        className="bg-gray-100"
                      />
                      <span className="text-sm text-gray-500">₹</span>
                    </div>
                    <p className="text-xs text-gray-500">Auto-calculated from gross salary</p>
                  </div>
                </div>
              </div>

              {/* Allowance Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Allowance Selection</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">Select allowances for this pay grade:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockAllowances.map((allowance) => {
                      const isSelected = formData.selectedAllowances.some(a => a.id === allowance.id)
                      return (
                        <div key={allowance.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            id={`allowance-${allowance.id}`}
                            checked={isSelected}
                            onChange={() => handleAllowanceToggle(allowance)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`allowance-${allowance.id}`} className="font-medium cursor-pointer">
                              {allowance.name}
                            </Label>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>
                                {allowance.type === "Percentage" 
                                  ? `${allowance.value}%` 
                                  : `₹${allowance.value}`
                                }
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {allowance.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Selected: {formData.selectedAllowances.length} allowance(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Deduction Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deduction Selection</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">Select deductions for this pay grade:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockDeductions.map((deduction) => {
                      const isSelected = formData.selectedDeductions.some(d => d.id === deduction.id)
                      return (
                        <div key={deduction.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            id={`deduction-${deduction.id}`}
                            checked={isSelected}
                            onChange={() => handleDeductionToggle(deduction)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`deduction-${deduction.id}`} className="font-medium cursor-pointer">
                              {deduction.name}
                            </Label>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>
                                {deduction.type === "Percentage" 
                                  ? `${deduction.value}%` 
                                  : `₹${deduction.value}`
                                }
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {deduction.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Selected: {formData.selectedDeductions.length} deduction(s)
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPayGrade ? "Update Monthly Pay Grade" : "Add Monthly Pay Grade"}
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
                placeholder="Search monthly pay grades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredPayGrades.length} pay grades
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Pay Grade Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-multiple" className="w-5 h-5" />
            Monthly Pay Grade List
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
                  <TableHead className="w-[150px]">Pay Grade Name</TableHead>
                  <TableHead className="w-[100px]">Gross Salary</TableHead>
                  <TableHead className="w-[100px]">Basic Salary</TableHead>
                  <TableHead className="w-[100px]">Allowances</TableHead>
                  <TableHead className="w-[100px]">Deductions</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-multiple" className="w-12 h-12 text-gray-300" />
                        <p>No monthly pay grades found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayGrades.map((payGrade) => (
                    <TableRow key={payGrade.id}>
                      <TableCell className="whitespace-nowrap">{payGrade.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{payGrade.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{payGrade.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{payGrade.monthlyPayGradeName}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{payGrade.grossSalary}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{payGrade.basicSalary}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="secondary">
                          {payGrade.selectedAllowances.length} allowances
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="secondary">
                          {payGrade.selectedDeductions.length} deductions
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{payGrade.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(payGrade)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(payGrade.id)}
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
