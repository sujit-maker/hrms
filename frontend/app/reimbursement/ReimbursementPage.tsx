"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Search, Edit, Trash2, Check, X, Plus, PlusCircle, MinusCircle, Settings, Download } from "lucide-react"
import { SearchSuggestInput } from "../components/SearchSuggestInput"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface ReimbursementItem {
  id?: number
  reimbursementType: string
  amount: string
  description: string
}

interface Reimbursement {
  id: string
  serviceProviderID?: number
  companyID?: number
  branchesID?: number
  manageEmployeeID?: number
  serviceProvider?: string
  companyName?: string
  branchName?: string
  employeeName?: string
  date: string
  // Header-level fields (for backward compatibility)
  reimbursementType?: string
  amount?: string
  description?: string
  status: string
  // New approval system fields
  approvalType?: string
  salaryPeriod?: string
  voucherCode?: string
  voucherDate?: string
  items?: ReimbursementItem[]
}

interface SelectedItem {
  display: string
  value: number
  item: any
}

interface Company {
  id: number
  companyName: string
  financialYearStart: string
}

interface SalaryCycle {
  id: number
  monthStartDay: string
  companyID: number
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// ---------- Financial Year and Salary Period Logic ----------
const monthsFull = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function clampDay(d: number) {
  if (!Number.isFinite(d)) return 1;
  return Math.max(1, Math.min(28, Math.floor(d)));
}

function buildSalaryPeriodLabels(fyStart?: string | null, dayStr?: string | number | null): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const day = clampDay(Number(dayStr ?? 1));
  const fyIsJan = (fyStart ?? "").trim().toLowerCase() === "1st jan";
  const fyIsApr = (fyStart ?? "").trim().toLowerCase() === "1st april";

  const addMonths = (y: number, m: number, delta: number) => {
    const n = m + delta;
    const y2 = y + Math.floor(n / 12);
    const m2 = ((n % 12) + 12) % 12;
    return { y: y2, m: m2 };
  };

  const makeDate = (y: number, m: number, d: number) => new Date(y, m, d);
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")} ${monthsFull[d.getMonth()]} ${d.getFullYear()}`;

  if (day === 1) {
    if (fyIsJan) {
      return Array.from({ length: 12 }).map((_, i) => `${monthsFull[i]} ${currentYear}`);
    }
    const out: string[] = [];
    for (let i = 3; i <= 11; i++) out.push(`${monthsFull[i]} ${currentYear}`);
    out.push(`January ${currentYear + 1}`, `February ${currentYear + 1}`, `March ${currentYear + 1}`);
    return out;
  }

  const periods: string[] = [];

  if (fyIsJan) {
    const start0 = makeDate(currentYear - 1, 11, day);
    for (let i = 0; i < 12; i++) {
      const start = addMonths(start0.getFullYear(), start0.getMonth(), i);
      const startDate = makeDate(start.y, start.m, day);
      const end = addMonths(startDate.getFullYear(), startDate.getMonth(), 1);
      const endDate = makeDate(end.y, end.m, day - 1);
      periods.push(`${fmt(startDate)} to ${fmt(endDate)}`);
    }
    return periods;
  }

  const start0 = makeDate(currentYear, 2, day); // March
  for (let i = 0; i < 12; i++) {
    const start = addMonths(start0.getFullYear(), start0.getMonth(), i);
    const startDate = makeDate(start.y, start.m, day);
    const end = addMonths(startDate.getFullYear(), startDate.getMonth(), 1);
    const endDate = makeDate(end.y, end.m, day - 1);
    periods.push(`${fmt(startDate)} to ${fmt(endDate)}`);
  }
  return periods;
}

// PDF Generation Component
const PDFTemplate = ({ reimbursement, ref }: { reimbursement: Reimbursement, ref: any }) => {
  const totalAmount = reimbursement.items?.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0) || 0;
  
  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Employee Reimbursement Form</h1>
      </div>

      {/* Company and Employee Information */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <strong>Company Name:</strong> {reimbursement.companyName || 'N/A'}
          </div>
          <div>
            <strong>Employee Name:</strong> {reimbursement.employeeName || 'N/A'}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <strong>Service Provider:</strong> {reimbursement.serviceProvider || 'N/A'}
          </div>
          <div>
            <strong>Branch:</strong> {reimbursement.branchName || 'N/A'}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Salary Period:</strong> {reimbursement.date || 'N/A'}
          </div>
          <div>
            <strong>Approval Type:</strong> {reimbursement.approvalType || 'N/A'}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', border: '1px solid #000' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Date</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Description</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Category</th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {reimbursement.items?.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{new Date().toLocaleDateString()}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.description || 'N/A'}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>{item.reimbursementType || 'N/A'}</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{parseFloat(item.amount || "0").toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
            <td colSpan={3} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Total:</td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>₹{totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '5px' }}></div>
          <div>Employee Signature</div>
          <div style={{ fontSize: '10px', marginTop: '5px' }}>Date: {new Date().toLocaleDateString()}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderBottom: '1px solid #000', width: '200px', marginBottom: '5px' }}></div>
          <div>Approval Signature</div>
          <div style={{ fontSize: '10px', marginTop: '5px' }}>Date: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#666', marginTop: '20px' }}>
        *Don't forget to attach receipts*
      </div>
    </div>
  );
};

export function ReimbursementManagement() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Reimbursement | null>(null)
  const [settingsReimbursement, setSettingsReimbursement] = useState<Reimbursement | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [salaryCycles, setSalaryCycles] = useState<SalaryCycle[]>([])

  // Settings modal states
  const [approvalType, setApprovalType] = useState<"Salary" | "Voucher" | "">("")
  const [salaryPeriodOptions, setSalaryPeriodOptions] = useState<string[]>([])
  const [selectedSalaryPeriod, setSelectedSalaryPeriod] = useState("")
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherDate, setVoucherDate] = useState("")
  const [settingsItems, setSettingsItems] = useState<ReimbursementItem[]>([])

  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    employeeName: "",
    date: new Date().toISOString().split('T')[0], // Use current date for existing date field
    status: "Pending",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    manageEmployeeID: undefined as number | undefined,
  })

  const [items, setItems] = useState<ReimbursementItem[]>([
    { reimbursementType: "", amount: "", description: "" },
  ])

  const pdfRef = useRef<HTMLDivElement>(null);

  // ---------- PDF Generation ----------
  // ---------- PDF Generation ----------
const generatePDF = async (reimbursement: Reimbursement) => {
  const element = pdfRef.current;
  if (!element) return;

  // Create a temporary div for PDF generation
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm'; // A4 width
  tempDiv.style.padding = '15mm';
  tempDiv.style.fontFamily = "'Helvetica', 'Arial', sans-serif";
  tempDiv.style.fontSize = '12px';
  tempDiv.style.lineHeight = '1.4';
  tempDiv.style.color = '#333';
  tempDiv.style.backgroundColor = 'white';
  
  const totalAmount = reimbursement.items?.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0) || 0;
  
  tempDiv.innerHTML = `
    <div style="padding: 0;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #2c3e50; padding-bottom: 15px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0; color: #2c3e50;">Employee Reimbursement Form</h1>
        <div style="font-size: 11px; color: #666;">Official Document</div>
      </div>

      <!-- Company and Employee Information -->
      <div style="margin-bottom: 25px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Company Name:</strong><br>
            <span style="font-size: 13px;">${reimbursement.companyName || 'N/A'}</span>
          </div>
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Employee Name:</strong><br>
            <span style="font-size: 13px;">${reimbursement.employeeName || 'N/A'}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Service Provider:</strong><br>
            <span style="font-size: 13px;">${reimbursement.serviceProvider || 'N/A'}</span>
          </div>
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Branch:</strong><br>
            <span style="font-size: 13px;">${reimbursement.branchName || 'N/A'}</span>
          </div>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Salary Period:</strong><br>
            <span style="font-size: 13px;">${reimbursement.date || 'N/A'}</span>
          </div>
          <div style="flex: 1;">
            <strong style="color: #2c3e50;">Approval Type:</strong><br>
            <span style="font-size: 13px;">${reimbursement.approvalType || 'N/A'}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          Reimbursement Items
        </h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px;">
          <thead>
            <tr style="background-color: #2c3e50; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">Date</th>
              <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">Description</th>
              <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-weight: bold;">Category</th>
              <th style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-weight: bold;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${reimbursement.items?.map((item, index) => `
              <tr key="${index}" style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : ''}">
                <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">${new Date().toLocaleDateString('en-IN')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
                  <strong>${item.description || 'N/A'}</strong>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; vertical-align: top;">
                  <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${item.reimbursementType || 'N/A'}
                  </span>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; vertical-align: top; font-weight: 500;">
                  ₹${parseFloat(item.amount || "0").toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8f9fa; font-weight: bold; border-top: 2px solid #2c3e50;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-size: 12px;">
                Total Amount:
              </td>
              <td style="border: 1px solid #ddd; padding: 10px 8px; text-align: right; font-size: 12px; color: #2c3e50;">
                ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Amount in Words -->
      <div style="margin-bottom: 25px; padding: 12px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #2c3e50;">
        <strong style="color: #2c3e50; font-size: 11px;">Amount in Words:</strong><br>
        <span style="font-size: 11px; font-style: italic;">
          ${convertNumberToWords(totalAmount)} rupees only
        </span>
      </div>

      <!-- Signatures -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #333; width: 200px; margin: 0 auto 8px auto; padding-top: 40px;"></div>
          <div style="font-weight: bold; font-size: 12px;">Employee Signature</div>
          <div style="font-size: 10px; color: #666; margin-top: 4px;">
            Date: ${new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
        <div style="text-align: center; flex: 1;">
          <div style="border-bottom: 1px solid #333; width: 200px; margin: 0 auto 8px auto; padding-top: 40px;"></div>
          <div style="font-weight: bold; font-size: 12px;">Approval Signature</div>
          <div style="font-size: 10px; color: #666; margin-top: 4px;">
            Date: ${new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="text-align: center; font-size: 10px; color: #666; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
        <div style="margin-bottom: 5px;">
          <strong>Note:</strong> Please attach all original receipts with this form. Reimbursement will be processed as per company policy.
        </div>
        <div>Generated on: ${new Date().toLocaleString('en-IN')}</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: tempDiv.offsetWidth,
      height: tempDiv.scrollHeight,
      windowWidth: tempDiv.scrollWidth,
      windowHeight: tempDiv.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is too long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `Reimbursement-${reimbursement.employeeName?.replace(/\s+/g, '_') || 'Unknown'}-${reimbursement.date?.replace(/\s+/g, '_') || 'NoDate'}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    document.body.removeChild(tempDiv);
  }
};

// Add this helper function for amount in words (you can place it outside the component)
const convertNumberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  let words = '';
  
  // Handle rupees part
  let rupees = Math.floor(num);
  
  if (rupees >= 10000000) {
    words += convertNumberToWords(Math.floor(rupees / 10000000)) + ' Crore ';
    rupees %= 10000000;
  }
  
  if (rupees >= 100000) {
    words += convertNumberToWords(Math.floor(rupees / 100000)) + ' Lakh ';
    rupees %= 100000;
  }
  
  if (rupees >= 1000) {
    words += convertNumberToWords(Math.floor(rupees / 1000)) + ' Thousand ';
    rupees %= 1000;
  }
  
  if (rupees >= 100) {
    words += convertNumberToWords(Math.floor(rupees / 100)) + ' Hundred ';
    rupees %= 100;
  }
  
  if (rupees > 0) {
    if (words !== '') words += 'and ';
    
    if (rupees < 20) {
      words += ones[rupees];
    } else {
      words += tens[Math.floor(rupees / 10)];
      if (rupees % 10 > 0) {
        words += ' ' + ones[rupees % 10];
      }
    }
  }
  
  // Handle paise part
  const paise = Math.round((num - Math.floor(num)) * 100);
  if (paise > 0) {
    if (words !== '') words += ' and ';
    words += convertNumberToWords(paise) + ' Paise';
  }
  
  return words.trim().replace(/\s+/g, ' ');
};

  // ---------- APIs ----------
  async function robustGet<T = any>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json()
  }
  
  async function robustFetch(url: string, init?: RequestInit) {
    const res = await fetch(url, init)
    if (!res.ok) throw new Error(`${res.status}`)
    return res.json().catch(() => ({}))
  }

  const fetchServiceProviders = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/service-provider`)
    return data.filter((d) => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchCompanies = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/company`)
    return data.filter((d) => (d.companyName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchBranches = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/branches`)
    return data.filter((d) => (d.branchName || "").toLowerCase().includes(q.toLowerCase()))
  }
  
  const fetchEmployees = async (q: string) => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/manage-emp`)
    return data.filter((d) => {
      const name = `${d.employeeFirstName || ""} ${d.employeeLastName || ""}`.trim().toLowerCase()
      return name.includes(q.toLowerCase()) || (d.employeeID || "").toLowerCase().includes(q.toLowerCase())
    })
  }

  // Load companies and salary cycles on component mount
  useEffect(() => {
    loadCompanies()
    loadSalaryCycles()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await robustGet<Company[]>(`${BACKEND_URL}/company`)
      setCompanies(data)
    } catch (error) {
      console.error("Failed to load companies:", error)
    }
  }

  const loadSalaryCycles = async () => {
    try {
      const data = await robustGet<SalaryCycle[]>(`${BACKEND_URL}/salary-cycle`)
      setSalaryCycles(data)
    } catch (error) {
      console.error("Failed to load salary cycles:", error)
    }
  }

  // ---------- Load ----------
  useEffect(() => { loadReimbursements() }, [])
  
  const loadReimbursements = async () => {
    const data = await robustGet<any[]>(`${BACKEND_URL}/reimbursement`)
    setReimbursements(
      data.map((r) => ({
        id: String(r.id),
        serviceProviderID: r.serviceProviderID,
        companyID: r.companyID,
        branchesID: r.branchesID,
        manageEmployeeID: r.manageEmployeeID,
        serviceProvider: r.serviceProvider?.companyName || "",
        companyName: r.company?.companyName || "",
        branchName: r.branches?.branchName || "",
        employeeName: r.manageEmployee
          ? `${r.manageEmployee.employeeFirstName || ""} ${r.manageEmployee.employeeLastName || ""} (${r.manageEmployee.employeeID})`
          : "",
        date: r.date || "",
        reimbursementType: r.reimbursementType || "",
        amount: r.amount || "",
        description: r.description || "",
        status: r.status || "Pending",
        approvalType: r.approvalType || "",
        voucherCode: r.voucherCode || "",
        voucherDate: r.voucherDate || "",
        items: Array.isArray(r.items)
          ? r.items.map((it: any) => ({
            id: it.id,
            reimbursementType: it.reimbursementType || "",
            amount: it.amount || "",
            description: it.description || "",
          }))
          : [],
      }))
    )
  }

  // ---------- Salary Period Handlers ----------
  const refreshSalaryPeriodOptions = async (companyId: number) => {
    try {
      const company = companies.find(c => c.id === companyId)
      const fyStart = company?.financialYearStart || "1st April"
      
      const companySalaryCycles = salaryCycles.filter(sc => sc.companyID === companyId)
      const latestCycle = companySalaryCycles[0]
      const startDay = latestCycle?.monthStartDay || "1"

      const periodOptions = buildSalaryPeriodLabels(fyStart, startDay)
      setSalaryPeriodOptions(periodOptions)
      setSelectedSalaryPeriod(periodOptions[0] || "")

    } catch (error) {
      console.error("Failed to refresh salary period options:", error)
      setSalaryPeriodOptions([])
      setSelectedSalaryPeriod("")
    }
  }

  // ---------- Form handlers ----------
  const handleEmployeeSelect = (selected: SelectedItem) => {
    const emp = selected.item
    setFormData((p) => ({
      ...p,
      employeeName: selected.display,
      manageEmployeeID: selected.value,
    }))
  }

  const handleCompanySelect = (selected: SelectedItem) => {
    const company = selected.item
    setFormData((p) => ({
      ...p,
      companyName: selected.display,
      companyID: selected.value,
    }))
  }

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      employeeName: "",
      date: new Date().toISOString().split('T')[0],
      status: "Pending",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      manageEmployeeID: undefined,
    })
    setItems([{ reimbursementType: "", amount: "", description: "" }])
    setEditing(null)
  }

  const resetSettingsForm = () => {
    setApprovalType("")
    setSalaryPeriodOptions([])
    setSelectedSalaryPeriod("")
    setVoucherCode("")
    setVoucherDate("")
    setSettingsItems([])
    setSettingsReimbursement(null)
  }

  const addItemRow = () => setItems((p) => [...p, { reimbursementType: "", amount: "", description: "" }])
  const removeItemRow = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx))
  const updateItemRow = (idx: number, key: keyof ReimbursementItem, val: string) =>
    setItems((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)))

  const addSettingsItemRow = () => setSettingsItems((p) => [...p, { reimbursementType: "", amount: "", description: "" }])
  const removeSettingsItemRow = (idx: number) => setSettingsItems((p) => p.filter((_, i) => i !== idx))
  const updateSettingsItemRow = (idx: number, key: keyof ReimbursementItem, val: string) =>
    setSettingsItems((p) => p.map((row, i) => (i === idx ? { ...row, [key]: val } : row)))

  // ---------- CRUD actions ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
                                              
    const payload = {
      serviceProviderID: formData.serviceProviderID,
      companyID: formData.companyID,
      branchesID: formData.branchesID,
      manageEmployeeID: formData.manageEmployeeID,
      date: formData.date,
      status: formData.status,
      items: items.map(i => ({
        reimbursementType: i.reimbursementType,
        amount: i.amount,
        description: i.description,
      })),
    }

    if (editing) {
      await robustFetch(`${BACKEND_URL}/reimbursement/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      await robustFetch(`${BACKEND_URL}/reimbursement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    }

    await loadReimbursements()
    resetForm()
    setIsDialogOpen(false)
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settingsReimbursement) return
    if (!approvalType) { alert("Please select Approval Type"); return }
    if (approvalType === "Salary" && !selectedSalaryPeriod) { alert("Please select Salary Period"); return }
    if (approvalType === "Voucher" && (!voucherCode || !voucherDate)) { alert("Please fill all voucher fields"); return }

    const payload = {
      approvalType,
      date: approvalType === "Salary" ? selectedSalaryPeriod : settingsReimbursement.date,
      voucherCode: approvalType === "Voucher" ? voucherCode : null,
      voucherDate: approvalType === "Voucher" ? voucherDate : null,
      status: "Approved",
      items: settingsItems.map(i => ({
        reimbursementType: i.reimbursementType,
        amount: i.amount,
        description: i.description,
      })),
    }

    await robustFetch(`${BACKEND_URL}/reimbursement/${settingsReimbursement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    await loadReimbursements()
    resetSettingsForm()
    setIsSettingsDialogOpen(false)
  }

  const handleEdit = async (row: Reimbursement) => {
    try {
      const fresh = await robustGet<any>(`${BACKEND_URL}/reimbursement/${row.id}`)
      setFormData({
        serviceProvider: fresh.serviceProvider?.companyName || row.serviceProvider || "",
        companyName: fresh.company?.companyName || row.companyName || "",
        branchName: fresh.branches?.branchName || row.branchName || "",
        employeeName: fresh.manageEmployee
          ? `${fresh.manageEmployee.employeeFirstName || ""} ${fresh.manageEmployee.employeeLastName || ""} (${fresh.manageEmployee.employeeID})`
          : row.employeeName || "",
        date: fresh.date || row.date || "",
        status: fresh.status || row.status || "Pending",
        serviceProviderID: fresh.serviceProviderID ?? row.serviceProviderID,
        companyID: fresh.companyID ?? row.companyID,
        branchesID: fresh.branchesID ?? row.branchesID,
        manageEmployeeID: fresh.manageEmployeeID ?? row.manageEmployeeID,
      })
      setItems(
        (fresh.items || row.items || []).map((it: any) => ({
          id: it.id,
          reimbursementType: it.reimbursementType || "",
          amount: it.amount || "",
          description: it.description || "",
        }))
      )
    } catch {
      setFormData({
        serviceProvider: row.serviceProvider || "",
        companyName: row.companyName || "",
        branchName: row.branchName || "",
        employeeName: row.employeeName || "",
        date: row.date || "",
        status: row.status || "Pending",
        serviceProviderID: row.serviceProviderID,
        companyID: row.companyID,
        branchesID: row.branchesID,
        manageEmployeeID: row.manageEmployeeID,
      })
      setItems(row.items && row.items.length ? row.items : [{ reimbursementType: "", amount: "", description: "" }])
    }
    setEditing(row)
    setIsDialogOpen(true)
  }

  const handleSettings = async (row: Reimbursement) => {
    try {
      const fresh = await robustGet<any>(`${BACKEND_URL}/reimbursement/${row.id}`)
      setSettingsReimbursement(row)
      setApprovalType(fresh.approvalType || "")
      setVoucherCode(fresh.voucherCode || "")
      setVoucherDate(fresh.voucherDate || "")
      setSettingsItems(
        (fresh.items || row.items || []).map((it: any) => ({
          id: it.id,
          reimbursementType: it.reimbursementType || "",
          amount: it.amount || "",
          description: it.description || "",
        }))
      )

      // Load salary period options if company exists
      if (fresh.companyID || row.companyID) {
        await refreshSalaryPeriodOptions((fresh.companyID || row.companyID)!)
        setSelectedSalaryPeriod(fresh.salaryPeriod || "")
      }
    } catch {
      setSettingsReimbursement(row)
      setApprovalType((row.approvalType || "") as "" | "Salary" | "Voucher")
      setVoucherCode(row.voucherCode || "")
      setVoucherDate(row.voucherDate || "")
      setSettingsItems(row.items && row.items.length ? row.items : [])
      
      if (row.companyID) {
        await refreshSalaryPeriodOptions(row.companyID)
        setSelectedSalaryPeriod(row.salaryPeriod || "")
      }
    }
    setIsSettingsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, { method: "DELETE" })
    await loadReimbursements()
  }

  const handleApprove = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    })
    await loadReimbursements()
  }

  const handleReject = async (id: string) => {
    await robustFetch(`${BACKEND_URL}/reimbursement/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Rejected" }),
    })
    await loadReimbursements()
  }

  // ---------- Filter ----------
  const filtered = reimbursements.filter(
    (r) =>
      (r.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employeeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.approvalType || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ---------- UI ----------
  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Hidden PDF Template */}
      <div style={{ display: 'none' }}>
        <div ref={pdfRef} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reimbursements</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Add Reimbursement
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Reimbursement" : "Add Reimbursement"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization Selection */}
              <div className="grid grid-cols-3 gap-4">
                <SearchSuggestInput
                  label="Service Provider"
                  placeholder="Select Service Provider"
                  value={formData.serviceProvider}
                  onChange={(v) => setFormData((p) => ({ ...p, serviceProvider: v }))}
                  onSelect={(s) => setFormData((p) => ({ ...p, serviceProvider: s.display, serviceProviderID: s.value }))}
                  fetchData={fetchServiceProviders}
                  displayField="companyName"
                  valueField="id"
                  required
                />
                <SearchSuggestInput
                  label="Company"
                  placeholder="Select Company"
                  value={formData.companyName}
                  onChange={(v) => setFormData((p) => ({ ...p, companyName: v }))}
                  onSelect={handleCompanySelect}
                  fetchData={fetchCompanies}
                  displayField="companyName"
                  valueField="id"
                  required
                />
                <SearchSuggestInput
                  label="Branch"
                  placeholder="Select Branch"
                  value={formData.branchName}
                  onChange={(v) => setFormData((p) => ({ ...p, branchName: v }))}
                  onSelect={(s) => setFormData((p) => ({ ...p, branchName: s.display, branchesID: s.value }))}
                  fetchData={fetchBranches}
                  displayField="branchName"
                  valueField="id"
                  required
                />
              </div>

              {/* Employee */}
              <SearchSuggestInput
                label="Employee"
                placeholder="Select Employee"
                value={formData.employeeName}
                onChange={(v) => setFormData((p) => ({ ...p, employeeName: v }))}
                onSelect={handleEmployeeSelect}
                fetchData={async (q: string) => {
                  const data = await fetchEmployees(q)
                  return data.map((emp: any) => ({
                    ...emp,
                    display: `${emp.employeeFirstName || ""} ${emp.employeeLastName || ""} (${emp.employeeID})`,
                    value: emp.id,
                  }))
                }}
                displayField="display"
                valueField="value"
                required
              />

              {/* Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                    <PlusCircle className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </div>

                {items.length === 0 && (
                  <p className="text-sm text-gray-500">No items yet. Click "Add Item".</p>
                )}

                {items.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                    <div className="col-span-4">
                      <Label>Type</Label>
                      <Input
                        placeholder="e.g. Travel, Food"
                        value={row.reimbursementType}
                        onChange={(e) => updateItemRow(idx, "reimbursementType", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Label>Amount</Label>
                      <Input
                        type="text"
                        placeholder="₹"
                        value={row.amount}
                        onChange={(e) => updateItemRow(idx, "amount", e.target.value)}
                      />
                    </div>
                    <div className="col-span-4">
                      <Label>Description</Label>
                      <Input
                        placeholder="Short description"
                        value={row.description}
                        onChange={(e) => updateItemRow(idx, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        onClick={() => removeItemRow(idx)}
                        title="Remove"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editing ? "Update Reimbursement" : "Create Reimbursement"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approve Reimbursement</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            {/* Employee Info (Read-only) */}
            {settingsReimbursement && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Employee</Label>
                  <p className="text-sm">{settingsReimbursement.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Company</Label>
                  <p className="text-sm">{settingsReimbursement.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Branch</Label>
                  <p className="text-sm">{settingsReimbursement.branchName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service Provider</Label>
                  <p className="text-sm">{settingsReimbursement.serviceProvider}</p>
                </div>
              </div>
            )}

            {/* Approval Type */}
            <div className="space-y-2">
              <Label htmlFor="approvalType">Approval Type *</Label>
              <select
                id="approvalType"
                value={approvalType}
                onChange={(e) => setApprovalType(e.target.value as "Salary" | "Voucher")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Approval Type</option>
                <option value="Salary">Salary</option>
                <option value="Voucher">Voucher</option>
              </select>
            </div>

            {/* Salary Period (only show if Salary selected) */}
            {approvalType === "Salary" && (
              <div className="space-y-2">
                <Label htmlFor="salaryPeriod">Salary Period *</Label>
                <select
                  id="salaryPeriod"
                  value={selectedSalaryPeriod}
                  onChange={(e) => setSelectedSalaryPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Salary Period</option>
                  {salaryPeriodOptions.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Voucher Fields (only show if Voucher selected) */}
            {approvalType === "Voucher" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voucherCode">Voucher Code *</Label>
                  <Input
                    id="voucherCode"
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voucherDate">Voucher Date *</Label>
                  <Input
                    id="voucherDate"
                    type="date"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Items (Editable in settings) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSettingsItemRow}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Item
                </Button>
              </div>

              {settingsItems.length === 0 && (
                <p className="text-sm text-gray-500">No items yet. Click "Add Item".</p>
              )}

              {settingsItems.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end border p-2 rounded">
                  <div className="col-span-4">
                    <Label>Type</Label>
                    <Input
                      placeholder="e.g. Travel, Food"
                      value={row.reimbursementType}
                      onChange={(e) => updateSettingsItemRow(idx, "reimbursementType", e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Label>Amount</Label>
                    <Input
                      type="text"
                      placeholder="₹"
                      value={row.amount}
                      onChange={(e) => updateSettingsItemRow(idx, "amount", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Label>Description</Label>
                    <Input
                      placeholder="Short description"
                      value={row.description}
                      onChange={(e) => updateSettingsItemRow(idx, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeSettingsItemRow(idx)}
                      title="Remove"
                    >
                      <MinusCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Approve Reimbursement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search + Table */}
      <Card>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="w-4 h-4 mr-2 text-gray-400" />
            <Input
              placeholder="Search reimbursements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Badge variant="secondary" className="ml-3">
              {filtered.length} reimbursements
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Salary Period</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Items (Type → Amount)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.companyName}</TableCell>
                  <TableCell>{r.employeeName}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  
                  <TableCell>
                    {r.approvalType === "Salary" && r.salaryPeriod && (
                      <div className="text-sm">{r.salaryPeriod}</div>
                    )}
                    {r.approvalType === "Voucher" && r.voucherCode && (
                      <div className="text-sm">
                        <div>Code: {r.voucherCode}</div>
                        <div>Date: {r.voucherDate}</div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap">
                    {(r.items && r.items.length
                      ? r.items
                      : (r.reimbursementType || r.amount) ? [{ reimbursementType: r.reimbursementType!, amount: r.amount!, description: r.description || "" }] : []
                    ).map((it, i) => (
                      <div key={i}>
                        <span className="font-medium">{it.reimbursementType || "-"}</span>
                        {" "}→{" "}
                        <span>₹{it.amount || "0"}</span>
                        {it.description ? <span className="text-gray-500"> — {it.description}</span> : null}
                      </div>
                    ))}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        r.status === "Approved"
                          ? "bg-green-600"
                          : r.status === "Rejected"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-1">
                    {/* Download button - only show for approved reimbursements */}
                    {r.status === "Approved" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-600" 
                        onClick={() => generatePDF(r)} 
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost" onClick={() => handleSettings(r)} title="Settings">
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    {r.status === "Pending" && !r.approvalType && (
                      <>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleApprove(r.id)} title="Approve">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleReject(r.id)} title="Reject">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(r)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}