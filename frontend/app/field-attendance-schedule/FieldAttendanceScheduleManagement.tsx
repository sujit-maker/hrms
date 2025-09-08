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
import { Plus, Search, Edit, Trash2, MapPin } from "lucide-react"

interface FieldAttendanceSchedule {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeId: string
  employeeName: string
  siteName: string
  address: string
  latitude: string
  longitude: string
  fromDate: string
  toDate: string
  createdAt: string
}

// Mock data for dropdowns
const mockServiceProviders = [
  "TechCorp Solutions",
  "Global Services Ltd",
  "Enterprise Systems",
  "Digital Innovations"
]

const mockCompanies = [
  "ABC Corporation",
  "XYZ Industries",
  "Tech Solutions Inc",
  "Global Enterprises"
]

const mockBranches = [
  "Mumbai Branch",
  "Delhi Branch",
  "Bangalore Branch",
  "Chennai Branch"
]

const mockEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
  { id: "EMP003", name: "Mike Johnson" },
  { id: "EMP004", name: "Sarah Wilson" },
  { id: "EMP005", name: "David Brown" }
]

export function FieldAttendanceScheduleManagement() {
  const [schedules, setSchedules] = useState<FieldAttendanceSchedule[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<FieldAttendanceSchedule | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeId: "",
    siteName: "",
    address: "",
    latitude: "",
    longitude: "",
    fromDate: "",
    toDate: ""
  })

  const filteredSchedules = schedules.filter(schedule =>
    schedule.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingSchedule) {
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === editingSchedule.id 
            ? { ...schedule, ...formData, id: editingSchedule.id, createdAt: editingSchedule.createdAt }
            : schedule
        )
      )
    } else {
      const employee = mockEmployees.find(emp => emp.id === formData.employeeId)
      const newSchedule: FieldAttendanceSchedule = {
        id: Date.now().toString(),
        ...formData,
        employeeName: employee?.name || "",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setSchedules(prev => [...prev, newSchedule])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeId: "",
      siteName: "",
      address: "",
      latitude: "",
      longitude: "",
      fromDate: "",
      toDate: ""
    })
    setEditingSchedule(null)
  }

  const handleEdit = (schedule: FieldAttendanceSchedule) => {
    setFormData({
      serviceProvider: schedule.serviceProvider,
      companyName: schedule.companyName,
      branchName: schedule.branchName,
      employeeId: schedule.employeeId,
      siteName: schedule.siteName,
      address: schedule.address,
      latitude: schedule.latitude,
      longitude: schedule.longitude,
      fromDate: schedule.fromDate,
      toDate: schedule.toDate
    })
    setEditingSchedule(schedule)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id))
  }

  const generateGoogleMapsLink = (latitude: string, longitude: string) => {
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`
    }
    return ""
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Field Attendance Schedule</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage field attendance schedules and site assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Field Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? "Edit Field Attendance Schedule" : "Add New Field Attendance Schedule"}
                </DialogTitle>
                <DialogDescription>
                  {editingSchedule 
                    ? "Update the field attendance schedule information below." 
                    : "Fill in the details to add a new field attendance schedule."
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Organization Selection</h3>
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
                        {mockServiceProviders.map((provider) => (
                          <option key={provider} value={provider}>{provider}</option>
                        ))}
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
                        {mockCompanies.map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))}
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
                        {mockBranches.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Employee Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Employee Selection</h3>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee Name *</Label>
                    <select
                      id="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {mockEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Show FirstName + LastName + Emp ID</p>
                  </div>
                  {formData.employeeId && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Employee ID: {formData.employeeId}</h4>
                      <p className="text-sm text-gray-600">Fetch by Name</p>
                    </div>
                  )}
                </div>

                {/* Site Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Site Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      type="text"
                      value={formData.siteName}
                      onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="Enter site name"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter site address"
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Location Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude *</Label>
                      <Input
                        id="latitude"
                        type="text"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="Enter latitude"
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude *</Label>
                      <Input
                        id="longitude"
                        type="text"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="Enter longitude"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">Google Maps Link</h4>
                      <a 
                        href={generateGoogleMapsLink(formData.latitude, formData.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        View Site on Google Maps
                      </a>
                    </div>
                  )}
                </div>

                {/* Schedule Period */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Schedule Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDate">From Date *</Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={formData.fromDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toDate">To Date *</Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={formData.toDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingSchedule ? "Update Field Schedule" : "Add Field Schedule"}
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
                placeholder="Search field attendance schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredSchedules.length} schedules
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Field Attendance Schedules Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:map-marker-multiple" className="w-5 h-5" />
            Field Attendance Schedules List
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
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[150px]">Site Name</TableHead>
                  <TableHead className="w-[200px]">Address</TableHead>
                  <TableHead className="w-[100px]">Latitude</TableHead>
                  <TableHead className="w-[100px]">Longitude</TableHead>
                  <TableHead className="w-[150px]">Google Maps Link</TableHead>
                  <TableHead className="w-[100px]">From Date</TableHead>
                  <TableHead className="w-[100px]">To Date</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:map-marker-multiple" className="w-12 h-12 text-gray-300" />
                        <p>No field attendance schedules found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium whitespace-nowrap">{schedule.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.siteName}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.address}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.latitude}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.longitude}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {schedule.latitude && schedule.longitude ? (
                          <a 
                            href={generateGoogleMapsLink(schedule.latitude, schedule.longitude)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            View on Maps
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.fromDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.toDate}</TableCell>
                      <TableCell className="whitespace-nowrap">{schedule.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
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
