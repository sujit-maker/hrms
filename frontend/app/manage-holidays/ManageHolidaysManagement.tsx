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
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  holidayName: string
  createdAt: string
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

// Backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export function ManageHolidaysManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    holidayName: "",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
  })

  // API functions for search and suggest
  const fetchServiceProviders = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/service-provider`, {
        cache: "no-store",
      })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching service providers:", error)
      return []
    }
  }

  const fetchCompanies = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/company`, { cache: "no-store" })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching companies:", error)
      return []
    }
  }

  const fetchBranches = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, { cache: "no-store" })
      const data = await res.json()
      const q = query.toLowerCase()
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.branchName || "").toLowerCase().includes(q)
          )
        : []
    } catch (error) {
      console.error("Error fetching branches:", error)
      return []
    }
  }

  // Load holidays on component mount
  useEffect(() => {
    loadHolidays()
  }, [])

  const loadHolidays = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/manage-holiday`, {
        cache: "no-store",
      })
      const data = await res.json()
      const holidaysData = (Array.isArray(data) ? data : []).map(
        (holiday: any) => ({
          id: holiday.id.toString(),
          serviceProviderID: holiday.serviceProviderID,
          companyID: holiday.companyID,
          branchesID: holiday.branchesID,
          serviceProvider: holiday.serviceProvider?.companyName || "",
          companyName: holiday.company?.companyName || "",
          branchName: holiday.branches?.branchName || "",
          holidayName: holiday.holidayName,
          createdAt: holiday.createdAt
            ? new Date(holiday.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
      )
      setHolidays(holidaysData)
    } catch (error) {
      console.error("Error loading holidays:", error)
    }
  }

  const filteredHolidays = holidays.filter(holiday =>
    (holiday.serviceProvider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holiday.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holiday.branchName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    holiday.holidayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const holidayData = {
        serviceProviderID: formData.serviceProviderID,
        companyID: formData.companyID,
        branchesID: formData.branchesID,
        holidayName: formData.holidayName,
      }

      const url = editingHoliday
        ? `${BACKEND_URL}/manage-holiday/${editingHoliday.id}`
        : `${BACKEND_URL}/manage-holiday`
      const method = editingHoliday ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holidayData),
      })
      if (!res.ok) {
        throw new Error(`Failed to save holiday: ${res.status}`)
      }

      await loadHolidays()
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving holiday:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      holidayName: "",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
    })
    setEditingHoliday(null)
  }

  const handleEdit = (holiday: Holiday) => {
    setFormData({
      serviceProvider: holiday.serviceProvider || "",
      companyName: holiday.companyName || "",
      branchName: holiday.branchName || "",
      holidayName: holiday.holidayName,
      serviceProviderID: holiday.serviceProviderID,
      companyID: holiday.companyID,
      branchesID: holiday.branchesID,
    })
    setEditingHoliday(holiday)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/manage-holiday/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`Failed to delete holiday: ${res.status}`)
      }
      await loadHolidays()
    } catch (error) {
      console.error("Error deleting holiday:", error)
    }
  }

  const handleServiceProviderSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      serviceProvider: selected.display,
      serviceProviderID: selected.value,
    }))
  }

  const handleCompanySelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      companyName: selected.display,
      companyID: selected.value,
    }))
  }

  const handleBranchSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      branchName: selected.display,
      branchesID: selected.value,
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Holidays</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage company holidays and special days</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
                </DialogTitle>
                <DialogDescription>
                  {editingHoliday 
                    ? "Update the holiday information below." 
                    : "Fill in the details to add a new holiday."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Selection</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <SearchSuggestInput
                      label="Service Provider"
                      placeholder="Select Service Provider"
                      value={formData.serviceProvider}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, serviceProvider: value }))
                      }
                      onSelect={handleServiceProviderSelect}
                      fetchData={fetchServiceProviders}
                      displayField="companyName"
                      valueField="id"
                      required
                    />
                    <SearchSuggestInput
                      label="Company Name"
                      placeholder="Select Company"
                      value={formData.companyName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, companyName: value }))
                      }
                      onSelect={handleCompanySelect}
                      fetchData={fetchCompanies}
                      displayField="companyName"
                      valueField="id"
                      required
                    />
                    <SearchSuggestInput
                      label="Branch Name"
                      placeholder="Select Branch"
                      value={formData.branchName}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, branchName: value }))
                      }
                      onSelect={handleBranchSelect}
                      fetchData={fetchBranches}
                      displayField="branchName"
                      valueField="id"
                      required
                    />
                  </div>
                </div>

                {/* Holiday Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Holiday Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="holidayName">Holiday Name *</Label>
                    <Input
                      id="holidayName"
                      type="text"
                      value={formData.holidayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, holidayName: e.target.value }))}
                      placeholder="Enter holiday name"
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingHoliday ? "Update Holiday" : "Add Holiday"}
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
                placeholder="Search holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredHolidays.length} holidays
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Holidays Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:calendar-star" className="w-5 h-5" />
            Holidays List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Service Provider</TableHead>
                  <TableHead className="w-[150px]">Company Name</TableHead>
                  <TableHead className="w-[150px]">Branch Name</TableHead>
                  <TableHead className="w-[200px]">Holiday Name</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:calendar-star" className="w-12 h-12 text-gray-300" />
                        <p>No holidays found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium whitespace-nowrap">{holiday.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.holidayName}</TableCell>
                      <TableCell className="whitespace-nowrap">{holiday.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(holiday.id)}
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
