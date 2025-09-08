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

interface Branch {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  branchAddress: string
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
  bankName: string
  bankBranch: string
  contactNumber: string
  emailAddress: string
  createdAt: string
}

export function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    branchAddress: "",
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
    bankName: "",
    bankBranch: "",
    contactNumber: "",
    emailAddress: ""
  })

  const filteredBranches = branches.filter(branch =>
    branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBranch) {
      // Update existing branch
      setBranches(prev => 
        prev.map(branch => 
          branch.id === editingBranch.id 
            ? { 
                ...branch, 
                ...formData,
                id: editingBranch.id,
                createdAt: editingBranch.createdAt
              }
            : branch
        )
      )
    } else {
      // Add new branch
      const newBranch: Branch = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setBranches(prev => [...prev, newBranch])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      branchAddress: "",
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
      bankName: "",
      bankBranch: "",
      contactNumber: "",
      emailAddress: ""
    })
    setEditingBranch(null)
  }

  const handleEdit = (branch: Branch) => {
    setFormData({
      serviceProvider: branch.serviceProvider,
      companyName: branch.companyName,
      branchName: branch.branchName,
      branchAddress: branch.branchAddress,
      country: branch.country,
      states: branch.states,
      timeZone: branch.timeZone,
      currency: branch.currency,
      pfNo: branch.pfNo,
      tanNo: branch.tanNo,
      panNo: branch.panNo,
      esiNo: branch.esiNo,
      linNo: branch.linNo,
      gstNo: branch.gstNo,
      shopRegistrationCertificateNo: branch.shopRegistrationCertificateNo,
      bankName: branch.bankName,
      bankBranch: branch.bankBranch,
      contactNumber: branch.contactNumber,
      emailAddress: branch.emailAddress
    })
    setEditingBranch(branch)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setBranches(prev => prev.filter(branch => branch.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your branch information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Edit Branch" : "Add New Branch"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch 
                  ? "Update the branch information below." 
                  : "Fill in the details to add a new branch."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceProvider">Service Provider *</Label>
                <Input
                  id="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceProvider: e.target.value }))}
                  placeholder="Select service provider"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Select company"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name *</Label>
                <Input
                  id="branchName"
                  value={formData.branchName}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchName: e.target.value }))}
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchAddress">Branch Address *</Label>
                <Textarea
                  id="branchAddress"
                  value={formData.branchAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchAddress: e.target.value }))}
                  placeholder="Enter branch address"
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
                    placeholder="Select country"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="states">States *</Label>
                  <Input
                    id="states"
                    value={formData.states}
                    onChange={(e) => setFormData(prev => ({ ...prev, states: e.target.value }))}
                    placeholder="Select state"
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
                    placeholder="Select time zone"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="Select currency"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Select bank"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankBranch">Bank Branch *</Label>
                  <Input
                    id="bankBranch"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                    placeholder="Select branch"
                    required
                  />
                </div>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingBranch ? "Update Branch" : "Add Branch"}
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
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredBranches.length} branches
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Branch Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building-multiple" className="w-5 h-5" />
            Branch List
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
                  <TableHead className="w-[100px]">Bank Name</TableHead>
                  <TableHead className="w-[100px]">Bank Branch</TableHead>
                  <TableHead className="w-[100px]">Contact</TableHead>
                  <TableHead className="w-[140px]">Email</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:office-building-multiple-outline" className="w-12 h-12 text-gray-300" />
                        <p>No branches found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium whitespace-nowrap">{branch.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.branchName}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.branchAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.country}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.states}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.timeZone}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.currency}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.pfNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.tanNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.panNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.esiNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.linNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.gstNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.bankName}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.bankBranch}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.contactNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.emailAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{branch.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(branch)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(branch.id)}
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
