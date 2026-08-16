import React from 'react';
import { FeeRecord, StudentRecord, SystemSettings } from '../types';
import { Printer, Download, X, ShieldCheck, CheckCircle2, Building, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeRecord | null;
  student?: StudentRecord | null;
  settings: SystemSettings;
}

export const FeeChallanModal: React.FC<Props> = ({ isOpen, onClose, fee, student, settings }) => {
  if (!isOpen || !fee) return null;

  const challanNo = `CHL-2026-${fee.id.replace(/\D/g, '').slice(-4) || '8839'}`;
  const issueDate = new Date().toISOString().split('T')[0];
  const dueDate = fee.dueDate || '2026-08-30';
  const currency = settings.currencySymbol || '$';
  const institution = settings.institutionName || 'Apex Institute of Technology & Management';

  const tuitionFee = Math.round(fee.totalAmount * 0.85);
  const regFee = Math.round(fee.totalAmount * 0.15);

  const generatePrintableHTML = () => {
    const copyTypes = ['BANK COPY', 'INSTITUTE COPY', 'STUDENT COPY'];

    const slipsHTML = copyTypes
      .map(
        (copyType) => `
        <div class="slip-card">
          <div class="watermark">PAID</div>
          
          <div class="slip-header">
            <div class="inst-logo">🏛️</div>
            <div class="inst-title">${institution}</div>
            <div class="inst-sub">Department of Financial Affairs &amp; Admissions</div>
            <div class="badge-row">
              <span class="copy-badge">${copyType}</span>
              <span class="challan-code">${challanNo}</span>
            </div>
          </div>

          <div class="bank-box">
            <div class="info-row"><strong>Bank:</strong> <span>Meezan Bank Ltd. (Islamic)</span></div>
            <div class="info-row"><strong>Account Title:</strong> <span>Apex Institute Tuition Fund</span></div>
            <div class="info-row"><strong>IBAN:</strong> <span class="mono-bold">PK82MEZN00019283746192</span></div>
          </div>

          <div class="student-meta">
            <div class="meta-item"><span class="meta-label">Student Name:</span> <span class="meta-val"><strong>${fee.studentName}</strong></span></div>
            <div class="meta-item"><span class="meta-label">Roll Number:</span> <span class="meta-val mono-bold">${fee.studentRollNo}</span></div>
            <div class="meta-item"><span class="meta-label">Program:</span> <span class="meta-val">${fee.course}</span></div>
            <div class="meta-item"><span class="meta-label">Issue Date:</span> <span class="meta-val">${issueDate}</span></div>
            <div class="meta-item"><span class="meta-label">Due Date:</span> <span class="meta-val due-color"><strong>${dueDate}</strong></span></div>
          </div>

          <table class="fee-table">
            <thead>
              <tr>
                <th style="text-align: left;">Particulars</th>
                <th style="text-align: right;">Amount (${currency})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tuition &amp; Lab Access</td>
                <td style="text-align: right;" class="mono">${currency}${tuitionFee}</td>
              </tr>
              <tr>
                <td>Registration &amp; Portal</td>
                <td style="text-align: right;" class="mono">${currency}${regFee}</td>
              </tr>
              <tr class="row-total">
                <td><strong>Total Program Fee</strong></td>
                <td style="text-align: right;" class="mono"><strong>${currency}${fee.totalAmount}</strong></td>
              </tr>
              <tr class="row-paid">
                <td>Paid to Date</td>
                <td style="text-align: right;" class="mono">-${currency}${fee.paidAmount}</td>
              </tr>
              <tr class="row-balance">
                <td><strong>Net Balance Due</strong></td>
                <td style="text-align: right;" class="mono"><strong class="balance-text">${currency}${fee.balance}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="status-stamp">
            <span>STATUS: <strong>${fee.status.toUpperCase()}</strong></span>
            <span class="stamp-verified">✓ Verified Online</span>
          </div>

          <div class="barcode-box">
            <div class="barcode-lines">||| | | |||| | || | ||| | |||</div>
            <div class="barcode-text">*${fee.studentRollNo}-${challanNo}*</div>
          </div>

          <div class="signatures">
            <div class="sig-col">
              <div class="sig-line"></div>
              <span>Depositor Signature</span>
            </div>
            <div class="sig-col">
              <div class="sig-line"></div>
              <span>Bank Cashier / Officer</span>
            </div>
          </div>

          <div class="notes">
            * Accepted via 1Bill, Meezan Online, Kuickpay, JazzCash &amp; Easypaisa.
          </div>
        </div>
      `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Fee Challan Voucher - ${fee.studentName} (${challanNo})</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }

            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              background: #f8fafc;
              padding: 10px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .container {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
              gap: 12px;
              width: 100%;
              max-width: 1100px;
              margin: 0 auto;
            }

            .slip-card {
              flex: 1;
              background: #ffffff;
              border: 1.5px dashed #475569;
              border-radius: 10px;
              padding: 12px;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }

            .watermark {
              position: absolute;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 52px;
              font-weight: 900;
              color: rgba(15, 23, 42, 0.04);
              pointer-events: none;
              user-select: none;
              z-index: 0;
            }

            .slip-header {
              text-align: center;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 6px;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }

            .inst-logo {
              font-size: 14px;
              margin-bottom: 2px;
            }

            .inst-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: -0.2px;
              color: #0f172a;
              line-height: 1.2;
            }

            .inst-sub {
              font-size: 9px;
              color: #475569;
              margin-top: 1px;
            }

            .badge-row {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 6px;
              margin-top: 5px;
            }

            .copy-badge {
              background: #e2e8f0;
              color: #0f172a;
              border: 1px solid #cbd5e1;
              font-size: 9px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 4px;
              text-transform: uppercase;
            }

            .challan-code {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9.5px;
              font-weight: 700;
              color: #4338ca;
            }

            .bank-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 5px 7px;
              font-size: 9px;
              margin-bottom: 7px;
              position: relative;
              z-index: 1;
            }

            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }

            .info-row:last-child {
              margin-bottom: 0;
            }

            .student-meta {
              font-size: 9.5px;
              margin-bottom: 7px;
              position: relative;
              z-index: 1;
            }

            .meta-item {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              border-bottom: 1px dotted #e2e8f0;
            }

            .meta-label {
              color: #64748b;
            }

            .meta-val {
              color: #0f172a;
              text-align: right;
            }

            .due-color {
              color: #b91c1c;
            }

            .fee-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9.5px;
              margin-bottom: 7px;
              position: relative;
              z-index: 1;
            }

            .fee-table th {
              background: #f1f5f9;
              border-top: 1px solid #cbd5e1;
              border-bottom: 1px solid #cbd5e1;
              padding: 3px 5px;
              font-weight: 700;
              color: #334155;
            }

            .fee-table td {
              padding: 3px 5px;
              border-bottom: 1px solid #f1f5f9;
            }

            .row-total {
              background: #f8fafc;
              border-top: 1px solid #94a3b8;
            }

            .row-paid {
              color: #047857;
              font-weight: 600;
            }

            .row-balance {
              background: #eef2ff;
              border-top: 1.5px solid #818cf8;
              border-bottom: 1.5px solid #818cf8;
            }

            .balance-text {
              color: #3730a3;
              font-size: 10.5px;
            }

            .status-stamp {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 3px 6px;
              border-radius: 4px;
              font-size: 8.5px;
              margin-bottom: 6px;
              position: relative;
              z-index: 1;
            }

            .stamp-verified {
              color: #059669;
              font-weight: 700;
            }

            .barcode-box {
              text-align: center;
              margin: 4px 0 6px 0;
              position: relative;
              z-index: 1;
            }

            .barcode-lines {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              letter-spacing: 3px;
              font-weight: 700;
              color: #1e293b;
              line-height: 1;
            }

            .barcode-text {
              font-family: 'JetBrains Mono', monospace;
              font-size: 8px;
              color: #64748b;
              margin-top: 1px;
            }

            .signatures {
              display: flex;
              justify-content: space-between;
              font-size: 8px;
              color: #475569;
              margin-top: 10px;
              padding-top: 4px;
              border-top: 1px solid #e2e8f0;
              position: relative;
              z-index: 1;
            }

            .sig-col {
              text-align: center;
              width: 45%;
            }

            .sig-line {
              border-bottom: 1px solid #64748b;
              margin-bottom: 2px;
              height: 12px;
            }

            .notes {
              font-size: 7px;
              color: #94a3b8;
              text-align: center;
              margin-top: 5px;
              position: relative;
              z-index: 1;
            }

            .mono {
              font-family: 'JetBrains Mono', monospace;
            }

            .mono-bold {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
            }

            @media print {
              body {
                background: #ffffff;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 100%;
                gap: 8px;
              }
              .slip-card {
                box-shadow: none;
                border: 1.5px dashed #000;
              }
              @page {
                size: landscape;
                margin: 5mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${slipsHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const html = generatePrintableHTML();
    const printWindow = window.open('', '_blank', 'width=1150,height=750');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownloadHTML = () => {
    const html = generatePrintableHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fee_Challan_${fee.studentRollNo}_${challanNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderSlipPreview = (copyType: 'BANK COPY' | 'INSTITUTE COPY' | 'STUDENT COPY') => (
    <div className="bg-white text-slate-900 border-2 border-dashed border-slate-400 rounded-2xl p-4 sm:p-4 flex flex-col justify-between shadow-sm relative overflow-hidden text-left">
      {/* Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-extrabold text-5xl rotate-[-30deg]">
        PAID
      </div>

      <div>
        {/* Slip Header */}
        <div className="text-center border-b-2 border-slate-900 pb-2 mb-2">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <h4 className="font-extrabold text-[11px] uppercase tracking-tight text-slate-900 leading-tight">
              {institution}
            </h4>
          </div>
          <p className="text-[9.5px] text-slate-600 font-medium">Department of Financial Affairs &amp; Admissions</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider uppercase">
              {copyType}
            </span>
            <span className="text-[10px] font-mono font-bold text-indigo-700">{challanNo}</span>
          </div>
        </div>

        {/* Bank & Payment Method Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-2.5 text-[9.5px] space-y-0.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Bank Account:</span>
            <span className="font-bold text-slate-800">Meezan Bank Ltd. (Islamic)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Account Title:</span>
            <span className="font-semibold text-slate-700">Apex Institute Tuition Fund</span>
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-slate-500">IBAN:</span>
            <span className="font-bold text-indigo-700">PK82MEZN00019283746192</span>
          </div>
        </div>

        {/* Student Metadata Table */}
        <div className="space-y-1 text-[10px] mb-2.5">
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span className="text-slate-500">Student:</span>
            <span className="font-bold text-slate-900 text-right">{fee.studentName}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-100 font-mono">
            <span className="text-slate-500 font-sans">Roll No:</span>
            <span className="font-bold text-indigo-900">{fee.studentRollNo}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span className="text-slate-500">Program:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[130px]">{fee.course}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span className="text-slate-500">Issue Date:</span>
            <span className="font-mono text-slate-700">{issueDate}</span>
          </div>
          <div className="flex justify-between py-0.5 border-b border-slate-100">
            <span className="text-rose-600 font-semibold">Due Date:</span>
            <span className="font-mono font-bold text-rose-700">{dueDate}</span>
          </div>
        </div>

        {/* Fee Line Items Table */}
        <table className="w-full border-collapse text-[10px] mb-2.5">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-y border-slate-200">
              <th className="py-1 px-1.5 text-left font-bold">Particulars</th>
              <th className="py-1 px-1.5 text-right font-bold">Amount ({currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[9.5px]">
            <tr>
              <td className="py-1 px-1.5 font-sans text-slate-700">Tuition &amp; Lab Access</td>
              <td className="py-1 px-1.5 text-right text-slate-900 font-semibold">{currency}{tuitionFee}</td>
            </tr>
            <tr>
              <td className="py-1 px-1.5 font-sans text-slate-700">Registration &amp; Portal</td>
              <td className="py-1 px-1.5 text-right text-slate-900 font-semibold">{currency}{regFee}</td>
            </tr>
            <tr className="bg-slate-50 font-bold border-t border-slate-300">
              <td className="py-1 px-1.5 font-sans text-slate-900">Total Program Fee</td>
              <td className="py-1 px-1.5 text-right text-slate-900">{currency}{fee.totalAmount}</td>
            </tr>
            <tr className="text-emerald-700 font-semibold">
              <td className="py-1 px-1.5 font-sans">Paid to Date</td>
              <td className="py-1 px-1.5 text-right">-{currency}{fee.paidAmount}</td>
            </tr>
            <tr className="bg-indigo-50/90 font-extrabold text-indigo-950 border-t-2 border-indigo-200">
              <td className="py-1.5 px-1.5 font-sans">Net Balance Due</td>
              <td className="py-1.5 px-1.5 text-right text-xs text-indigo-700">{currency}{fee.balance}</td>
            </tr>
          </tbody>
        </table>

        {/* Status Stamp */}
        <div className="flex items-center justify-between mb-2 px-2 py-1 bg-slate-50 rounded border border-slate-200 text-[9px]">
          <span className="text-slate-600 uppercase font-bold">Ledger: {fee.status.toUpperCase()}</span>
          <span className="text-emerald-700 font-bold">✓ Verified</span>
        </div>

        {/* Barcode */}
        <div className="text-center my-1.5">
          <div className="font-mono text-xs tracking-[4px] font-bold text-slate-800">
            ||| | | |||| | || | ||| | |||
          </div>
          <p className="font-mono text-[8.5px] text-slate-400">*{fee.studentRollNo}-{challanNo}*</p>
        </div>
      </div>

      {/* Footer & Signatures */}
      <div>
        <div className="pt-2 mt-1 border-t border-slate-200 flex justify-between items-end text-[8.5px] text-slate-600">
          <div className="text-center w-5/12">
            <div className="border-b border-slate-400 mb-1" />
            <span>Depositor Signature</span>
          </div>
          <div className="text-center w-5/12">
            <div className="border-b border-slate-400 mb-1" />
            <span>Bank Cashier</span>
          </div>
        </div>
        <p className="text-[7.5px] text-slate-400 text-center mt-1.5">
          * Valid across online 1Bill, Meezan, Easypaisa &amp; JazzCash channels.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Official Tuition Fee Challan / Voucher
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {challanNo} • Student: {fee.studentName} ({fee.studentRollNo})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHTML}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
              title="Download HTML Voucher File"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Save Voucher</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 3-Part Challan (1 Page)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Column Preview */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {renderSlipPreview('BANK COPY')}
            {renderSlipPreview('INSTITUTE COPY')}
            {renderSlipPreview('STUDENT COPY')}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 px-6 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard Landscape 3-Part Slip (Bank / Institute / Student)
          </span>
          <span className="font-mono text-slate-500">
            Auto-fit single landscape sheet (A4 / Letter)
          </span>
        </div>
      </div>
    </div>
  );
};
