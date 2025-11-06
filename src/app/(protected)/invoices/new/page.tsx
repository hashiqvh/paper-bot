'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mockAgreements, mockClients } from "@/lib/mockData";
import { ArrowLeft, Eye, Plus, Save, Send, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LineItem {
  id: string;
  description: string;
  amount: string;
}

export default function NewInvoice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agreementId = searchParams.get("agreementId") as string | null;

  // Check if returning from preview with saved data (using sessionStorage)
  const savedFormData = typeof window !== 'undefined' 
    ? JSON.parse(sessionStorage.getItem('invoiceFormData') || 'null')
    : null;
  const savedLineItems = typeof window !== 'undefined'
    ? JSON.parse(sessionStorage.getItem('invoiceLineItems') || 'null')
    : null;

  // Pre-fill if coming from an agreement
  const linkedAgreement = agreementId
    ? mockAgreements.find((a) => a.id === agreementId)
    : undefined;

  const [formData, setFormData] = useState(
    savedFormData || {
      clientId: linkedAgreement?.clientId || "",
      taxRate: "20",
      dueDate: "",
      issueDate: new Date().toISOString().split("T")[0],
      status: "Unpaid" as const,
      notes: "",
      paymentTerms: "Payment due within 30 days of invoice date.",
    }
  );

  const [lineItems, setLineItems] = useState<LineItem[]>(
    savedLineItems ||
      (linkedAgreement
        ? [
            {
              id: "1",
              description: linkedAgreement.service,
              amount: linkedAgreement.fee.toString(),
            },
          ]
        : [
            {
              id: "1",
              description: "",
              amount: "",
            },
          ])
  );

  // Clear sessionStorage after restoring to prevent issues with browser back button
  useEffect(() => {
    if (savedFormData || savedLineItems) {
      sessionStorage.removeItem('invoiceFormData');
      sessionStorage.removeItem('invoiceLineItems');
    }
  }, [savedFormData, savedLineItems]);

  const calculateSubtotal = (): number => {
    return lineItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const calculateTax = (): number => {
    const subtotal = calculateSubtotal();
    const taxRate = parseFloat(formData.taxRate) || 0;
    return (subtotal * taxRate) / 100;
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: "",
      amount: "",
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) {
      toast.error("Invoice must have at least one line item");
      return;
    }
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleLineItemChange = (
    id: string,
    field: keyof LineItem,
    value: string
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();

    // Validation
    if (!formData.clientId || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate line items
    const hasEmptyItems = lineItems.some(
      (item) => !item.description || !item.amount
    );
    if (hasEmptyItems) {
      toast.error("Please complete all line items");
      return;
    }

    const selectedClient = mockClients.find((c) => c.id === formData.clientId);

    // Here you would normally save to backend/database
    const invoiceData = {
      id: "inv" + Math.random().toString(36).substr(2, 9),
      clientId: formData.clientId,
      clientName: selectedClient?.name || "",
      lineItems: lineItems.map((item) => ({
        description: item.description,
        amount: parseFloat(item.amount),
      })),
      subtotal: calculateSubtotal(),
      taxRate: parseFloat(formData.taxRate),
      tax: calculateTax(),
      total: calculateTotal(),
      status: formData.status,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate,
      notes: formData.notes,
      paymentTerms: formData.paymentTerms,
    };

    console.log("New invoice data:", invoiceData);

    toast.success(
      sendImmediately
        ? "Invoice sent successfully!"
        : "Invoice saved successfully!"
    );
    router.push("/invoices");
  };

  const handlePreview = () => {
    if (!formData.clientId) {
      toast.error("Please select a client before previewing");
      return;
    }

    const hasEmptyItems = lineItems.some(
      (item) => !item.description || !item.amount
    );
    if (hasEmptyItems) {
      toast.error("Please complete all line items before previewing");
      return;
    }

    const selectedClient = mockClients.find((c) => c.id === formData.clientId);

    const previewInvoice = {
      id: "PREVIEW",
      clientId: formData.clientId,
      clientName: selectedClient?.name || "",
      lineItems: lineItems.map((item) => ({
        description: item.description,
        amount: parseFloat(item.amount) || 0,
      })),
      subtotal: calculateSubtotal(),
      taxRate: parseFloat(formData.taxRate),
      tax: calculateTax(),
      total: calculateTotal(),
      status: formData.status,
      dueDate: formData.dueDate || new Date().toISOString().split("T")[0],
      issueDate: formData.issueDate,
    };

    const returnPath = agreementId
      ? `/invoices/new?agreementId=${agreementId}`
      : "/invoices/new";

    // Store data in sessionStorage for preview page
    sessionStorage.setItem('previewInvoice', JSON.stringify(previewInvoice));
    sessionStorage.setItem('invoiceFormData', JSON.stringify(formData));
    sessionStorage.setItem('invoiceLineItems', JSON.stringify(lineItems));
    sessionStorage.setItem('invoiceReturnTo', returnPath);
    
    router.push("/invoices/preview");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const selectedClient = mockClients.find((c) => c.id === formData.clientId);
  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/invoices")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Create Invoice</h1>
            <p className="text-slate-600 mt-1">
              Generate a new invoice for your client
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePreview} className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleSubmit(e, false)
            }
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleSubmit(e, true)
            }
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Save & Send
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Date Information */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value: string) =>
                      handleChange("clientId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Issue Date *</Label>
                    <Input
                      id="issueDate"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) =>
                        handleChange("issueDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleChange("dueDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Line Items</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLineItem}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-slate-600 mt-2">
                        Item {index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLineItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`description-${item.id}`}>
                          Description *
                        </Label>
                        <Input
                          id={`description-${item.id}`}
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Managed Account Service - Monthly Fee"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`amount-${item.id}`}>
                          Amount (USD) *
                        </Label>
                        <Input
                          id={`amount-${item.id}`}
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "amount",
                              e.target.value
                            )
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tax */}
            <Card>
              <CardHeader>
                <CardTitle>Tax & Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => handleChange("taxRate", e.target.value)}
                    placeholder="20"
                  />
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Tax ({formData.taxRate}%):
                    </span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      handleChange("paymentTerms", e.target.value)
                    }
                    rows={3}
                    placeholder="Enter payment terms and conditions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Internal)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
                    placeholder="Add any internal notes (not visible to client)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedClient && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Client</p>
                    <p>{selectedClient.name}</p>
                    <p className="text-sm text-slate-600">
                      {selectedClient.email}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-2">Line Items</p>
                  <div className="space-y-2">
                    {lineItems.map((item, index) => (
                      <div key={item.id} className="text-sm">
                        {item.description ? (
                          <div className="flex justify-between gap-2">
                            <p className="truncate">{item.description}</p>
                            <p className="text-slate-600">
                              ${item.amount || "0.00"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-slate-400">
                            Item {index + 1} (incomplete)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Tax ({formData.taxRate}%):
                    </span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {formData.dueDate && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Due Date</p>
                    <p>
                      {new Date(formData.dueDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    handleChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
