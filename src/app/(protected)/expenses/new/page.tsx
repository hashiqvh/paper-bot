"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useExpenseCategories } from '@/contexts/ExpenseCategoriesContext';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewExpense() {
  const router = useRouter();
  const { categories } = useExpenseCategories();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '' as 'Advertising' | 'Office' | 'Platform Fee' | 'Other' | '',
    amount: '',
    description: '',
    notes: '',
    vendor: '',
    category: '',
    paymentMethod: '',
  });

  const [receipt, setReceipt] = useState<File | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleRemoveReceipt = () => {
    setReceipt(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.date || !formData.type || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would normally save to backend/database
    const expenseData = {
      id: 'e' + Math.random().toString(36).substr(2, 9),
      date: formData.date,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      notes: formData.notes,
      vendor: formData.vendor,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      receipt: receipt?.name,
    };

    console.log('New expense data:', expenseData);

    toast.success('Expense added successfully!');
    router.push('/expenses');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/expenses')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Add Expense</h1>
            <p className="text-slate-600 mt-1">Record a new business expense</p>
          </div>
        </div>
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="w-4 h-4" />
          Save Expense
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: string) => handleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="e.g., Google Ads Campaign"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor/Payee</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => handleChange('vendor', e.target.value)}
                    placeholder="e.g., Google LLC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: string) => handleChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Receipt Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt/Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Receipt</Label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6">
                    {receipt ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Upload className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm">{receipt.name}</p>
                            <p className="text-xs text-slate-500">
                              {(receipt.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveReceipt}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, PNG, JPG up to 10MB
                        </p>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="mt-4"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={4}
                    placeholder="Add any additional notes or details about this expense..."
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
                {formData.date && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Date</p>
                    <p>
                      {new Date(formData.date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {formData.type && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Type</p>
                    <p>{formData.type}</p>
                  </div>
                )}

                {formData.description && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Description</p>
                    <p>{formData.description}</p>
                  </div>
                )}

                {formData.amount && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Amount</p>
                    <p className="text-2xl">${parseFloat(formData.amount).toLocaleString()}</p>
                  </div>
                )}

                {formData.vendor && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Vendor</p>
                    <p>{formData.vendor}</p>
                  </div>
                )}

                {formData.paymentMethod && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                    <p>{formData.paymentMethod}</p>
                  </div>
                )}

                {receipt && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-slate-600 mb-1">Receipt</p>
                    <p className="text-sm text-green-600">✓ Uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-50">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  * Required fields must be completed before saving
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
