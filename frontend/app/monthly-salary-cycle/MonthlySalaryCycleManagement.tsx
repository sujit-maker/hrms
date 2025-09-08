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

interface MonthlySalaryCycle {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  cycleName: string
  startDayOfMonth: number
  createdAt: string
}

export function MonthlySalaryCycleManagement() {
  const [cycles, setCycles] = useState<MonthlySalaryCycle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCycle, setEditingCycle] = useState<MonthlySalaryCycle | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    cycleName: "",
    startDayOfMonth: 1
  })

  const filteredCycles = cycles.filter(cycle =>
    cycle.cycleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cycle.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCycle) {
      setCycles(prev => 
        prev.map(cycle => 
          cycle.id === editingCycle.id 
            ? { ...cycle, ...formData, id: editingCycle.id, createdAt: editingCycle.createdAt }
            : cycle
        )
      )
    } else {
      const newCycle: MonthlySalaryCycle = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setCycles(prev => [...prev, newCycle])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      cycleName: "",
      startDayOfMonth: 1
    })
    setEditingCycle(null)
  }

  const handleEdit = (cycle: MonthlySalaryCycle) => {
    setFormData({
      serviceProvider: cycle.serviceProvider,
      companyName: cycle.companyName,
      branchName: cycle.branchName,
      cycleName: cycle.cycleName,
      startDayOfMonth: cycle.startDayOfMonth
    })
    setEditingCycle(cycle)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCycles(prev => prev.filter(cycle => cycle.id !== id))
  }

  // Generate day options for dropdown
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Salary Cycle</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage monthly salary cycle configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Salary Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCycle ? "Edit Monthly Salary Cycle" : "Add New Monthly Salary Cycle"}
              </DialogTitle>
              <DialogDescription>
                {editingCycle 
                  ? "Update the monthly salary cycle information below." 
                  : "Fill in the details to add a new monthly salary cycle."
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
                <Label htmlFor="cycleName">Cycle Name *</Label>
                <Input
                  id="cycleName"
                  value={formData.cycleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, cycleName: e.target.value }))}
                  placeholder="Enter cycle name"
                  required
                />
              </div>

              {/* Start Day Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cycle Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="startDayOfMonth">Start Day of Month *</Label>
                  <select
                    id="startDayOfMonth"
                    value={formData.startDayOfMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDayOfMonth: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {dayOptions.map(day => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500">
                    Select the day of the month when the salary cycle starts
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCycle ? "Update Salary Cycle" : "Add Salary Cycle"}
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
                placeholder="Search salary cycles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredCycles.length} cycles
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Salary Cycle Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:cash-multiple" className="w-5 h-5" />
            Monthly Salary Cycle List
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
                  <TableHead className="w-[150px]">Cycle Name</TableHead>
                  <TableHead className="w-[120px]">Start Day</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCycles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:cash-multiple" className="w-12 h-12 text-gray-300" />
                        <p>No salary cycles found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell className="whitespace-nowrap">{cycle.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{cycle.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{cycle.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{cycle.cycleName}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="outline">
                          Day {cycle.startDayOfMonth}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{cycle.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cycle)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cycle.id)}
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
