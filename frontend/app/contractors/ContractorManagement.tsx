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

interface Contractor {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  contractorCompanyName: string
  contractorCompanyAddress: string
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
  contactNumber: string
  emailAddress: string
  companyLogo: string
  signatureUpload: string
  createdAt: string
}

export function ContractorManagement() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    contractorCompanyName: "",
    contractorCompanyAddress: "",
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
    contactNumber: "",
    emailAddress: "",
    companyLogo: "",
    signatureUpload: ""
  })

  const filteredContractors = contractors.filter(contractor =>
    contractor.contractorCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contractor.contactNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingContractor) {
      // Update existing contractor
      setContractors(prev => 
        prev.map(contractor => 
          contractor.id === editingContractor.id 
            ? { 
                ...contractor, 
                ...formData,
                id: editingContractor.id,
                createdAt: editingContractor.createdAt
              }
            : contractor
        )
      )
    } else {
      // Add new contractor
      const newContractor: Contractor = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setContractors(prev => [...prev, newContractor])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      contractorCompanyName: "",
      contractorCompanyAddress: "",
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
      contactNumber: "",
      emailAddress: "",
      companyLogo: "",
      signatureUpload: ""
    })
    setEditingContractor(null)
  }

  const handleEdit = (contractor: Contractor) => {
    setFormData({
      serviceProvider: contractor.serviceProvider,
      companyName: contractor.companyName,
      branchName: contractor.branchName,
      contractorCompanyName: contractor.contractorCompanyName,
      contractorCompanyAddress: contractor.contractorCompanyAddress,
      country: contractor.country,
      states: contractor.states,
      timeZone: contractor.timeZone,
      currency: contractor.currency,
      pfNo: contractor.pfNo,
      tanNo: contractor.tanNo,
      panNo: contractor.panNo,
      esiNo: contractor.esiNo,
      linNo: contractor.linNo,
      gstNo: contractor.gstNo,
      shopRegistrationCertificateNo: contractor.shopRegistrationCertificateNo,
      contactNumber: contractor.contactNumber,
      emailAddress: contractor.emailAddress,
      companyLogo: contractor.companyLogo,
      signatureUpload: contractor.signatureUpload
    })
    setEditingContractor(contractor)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setContractors(prev => prev.filter(contractor => contractor.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your contractors</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Contractor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContractor ? "Edit Contractor" : "Add New Contractor"}
              </DialogTitle>
              <DialogDescription>
                {editingContractor 
                  ? "Update the contractor information below." 
                  : "Fill in the details to add a new contractor."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="contractorCompanyName">Contractor Company Name *</Label>
                <Input
                  id="contractorCompanyName"
                  value={formData.contractorCompanyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractorCompanyName: e.target.value }))}
                  placeholder="Enter contractor company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractorCompanyAddress">Contractor Company Address *</Label>
                <Textarea
                  id="contractorCompanyAddress"
                  value={formData.contractorCompanyAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractorCompanyAddress: e.target.value }))}
                  placeholder="Enter contractor company address"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="states">States *</Label>
                  <select
                    id="states"
                    value={formData.states}
                    onChange={(e) => setFormData(prev => ({ ...prev, states: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time Zone *</Label>
                  <select
                    id="timeZone"
                    value={formData.timeZone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeZone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Time Zone</option>
                    <option value="IST">IST (UTC+5:30)</option>
                    <option value="EST">EST (UTC-5)</option>
                    <option value="PST">PST (UTC-8)</option>
                    <option value="GMT">GMT (UTC+0)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Currency</option>
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
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
                  {editingContractor ? "Update Contractor" : "Add Contractor"}
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
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredContractors.length} contractors
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contractor Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-hard-hat" className="w-5 h-5" />
            Contractor List
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
                  <TableHead className="w-[150px]">Contractor Company</TableHead>
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
                {filteredContractors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={19} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-hard-hat" className="w-12 h-12 text-gray-300" />
                        <p>No contractors found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContractors.map((contractor) => (
                    <TableRow key={contractor.id}>
                      <TableCell className="whitespace-nowrap">{contractor.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{contractor.contractorCompanyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.contractorCompanyAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.country}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.states}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.timeZone}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.currency}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.pfNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.tanNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.panNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.esiNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.linNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.gstNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.contactNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.emailAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{contractor.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(contractor)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(contractor.id)}
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
