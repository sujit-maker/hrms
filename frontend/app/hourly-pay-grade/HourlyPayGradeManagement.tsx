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

interface HourlyPayGrade {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  hourlyPayGradeName: string
  hourlyRate: number
  createdAt: string
}

export function HourlyPayGradeManagement() {
  const [payGrades, setPayGrades] = useState<HourlyPayGrade[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayGrade, setEditingPayGrade] = useState<HourlyPayGrade | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    hourlyPayGradeName: "",
    hourlyRate: 0
  })

  const filteredPayGrades = payGrades.filter(payGrade =>
    payGrade.hourlyPayGradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const newPayGrade: HourlyPayGrade = {
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
      hourlyPayGradeName: "",
      hourlyRate: 0
    })
    setEditingPayGrade(null)
  }

  const handleEdit = (payGrade: HourlyPayGrade) => {
    setFormData({
      serviceProvider: payGrade.serviceProvider,
      companyName: payGrade.companyName,
      branchName: payGrade.branchName,
      hourlyPayGradeName: payGrade.hourlyPayGradeName,
      hourlyRate: payGrade.hourlyRate
    })
    setEditingPayGrade(payGrade)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPayGrades(prev => prev.filter(payGrade => payGrade.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Hourly Pay Grade</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage hourly pay grades and rates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Hourly Pay Grade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPayGrade ? "Edit Hourly Pay Grade" : "Add New Hourly Pay Grade"}
              </DialogTitle>
              <DialogDescription>
                {editingPayGrade 
                  ? "Update the hourly pay grade information below." 
                  : "Fill in the details to add a new hourly pay grade."
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
                <Label htmlFor="hourlyPayGradeName">Hourly Pay Grade Name *</Label>
                <Input
                  id="hourlyPayGradeName"
                  value={formData.hourlyPayGradeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyPayGradeName: e.target.value }))}
                  placeholder="Enter hourly pay grade name"
                  required
                />
              </div>

              {/* Hourly Rate Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rate Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                      required
                    />
                    <span className="text-sm text-gray-500">₹/hour</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Rate per hour for this pay grade
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPayGrade ? "Update Hourly Pay Grade" : "Add Hourly Pay Grade"}
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
                placeholder="Search hourly pay grades..."
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

      {/* Hourly Pay Grade Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-outline" className="w-5 h-5" />
            Hourly Pay Grade List
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
                  <TableHead className="w-[120px]">Hourly Rate</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayGrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-outline" className="w-12 h-12 text-gray-300" />
                        <p>No hourly pay grades found</p>
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
                      <TableCell className="font-medium whitespace-nowrap">{payGrade.hourlyPayGradeName}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="outline">
                          ₹{payGrade.hourlyRate}/hour
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
