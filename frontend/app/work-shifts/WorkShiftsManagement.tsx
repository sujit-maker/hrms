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

interface DaySchedule {
  day: string
  startTime: string
  endTime: string
  totalHours: number
  isWeeklyOff: boolean
}

interface WorkShift {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  workShiftName: string
  weeklySchedule: DaySchedule[]
  createdAt: string
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

export function WorkShiftsManagement() {
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWorkShift, setEditingWorkShift] = useState<WorkShift | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    workShiftName: "",
    weeklySchedule: DAYS_OF_WEEK.map(day => ({
      day,
      startTime: "09:00",
      endTime: "18:00",
      totalHours: 8,
      isWeeklyOff: false
    }))
  })

  const filteredWorkShifts = workShifts.filter(workShift =>
    workShift.workShiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workShift.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workShift.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workShift.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    const diffMinutes = endMinutes - startMinutes
    return Math.round((diffMinutes / 60) * 10) / 10 // Round to 1 decimal place
  }

  const handleTimeChange = (dayIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedule = [...formData.weeklySchedule]
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      [field]: value
    }
    
    // Auto calculate total hours
    const totalHours = calculateTotalHours(
      updatedSchedule[dayIndex].startTime,
      updatedSchedule[dayIndex].endTime
    )
    updatedSchedule[dayIndex].totalHours = totalHours
    
    setFormData(prev => ({
      ...prev,
      weeklySchedule: updatedSchedule
    }))
  }

  const handleWeeklyOffChange = (dayIndex: number, isWeeklyOff: boolean) => {
    const updatedSchedule = [...formData.weeklySchedule]
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      isWeeklyOff,
      startTime: isWeeklyOff ? "00:00" : updatedSchedule[dayIndex].startTime,
      endTime: isWeeklyOff ? "00:00" : updatedSchedule[dayIndex].endTime,
      totalHours: isWeeklyOff ? 0 : updatedSchedule[dayIndex].totalHours
    }
    
    setFormData(prev => ({
      ...prev,
      weeklySchedule: updatedSchedule
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingWorkShift) {
      setWorkShifts(prev => 
        prev.map(workShift => 
          workShift.id === editingWorkShift.id 
            ? { ...workShift, ...formData, id: editingWorkShift.id, createdAt: editingWorkShift.createdAt }
            : workShift
        )
      )
    } else {
      const newWorkShift: WorkShift = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setWorkShifts(prev => [...prev, newWorkShift])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      workShiftName: "",
      weeklySchedule: DAYS_OF_WEEK.map(day => ({
        day,
        startTime: "09:00",
        endTime: "18:00",
        totalHours: 8,
        isWeeklyOff: false
      }))
    })
    setEditingWorkShift(null)
  }

  const handleEdit = (workShift: WorkShift) => {
    setFormData({
      serviceProvider: workShift.serviceProvider,
      companyName: workShift.companyName,
      branchName: workShift.branchName,
      workShiftName: workShift.workShiftName,
      weeklySchedule: workShift.weeklySchedule
    })
    setEditingWorkShift(workShift)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setWorkShifts(prev => prev.filter(workShift => workShift.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Work Shifts</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage work shifts and schedules</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Work Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkShift ? "Edit Work Shift" : "Add New Work Shift"}
              </DialogTitle>
              <DialogDescription>
                {editingWorkShift 
                  ? "Update the work shift information below." 
                  : "Fill in the details to add a new work shift."
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
                <Label htmlFor="workShiftName">Work Shift Name *</Label>
                <Input
                  id="workShiftName"
                  value={formData.workShiftName}
                  onChange={(e) => setFormData(prev => ({ ...prev, workShiftName: e.target.value }))}
                  placeholder="Enter work shift name"
                  required
                />
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Default Working Hours</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">Day</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">Start Time</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">End Time</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">Total Hours</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">Weekly Off</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.weeklySchedule.map((daySchedule, index) => (
                        <tr key={daySchedule.day}>
                          <td className="border border-gray-300 px-3 py-2 font-medium">{daySchedule.day}</td>
                          <td className="border border-gray-300 px-3 py-2">
                            <Input
                              type="time"
                              value={daySchedule.startTime}
                              onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                              disabled={daySchedule.isWeeklyOff}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <Input
                              type="time"
                              value={daySchedule.endTime}
                              onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                              disabled={daySchedule.isWeeklyOff}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className="font-medium">{daySchedule.totalHours}h</span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={daySchedule.isWeeklyOff}
                              onChange={(e) => handleWeeklyOffChange(index, e.target.checked)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingWorkShift ? "Update Work Shift" : "Add Work Shift"}
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
                placeholder="Search work shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredWorkShifts.length} work shifts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Work Shifts Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-outline" className="w-5 h-5" />
            Work Shifts List
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
                  <TableHead className="w-[150px]">Work Shift Name</TableHead>
                  <TableHead className="w-[200px]">Schedule</TableHead>
                  <TableHead className="w-[100px]">Total Weekly Hours</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkShifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:clock-outline" className="w-12 h-12 text-gray-300" />
                        <p>No work shifts found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkShifts.map((workShift) => {
                    const totalWeeklyHours = workShift.weeklySchedule
                      .filter(day => !day.isWeeklyOff)
                      .reduce((sum, day) => sum + day.totalHours, 0)
                    
                    const scheduleSummary = workShift.weeklySchedule
                      .filter(day => !day.isWeeklyOff)
                      .map(day => `${day.day}: ${day.startTime}-${day.endTime}`)
                      .join(', ')
                    
                    return (
                      <TableRow key={workShift.id}>
                        <TableCell className="whitespace-nowrap">{workShift.serviceProvider}</TableCell>
                        <TableCell className="whitespace-nowrap">{workShift.companyName}</TableCell>
                        <TableCell className="whitespace-nowrap">{workShift.branchName}</TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{workShift.workShiftName}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <div className="max-w-[180px] truncate" title={scheduleSummary}>
                            {scheduleSummary || "No working days"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          <Badge variant="outline">{totalWeeklyHours}h</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{workShift.createdAt}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(workShift)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(workShift.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
