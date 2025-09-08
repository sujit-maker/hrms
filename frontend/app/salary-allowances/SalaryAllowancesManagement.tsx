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

interface SalaryAllowance {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  allowanceName: string
  allowanceType: "Fixed" | "Percentage"
  value: number
  perMonthLimit: number
  createdAt: string
}

export function SalaryAllowancesManagement() {
  const [allowances, setAllowances] = useState<SalaryAllowance[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAllowance, setEditingAllowance] = useState<SalaryAllowance | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    allowanceName: "",
    allowanceType: "Fixed" as "Fixed" | "Percentage",
    value: 0,
    perMonthLimit: 0
  })

  const filteredAllowances = allowances.filter(allowance =>
    allowance.allowanceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allowance.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allowance.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allowance.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingAllowance) {
      setAllowances(prev => 
        prev.map(allowance => 
          allowance.id === editingAllowance.id 
            ? { ...allowance, ...formData, id: editingAllowance.id, createdAt: editingAllowance.createdAt }
            : allowance
        )
      )
    } else {
      const newAllowance: SalaryAllowance = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setAllowances(prev => [...prev, newAllowance])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      allowanceName: "",
      allowanceType: "Fixed",
      value: 0,
      perMonthLimit: 0
    })
    setEditingAllowance(null)
  }

  const handleEdit = (allowance: SalaryAllowance) => {
    setFormData({
      serviceProvider: allowance.serviceProvider,
      companyName: allowance.companyName,
      branchName: allowance.branchName,
      allowanceName: allowance.allowanceName,
      allowanceType: allowance.allowanceType,
      value: allowance.value,
      perMonthLimit: allowance.perMonthLimit
    })
    setEditingAllowance(allowance)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAllowances(prev => prev.filter(allowance => allowance.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Salary Allowances</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage salary allowances and benefits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Salary Allowance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAllowance ? "Edit Salary Allowance" : "Add New Salary Allowance"}
              </DialogTitle>
              <DialogDescription>
                {editingAllowance 
                  ? "Update the salary allowance information below." 
                  : "Fill in the details to add a new salary allowance."
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
                <Label htmlFor="allowanceName">Allowance Name *</Label>
                <Input
                  id="allowanceName"
                  value={formData.allowanceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowanceName: e.target.value }))}
                  placeholder="Enter allowance name"
                  required
                />
              </div>

              {/* Allowance Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Allowance Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="allowanceType">Allowance Type *</Label>
                  <select
                    id="allowanceType"
                    value={formData.allowanceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowanceType: e.target.value as "Fixed" | "Percentage" }))}
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
                        {formData.allowanceType === "Percentage" ? "%" : "₹"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formData.allowanceType === "Percentage" 
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
                    <p className="text-xs text-gray-500">Maximum amount per month</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingAllowance ? "Update Salary Allowance" : "Add Salary Allowance"}
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
                placeholder="Search salary allowances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredAllowances.length} allowances
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Allowances Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-plus" className="w-5 h-5" />
            Salary Allowances List
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
                  <TableHead className="w-[150px]">Allowance Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="w-[100px]">Value</TableHead>
                  <TableHead className="w-[120px]">Per Month Limit</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAllowances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-plus" className="w-12 h-12 text-gray-300" />
                        <p>No salary allowances found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllowances.map((allowance) => (
                    <TableRow key={allowance.id}>
                      <TableCell className="whitespace-nowrap">{allowance.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{allowance.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{allowance.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{allowance.allowanceName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={allowance.allowanceType === "Fixed" ? "default" : "secondary"}>
                          {allowance.allowanceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {allowance.allowanceType === "Percentage" 
                          ? `${allowance.value}%` 
                          : `₹${allowance.value}`
                        }
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        ₹{allowance.perMonthLimit}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{allowance.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(allowance)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(allowance.id)}
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
