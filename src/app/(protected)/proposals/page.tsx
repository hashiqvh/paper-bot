'use client';

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
import { mockClients, mockProposals } from '@/lib/mockData';
import { Edit, Eye, FileSignature, Plus, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function Proposals() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Find the client record for logged-in client users
  const currentClient = user?.role === 'client' 
    ? mockClients.find(c => c.email === user.email)
    : null;

  // Filter proposals based on user role
  // Clients only see their own proposals that are Sent or Accepted
  const allProposals = user?.role === 'client' && currentClient
    ? mockProposals.filter(proposal => 
        proposal.clientId === currentClient.id && 
        (proposal.status === 'Sent' || proposal.status === 'Accepted')
      )
    : mockProposals;

  const filteredProposals = allProposals.filter(proposal => {
    const matchesSearch = 
      proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Determine page title and description based on user role
  const pageTitle = user?.role === 'client' ? 'My Proposals' : 'Proposals';
  const pageDescription = user?.role === 'client' 
    ? 'View service proposals from our team'
    : 'Create and manage service proposals';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-slate-600 mt-1">{pageDescription}</p>
        </div>
        {user?.role !== 'client' && (
          <Button asChild className="gap-2 w-full sm:w-auto">
            <Link href="/proposals/new">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Proposal</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {user?.role === 'client' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Active Proposals</p>
              <p className="text-2xl mt-2">{allProposals.filter(p => p.status === 'Sent').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Accepted</p>
              <p className="text-2xl mt-2">{allProposals.filter(p => p.status === 'Accepted').length}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['Draft', 'Sent', 'Accepted', 'Rejected'].map((status) => {
            const count = allProposals.filter(p => p.status === status).length;
            return (
              <Card key={status}>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{status}</p>
                  <p className="text-2xl mt-2">{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search proposals..."
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
                {user?.role !== 'client' && <SelectItem value="Draft">Draft</SelectItem>}
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                {user?.role !== 'client' && <SelectItem value="Rejected">Rejected</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                {user?.role !== 'client' && <TableHead>Client</TableHead>}
                <TableHead>Service</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>{user?.role === 'client' ? 'Date' : 'Created Date'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  {user?.role !== 'client' && (
                    <TableCell className="text-sm">{proposal.clientName}</TableCell>
                  )}
                  <TableCell className="text-sm">{proposal.service}</TableCell>
                  <TableCell className="text-sm">${proposal.fee.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(proposal.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      proposal.status === 'Accepted' ? 'default' :
                      proposal.status === 'Rejected' ? 'destructive' :
                      proposal.status === 'Sent' ? 'secondary' :
                      'outline'
                    }>
                      {proposal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user?.role !== 'client' && proposal.status === 'Accepted' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          className="gap-1"
                          onClick={() => router.push(`/agreements/new?proposalId=${proposal.id}`)}
                        >
                          <FileSignature className="w-4 h-4" />
                          Create Agreement
                        </Button>
                      )}
                      {user?.role !== 'client' && proposal.status === 'Draft' && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No proposals found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
