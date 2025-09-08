"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
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

interface Company {
  id: string
  companyName: string
  companyAddress: string
  country: string
  states: string
  timeZone: string
  currency: string
  pfNo: string
  tanNo: string
  panNo: string
  esiNo: string
  linNo: string
  gstNo: string
  shopRegistrationCertificateNo: string
  financialYearStart: string
  contactNumber: string
  emailAddress: string
  companyLogo: string
  signatureUpload: string
  createdAt: string
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    country: "",
    states: "",
    timeZone: "",
    currency: "",
    pfNo: "",
    tanNo: "",
    panNo: "",
    esiNo: "",
    linNo: "",
    gstNo: "",
    shopRegistrationCertificateNo: "",
    financialYearStart: "",
    contactNumber: "",
    emailAddress: "",
    companyLogo: "",
    signatureUpload: ""
  })

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingCompany) {
      // Update existing company
      setCompanies(prev => 
        prev.map(company => 
          company.id === editingCompany.id 
            ? { 
                ...company, 
                ...formData,
                id: editingCompany.id,
                createdAt: editingCompany.createdAt
              }
            : company
        )
      )
    } else {
      // Add new company
      const newCompany: Company = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setCompanies(prev => [...prev, newCompany])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      companyAddress: "",
      country: "",
      states: "",
      timeZone: "",
      currency: "",
      pfNo: "",
      tanNo: "",
      panNo: "",
      esiNo: "",
      linNo: "",
      gstNo: "",
      shopRegistrationCertificateNo: "",
      financialYearStart: "",
      contactNumber: "",
      emailAddress: "",
      companyLogo: "",
      signatureUpload: ""
    })
    setEditingCompany(null)
  }

  const handleEdit = (company: Company) => {
    setFormData({
      companyName: company.companyName,
      companyAddress: company.companyAddress,
      country: company.country,
      states: company.states,
      timeZone: company.timeZone,
      currency: company.currency,
      pfNo: company.pfNo,
      tanNo: company.tanNo,
      panNo: company.panNo,
      esiNo: company.esiNo,
      linNo: company.linNo,
      gstNo: company.gstNo,
      shopRegistrationCertificateNo: company.shopRegistrationCertificateNo,
      financialYearStart: company.financialYearStart,
      contactNumber: company.contactNumber,
      emailAddress: company.emailAddress,
      companyLogo: company.companyLogo,
      signatureUpload: company.signatureUpload
    })
    setEditingCompany(company)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setCompanies(prev => prev.filter(company => company.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Company</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your company information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Edit Company" : "Add New Company"}
              </DialogTitle>
              <DialogDescription>
                {editingCompany 
                  ? "Update the company information below." 
                  : "Fill in the details to add a new company."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address *</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Enter company address"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Enter country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="states">States *</Label>
                  <Input
                    id="states"
                    value={formData.states}
                    onChange={(e) => setFormData(prev => ({ ...prev, states: e.target.value }))}
                    placeholder="Enter state/province"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time Zone *</Label>
                  <Input
                    id="timeZone"
                    value={formData.timeZone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeZone: e.target.value }))}
                    placeholder="Enter time zone"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="Enter currency"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pfNo">PF No *</Label>
                  <Input
                    id="pfNo"
                    value={formData.pfNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, pfNo: e.target.value }))}
                    placeholder="Enter PF number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanNo">TAN No *</Label>
                  <Input
                    id="tanNo"
                    value={formData.tanNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanNo: e.target.value }))}
                    placeholder="Enter TAN number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="panNo">PAN No *</Label>
                  <Input
                    id="panNo"
                    value={formData.panNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, panNo: e.target.value }))}
                    placeholder="Enter PAN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="esiNo">ESI No *</Label>
                  <Input
                    id="esiNo"
                    value={formData.esiNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, esiNo: e.target.value }))}
                    placeholder="Enter ESI number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linNo">LIN No *</Label>
                  <Input
                    id="linNo"
                    value={formData.linNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, linNo: e.target.value }))}
                    placeholder="Enter LIN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNo">GST No *</Label>
                  <Input
                    id="gstNo"
                    value={formData.gstNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, gstNo: e.target.value }))}
                    placeholder="Enter GST number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopRegistrationCertificateNo">Shop Registration Certificate No *</Label>
                <Input
                  id="shopRegistrationCertificateNo"
                  value={formData.shopRegistrationCertificateNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, shopRegistrationCertificateNo: e.target.value }))}
                  placeholder="Enter shop registration certificate number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="financialYearStart">Financial Year Start *</Label>
                <Input
                  id="financialYearStart"
                  value={formData.financialYearStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, financialYearStart: e.target.value }))}
                  placeholder="Enter financial year start"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="Enter contact number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyLogo">Company Logo</Label>
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, companyLogo: file.name }))
                    }
                  }}
                />
                <p className="text-sm text-gray-500">Upload company logo (PNG, JPG, JPEG)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureUpload">Signature Upload</Label>
                <Input
                  id="signatureUpload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData(prev => ({ ...prev, signatureUpload: file.name }))
                    }
                  }}
                />
                <p className="text-sm text-gray-500">Upload signature (PNG, JPG, JPEG)</p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCompany ? "Update Company" : "Add Company"}
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
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredCompanies.length} companies
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Company Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building" className="w-5 h-5" />
            Company List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[150px]">Address</TableHead>
                  <TableHead className="w-[100px]">Country</TableHead>
                  <TableHead className="w-[100px]">States</TableHead>
                  <TableHead className="w-[100px]">Time Zone</TableHead>
                  <TableHead className="w-[80px]">Currency</TableHead>
                  <TableHead className="w-[100px]">PF No</TableHead>
                  <TableHead className="w-[100px]">TAN No</TableHead>
                  <TableHead className="w-[100px]">PAN No</TableHead>
                  <TableHead className="w-[100px]">ESI No</TableHead>
                  <TableHead className="w-[100px]">LIN No</TableHead>
                  <TableHead className="w-[100px]">GST No</TableHead>
                  <TableHead className="w-[100px]">Contact</TableHead>
                  <TableHead className="w-[140px]">Email</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={16} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:office-building-outline" className="w-12 h-12 text-gray-300" />
                        <p>No companies found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium whitespace-nowrap">{company.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.companyAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.country}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.states}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.timeZone}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.currency}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.pfNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.tanNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.panNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.esiNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.linNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.gstNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.contactNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.emailAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{company.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company.id)}
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
