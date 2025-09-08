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

interface Holiday {
  id: string
  name: string
  date: string
  type: string
}

interface LeavePolicy {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  policyName: string
  sickLeavePerYear: number
  casualLeavePerYear: number
  earnedLeaveWorkingMonths: number
  earnedLeaveDays: number
  applicableHolidays: Holiday[]
  createdAt: string
}

// Mock holiday data
const mockHolidays: Holiday[] = [
  { id: "1", name: "New Year's Day", date: "2024-01-01", type: "National" },
  { id: "2", name: "Republic Day", date: "2024-01-26", type: "National" },
  { id: "3", name: "Independence Day", date: "2024-08-15", type: "National" },
  { id: "4", name: "Gandhi Jayanti", date: "2024-10-02", type: "National" },
  { id: "5", name: "Diwali", date: "2024-11-01", type: "Religious" },
  { id: "6", name: "Christmas", date: "2024-12-25", type: "Religious" },
  { id: "7", name: "Holi", date: "2024-03-25", type: "Religious" },
  { id: "8", name: "Eid", date: "2024-04-10", type: "Religious" },
]

export function LeavePolicyManagement() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    policyName: "",
    sickLeavePerYear: 0,
    casualLeavePerYear: 0,
    earnedLeaveWorkingMonths: 0,
    earnedLeaveDays: 0,
    applicableHolidays: [] as Holiday[]
  })

  const filteredPolicies = policies.filter(policy =>
    policy.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const newPolicy: LeavePolicy = {
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
      policyName: "",
      sickLeavePerYear: 0,
      casualLeavePerYear: 0,
      earnedLeaveWorkingMonths: 0,
      earnedLeaveDays: 0,
      applicableHolidays: []
    })
    setEditingPolicy(null)
  }

  const handleEdit = (policy: LeavePolicy) => {
    setFormData({
      serviceProvider: policy.serviceProvider,
      companyName: policy.companyName,
      branchName: policy.branchName,
      policyName: policy.policyName,
      sickLeavePerYear: policy.sickLeavePerYear,
      casualLeavePerYear: policy.casualLeavePerYear,
      earnedLeaveWorkingMonths: policy.earnedLeaveWorkingMonths,
      earnedLeaveDays: policy.earnedLeaveDays,
      applicableHolidays: policy.applicableHolidays
    })
    setEditingPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPolicies(prev => prev.filter(policy => policy.id !== id))
  }

  const handleHolidayToggle = (holiday: Holiday) => {
    const isSelected = formData.applicableHolidays.some(h => h.id === holiday.id)
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        applicableHolidays: prev.applicableHolidays.filter(h => h.id !== holiday.id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        applicableHolidays: [...prev.applicableHolidays, holiday]
      }))
    }
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Leave Policy</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage leave policies and holiday configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Leave Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy 
                  ? "Update the leave policy information below." 
                  : "Fill in the details to add a new leave policy."
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
                <Label htmlFor="policyName">Policy Name *</Label>
                <Input
                  id="policyName"
                  value={formData.policyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, policyName: e.target.value }))}
                  placeholder="Enter leave policy name"
                  required
                />
              </div>

              {/* Leave Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Leave Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sickLeavePerYear">Sick Leave / Per Year *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sickLeavePerYear"
                        type="number"
                        min="0"
                        value={formData.sickLeavePerYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, sickLeavePerYear: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Nos</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="casualLeavePerYear">Casual Leave / Per Year *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="casualLeavePerYear"
                        type="number"
                        min="0"
                        value={formData.casualLeavePerYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, casualLeavePerYear: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Nos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earned Leave Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Earned Leave Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="earnedLeaveWorkingMonths">No. of Working Month *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earnedLeaveWorkingMonths"
                        type="number"
                        min="0"
                        value={formData.earnedLeaveWorkingMonths}
                        onChange={(e) => setFormData(prev => ({ ...prev, earnedLeaveWorkingMonths: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Months</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earnedLeaveDays">Day of Earn Leave *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earnedLeaveDays"
                        type="number"
                        min="0"
                        value={formData.earnedLeaveDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, earnedLeaveDays: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicable Public Holidays */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Applicable Public Holidays</h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">Select holidays that apply to this leave policy:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mockHolidays.map((holiday) => {
                      const isSelected = formData.applicableHolidays.some(h => h.id === holiday.id)
                      return (
                        <div key={holiday.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            id={`holiday-${holiday.id}`}
                            checked={isSelected}
                            onChange={() => handleHolidayToggle(holiday)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`holiday-${holiday.id}`} className="font-medium cursor-pointer">
                              {holiday.name}
                            </Label>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{holiday.date}</span>
                              <Badge variant="outline" className="text-xs">
                                {holiday.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Selected: {formData.applicableHolidays.length} holiday(s)
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingPolicy ? "Update Leave Policy" : "Add Leave Policy"}
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
                placeholder="Search leave policies..."
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

      {/* Leave Policy Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:calendar-clock" className="w-5 h-5" />
            Leave Policy List
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
                  <TableHead className="w-[100px]">Sick Leave</TableHead>
                  <TableHead className="w-[100px]">Casual Leave</TableHead>
                  <TableHead className="w-[100px]">Working Months</TableHead>
                  <TableHead className="w-[100px]">Earn Leave Days</TableHead>
                  <TableHead className="w-[120px]">Holidays</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:calendar-clock" className="w-12 h-12 text-gray-300" />
                        <p>No leave policies found</p>
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
                      <TableCell className="font-medium whitespace-nowrap">{policy.policyName}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.sickLeavePerYear}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.casualLeavePerYear}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.earnedLeaveWorkingMonths}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.earnedLeaveDays}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="secondary">
                          {policy.applicableHolidays.length} holidays
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
