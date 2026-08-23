import { jsPDF } from 'jspdf';
import { GymConfig } from '../types';

export interface FormattedReceipt {
  receiptNumber: string;
  date: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberId: string;
  planName: string;
  duration?: string;
  startDate?: string;
  expiryDate?: string;
  paymentMethod: string;
  transactionId: string;
  baseAmount: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
}

/**
 * Generates and downloads a clean, professional PDF receipt using jsPDF.
 */
export const downloadReceiptAsPDF = (
  receipt: FormattedReceipt,
  config: GymConfig
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = config.currencySymbol || 'INR ';
  const gymName = (config.name || 'ABSOLUTE GYM').toUpperCase();
  const gymTagline = config.tagline || 'PREMIUM FITNESS & STRENGTH CLUB';
  const gymAddress = config.address || '108 Olympic Way, Fitness Plaza, Level 2';
  const gymPhone = config.phone || '+91 98765 43210';
  const gymEmail = config.email || 'memberships@absolutegym.fit';

  // --- TOP ACCENT BAR ---
  doc.setFillColor(20, 20, 20); // Dark neutral
  doc.rect(0, 0, 210, 10, 'F');
  doc.setFillColor(245, 158, 11); // Amber / Gold accent bar
  doc.rect(0, 8, 210, 2, 'F');

  // --- HEADER SECTION ---
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(gymName, 14, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 100, 20);
  doc.text(gymTagline, 14, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`${gymAddress} | Tel: ${gymPhone}`, 14, 34);
  doc.text(`GSTIN / Reg: 27AABCA1234F1Z8 | Email: ${gymEmail}`, 14, 38);

  // --- INVOICE BADGE & META (RIGHT ALIGNED) ---
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(140, 16, 56, 7, 1.5, 1.5, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('OFFICIAL TAX INVOICE', 168, 20.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  doc.text('Receipt No:', 140, 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.receiptNumber, 196, 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Issue Date:', 140, 33);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.date, 196, 33, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Status:', 140, 38);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 140, 70); // Green
  doc.text('PAID & ACTIVE', 196, 38, { align: 'right' });

  // Divider Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, 44, 196, 44);

  // --- BILLED TO & MEMBERSHIP VALIDITY (TWO COLUMNS) ---
  // Left Box: Member Info
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, 48, 88, 38, 2, 2, 'F');
  doc.setDrawColor(225, 230, 235);
  doc.roundedRect(14, 48, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('BILLED TO (MEMBER INFORMATION):', 18, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.memberName, 18, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Email: ${receipt.memberEmail || 'N/A'}`, 18, 66);
  doc.text(`Phone: ${receipt.memberPhone || 'N/A'}`, 18, 71);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 100, 10);
  doc.text(`Member ID: ${receipt.memberId}`, 18, 77);

  // Right Box: Subscription Validity Info
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(108, 48, 88, 38, 2, 2, 'F');
  doc.setDrawColor(225, 230, 235);
  doc.roundedRect(108, 48, 88, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('MEMBERSHIP VALIDITY & ACCESS:', 112, 54);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.planName, 112, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Duration: ${receipt.duration || '1 Month Access'}`, 112, 66);
  doc.text(`Start Date: ${receipt.startDate || receipt.date}`, 112, 71);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 140, 70);
  doc.text(`Valid Until: ${receipt.expiryDate || 'Active'}`, 112, 77);

  // --- ITEMIZATION TABLE ---
  const tableStartY = 92;
  doc.setFillColor(20, 20, 20);
  doc.rect(14, tableStartY, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('PACKAGE & SERVICE DESCRIPTION', 18, tableStartY + 5.5);
  doc.text('DURATION', 115, tableStartY + 5.5, { align: 'center' });
  doc.text('TAX (18% GST)', 150, tableStartY + 5.5, { align: 'right' });
  doc.text('TOTAL AMOUNT', 192, tableStartY + 5.5, { align: 'right' });

  // Table Row 1
  const rowY = tableStartY + 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, rowY, 182, 18, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.line(14, rowY + 18, 196, rowY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.planName, 18, rowY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Includes Gym Floor Access, Cardio Deck, Steam/Sauna & Digital Keycard Pass', 18, rowY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(receipt.duration || '1 Month', 115, rowY + 8, { align: 'center' });
  doc.text(`${currency}${receipt.taxAmount.toLocaleString('en-IN')}`, 150, rowY + 8, { align: 'right' });
  doc.text(`${currency}${receipt.totalAmount.toLocaleString('en-IN')}`, 192, rowY + 8, { align: 'right' });

  // --- PAYMENT VERIFICATION & TOTALS ---
  const paymentSectionY = rowY + 24;

  // Left side: Payment Verification Card
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(14, paymentSectionY, 96, 42, 2, 2, 'F');
  doc.setDrawColor(225, 230, 235);
  doc.roundedRect(14, paymentSectionY, 96, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('PAYMENT VERIFICATION AUDIT:', 18, paymentSectionY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('Payment Mode:', 18, paymentSectionY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.paymentMethod, 50, paymentSectionY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('Txn Reference ID:', 18, paymentSectionY + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(20, 20, 20);
  doc.text(receipt.transactionId, 50, paymentSectionY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('Gateway Status:', 18, paymentSectionY + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 140, 70);
  doc.text('CONFIRMED / SETTLED (RBI Tokenized)', 50, paymentSectionY + 27);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('* Computer-generated valid electronic receipt. No physical stamp required.', 18, paymentSectionY + 36);

  // Right side: Totals Calculation
  doc.setFillColor(245, 246, 248);
  doc.roundedRect(115, paymentSectionY, 81, 42, 2, 2, 'F');
  doc.setDrawColor(220, 225, 230);
  doc.roundedRect(115, paymentSectionY, 81, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);

  doc.text('Base Membership Fee:', 119, paymentSectionY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`${currency}${receipt.baseAmount.toLocaleString('en-IN')}`, 192, paymentSectionY + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('Goods & Services Tax (18%):', 119, paymentSectionY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(`${currency}${receipt.taxAmount.toLocaleString('en-IN')}`, 192, paymentSectionY + 16, { align: 'right' });

  if (receipt.discountAmount && receipt.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 140, 70);
    doc.text('Special Promo Discount:', 119, paymentSectionY + 23);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${currency}${receipt.discountAmount.toLocaleString('en-IN')}`, 192, paymentSectionY + 23, { align: 'right' });
  }

  // Divider
  doc.setDrawColor(180, 180, 180);
  doc.line(119, paymentSectionY + 28, 192, paymentSectionY + 28);

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('GRAND TOTAL PAID:', 119, paymentSectionY + 36);

  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(`${currency}${receipt.totalAmount.toLocaleString('en-IN')}`, 192, paymentSectionY + 36, { align: 'right' });

  // --- FACILITY TERMS & CODE OF CONDUCT ---
  const termsY = paymentSectionY + 48;
  doc.setFillColor(253, 248, 240); // Soft amber tint
  doc.roundedRect(14, termsY, 182, 28, 2, 2, 'F');
  doc.setDrawColor(245, 215, 170);
  doc.roundedRect(14, termsY, 182, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(160, 95, 10);
  doc.text('MEMBERSHIP TERMS & FACILITY ACCESS GUIDELINES:', 18, termsY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('1. Membership is non-transferable and includes complete access to gym floor, locker rooms & wet areas.', 18, termsY + 11);
  doc.text('2. Please show this receipt or your Digital Member Pass barcode at the front-desk turnstile upon every visit.', 18, termsY + 16);
  doc.text('3. Proper athletic footwear & workout attire are mandatory on all weight training and cardio decks.', 18, termsY + 21);

  // --- FOOTER & BARCODE STRIP ---
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.4);
  doc.line(14, 272, 196, 272);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`${gymName} • Fitness Management Systems`, 14, 278);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`||||| | ||||| |||| | |||||| |||| ${receipt.memberId} |||||`, 196, 278, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('Secure Electronic Payment Receipt • RBI & ISO 27001 Certified Gateway', 105, 284, { align: 'center' });

  // Save / Trigger Download
  const filename = `${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_Receipt_${receipt.receiptNumber}.pdf`;
  doc.save(filename);
};

/**
 * Generates and downloads a clean, structured plain text (.txt) receipt.
 */
export const downloadReceiptAsText = (
  receipt: FormattedReceipt,
  config: GymConfig
): void => {
  const currency = config.currencySymbol || 'INR ';
  const divider = '='.repeat(60);
  const thinDivider = '-'.repeat(60);

  const textContent = `
${divider}
             ${(config.name || 'ABSOLUTE GYM FITNESS CLUB').toUpperCase()}
        ${config.tagline || 'PREMIUM FITNESS & STRENGTH CLUB'}
${divider}
Address: ${config.address || '108 Olympic Way, Level 2'}
Contact: ${config.phone || '+91 98765 43210'} | Email: ${config.email || 'memberships@absolutegym.fit'}
GSTIN / Reg: 27AABCA1234F1Z8
${divider}
                OFFICIAL PAYMENT RECEIPT & INVOICE
${divider}
Receipt No     : ${receipt.receiptNumber}
Issue Date     : ${receipt.date}
Payment Status : PAID & CONFIRMED (ACTIVE)
${thinDivider}
MEMBER DETAILS:
Member Name    : ${receipt.memberName}
Member ID      : ${receipt.memberId}
Contact Phone  : ${receipt.memberPhone || 'N/A'}
Contact Email  : ${receipt.memberEmail || 'N/A'}
${thinDivider}
MEMBERSHIP SUBSCRIPTION:
Plan Tier      : ${receipt.planName}
Duration       : ${receipt.duration || '1 Month (30 Days)'}
Start Date     : ${receipt.startDate || receipt.date}
Valid Until    : ${receipt.expiryDate || 'Active'}
Access Scope   : All Gym Zones, Cardio, Steam & Digital Pass
${thinDivider}
PAYMENT TRANSACTION AUDIT:
Payment Method : ${receipt.paymentMethod}
Txn Ref ID     : ${receipt.transactionId}
Security Audit : RBI Tokenized / 256-Bit Bank Encrypted
${thinDivider}
FINANCIAL BREAKDOWN:
Base Membership Fee : ${currency}${receipt.baseAmount.toLocaleString('en-IN')}
GST / Taxes (18%)   : ${currency}${receipt.taxAmount.toLocaleString('en-IN')}
${receipt.discountAmount && receipt.discountAmount > 0 ? `Discount Applied    : -${currency}${receipt.discountAmount.toLocaleString('en-IN')}\n` : ''}${divider}
TOTAL AMOUNT PAID   : ${currency}${receipt.totalAmount.toLocaleString('en-IN')}
${divider}
FACILITY GUIDELINES:
1. Present this digital/printed receipt or your Member ID (${receipt.memberId})
   at the front desk turnstiles for instant facility access.
2. Proper gym shoes and clean athletic attire are required at all times.
3. Membership is non-transferable.

* This is a computer-generated official receipt.
* Thank you for choosing ${(config.name || 'Absolute Gym')}!
${divider}
`.trim();

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${config.name.replace(/[^a-zA-Z0-9]/g, '_')}_Receipt_${receipt.receiptNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
