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

interface SalaryStatement {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  employeeName: string
  employeeId: string
  financialYear: string
  generatedAt: string
  status: "Generated" | "Processing" | "Failed"
  recordCount: number
  statementType: "Monthly Statement" | "Annual Statement" | "Tax Statement" | "Pay Slip"
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
  { id: "EMP005", name: "David Brown" },
  { id: "EMP006", name: "Lisa Anderson" },
  { id: "EMP007", name: "Robert Taylor" },
  { id: "EMP008", name: "Emily Davis" },
  { id: "EMP009", name: "Michael Chen" },
  { id: "EMP010", name: "Jennifer Lee" }
]

// Generate financial years (current year and previous 5 years)
const generateFinancialYears = () => {
  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 6; i++) {
    const year = currentYear - i
    years.push(year.toString())
  }
  return years
}

const mockFinancialYears = generateFinancialYears()

const statementTypes = [
  "Monthly Statement",
  "Annual Statement",
  "Tax Statement",
  "Pay Slip"
]

export function SalaryStatementsManagement() {
  const [statements, setStatements] = useState<SalaryStatement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStatement, setEditingStatement] = useState<SalaryStatement | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeId: "",
    financialYear: ""
  })

  const filteredStatements = statements.filter(statement =>
    statement.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.financialYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.statementType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingStatement) {
      setStatements(prev => 
        prev.map(statement => 
          statement.id === editingStatement.id 
            ? { ...statement, ...formData, id: editingStatement.id, generatedAt: editingStatement.generatedAt }
            : statement
        )
      )
    } else {
      const employee = mockEmployees.find(emp => emp.id === formData.employeeId)
      const newStatement: SalaryStatement = {
        id: Date.now().toString(),
        ...formData,
        employeeName: employee?.name || "",
        generatedAt: new Date().toISOString().split('T')[0],
        status: "Generated",
        recordCount: Math.floor(Math.random() * 12) + 1, // 1-12 months
        statementType: statementTypes[Math.floor(Math.random() * statementTypes.length)]
      }
      setStatements(prev => [...prev, newStatement])
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
      financialYear: ""
    })
    setEditingStatement(null)
  }

  const handleEdit = (statement: SalaryStatement) => {
    setFormData({
      serviceProvider: statement.serviceProvider,
      companyName: statement.companyName,
      branchName: statement.branchName,
      employeeId: statement.employeeId,
      financialYear: statement.financialYear
    })
    setEditingStatement(statement)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setStatements(prev => prev.filter(statement => statement.id !== id))
  }

  const handleGenerateStatement = (id: string) => {
    setStatements(prev => 
      prev.map(statement => 
        statement.id === id 
          ? { ...statement, status: "Generated" as const }
          : statement
      )
    )
  }

  const handleDownloadStatement = (id: string) => {
    // Mock download functionality
    console.log(`Downloading salary statement ${id}`)
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Salary Statements</h1>
          <p className="text-gray-600 mt-1 text-sm">Generate and manage comprehensive salary statements</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
                <Plus className="w-4 h-4 mr-1" />
                Generate Statement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStatement ? "Edit Salary Statement" : "Generate Salary Statement"}
                </DialogTitle>
                <DialogDescription>
                  {editingStatement 
                    ? "Update the salary statement configuration below." 
                    : "Configure the parameters to generate a new salary statement."
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

                {/* Statement Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Statement Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
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
                            {employee.name} ({employee.id})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Fetch List</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financialYear">Select Financial Year *</Label>
                      <select
                        id="financialYear"
                        value={formData.financialYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, financialYear: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Financial Year</option>
                        {mockFinancialYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500">Select</p>
                    </div>
                  </div>
                  {formData.employeeId && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-900 mb-2">Selected Employee: {mockEmployees.find(emp => emp.id === formData.employeeId)?.name}</h4>
                      <p className="text-sm text-gray-600">Employee ID: {formData.employeeId}</p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingStatement ? "Update Statement" : "Generate Statement"}
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
                placeholder="Search salary statements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredStatements.length} statements
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Salary Statements Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:currency-usd" className="w-5 h-5" />
            Salary Statements List
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
                  <TableHead className="w-[150px]">Employee Name</TableHead>
                  <TableHead className="w-[100px]">Employee ID</TableHead>
                  <TableHead className="w-[120px]">Financial Year</TableHead>
                  <TableHead className="w-[120px]">Statement Type</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Record Count</TableHead>
                  <TableHead className="w-[100px]">Generated At</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:currency-usd" className="w-12 h-12 text-gray-300" />
                        <p>No salary statements found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStatements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell className="font-medium whitespace-nowrap">{statement.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.employeeName}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.employeeId}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.financialYear}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.statementType}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={
                          statement.status === "Generated" ? "default" : 
                          statement.status === "Processing" ? "secondary" : "destructive"
                        }>
                          {statement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{statement.recordCount.toLocaleString()}</TableCell>
                      <TableCell className="whitespace-nowrap">{statement.generatedAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {statement.status === "Generated" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadStatement(statement.id)}
                              className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Download Statement"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(statement)}
                            className="h-7 w-7 p-0"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(statement.id)}
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
