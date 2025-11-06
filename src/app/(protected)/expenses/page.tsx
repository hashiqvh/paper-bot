"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useExpenseCategories } from '@/contexts/ExpenseCategoriesContext';
import { Expense, mockExpenses } from '@/lib/mockData';
import { Download, Eye, FileText, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Expenses() {
  const router = useRouter();
  const { categories } = useExpenseCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate expenses by category dynamically
  const expensesByType: Record<string, number> = {};
  categories.forEach((category) => {
    expensesByType[category.name] = mockExpenses
      .filter(e => e.type === category.name)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>Expenses</h1>
          <p className="text-slate-600 mt-1">Track and manage business expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 hidden sm:flex">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2 flex-1 sm:flex-none" onClick={() => router.push('/expenses/new')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Expenses</p>
            <p className="text-2xl mt-2">${totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
        {Object.entries(expensesByType).map(([type, amount]) => (
          <Card key={type}>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">{type}</p>
              <p className="text-lg mt-2">${amount.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {expense.vendor || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {expense.paymentMethod || '-'}
                  </TableCell>
                  <TableCell className="text-sm">${expense.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {expense.receipt && (
                        <Button variant="ghost" size="sm" title="View Receipt">
                          <FileText className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No expenses found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Detail Dialog */}
      <Dialog open={!!selectedExpense} onOpenChange={() => setSelectedExpense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              View complete information about this expense record
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Date</p>
                  <p>
                    {new Date(selectedExpense.date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Type</p>
                  <Badge variant="outline">{selectedExpense.type}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Description</p>
                <p>{selectedExpense.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Amount</p>
                  <p className="text-2xl">${selectedExpense.amount.toLocaleString()}</p>
                </div>
                {selectedExpense.vendor && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Vendor</p>
                    <p>{selectedExpense.vendor}</p>
                  </div>
                )}
              </div>

              {selectedExpense.paymentMethod && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                  <p>{selectedExpense.paymentMethod}</p>
                </div>
              )}

              {selectedExpense.notes && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Notes</p>
                  <p className="text-sm">{selectedExpense.notes}</p>
                </div>
              )}

              {selectedExpense.receipt && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Receipt</p>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    View Receipt
                  </Button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedExpense(null)}>
                  Close
                </Button>
                <Button variant="outline">
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
