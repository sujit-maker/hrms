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
import { SearchSuggestInput } from "../components/SearchSuggestInput"

interface Holiday {
  id: string
  name: string
  date: string
  type: string
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

interface LeavePolicy {
  id: number
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  leavePolicyName?: string
  sickLeaveCount?: string
  casualLeaveCount?: string
  earnLeaveWorkingMonths?: string
  earnLeaveCount?: number
  applicableHolidays: Holiday[]
  createdAt?: string
}

// Holidays list fetched from Manage Holiday API (only holidayName is used)
const BACKEND_URL = "http://localhost:8000"

export function LeavePolicyManagement() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const [formData, setFormData] = useState({
    serviceProviderID: 0,
    companyID: 0,
    branchesID: 0,
    serviceProvider: "",
    companyName: "",
    branchName: "",
    leavePolicyName: "",
    sickLeaveCount: 0,
    casualLeaveCount: 0,
    earnLeaveWorkingMonths: 0,
    earnLeaveCount: 0,
    applicableHolidays: [] as Holiday[]
  })
  const [availableHolidays, setAvailableHolidays] = useState<Holiday[]>([])

  // Load available holidays from Manage Holiday API (unique by name, keep real IDs)
  const loadAvailableHolidays = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/manage-holiday`)
      const data = await response.json()
      const map = new Map<string, number>()
      ;(Array.isArray(data) ? data : []).forEach((h: any) => {
        const name = (h?.holidayName || "").trim()
        const id = typeof h?.id === 'number' ? h.id : undefined
        if (name && typeof id === 'number' && !map.has(name)) {
          map.set(name, id)
        }
      })

      const mapped: Holiday[] = Array.from(map.entries()).map(([name, id]) => ({
        id: String(id),
        name,
        date: "",
        type: "",
      }))
      setAvailableHolidays(mapped)
    } catch (error) {
      console.error("Error fetching holidays:", error)
      setAvailableHolidays([])
    }
  }

  // API functions
  const fetchServiceProviders = async (query: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/service-provider`)
      const data = await response.json()
      return data.filter((item: any) => 
        item.companyName?.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error fetching service providers:', error)
      return []
    }
  }

  const fetchCompanies = async (query: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/company`)
      const data = await response.json()
      return data.filter((item: any) => 
        item.companyName?.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error fetching companies:', error)
      return []
    }
  }

  const fetchBranches = async (query: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/branches`)
      const data = await response.json()
      return data.filter((item: any) => 
        item.branchName?.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error fetching branches:', error)
      return []
    }
  }

  const loadLeavePolicies = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/leave-policy`)
      const data = await response.json()
      
      // Map the nested data to flattened structure for display
      const mappedData = data.map((policy: any) => {
        const holidays: Holiday[] = Array.isArray(policy?.leavePolicyHoliday)
          ? policy.leavePolicyHoliday
              .map((lph: any, idx: number) => ({
                id: String(lph?.publicHoliday?.manageHoliday?.id ?? idx),
                name: lph?.publicHoliday?.manageHoliday?.holidayName || "",
                date: "",
                type: "",
              }))
              .filter((h: Holiday) => h.name)
          : []

        return {
          ...policy,
          serviceProvider: policy.serviceProvider?.companyName || "",
          companyName: policy.company?.companyName || "",
          branchName: policy.branches?.branchName || "",
          applicableHolidays: holidays,
        }
      })
      
      setPolicies(mappedData)
    } catch (error) {
      console.error('Error loading leave policies:', error)
    }
  }

  useEffect(() => {
    loadLeavePolicies()
    loadAvailableHolidays()
  }, [])

  const filteredPolicies = policies.filter(policy =>
    (policy.leavePolicyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.serviceProvider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.branchName || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Send selected ManageHoliday IDs to backend
      const applicableHolidayIds = (formData.applicableHolidays || [])
        .map((h) => {
          const found = availableHolidays.find((ah) => ah.name === h.name)
          return found ? Number(found.id) : undefined
        })
        .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id))

      const payload = {
        serviceProviderID: formData.serviceProviderID > 0 ? formData.serviceProviderID : null,
        companyID: formData.companyID > 0 ? formData.companyID : null,
        branchesID: formData.branchesID > 0 ? formData.branchesID : null,
        leavePolicyName: formData.leavePolicyName,
        sickLeaveCount: String(formData.sickLeaveCount ?? 0),
        casualLeaveCount: String(formData.casualLeaveCount ?? 0),
        earnLeaveWorkingMonths: String(formData.earnLeaveWorkingMonths ?? 0),
        earnLeaveCount: Number(formData.earnLeaveCount ?? 0),
        applicableHolidayIds,
      }

      if (editingPolicy) {
        const response = await fetch(`${BACKEND_URL}/leave-policy/${editingPolicy.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (response.ok) {
          await loadLeavePolicies()
        }
      } else {
        const response = await fetch(`${BACKEND_URL}/leave-policy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (response.ok) {
          await loadLeavePolicies()
        }
      }
      
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving leave policy:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceProviderID: 0,
      companyID: 0,
      branchesID: 0,
      serviceProvider: "",
      companyName: "",
      branchName: "",
      leavePolicyName: "",
      sickLeaveCount: 0,
      casualLeaveCount: 0,
      earnLeaveWorkingMonths: 0,
      earnLeaveCount: 0,
      applicableHolidays: []
    })
    setEditingPolicy(null)
  }

  const handleEdit = (policy: LeavePolicy) => {
    setFormData({
      serviceProviderID: policy.serviceProviderID || 0,
      companyID: policy.companyID || 0,
      branchesID: policy.branchesID || 0,
      serviceProvider: policy.serviceProvider || "",
      companyName: policy.companyName || "",
      branchName: policy.branchName || "",
      leavePolicyName: policy.leavePolicyName || "",
      sickLeaveCount: parseInt(policy.sickLeaveCount || "0") || 0,
      casualLeaveCount: parseInt(policy.casualLeaveCount || "0") || 0,
      earnLeaveWorkingMonths: parseInt(policy.earnLeaveWorkingMonths || "0") || 0,
      earnLeaveCount: policy.earnLeaveCount || 0,
      applicableHolidays: policy.applicableHolidays || []
    })
    setEditingPolicy(policy)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/leave-policy/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await loadLeavePolicies()
      }
    } catch (error) {
      console.error('Error deleting leave policy:', error)
    }
  }

  const handleServiceProviderSelect = (selected: SelectedItem) => {
    setFormData(prev => ({
      ...prev,
      serviceProviderID: selected.value,
      serviceProvider: selected.display
    }))
  }

  const handleCompanySelect = (selected: SelectedItem) => {
    setFormData(prev => ({
      ...prev,
      companyID: selected.value,
      companyName: selected.display
    }))
  }

  const handleBranchSelect = (selected: SelectedItem) => {
    setFormData(prev => ({
      ...prev,
      branchesID: selected.value,
      branchName: selected.display
    }))
  }

  const handleHolidayToggle = (holiday: Holiday) => {
    const isSelected = formData.applicableHolidays?.some(h => h.id === holiday.id) || false
    
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        applicableHolidays: (prev.applicableHolidays || []).filter(h => h.id !== holiday.id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        applicableHolidays: [...(prev.applicableHolidays || []), holiday]
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
                  <SearchSuggestInput
                    label="Service Provider"
                    value={formData.serviceProvider}
                    onChange={(value) => setFormData(prev => ({ ...prev, serviceProvider: value }))}
                    onSelect={handleServiceProviderSelect}
                    fetchData={fetchServiceProviders}
                    placeholder="Select Service Provider"
                    displayField="companyName"
                    valueField="id"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <SearchSuggestInput
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(value) => setFormData(prev => ({ ...prev, companyName: value }))}
                    onSelect={handleCompanySelect}
                    fetchData={fetchCompanies}
                    placeholder="Select Company"
                    displayField="companyName"
                    valueField="id"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <SearchSuggestInput
                    label="Branch Name"
                    value={formData.branchName}
                    onChange={(value) => setFormData(prev => ({ ...prev, branchName: value }))}
                    onSelect={handleBranchSelect}
                    fetchData={fetchBranches}
                    placeholder="Select Branch"
                    displayField="branchName"
                    valueField="id"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leavePolicyName">Leave Policy Name *</Label>
                <Input
                  id="leavePolicyName"
                  value={formData.leavePolicyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, leavePolicyName: e.target.value }))}
                  placeholder="Enter leave policy name"
                  required
                />
              </div>

              {/* Leave Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Leave Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sickLeaveCount">Sick Leave / Per Year *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="sickLeaveCount"
                        type="text"
                        value={formData.sickLeaveCount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, sickLeaveCount: parseInt(value) || 0 }));
                        }}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Nos</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="casualLeaveCount">Casual Leave / Per Year *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="casualLeaveCount"
                        type="text"
                        value={formData.casualLeaveCount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, casualLeaveCount: parseInt(value) || 0 }));
                        }}
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
                    <Label htmlFor="earnLeaveWorkingMonths">No. of Working Month *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earnLeaveWorkingMonths"
                        type="text"
                        value={formData.earnLeaveWorkingMonths}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, earnLeaveWorkingMonths: parseInt(value) || 0 }));
                        }}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">Days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="earnLeaveCount">Day of Earn Leave *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="earnLeaveCount"
                        type="text"
                        value={formData.earnLeaveCount}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData(prev => ({ ...prev, earnLeaveCount: parseInt(value) || 0 }));
                        }}
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
                    {availableHolidays.map((holiday) => {
                      const isSelected = formData.applicableHolidays?.some(h => h.id === holiday.id) || false
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
                              {/* Only holiday name is required per requirements */}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Selected: {formData.applicableHolidays?.length || 0} holiday(s)
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
                      <TableCell className="whitespace-nowrap">{policy.serviceProvider || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">{policy.companyName || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">{policy.branchName || "-"}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{policy.leavePolicyName || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.sickLeaveCount || 0}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.casualLeaveCount || 0}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.earnLeaveWorkingMonths || 0}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">{policy.earnLeaveCount || "0"}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="secondary">
                          {policy.applicableHolidays?.length || 0} holidays
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{policy.createdAt || "-"}</TableCell>
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
