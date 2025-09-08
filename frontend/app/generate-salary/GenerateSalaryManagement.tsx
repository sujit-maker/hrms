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
import { Plus, Search, Download, CreditCard, Play } from "lucide-react"

interface SalaryGeneration {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeId: string
  employeeName: string
  payGrade: string
  basicSalary: number
  grossSalary: number
  salaryPayout: number
  status: "Generated" | "Paid" | "Pending"
  month: string
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
  { id: "EMP001", name: "John Doe", payGrade: "Senior Manager", basicSalary: 50000, grossSalary: 75000 },
  { id: "EMP002", name: "Jane Smith", payGrade: "Manager", basicSalary: 40000, grossSalary: 60000 },
  { id: "EMP003", name: "Mike Johnson", payGrade: "Senior Developer", basicSalary: 45000, grossSalary: 65000 },
  { id: "EMP004", name: "Sarah Wilson", payGrade: "Developer", basicSalary: 35000, grossSalary: 50000 },
  { id: "EMP005", name: "David Brown", payGrade: "Junior Developer", basicSalary: 25000, grossSalary: 35000 }
]

const mockSalaryCycles = [
  "January 2024",
  "February 2024",
  "March 2024",
  "April 2024",
  "May 2024",
  "June 2024"
]

export function GenerateSalaryManagement() {
  const [salaryGenerations, setSalaryGenerations] = useState<SalaryGeneration[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGeneration, setEditingGeneration] = useState<SalaryGeneration | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeId: "",
    month: ""
  })

  const filteredGenerations = salaryGenerations.filter(generation =>
    generation.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generation.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generation.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generation.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generation.payGrade.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingGeneration) {
      setSalaryGenerations(prev => 
        prev.map(generation => 
          generation.id === editingGeneration.id 
            ? { ...generation, ...formData, id: editingGeneration.id, createdAt: editingGeneration.createdAt }
            : generation
        )
      )
    } else {
      const selectedEmployee = mockEmployees.find(emp => emp.id === formData.employeeId)
      const newGeneration: SalaryGeneration = {
        id: Date.now().toString(),
        ...formData,
        employeeName: selectedEmployee?.name || "",
        payGrade: selectedEmployee?.payGrade || "",
        basicSalary: selectedEmployee?.basicSalary || 0,
        grossSalary: selectedEmployee?.grossSalary || 0,
        salaryPayout: selectedEmployee?.grossSalary || 0,
        status: "Pending",
        createdAt: new Date().toISOString().split('T')[0]
      }
      setSalaryGenerations(prev => [...prev, newGeneration])
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
      month: ""
    })
    setEditingGeneration(null)
  }

  const handleEdit = (generation: SalaryGeneration) => {
    setFormData({
      serviceProvider: generation.serviceProvider,
      companyName: generation.companyName,
      branchName: generation.branchName,
      employeeId: generation.employeeId,
      month: generation.month
    })
    setEditingGeneration(generation)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setSalaryGenerations(prev => prev.filter(generation => generation.id !== id))
  }

  const handleGenerate = () => {
    // Simulate salary generation - in real app this would call backend API
    setSalaryGenerations(prev => 
      prev.map(generation => ({
        ...generation,
        status: "Generated" as const
      }))
    )
  }

  const handleDownloadPDF = (id: string) => {
    // Simulate PDF download - in real app this would generate and download PDF
    console.log(`Downloading PDF for salary generation ${id}`)
    alert(`PDF download initiated for salary generation ${id}`)
  }

  const handleMakePayment = (id: string) => {
    // Simulate payment processing - in real app this would process payment
    setSalaryGenerations(prev => 
      prev.map(generation => 
        generation.id === id 
          ? { ...generation, status: "Paid" as const }
          : generation
      )
    )
    alert(`Payment processed for salary generation ${id}`)
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Generate Salary</h1>
          <p className="text-gray-600 mt-1 text-sm">Generate and manage employee salary payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleGenerate}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0 text-sm px-3 py-2"
            disabled={salaryGenerations.length === 0}
          >
            <Play className="w-4 h-4 mr-1" />
            Generate Salary
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Add Salary Generation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingGeneration ? "Edit Salary Generation" : "Add New Salary Generation"}
                </DialogTitle>
                <DialogDescription>
                  {editingGeneration 
                    ? "Update the salary generation information below." 
                    : "Fill in the details to add a new salary generation."
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
                    <Label htmlFor="employeeId">Select Employee *</Label>
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
                          {employee.name} ({employee.id}) - {employee.payGrade}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Fetch List</p>
                  </div>
                </div>

                {/* Salary Period */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Salary Period</h3>
                  <div className="space-y-2">
                    <Label htmlFor="month">Select Month *</Label>
                    <select
                      id="month"
                      value={formData.month}
                      onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Month</option>
                      {mockSalaryCycles.map((cycle) => (
                        <option key={cycle} value={cycle}>{cycle}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">List salary cycle</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingGeneration ? "Update Salary Generation" : "Add Salary Generation"}
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
                placeholder="Search salary generations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredGenerations.length} generations
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Generations Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:currency-inr" className="w-5 h-5" />
            Salary Generations List
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
                  <TableHead className="w-[120px]">PayGrade</TableHead>
                  <TableHead className="w-[100px]">Basic Salary</TableHead>
                  <TableHead className="w-[100px]">Gross Salary</TableHead>
                  <TableHead className="w-[100px]">Salary Payout</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGenerations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:currency-inr" className="w-12 h-12 text-gray-300" />
                        <p>No salary generations found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGenerations.map((generation) => (
                    <TableRow key={generation.id}>
                      <TableCell className="font-medium whitespace-nowrap">{generation.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{generation.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{generation.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{generation.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{generation.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{generation.payGrade}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{generation.basicSalary}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{generation.grossSalary}</TableCell>
                      <TableCell className="whitespace-nowrap text-center">₹{generation.salaryPayout}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                          generation.status === "Paid" ? "default" : 
                          generation.status === "Generated" ? "secondary" : "outline"
                        }>
                          {generation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadPDF(generation.id)}
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMakePayment(generation.id)}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Make Payment"
                            disabled={generation.status === "Paid"}
                          >
                            <CreditCard className="w-3 h-3" />
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
