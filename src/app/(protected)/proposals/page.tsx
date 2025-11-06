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
import { useProposals, useUpdateProposal } from '@/hooks/useProposals';
import { Edit, Eye, FileSignature, Plus, Search, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Proposals() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useProposals({
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const updateProposalMutation = useUpdateProposal();

  const proposals = data?.proposals || [];

  const handleSendProposal = async (proposalId: string) => {
    try {
      await updateProposalMutation.mutateAsync({
        id: proposalId,
        data: { status: 'SENT' },
      });
      toast.success('Proposal sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send proposal');
    }
  };

  // Determine page title and description
  const pageTitle = 'Proposals';
  const pageDescription = 'Create and manage service proposals';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-slate-600 mt-1">{pageDescription}</p>
        </div>
        <Button asChild className="gap-2 w-full sm:w-auto">
          <Link href="/proposals/new">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Proposal</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map((status) => {
          const count = proposals.filter((p) => p.status === status).length;
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading proposals...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load proposals</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proposals.map((proposal) => (
                      <TableRow key={proposal.id}>
                        <TableCell className="text-sm">{proposal.clientName}</TableCell>
                        <TableCell className="text-sm">{proposal.service}</TableCell>
                        <TableCell className="text-sm">
                          ${proposal.fee.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              proposal.status === 'ACCEPTED'
                                ? 'default'
                                : proposal.status === 'REJECTED'
                                ? 'destructive'
                                : proposal.status === 'SENT'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {proposal.status === 'ACCEPTED' && (
                              <Button
                                variant="default"
                                size="sm"
                                className="gap-1"
                                onClick={() =>
                                  router.push(`/agreements/new?proposalId=${proposal.id}`)
                                }
                              >
                                <FileSignature className="w-4 h-4" />
                                Create Agreement
                              </Button>
                            )}
                            {proposal.status === 'DRAFT' && (
                              <>
                                <Link href={`/proposals/${proposal.id}/edit`}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSendProposal(proposal.id)}
                                  disabled={updateProposalMutation.isPending}
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Link href={`/proposals/${proposal.id}/preview`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {proposals.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No proposals found</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
