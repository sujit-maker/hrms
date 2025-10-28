"use client"

import { useState, useEffect, useRef } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Icon } from "@iconify/react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"

interface Company {
  id: number
  serviceProviderID?: number
  companyName?: string
  address?: string
  country?: string
  state?: string
  timeZone?: string
  currency?: string
  pfNo?: string
  tanNo?: string
  panNo?: string
  esiNo?: string
  linNo?: string
  gstNo?: string
  shopRegNo?: string
  financialYearStart?: string
  contactNo?: string
  emailAdd?: string
  companyLogoUrl?: string
  SignatureUrl?: string
  createdAt?: string
}

interface ServiceProvider {
  id: number
  companyName: string
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewCompany, setViewCompany] = useState<Company | null>(null)
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)

  interface CompanyFormData extends Partial<Company> {
    autocompleteName?: string
  }

  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    address: "",
    country: "",
    state: "",
    timeZone: "",
    currency: "",
    pfNo: "",
    tanNo: "",
    panNo: "",
    esiNo: "",
    linNo: "",
    gstNo: "",
    shopRegNo: "",
    financialYearStart: "",
    contactNo: "",
    emailAdd: "",
    autocompleteName: "",
  })

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch companies
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
  const res = await fetch("http://192.168.29.225:8000/company");
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json.data ?? []);
  setCompanies(list);
};


  // Fetch service providers for autocomplete
  const fetchServiceProviders = async (query: string) => {
    try {
      const res = await fetch("http://192.168.29.225:8000/service-provider")
      const data = await res.json()
      const filtered = data.filter((sp: ServiceProvider) =>
        sp.companyName.toLowerCase().includes(query.toLowerCase())
      )
      setServiceProviders(filtered)
    } catch (error) {
      console.error("Error fetching service providers:", error)
    }
  }

  useEffect(() => {
    if (formData.companyName && formData.companyName.length > 1) {
      fetchServiceProviders(formData.companyName)
    }
  }, [formData.companyName])


  // add once near your helpers/constants
  const UPLOAD_URL = "http://192.168.29.225:8000/files/upload";

  async function uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(UPLOAD_URL, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const raw = await res.json();
    // try common shapes: {url}, {data:{url}}, {location}
    return raw?.url || raw?.data?.url || raw?.location || "";
  }

  // Submit form
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1) upload files first (if provided)
      let companyLogoUrl = formData.companyLogoUrl || "";
      let SignatureUrl = formData.SignatureUrl || "";

      if (logoFile) {
        companyLogoUrl = await uploadImage(logoFile);
      }
      if (signatureFile) {
        SignatureUrl = await uploadImage(signatureFile);
      }

      // 2) choose companyName: manual first, autocomplete fallback
      const { autocompleteName, id, ...formDataWithoutAutocomplete } = formData;
      // Remove any nested objects that shouldn't be sent to backend
      const { serviceProvider, ...cleanFormData } = formDataWithoutAutocomplete as any;
      const finalData = {
  ...cleanFormData,
  companyName: formData.companyName || formData.autocompleteName || "",
  serviceProviderID: formData.serviceProviderID || undefined,
  companyLogoUrl: companyLogoUrl || undefined,
  SignatureUrl: SignatureUrl || undefined,
};


      // 3) send JSON payload to your API
      const res = editingCompany
        ? await fetch(`http://192.168.29.225:8000/company/${editingCompany.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        })
        : await fetch("http://192.168.29.225:8000/company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalData),
        });

      if (!res.ok) throw new Error(await res.text());

      await fetchCompanies();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      // optionally surface to UI:
      // setError(err instanceof Error ? err.message : "Save failed");
    }
  };



  const handleEdit = (company: Company & { serviceProvider?: ServiceProvider }) => {
  setFormData({
    ...company,
    serviceProviderID: company.serviceProviderID,
    autocompleteName: company.serviceProvider?.companyName || "",
  })
  setEditingCompany(company)
  setIsDialogOpen(true)
}


  const handleView = (company: Company) => {
    setViewCompany(company)
    setIsViewDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this company?")) {
      try {
        await fetch(`http://192.168.29.225:8000/company/${id}`, { method: "DELETE" })
        await fetchCompanies()
      } catch (error) {
        console.error("Error deleting company:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      address: "",
      country: "",
      state: "",
      timeZone: "",
      currency: "",
      pfNo: "",
      tanNo: "",
      panNo: "",
      esiNo: "",
      linNo: "",
      gstNo: "",
      shopRegNo: "",
      financialYearStart: "",
      contactNo: "",
      emailAdd: "",
    })
    setLogoFile(null)
    setSignatureFile(null)
    setEditingCompany(null)
  }

  const filteredCompanies = companies.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.emailAdd?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close autocomplete on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setServiceProviders([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage registered companies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" /> Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
              <DialogDescription>
                {editingCompany ? "Update company details below." : "Fill in details to add a new company."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name with Service Provider Autocomplete */}
              <div ref={wrapperRef} className="space-y-2 relative">
                <Label>Service Provider *</Label>
                <Input
                  value={formData.autocompleteName || ""} // separate state for autocomplete input
                  onChange={(e) => {
                    const val = e.target.value
                    setFormData((p) => ({ ...p, autocompleteName: val }))
                    if (val.length > 1) fetchServiceProviders(val)
                    else setServiceProviders([])
                  }}
                  placeholder="Start typing service provider..."
                  autoComplete="off"
                />
                {serviceProviders.length > 0 && (
                  <div className="absolute z-10 bg-white border rounded w-full shadow max-h-40 overflow-y-auto">
                    {serviceProviders.map((sp) => (
                      <div
                        key={sp.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()} // prevent blur
                        onClick={() => {
                          // On single click, set serviceProviderID and autocompleteName
                          setFormData((p) => ({
                            ...p,
                            serviceProviderID: sp.id,
                            autocompleteName: sp.companyName,
                          }))
                          setServiceProviders([])
                        }}
                      >
                        {sp.companyName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Company Name (Manual / Override)</Label>
                <Input
                  value={formData.companyName || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                  placeholder="Enter company name manually"
                />
              </div>


              {/* Rest of the form */}
              <div className="space-y-2">
                <Label>Company Address</Label>
                <Textarea
                  value={formData.address || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={formData.country || ""} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={formData.state || ""} onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Input value={formData.timeZone || ""} onChange={(e) => setFormData((p) => ({ ...p, timeZone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input value={formData.currency || ""} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>PF No</Label><Input value={formData.pfNo || ""} onChange={(e) => setFormData((p) => ({ ...p, pfNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>TAN No</Label><Input value={formData.tanNo || ""} onChange={(e) => setFormData((p) => ({ ...p, tanNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>PAN No</Label><Input value={formData.panNo || ""} onChange={(e) => setFormData((p) => ({ ...p, panNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>ESI No</Label><Input value={formData.esiNo || ""} onChange={(e) => setFormData((p) => ({ ...p, esiNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>LIN No</Label><Input value={formData.linNo || ""} onChange={(e) => setFormData((p) => ({ ...p, linNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>GST No</Label><Input value={formData.gstNo || ""} onChange={(e) => setFormData((p) => ({ ...p, gstNo: e.target.value }))} /></div>
              </div>

              <div className="space-y-2">
                <Label>Shop Registration Certificate No</Label>
                <Input value={formData.shopRegNo || ""} onChange={(e) => setFormData((p) => ({ ...p, shopRegNo: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Financial Year Start</Label>
                <select
                  className="w-full rounded-md border px-3 py-2"
                  value={formData.financialYearStart || ""}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, financialYearStart: e.target.value }))
                  }
                >
                  <option value="">-- Select Start Date --</option>
                  <option value="1st Jan">1st Jan</option>
                  <option value="1st April">1st April</option>
                </select>
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input value={formData.contactNo || ""} onChange={(e) => setFormData((p) => ({ ...p, contactNo: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input type="email" value={formData.emailAdd || ""} onChange={(e) => setFormData((p) => ({ ...p, emailAdd: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Signature Upload</Label>
                <Input type="file" accept="image/*" onChange={(e) => setSignatureFile(e.target.files?.[0] || null)} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCompany ? "Update Company" : "Add Company"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>All information is read-only.</DialogDescription>
          </DialogHeader>
          {viewCompany && (
            <div className="space-y-3">
              <p><strong>Name:</strong> {viewCompany.companyName}</p>
              <p><strong>Address:</strong> {viewCompany.address}</p>
              <p><strong>Country:</strong> {viewCompany.country}</p>
              <p><strong>State:</strong> {viewCompany.state}</p>
              <p><strong>GST No:</strong> {viewCompany.gstNo}</p>
              <p><strong>Contact:</strong> {viewCompany.contactNo}</p>
              <p><strong>Email:</strong> {viewCompany.emailAdd}</p>
              <p><strong>Currency:</strong> {viewCompany.currency}</p>
              <p><strong>TimeZone:</strong> {viewCompany.timeZone}</p>
              <p><strong>PF:</strong> {viewCompany.pfNo}</p>
              <p><strong>TAN:</strong> {viewCompany.tanNo}</p>
           <p><strong>PAN:</strong> {viewCompany.panNo}</p>
              <p><strong>ESI:</strong> {viewCompany.esiNo}</p>
              <p><strong>LIN:</strong> {viewCompany.linNo}</p>
              <p><strong>Shop Reg:</strong> {viewCompany.shopRegNo}</p>
              <p><strong>FY Start:</strong> {viewCompany.financialYearStart}</p>
              {viewCompany.companyLogoUrl && <img src={viewCompany.companyLogoUrl} alt="Company Logo" className="w-24 h-24 object-contain" />}
              {viewCompany.SignatureUrl && <img src={viewCompany.SignatureUrl} alt="Signature" className="w-24 h-24 object-contain" />}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)} variant="outline">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search & Table */}
      <Card>
        <CardContent className="p-6 flex items-center space-x-4">
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
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:office-building" className="w-5 h-5" /> Company List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>GST</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Icon icon="mdi:account-search" className="w-12 h-12 text-gray-300" />
                      <p>No companies found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.companyName}</TableCell>
                    <TableCell>{company.country}</TableCell>
                    <TableCell>{company.state}</TableCell>
                    <TableCell>{company.emailAdd}</TableCell>
                    <TableCell>{company.contactNo}</TableCell>
                    <TableCell>{company.gstNo}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(company)} className="h-7 w-7 p-0">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(company)} className="h-7 w-7 p-0">
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
        </CardContent>
      </Card>
    </div>
  )
}