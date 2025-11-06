"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, mockInvoices } from '@/lib/mockData';
import { Download, Eye, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Invoices() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Find the client record for logged-in client users
  const currentClient = user?.role === 'client' 
    ? mockClients.find(c => c.email === user.email)
    : null;

  // Filter invoices based on user role
  const allInvoices = user?.role === 'client' && currentClient
    ? mockInvoices.filter(invoice => invoice.clientId === currentClient.id)
    : mockInvoices;

  const filteredInvoices = allInvoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      invoice.clientName.toLowerCase().includes(searchLower) ||
      invoice.id.toLowerCase().includes(searchLower) ||
      (invoice.service && invoice.service.toLowerCase().includes(searchLower)) ||
      (invoice.lineItems && invoice.lineItems.some(item => 
        item.description.toLowerCase().includes(searchLower)
      ));
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.total, 0);
  const unpaidAmount = filteredInvoices.filter(i => i.status !== 'Paid').reduce((sum, inv) => sum + inv.total, 0);

  // Determine page title and description based on user role
  const pageTitle = user?.role === 'client' ? 'My Invoices' : 'Invoices';
  const pageDescription = user?.role === 'client' 
    ? 'View your invoices and payment history'
    : 'Manage your invoices and payments';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-slate-600 mt-1">{pageDescription}</p>
        </div>
        {user?.role !== 'client' && (
          <Button className="gap-2 w-full sm:w-auto" onClick={() => router.push('/invoices/new')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Invoiced</p>
            <p className="text-2xl mt-2">${totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Paid</p>
            <p className="text-2xl mt-2 text-green-600">${paidAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Unpaid</p>
            <p className="text-2xl mt-2 text-orange-600">${unpaidAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                {user?.role !== 'client' && <TableHead>Client</TableHead>}
                <TableHead>Service</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="text-sm">{invoice.id.toUpperCase()}</TableCell>
                  {user?.role !== 'client' && (
                    <TableCell className="text-sm">{invoice.clientName}</TableCell>
                  )}
                  <TableCell className="text-sm">
                    {invoice.lineItems ? (
                      invoice.lineItems.length === 1 ? (
                        invoice.lineItems[0].description
                      ) : (
                        `${invoice.lineItems.length} items`
                      )
                    ) : (
                      invoice.service
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">${invoice.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'Paid' ? 'default' :
                      invoice.status === 'Overdue' ? 'destructive' :
                      invoice.status === 'Upcoming' ? 'outline' :
                      'secondary'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          sessionStorage.setItem('previewInvoice', JSON.stringify(invoice));
                          router.push('/invoices/preview');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
