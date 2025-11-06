"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import type { ServiceAgreement } from '@/lib/mockData';
import { mockAgreements, mockClients } from '@/lib/mockData';
import { Download, Eye, FileText, Mail, MoreVertical, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Agreements() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Find the client record for logged-in client users
  const currentClient = user?.role === 'client' 
    ? mockClients.find(c => c.email === user.email)
    : null;

  // Filter agreements based on user role
  // Clients only see their own agreements that are Signed or Active
  const allAgreements = user?.role === 'client' && currentClient
    ? mockAgreements.filter(agreement => 
        agreement.clientId === currentClient.id && 
        (agreement.status === 'Signed' || agreement.status === 'Active' || agreement.status === 'Sent')
      )
    : mockAgreements;

  const filteredAgreements = allAgreements.filter(
    (agreement) =>
      agreement.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agreement.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ServiceAgreement['status']) => {
    const variants: Record<ServiceAgreement['status'], { variant: any; label: string }> = {
      Draft: { variant: 'secondary', label: 'Draft' },
      Sent: { variant: 'outline', label: 'Sent' },
      Signed: { variant: 'default', label: 'Signed' },
      Active: { variant: 'default', label: 'Active' },
      Expired: { variant: 'destructive', label: 'Expired' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: allAgreements.length,
    active: allAgreements.filter((a) => a.status === 'Active').length,
    pending: allAgreements.filter((a) => a.status === 'Sent').length,
    signed: allAgreements.filter((a) => a.status === 'Signed').length,
  };

  // Determine page title and description based on user role
  const pageTitle = user?.role === 'client' ? 'My Agreements' : 'Service Agreements';
  const pageDescription = user?.role === 'client' 
    ? 'View your service contracts and agreements'
    : 'Manage service contracts and agreements';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-slate-600">{pageDescription}</p>
        </div>
        {user?.role !== 'client' && (
          <Button className="gap-2 w-full sm:w-auto" onClick={() => router.push('/agreements/new')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Agreement</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {user?.role === 'client' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
              <FileText className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Signature</CardTitle>
              <FileText className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Signed</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.signed}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Agreements</CardTitle>
              <FileText className="w-4 h-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Active</CardTitle>
              <FileText className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Signature</CardTitle>
              <FileText className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Signed</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.signed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agreements Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Agreements</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search agreements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agreement ID</TableHead>
                {user?.role !== 'client' && <TableHead>Client</TableHead>}
                <TableHead>Service</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>{user?.role === 'client' ? 'Date' : 'Created Date'}</TableHead>
                <TableHead>Signed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgreements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'client' ? 7 : 8} className="text-center text-slate-500">
                    No agreements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgreements.map((agreement) => (
                  <TableRow key={agreement.id}>
                    <TableCell className="text-sm">{agreement.id}</TableCell>
                    {user?.role !== 'client' && (
                      <TableCell className="text-sm">{agreement.clientName}</TableCell>
                    )}
                    <TableCell className="text-sm">{agreement.service}</TableCell>
                    <TableCell className="text-sm">${agreement.fee.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(agreement.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {agreement.signedDate
                        ? new Date(agreement.signedDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(agreement.status)}</TableCell>
                    <TableCell>
                      {user?.role === 'client' ? (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            {agreement.status === 'Signed' && (
                              <DropdownMenuItem onClick={() => router.push('/invoices/new')}>
                                <FileText className="w-4 h-4 mr-2" />
                                Create Invoice
                              </DropdownMenuItem>
                            )}
                            {agreement.status === 'Draft' && (
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send to Client
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
  );
}
