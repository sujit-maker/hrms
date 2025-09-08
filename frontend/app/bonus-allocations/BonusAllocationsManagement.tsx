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
import { Plus, Search, Edit, Trash2, Play } from "lucide-react"

interface BonusAllocation {
  id: string
  bonusName: string
  financialYear: string
  salaryPeriod: string
  employeeName: string
  employeeId: string
  bonusAmount: number
  status: "Generated" | "Pending"
  createdAt: string
}

// Mock data for dropdowns
const mockBonusNames = [
  "Performance Bonus",
  "Annual Bonus",
  "Festival Bonus",
  "Retention Bonus",
  "Project Completion Bonus"
]

const mockFinancialYears = [
  "2023-24 (Apr-Mar)",
  "2024-25 (Apr-Mar)",
  "2023-24 (Jan-Dec)",
  "2024-25 (Jan-Dec)"
]

const mockSalaryPeriods = [
  "April 2024",
  "May 2024",
  "June 2024",
  "July 2024",
  "August 2024",
  "September 2024"
]

const mockEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
  { id: "EMP003", name: "Mike Johnson" },
  { id: "EMP004", name: "Sarah Wilson" },
  { id: "EMP005", name: "David Brown" }
]

export function BonusAllocationsManagement() {
  const [allocations, setAllocations] = useState<BonusAllocation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAllocation, setEditingAllocation] = useState<BonusAllocation | null>(null)
  const [formData, setFormData] = useState({
    bonusName: "",
    financialYear: "",
    salaryPeriod: "",
    employeeName: ""
  })

  const filteredAllocations = allocations.filter(allocation =>
    allocation.bonusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.financialYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.salaryPeriod.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAllocation) {
      setAllocations(prev => 
        prev.map(allocation => 
          allocation.id === editingAllocation.id 
            ? { ...allocation, ...formData, id: editingAllocation.id, createdAt: editingAllocation.createdAt }
            : allocation
        )
      )
    } else {
      const selectedEmployee = mockEmployees.find(emp => emp.name === formData.employeeName)
      const newAllocation: BonusAllocation = {
        id: Date.now().toString(),
        ...formData,
        employeeId: selectedEmployee?.id || "",
        bonusAmount: 0, // Will be calculated by Generate button
        status: "Pending",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setAllocations(prev => [...prev, newAllocation])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      bonusName: "",
      financialYear: "",
      salaryPeriod: "",
      employeeName: ""
    })
    setEditingAllocation(null)
  }

  const handleEdit = (allocation: BonusAllocation) => {
    setFormData({
      bonusName: allocation.bonusName,
      financialYear: allocation.financialYear,
      salaryPeriod: allocation.salaryPeriod,
      employeeName: allocation.employeeName
    })
    setEditingAllocation(allocation)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAllocations(prev => prev.filter(allocation => allocation.id !== id))
  }

  const handleGenerate = () => {
    // Simulate bonus generation - in real app this would call backend API
    setAllocations(prev => 
      prev.map(allocation => ({
        ...allocation,
        bonusAmount: Math.floor(Math.random() * 50000) + 10000, // Random amount between 10k-60k
        status: "Generated" as const
      }))
    )
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Bonus Allocations</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage bonus allocations and generate bonus payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGenerate}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0 text-sm px-3 py-2"
            disabled={allocations.length === 0}
          >
            <Play className="w-4 h-4 mr-1" />
            Generate Bonus
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Bonus Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAllocation ? "Edit Bonus Allocation" : "Add New Bonus Allocation"}
                </DialogTitle>
                <DialogDescription>
                  {editingAllocation 
                    ? "Update the bonus allocation information below." 
                    : "Fill in the details to add a new bonus allocation."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bonus Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bonus Configuration</h3>
                  <div className="space-y-2">
                    <Label htmlFor="bonusName">Bonus Name *</Label>
                    <select
                      id="bonusName"
                      value={formData.bonusName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonusName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Bonus Name</option>
                      {mockBonusNames.map((bonus) => (
                        <option key={bonus} value={bonus}>{bonus}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Period Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Period Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="financialYear">Financial Year *</Label>
                      <select
                        id="financialYear"
                        value={formData.financialYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, financialYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Financial Year</option>
                        {mockFinancialYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Based on 1st Jan or 1st Apr</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryPeriod">Salary Period *</Label>
                      <select
                        id="salaryPeriod"
                        value={formData.salaryPeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, salaryPeriod: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Salary Period</option>
                        {mockSalaryPeriods.map((period) => (
                          <option key={period} value={period}>{period}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Based on salary cycle</p>
                    </div>
                  </div>
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employee Selection</h3>
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Employee Name *</Label>
                    <select
                      id="employeeName"
                      value={formData.employeeName}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {mockEmployees.map((employee) => (
                        <option key={employee.id} value={employee.name}>{employee.name} ({employee.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingAllocation ? "Update Bonus Allocation" : "Add Bonus Allocation"}
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
                placeholder="Search bonus allocations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredAllocations.length} allocations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Allocations Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trophy-outline" className="w-5 h-5" />
            Bonus Allocations List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Bonus Name</TableHead>
                  <TableHead className="w-[120px]">Financial Year</TableHead>
                  <TableHead className="w-[120px]">Salary Period</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[100px]">Bonus Amount</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:trophy-outline" className="w-12 h-12 text-gray-300" />
                        <p>No bonus allocations found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium whitespace-nowrap">{allocation.bonusName}</TableCell>
                      <TableCell className="whitespace-nowrap">{allocation.financialYear}</TableCell>
                      <TableCell className="whitespace-nowrap">{allocation.salaryPeriod}</TableCell>
                      <TableCell className="whitespace-nowrap">{allocation.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{allocation.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {allocation.bonusAmount > 0 ? `₹${allocation.bonusAmount}` : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={allocation.status === "Generated" ? "default" : "secondary"}>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{allocation.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(allocation)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(allocation.id)}
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
