"use client";

import { Button } from '@/components/ui/button';
import { Invoice, mockClients } from '@/lib/mockData';
import { ArrowLeft, Download, Printer, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InvoicePreview() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [lineItems, setLineItems] = useState<any[] | null>(null);

  useEffect(() => {
    // Get data from sessionStorage
    const savedInvoice = typeof window !== 'undefined' 
      ? sessionStorage.getItem('previewInvoice')
      : null;
    const savedReturnTo = typeof window !== 'undefined'
      ? sessionStorage.getItem('invoiceReturnTo')
      : null;
    const savedFormData = typeof window !== 'undefined'
      ? sessionStorage.getItem('invoiceFormData')
      : null;
    const savedLineItems = typeof window !== 'undefined'
      ? sessionStorage.getItem('invoiceLineItems')
      : null;

    if (!savedInvoice) {
      router.push('/invoices');
      return;
    }

    try {
      setInvoice(JSON.parse(savedInvoice));
      setReturnTo(savedReturnTo);
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
      if (savedLineItems) {
        setLineItems(JSON.parse(savedLineItems));
      }
    } catch (error) {
      router.push('/invoices');
    }
  }, [router]);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No invoice data available</p>
          <Button onClick={() => router.push('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    window.print();
  };

  const handleSend = () => {
    alert(`Invoice ${invoice.id.toUpperCase()} will be sent to the client`);
  };

  const handleBack = () => {
    if (returnTo) {
      // If returning to create invoice, restore the form data
      if (formData) {
        sessionStorage.setItem('invoiceFormData', JSON.stringify(formData));
      }
      if (lineItems) {
        sessionStorage.setItem('invoiceLineItems', JSON.stringify(lineItems));
      }
      router.push(returnTo);
    } else {
      // Otherwise go to invoices list
      router.push('/invoices');
    }
  };

  // Get client details
  const client = invoice ? mockClients.find((c: any) => c.id === invoice.clientId) : null;
  
  // Get invoice line items
  const invoiceLineItems = lineItems || invoice?.lineItems || [];
  const invoiceSubtotal = invoice?.subtotal || invoice?.amount || 0;
  const invoiceTax = invoice?.tax || 0;
  const invoiceTotal = invoice?.total || 0;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0 print:min-h-0">
      {/* Action Bar */}
      <div className="max-w-[800px] mx-auto px-6 mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {returnTo ? 'Back to Create Invoice' : 'Back to Invoices'}
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            {invoice.status === 'Unpaid' && (
              <Button
                onClick={handleSend}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send Invoice
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="invoice-document max-w-[800px] mx-auto bg-white shadow-lg print:shadow-none print:max-w-none print:m-0 print:w-full print:page-break-after-avoid">
        {/* A4 Container */}
        <div className="bg-white relative w-full aspect-[1/1.414] p-12 print:page-break-inside-avoid" data-name="invoiceai[1]-01 1">
          {/* Top Right Image */}
          <img 
            src="/top-right.svg" 
            alt="Top Right Graphic" 
            className="absolute top-12 right-12 h-auto object-contain max-w-xs"
          />
          
          {/* INVOICE Title */}
          <h1 className="text-[#18120f] text-5xl font-bold font-inter leading-none mb-4">INVOICE</h1>
          
          {/* Top Logo */}
          <div className="mb-6">
            <img 
              src="/top-logo.svg" 
              alt="Company Logo" 
              className="h-auto object-contain max-w-xs"
            />
          </div>
          
          {/* Client Info Section */}
          <div className="mb-4">
            <p className="text-[#9ca3af] text-xs uppercase tracking-wide mb-2">CLIENT INFO</p>
            <p className="text-[#18120f] font-bold text-base mb-1">{client?.name || invoice?.clientName || 'Client Name'}</p>
            <p className="text-[#18120f] text-sm">{client?.country || 'Location'}</p>
          </div>
          
          {/* Issued Date - Below Client Info */}
          <div className="mb-8 text-right">
            <p className="text-[#9ca3af] text-xs uppercase tracking-wide mb-1">ISSUED DATE</p>
            <p className="text-[#18120f] font-bold text-base">{invoice?.issueDate ? formatDate(invoice.issueDate) : 'Date'}</p>
          </div>
          
          {/* Description/Charges Section */}
          <div className="mb-4 mt-16">
            <div className="bg-[#18120f] text-white py-2 mb-4 flex items-center gap-4">
              {/* Left Column - Empty space for index column */}
              <div className="w-8 shrink-0"></div>
              {/* Middle Column - Description title */}
              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide">DESCRIPTION</p>
              </div>
              {/* Right Column - Charges title */}
              <div className="w-24 shrink-0 text-right pr-4">
                <p className="text-sm font-semibold uppercase tracking-wide">CHARGES</p>
              </div>
            </div>
            
            {/* Line Items */}
            <div className="space-y-4">
              {invoiceLineItems.length > 0 ? (
                invoiceLineItems.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Left Column - Index */}
                    <div className="w-8 shrink-0">
                      <p className="text-[#18120f] text-sm font-medium">#</p>
                    </div>
                    {/* Middle Column - Description */}
                    <div className="flex-1">
                      <p className="text-[#18120f] text-sm font-medium">
                        {item.description || 'Service Description'}
                      </p>
                      {invoice?.issueDate && (
                        <p className="text-[#9ca3af] text-xs mt-1">
                          Month - {new Date(invoice.issueDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {/* Right Column - Amount */}
                    <div className="w-24 shrink-0 text-right pr-4">
                      <p className="text-[#9ca3af] text-sm">$ {typeof item.amount === 'number' ? item.amount.toLocaleString() : parseFloat(item.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-4">
                  {/* Left Column - Index */}
                  <div className="w-8 shrink-0">
                    <p className="text-[#18120f] text-sm font-medium">#</p>
                  </div>
                  {/* Middle Column - Description */}
                  <div className="flex-1">
                    <p className="text-[#18120f] text-sm font-medium">
                      {invoice?.service || 'Service Description'}
                    </p>
                    {invoice?.issueDate && (
                      <p className="text-[#9ca3af] text-xs mt-1">
                        Month - {new Date(invoice.issueDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {/* Right Column - Amount */}
                  <div className="w-24 shrink-0 text-right pr-4">
                    <p className="text-[#9ca3af] text-sm">$ {invoiceSubtotal.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Total Section */}
          <div className="mb-6">
            <div className="bg-[#18120f] text-white py-2 px-4 flex justify-end">
              <p className="text-sm font-bold uppercase tracking-wide">Total$ {invoiceTotal.toLocaleString()}</p>
            </div>
          </div>
          
          {/* Payment Info Section */}
          <div className="absolute bottom-32 left-12 right-12">
            <div className="bg-[#18120f] text-white py-2 px-4 mb-4 flex justify-end">
              <p className="text-sm font-semibold uppercase tracking-wide">PAYMENT INFO</p>
            </div>
            
            {/* Right Side - Payment Info (Wallet ID and QR Code) */}
            <div className="flex justify-end items-start">
              <div className="text-right">
                <p className="text-[#18120f] text-sm font-medium mb-2">Paperbot Fintech Solutions</p>
                <p className="text-[#18120f] text-xs mb-3">
                  Wallet ID : {formData?.walletAddress || 'TPgazse1uRb4DAAqS6Dg4SF62BMyUae97Y'}
                </p>
                <img 
                  src="/qr.svg" 
                  alt="QR Code" 
                  className="h-auto object-contain w-32 ml-auto"
                />
              </div>
            </div>
          </div>
          
          {/* Bottom Left Image */}
          <img 
            src="/bottom-left.svg" 
            alt="Bottom Left Graphic" 
            className="absolute bottom-32 left-12 h-auto object-contain max-w-xs"
          />
          
          {/* Bottom Logo */}
          <img 
            src="/bottom-logo.svg" 
            alt="Bottom Logo" 
            className="absolute bottom-12 left-12 h-auto object-contain max-w-xs"
          />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar,
          *::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          body > div:first-child {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            overflow: hidden !important;
          }
          header,
          nav,
          aside,
          [class*="sidebar"],
          [class*="Sidebar"],
          [class*="Header"],
          [class*="header"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            position: static !important;
          }
          main > div {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          main > div > div:not(.invoice-document) {
            display: none !important;
          }
          .invoice-document {
            display: block !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:min-h-0 {
            min-height: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:page-break-after-avoid {
            page-break-after: avoid !important;
          }
          .print\\:page-break-inside-avoid {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
