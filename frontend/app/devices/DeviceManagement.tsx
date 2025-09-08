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

interface Device {
  id: string
  status: "Active" | "Inactive"
  serviceProvider: string
  companyName: string
  branchName: string
  deviceName: string
  deviceMake: string
  deviceModel: string
  deviceSN: string
  createdAt: string
}

export function DeviceManagement() {
  const [devices, setDevices] = useState<Device[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState({
    status: "Active" as "Active" | "Inactive",
    serviceProvider: "",
    companyName: "",
    branchName: "",
    deviceName: "",
    deviceMake: "",
    deviceModel: "",
    deviceSN: ""
  })

  const filteredDevices = devices.filter(device =>
    device.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceSN.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingDevice) {
      // Update existing device
      setDevices(prev => 
        prev.map(device => 
          device.id === editingDevice.id 
            ? { 
                ...device, 
                ...formData,
                id: editingDevice.id,
                createdAt: editingDevice.createdAt
              }
            : device
        )
      )
    } else {
      // Add new device
      const newDevice: Device = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setDevices(prev => [...prev, newDevice])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      status: "Active",
      serviceProvider: "",
      companyName: "",
      branchName: "",
      deviceName: "",
      deviceMake: "",
      deviceModel: "",
      deviceSN: ""
    })
    setEditingDevice(null)
  }

  const handleEdit = (device: Device) => {
    setFormData({
      status: device.status,
      serviceProvider: device.serviceProvider,
      companyName: device.companyName,
      branchName: device.branchName,
      deviceName: device.deviceName,
      deviceMake: device.deviceMake,
      deviceModel: device.deviceModel,
      deviceSN: device.deviceSN
    })
    setEditingDevice(device)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDevices(prev => prev.filter(device => device.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your devices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDevice ? "Edit Device" : "Add New Device"}
              </DialogTitle>
              <DialogDescription>
                {editingDevice 
                  ? "Update the device information below." 
                  : "Fill in the details to add a new device."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

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
                  <option value="Provider 3">Provider 3</option>
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
                  <option value="Company 3">Company 3</option>
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
                  <option value="Branch 3">Branch 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name *</Label>
                <Input
                  id="deviceName"
                  value={formData.deviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
                  placeholder="Enter device name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceMake">Device Make *</Label>
                <Input
                  id="deviceMake"
                  value={formData.deviceMake}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceMake: e.target.value }))}
                  placeholder="Enter device make"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceModel">Device Model *</Label>
                <Input
                  id="deviceModel"
                  value={formData.deviceModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceModel: e.target.value }))}
                  placeholder="Enter device model"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceSN">Device SN *</Label>
                <Input
                  id="deviceSN"
                  value={formData.deviceSN}
                  onChange={(e) => setFormData(prev => ({ ...prev, deviceSN: e.target.value }))}
                  placeholder="Enter device serial number"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingDevice ? "Update Device" : "Add Device"}
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
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredDevices.length} devices
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Device Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:devices" className="w-5 h-5" />
            Device List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[120px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[120px]">Branch Name</TableHead>
                  <TableHead className="w-[120px]">Device Name</TableHead>
                  <TableHead className="w-[100px]">Device Make</TableHead>
                  <TableHead className="w-[100px]">Device Model</TableHead>
                  <TableHead className="w-[120px]">Device SN</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:devices" className="w-12 h-12 text-gray-300" />
                        <p>No devices found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={device.status === "Active" ? "default" : "secondary"}>
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{device.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{device.deviceName}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.deviceMake}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.deviceModel}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.deviceSN}</TableCell>
                      <TableCell className="whitespace-nowrap">{device.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(device)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(device.id)}
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
