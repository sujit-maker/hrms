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

interface AttendanceLog {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  deviceName: string
  deviceEmployeeCode: string
  employeeName: string
  punchTime: string
  latitude: string
  longitude: string
  googleMapsLink: string
  location: string
  mobileDeviceId: string
  mobileDeviceInfo: string
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

const mockDevices = [
  { name: "Biometric Device 001", employeeCode: "EMP001" },
  { name: "Biometric Device 002", employeeCode: "EMP002" },
  { name: "Card Reader 001", employeeCode: "EMP003" },
  { name: "Mobile App", employeeCode: "EMP004" },
  { name: "Fingerprint Scanner 001", employeeCode: "EMP005" }
]

const mockEmployees = [
  { id: "EMP001", name: "John Doe" },
  { id: "EMP002", name: "Jane Smith" },
  { id: "EMP003", name: "Mike Johnson" },
  { id: "EMP004", name: "Sarah Wilson" },
  { id: "EMP005", name: "David Brown" }
]

export function AttendanceLogsManagement() {
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<AttendanceLog | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    deviceName: "",
    deviceEmployeeCode: "",
    employeeName: "",
    punchTime: "",
    latitude: "",
    longitude: "",
    googleMapsLink: "",
    location: "",
    mobileDeviceId: "",
    mobileDeviceInfo: ""
  })

  const filteredLogs = attendanceLogs.filter(log =>
    log.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingLog) {
      setAttendanceLogs(prev => 
        prev.map(log => 
          log.id === editingLog.id 
            ? { ...log, ...formData, id: editingLog.id, createdAt: editingLog.createdAt }
            : log
        )
      )
    } else {
      const newLog: AttendanceLog = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setAttendanceLogs(prev => [...prev, newLog])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      deviceName: "",
      deviceEmployeeCode: "",
      employeeName: "",
      punchTime: "",
      latitude: "",
      longitude: "",
      googleMapsLink: "",
      location: "",
      mobileDeviceId: "",
      mobileDeviceInfo: ""
    })
    setEditingLog(null)
  }

  const handleEdit = (log: AttendanceLog) => {
    setFormData({
      serviceProvider: log.serviceProvider,
      companyName: log.companyName,
      branchName: log.branchName,
      deviceName: log.deviceName,
      deviceEmployeeCode: log.deviceEmployeeCode,
      employeeName: log.employeeName,
      punchTime: log.punchTime,
      latitude: log.latitude,
      longitude: log.longitude,
      googleMapsLink: log.googleMapsLink,
      location: log.location,
      mobileDeviceId: log.mobileDeviceId,
      mobileDeviceInfo: log.mobileDeviceInfo
    })
    setEditingLog(log)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAttendanceLogs(prev => prev.filter(log => log.id !== id))
  }

  const generateGoogleMapsLink = (latitude: string, longitude: string) => {
    if (latitude && longitude) {
      return `https://www.google.com/maps?q=${latitude},${longitude}`
    }
    return ""
  }

  const handleLocationChange = (latitude: string, longitude: string) => {
    setFormData(prev => ({
      ...prev,
      latitude,
      longitude,
      googleMapsLink: generateGoogleMapsLink(latitude, longitude)
    }))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Logs</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage employee attendance logs and device tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Attendance Log
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLog ? "Edit Attendance Log" : "Add New Attendance Log"}
                </DialogTitle>
                <DialogDescription>
                  {editingLog 
                    ? "Update the attendance log information below." 
                    : "Fill in the details to add a new attendance log."
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

                {/* Device Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Device Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deviceName">Device Name *</Label>
                      <select
                        id="deviceName"
                        value={formData.deviceName}
                        onChange={(e) => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Device</option>
                        {mockDevices.map((device) => (
                          <option key={device.name} value={device.name}>{device.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deviceEmployeeCode">Device Employee Code *</Label>
                      <select
                        id="deviceEmployeeCode"
                        value={formData.deviceEmployeeCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, deviceEmployeeCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Employee Code</option>
                        {mockDevices.map((device) => (
                          <option key={device.employeeCode} value={device.employeeCode}>{device.employeeCode}</option>
                        ))}
                      </select>
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
                        <option key={employee.id} value={employee.name}>{employee.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Attendance Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attendance Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="punchTime">Punch Time *</Label>
                    <Input
                      id="punchTime"
                      type="datetime-local"
                      value={formData.punchTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, punchTime: e.target.value }))}
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
                        onChange={(e) => handleLocationChange(e.target.value, formData.longitude)}
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
                        onChange={(e) => handleLocationChange(formData.latitude, e.target.value)}
                        placeholder="Enter longitude"
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                    <Input
                      id="googleMapsLink"
                      type="url"
                      value={formData.googleMapsLink}
                      onChange={(e) => setFormData(prev => ({ ...prev, googleMapsLink: e.target.value }))}
                      placeholder="Google Maps link will be auto-generated"
                      className="w-full"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location description"
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Device Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mobile Device Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="mobileDeviceId">Mobile Device ID *</Label>
                    <Input
                      id="mobileDeviceId"
                      type="text"
                      value={formData.mobileDeviceId}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileDeviceId: e.target.value }))}
                      placeholder="Enter mobile device ID"
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileDeviceInfo">Mobile Device Info *</Label>
                    <Input
                      id="mobileDeviceInfo"
                      type="text"
                      value={formData.mobileDeviceInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobileDeviceInfo: e.target.value }))}
                      placeholder="Enter mobile device information"
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
                    {editingLog ? "Update Attendance Log" : "Add Attendance Log"}
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
                placeholder="Search attendance logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredLogs.length} logs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Logs Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-check" className="w-5 h-5" />
            Attendance Logs List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Service Provider</TableHead>
                  <TableHead className="w-[100px]">Company Name</TableHead>
                  <TableHead className="w-[100px]">Branch Name</TableHead>
                  <TableHead className="w-[120px]">Device Name</TableHead>
                  <TableHead className="w-[100px]">Device Employee Code</TableHead>
                  <TableHead className="w-[120px]">Employee Name</TableHead>
                  <TableHead className="w-[120px]">Punch Time</TableHead>
                  <TableHead className="w-[80px]">Latitude</TableHead>
                  <TableHead className="w-[80px]">Longitude</TableHead>
                  <TableHead className="w-[140px]">Google Maps Link</TableHead>
                  <TableHead className="w-[120px]">Location</TableHead>
                  <TableHead className="w-[100px]">Mobile Device ID</TableHead>
                  <TableHead className="w-[120px]">Mobile Device Info</TableHead>
                  <TableHead className="w-[80px]">Created</TableHead>
                  <TableHead className="w-[60px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={15} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-check" className="w-12 h-12 text-gray-300" />
                        <p>No attendance logs found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium whitespace-nowrap text-xs">{log.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.deviceName}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.deviceEmployeeCode}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.punchTime}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.latitude}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.longitude}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.googleMapsLink ? (
                          <a 
                            href={log.googleMapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                          >
                            <MapPin className="w-3 h-3" />
                            Maps
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.location}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.mobileDeviceId}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.mobileDeviceInfo}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">{log.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(log)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(log.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
