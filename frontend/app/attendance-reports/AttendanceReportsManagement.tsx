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
import { Plus, Search, Edit, Trash2, Download, FileText } from "lucide-react"

interface AttendanceReport {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  department: string
  reportFilter: "Department Wise" | "Employee Wise"
  reportType: "All Punches Logs" | "In-Out Punches Log" | "Attendance Logs" | "Summary Logs"
  generatedAt: string
  status: "Generated" | "Processing" | "Failed"
  recordCount: number
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

const mockDepartments = [
  "All",
  "Human Resources",
  "Information Technology",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "Customer Support"
]

const reportFilters = [
  "Department Wise",
  "Employee Wise"
]

const reportTypes = [
  "All Punches Logs",
  "In-Out Punches Log",
  "Attendance Logs",
  "Summary Logs"
]

export function AttendanceReportsManagement() {
  const [reports, setReports] = useState<AttendanceReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<AttendanceReport | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    department: "",
    reportFilter: "",
    reportType: ""
  })

  const filteredReports = reports.filter(report =>
    report.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportFilter.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingReport) {
      setReports(prev => 
        prev.map(report => 
          report.id === editingReport.id 
            ? { ...report, ...formData, id: editingReport.id, generatedAt: editingReport.generatedAt }
            : report
        )
      )
    } else {
      const newReport: AttendanceReport = {
        id: Date.now().toString(),
        ...formData,
        generatedAt: new Date().toISOString().split('T')[0],
        status: "Generated",
        recordCount: Math.floor(Math.random() * 1000) + 100
      }
      setReports(prev => [...prev, newReport])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      department: "",
      reportFilter: "",
      reportType: ""
    })
    setEditingReport(null)
  }

  const handleEdit = (report: AttendanceReport) => {
    setFormData({
      serviceProvider: report.serviceProvider,
      companyName: report.companyName,
      branchName: report.branchName,
      department: report.department,
      reportFilter: report.reportFilter,
      reportType: report.reportType
    })
    setEditingReport(report)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id))
  }

  const handleGenerateReport = (id: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { ...report, status: "Generated" as const }
          : report
      )
    )
  }

  const handleDownloadReport = (id: string) => {
    // Mock download functionality
    console.log(`Downloading report ${id}`)
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-1 text-sm">Generate and manage comprehensive attendance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReport ? "Edit Attendance Report" : "Generate Attendance Report"}
                </DialogTitle>
                <DialogDescription>
                  {editingReport 
                    ? "Update the attendance report configuration below." 
                    : "Configure the parameters to generate a new attendance report."
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

                {/* Report Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Report Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <select
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Department</option>
                        {mockDepartments.map((department) => (
                          <option key={department} value={department}>{department}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Select or All</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportFilter">Report Filter *</Label>
                      <select
                        id="reportFilter"
                        value={formData.reportFilter}
                        onChange={(e) => setFormData(prev => ({ ...prev, reportFilter: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Report Filter</option>
                        {reportFilters.map((filter) => (
                          <option key={filter} value={filter}>{filter}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Department Wise / Employee Wise</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportType">Report Type *</Label>
                    <select
                      id="reportType"
                      value={formData.reportType}
                      onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Report Type</option>
                      {reportTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">All Punches Logs / In-Out Punches Log / Attendance Logs / Summary Logs</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingReport ? "Update Report" : "Generate Report"}
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
                placeholder="Search attendance reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredReports.length} reports
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Reports Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:chart-line" className="w-5 h-5" />
            Attendance Reports List
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
                  <TableHead className="w-[120px]">Department</TableHead>
                  <TableHead className="w-[120px]">Report Filter</TableHead>
                  <TableHead className="w-[150px]">Report Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Record Count</TableHead>
                  <TableHead className="w-[100px]">Generated At</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:chart-line" className="w-12 h-12 text-gray-300" />
                        <p>No attendance reports found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium whitespace-nowrap">{report.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.department}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.reportFilter}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.reportType}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                          report.status === "Generated" ? "default" : 
                          report.status === "Processing" ? "secondary" : "destructive"
                        }>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{report.recordCount.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{report.generatedAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === "Generated" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report.id)}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Download Report"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(report)}
                            className="h-7 w-7 p-0"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(report.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
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
