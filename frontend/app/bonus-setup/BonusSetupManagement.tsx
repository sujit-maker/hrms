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

interface BonusSetup {
  id: string
  serviceProvider: string
  companyName: string
  branchName: string
  bonusName: string
  description: string
  bonusBasedOn: "Basic" | "Gross"
  percentageOfBonus: number
  createdAt: string
}

export function BonusSetupManagement() {
  const [bonuses, setBonuses] = useState<BonusSetup[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBonus, setEditingBonus] = useState<BonusSetup | null>(null)
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    bonusName: "",
    description: "",
    bonusBasedOn: "Basic" as "Basic" | "Gross",
    percentageOfBonus: 0
  })

  const filteredBonuses = bonuses.filter(bonus =>
    bonus.bonusName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bonus.serviceProvider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bonus.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bonus.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBonus) {
      setBonuses(prev => 
        prev.map(bonus => 
          bonus.id === editingBonus.id 
            ? { ...bonus, ...formData, id: editingBonus.id, createdAt: editingBonus.createdAt }
            : bonus
        )
      )
    } else {
      const newBonus: BonusSetup = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setBonuses(prev => [...prev, newBonus])
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      bonusName: "",
      description: "",
      bonusBasedOn: "Basic",
      percentageOfBonus: 0
    })
    setEditingBonus(null)
  }

  const handleEdit = (bonus: BonusSetup) => {
    setFormData({
      serviceProvider: bonus.serviceProvider,
      companyName: bonus.companyName,
      branchName: bonus.branchName,
      bonusName: bonus.bonusName,
      description: bonus.description,
      bonusBasedOn: bonus.bonusBasedOn,
      percentageOfBonus: bonus.percentageOfBonus
    })
    setEditingBonus(bonus)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setBonuses(prev => prev.filter(bonus => bonus.id !== id))
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Bonus Setup</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage bonus configurations and calculations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2">
              <Plus className="w-4 h-4 mr-1" />
              Add Bonus Setup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBonus ? "Edit Bonus Setup" : "Add New Bonus Setup"}
              </DialogTitle>
              <DialogDescription>
                {editingBonus 
                  ? "Update the bonus setup information below." 
                  : "Fill in the details to add a new bonus setup."
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
                <Label htmlFor="bonusName">Bonus Name *</Label>
                <Input
                  id="bonusName"
                  value={formData.bonusName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bonusName: e.target.value }))}
                  placeholder="Enter bonus name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter bonus description"
                  rows={3}
                  required
                />
              </div>

              {/* Bonus Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bonus Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bonusBasedOn">Bonus Based On *</Label>
                    <select
                      id="bonusBasedOn"
                      value={formData.bonusBasedOn}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonusBasedOn: e.target.value as "Basic" | "Gross" }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Basic">Basic</option>
                      <option value="Gross">Gross</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Whether bonus is calculated on Basic salary or Gross salary
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentageOfBonus">Percentage of Bonus *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="percentageOfBonus"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.percentageOfBonus}
                        onChange={(e) => setFormData(prev => ({ ...prev, percentageOfBonus: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Percentage of {formData.bonusBasedOn.toLowerCase()} salary for bonus
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingBonus ? "Update Bonus Setup" : "Add Bonus Setup"}
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
                placeholder="Search bonus setups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredBonuses.length} bonuses
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bonus Setup Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:trophy" className="w-5 h-5" />
            Bonus Setup List
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
                  <TableHead className="w-[150px]">Bonus Name</TableHead>
                  <TableHead className="w-[200px]">Description</TableHead>
                  <TableHead className="w-[100px]">Based On</TableHead>
                  <TableHead className="w-[100px]">Percentage</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBonuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Icon icon="mdi:trophy" className="w-12 h-12 text-gray-300" />
                        <p>No bonus setups found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell className="whitespace-nowrap">{bonus.serviceProvider}</TableCell>
                      <TableCell className="whitespace-nowrap">{bonus.companyName}</TableCell>
                      <TableCell className="whitespace-nowrap">{bonus.branchName}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{bonus.bonusName}</TableCell>
                      <TableCell className="whitespace-nowrap max-w-[200px] truncate" title={bonus.description}>
                        {bonus.description}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={bonus.bonusBasedOn === "Basic" ? "default" : "secondary"}>
                          {bonus.bonusBasedOn}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {bonus.percentageOfBonus}%
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{bonus.createdAt}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(bonus)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bonus.id)}
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
