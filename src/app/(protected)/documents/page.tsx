"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { mockClients, mockCompanyDocuments } from '@/lib/mockData';
import { Building2, Download, Eye, FileText, Plus, Search, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Documents() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('client');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Find the client record for logged-in client users
  const currentClient = user?.role === 'CLIENT' 
    ? mockClients.find(c => c.email === user.email)
    : null;

  // Get all client documents, filtered for client role
  const allClientDocuments = mockClients.flatMap(client =>
    client.documents.map(doc => ({
      ...doc,
      clientId: client.id,
      clientName: client.name,
      ownerType: 'client' as const,
    }))
  );

  // For clients, only show their own documents
  const clientDocuments = user?.role === 'CLIENT' && currentClient
    ? allClientDocuments.filter(doc => doc.clientId === currentClient.id)
    : allClientDocuments;

  const companyDocuments = mockCompanyDocuments.map(doc => ({
    ...doc,
    ownerType: 'company' as const,
  }));

  const allDocuments = activeTab === 'client' ? clientDocuments : companyDocuments;

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activeTab === 'client' && 'clientName' in doc && doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleDeleteDocument = () => {
    // Simulate delete
    toast.success('Document deleted successfully');
    setDeleteDialogOpen(false);
    setSelectedDocId(null);
  };

  const handleDownload = (docName: string) => {
    toast.success(`Downloading ${docName}...`);
  };

  const handleView = (docName: string) => {
    toast.info(`Opening ${docName}...`);
  };

  // Determine page title and description based on user role
  const pageTitle = user?.role === 'CLIENT' ? 'My Documents' : 'Documents';
  const pageDescription = user?.role === 'CLIENT' 
    ? 'View your documents, agreements, and compliance files'
    : 'Manage client documents and compliance files';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{pageTitle}</h1>
          <p className="text-slate-600 mt-1">{pageDescription}</p>
        </div>
        {user?.role !== 'CLIENT' && (
          <Button className="gap-2 w-full sm:w-auto" onClick={() => router.push('/documents/new')}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Document</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}
      </div>

      {/* Summary Cards - Different views for clients vs admin/managers */}
      {user?.role === 'CLIENT' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-slate-600">My Documents</p>
              </div>
              <p className="text-2xl">{clientDocuments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl mt-2">
                {clientDocuments.filter(d => d.status === 'Approved').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl mt-2">
                {clientDocuments.filter(d => d.status === 'Pending').length}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-slate-600">Client Documents</p>
              </div>
              <p className="text-2xl">{clientDocuments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-600" />
                <p className="text-sm text-slate-600">Company Documents</p>
              </div>
              <p className="text-2xl">{companyDocuments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl mt-2">
                {[...clientDocuments, ...companyDocuments].filter(d => d.status === 'Pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Total Documents</p>
              <p className="text-2xl mt-2">{clientDocuments.length + companyDocuments.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {user?.role === 'CLIENT' ? (
        // Client view - no tabs, just their documents
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="KYC">KYC</SelectItem>
                  <SelectItem value="Agreement">Agreement</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                            {doc.status && (
                              <Badge 
                                variant={
                                  doc.status === 'Approved' ? 'default' :
                                  doc.status === 'Rejected' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {doc.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleView(doc.name)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleDownload(doc.name)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No documents found</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Admin/Manager view - with tabs
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="client" className="gap-2">
              <Users className="w-4 h-4" />
              Client Documents
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="w-4 h-4" />
              Company Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder={activeTab === 'client' ? "Search client documents..." : "Search company documents..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {activeTab === 'client' ? (
                        <>
                          <SelectItem value="KYC">KYC</SelectItem>
                          <SelectItem value="Agreement">Agreement</SelectItem>
                          <SelectItem value="Compliance">Compliance</SelectItem>
                          <SelectItem value="Report">Report</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Policy">Policy</SelectItem>
                          <SelectItem value="Template">Template</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{doc.name}</p>
                              {activeTab === 'client' && 'clientName' in doc && (
                                <p className="text-xs text-slate-500 mt-1">{doc.clientName}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {doc.type}
                                </Badge>
                                {doc.status && (
                                  <Badge 
                                    variant={
                                      doc.status === 'Approved' ? 'default' :
                                      doc.status === 'Rejected' ? 'destructive' :
                                      'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {doc.status}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </p>
                              <div className="flex gap-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleView(doc.name)}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleDownload(doc.name)}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDocId(doc.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No documents found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
