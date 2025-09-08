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
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"

interface ServiceProvider {
  id: string
  companyName: string
  companyAddress: string
  country: string
  states: string
  gstNo: string
  contactNumber: string
  emailAddress: string
  website: string
  companyLogo: string
  createdAt: string
}

export function ServiceProviderManagement() {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null)
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    country: "",
    states: "",
    gstNo: "",
    contactNumber: "",
    emailAddress: "",
    website: "",
    companyLogo: ""
  })

  const filteredProviders = serviceProviders.filter(provider =>
    provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.country.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingProvider) {
      // Update existing provider
      setServiceProviders(prev => 
        prev.map(provider => 
          provider.id === editingProvider.id 
            ? { 
                ...provider, 
                ...formData,
                id: editingProvider.id,
                createdAt: editingProvider.createdAt
              }
            : provider
        )
      )
    } else {
      // Add new provider
      const newProvider: ServiceProvider = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setServiceProviders(prev => [...prev, newProvider])
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
      gstNo: "",
      contactNumber: "",
      emailAddress: "",
      website: "",
      companyLogo: ""
    })
    setEditingProvider(null)
  }

  const handleEdit = (provider: ServiceProvider) => {
    setFormData({
      companyName: provider.companyName,
      companyAddress: provider.companyAddress,
      country: provider.country,
      states: provider.states,
      gstNo: provider.gstNo,
      contactNumber: provider.contactNumber,
      emailAddress: provider.emailAddress,
      website: provider.website,
      companyLogo: provider.companyLogo
    })
    setEditingProvider(provider)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setServiceProviders(prev => prev.filter(provider => provider.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Service Providers</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage your service provider relationships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Service Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? "Edit Service Provider" : "Add New Service Provider"}
              </DialogTitle>
              <DialogDescription>
                {editingProvider 
                  ? "Update the service provider information below." 
                  : "Fill in the details to add a new service provider."
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Enter website URL"
                />
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingProvider ? "Update Provider" : "Add Provider"}
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
                placeholder="Search service providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredProviders.length} providers
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Providers Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:account-group" className="w-5 h-5" />
            Service Providers List
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
                  <TableHead className="w-[100px]">GST No</TableHead>
                  <TableHead className="w-[110px]">Contact</TableHead>
                  <TableHead className="w-[140px]">Email</TableHead>
                  <TableHead className="w-[80px]">Website</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-300" />
                        <p>No service providers found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium whitespace-nowrap">{provider.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.companyAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.country}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.states}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.gstNo}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.contactNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{provider.emailAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {provider.website ? (
                          <a 
                            href={provider.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            Visit
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{provider.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(provider)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(provider.id)}
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
