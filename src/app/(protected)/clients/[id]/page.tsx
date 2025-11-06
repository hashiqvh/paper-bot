'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  useClient,
  useClientDocuments,
  useClientNotes,
  useCreateClientNote,
  useDeleteClientDocument,
  useDeleteClientNote,
  useUpdateClientDocument,
  useUpdateClientNote,
  useUploadClientDocument,
} from '@/hooks/useClients';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Handshake,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface ClientDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetail({ params }: ClientDetailProps) {
  const { id } = use(params);
  const { data, isLoading, error } = useClient(id);
  const { data: notesData } = useClientNotes(id);
  const { data: documentsData } = useClientDocuments(id);
  const createNoteMutation = useCreateClientNote();
  const updateNoteMutation = useUpdateClientNote();
  const deleteNoteMutation = useDeleteClientNote();
  const uploadDocumentMutation = useUploadClientDocument();
  const updateDocumentMutation = useUpdateClientDocument();
  const deleteDocumentMutation = useDeleteClientDocument();

  const [addNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [editNoteDialogOpen, setEditNoteDialogOpen] = useState(false);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [noteContent, setNoteContent] = useState('');

  const [uploadDocumentDialogOpen, setUploadDocumentDialogOpen] = useState(false);
  const [deleteDocumentDialogOpen, setDeleteDocumentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('KYC Document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

  const notes = notesData?.notes || data?.client?.clientNotes || [];
  const documents = documentsData?.documents || data?.client?.documents || [];

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content is required');
      return;
    }
    try {
      await createNoteMutation.mutateAsync({ clientId: id, content: noteContent });
      toast.success('Note added successfully');
      setNoteContent('');
      setAddNoteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add note');
    }
  };

  const handleEditNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content is required');
      return;
    }
    if (!selectedNote) return;
    try {
      await updateNoteMutation.mutateAsync({
        clientId: id,
        noteId: selectedNote.id,
        content: noteContent,
      });
      toast.success('Note updated successfully');
      setNoteContent('');
      setSelectedNote(null);
      setEditNoteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      await deleteNoteMutation.mutateAsync({
        clientId: id,
        noteId: selectedNote.id,
      });
      toast.success('Note deleted successfully');
      setSelectedNote(null);
      setDeleteNoteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete note');
    }
  };

  const openEditDialog = (note: any) => {
    setSelectedNote(note);
    setNoteContent(note.content);
    setEditNoteDialogOpen(true);
  };

  const openDeleteDialog = (note: any) => {
    setSelectedNote(note);
    setDeleteNoteDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name);
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    if (!documentName.trim()) {
      toast.error('Document name is required');
      return;
    }
    try {
      await uploadDocumentMutation.mutateAsync({
        clientId: id,
        file: selectedFile,
        name: documentName,
        type: documentType,
      });
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      setDocumentName('');
      setDocumentType('KYC Document');
      setUploadDocumentDialogOpen(false);
      if (fileInputRef) {
        fileInputRef.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    try {
      await deleteDocumentMutation.mutateAsync({
        clientId: id,
        documentId: selectedDocument.id,
      });
      toast.success('Document deleted successfully');
      setSelectedDocument(null);
      setDeleteDocumentDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const openDeleteDocumentDialog = (document: any) => {
    setSelectedDocument(document);
    setDeleteDocumentDialogOpen(true);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading client...</p>
      </div>
    );
  }

  if (error || !data?.client) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Client not found</p>
        <Link href="/clients">
          <Button variant="link" className="mt-4">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  const client = data.client;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'VERIFIED':
        return 'secondary';
      case 'LEAD':
        return 'outline';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getKycStatusBadgeVariant = (kycStatus: string) => {
    switch (kycStatus) {
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1>{client.name}</h1>
          <p className="text-slate-600 mt-1">Client Details & Management</p>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button>Edit Client</Button>
        </Link>
      </div>

      {/* Client Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
              {client.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl">{client.name}</h2>
                  <p className="text-slate-600">Client Account</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(client.status)}>
                    {client.status}
                  </Badge>
                  <Badge variant={getKycStatusBadgeVariant(client.kycStatus)}>
                    KYC: {client.kycStatus}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{client.country}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Joined {new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices
            {client.invoices && client.invoices.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {client.invoices.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="proposals">
            Proposals
            {client.proposals && client.proposals.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {client.proposals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="agreements">
            Agreements
            {client.agreements && client.agreements.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {client.agreements.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Expenses
            {client.expenses && client.expenses.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {client.expenses.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-600">Full Name</label>
                  <p className="mt-1">{client.name}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Email</label>
                  <p className="mt-1">{client.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Phone</label>
                  <p className="mt-1">{client.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Country</label>
                  <p className="mt-1">{client.country}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Date Added</label>
                  <p className="mt-1">{new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>KYC Documents</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setDocumentName('');
                    setDocumentType('KYC Document');
                    setUploadDocumentDialogOpen(true);
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">
                              {doc.type} • {formatFileSize(doc.fileSize)} • Uploaded on{' '}
                              {new Date(doc.uploadDate || doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <Badge
                          variant={
                            doc.status === 'Approved'
                              ? 'default'
                              : doc.status === 'Rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {doc.status}
                        </Badge>
                        {doc.fileUrl && (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDocumentDialog(doc)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No documents uploaded yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setSelectedFile(null);
                      setDocumentName('');
                      setDocumentType('KYC Document');
                      setUploadDocumentDialogOpen(true);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.invoices && client.invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="text-sm font-mono">
                            {invoice.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.issueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ${invoice.total?.toLocaleString() || '0.00'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === 'PAID'
                                  ? 'default'
                                  : invoice.status === 'OVERDUE'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/invoices/preview?id=${invoice.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No invoices found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Proposals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.proposals && client.proposals.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.proposals.map((proposal: any) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="text-sm">{proposal.service}</TableCell>
                          <TableCell className="text-sm font-medium">
                            ${proposal.fee?.toLocaleString() || '0.00'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(proposal.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">
                            {proposal.validUntil
                              ? new Date(proposal.validUntil).toLocaleDateString()
                              : '-'}
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
                            <Link href={`/proposals/preview?id=${proposal.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No proposals found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.agreements && client.agreements.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.agreements.map((agreement: any) => (
                        <TableRow key={agreement.id}>
                          <TableCell className="text-sm">{agreement.service}</TableCell>
                          <TableCell className="text-sm font-medium">
                            ${agreement.fee?.toLocaleString() || '0.00'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {agreement.startDate
                              ? new Date(agreement.startDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {agreement.endDate
                              ? new Date(agreement.endDate).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                agreement.status === 'ACTIVE'
                                  ? 'default'
                                  : agreement.status === 'TERMINATED'
                                  ? 'destructive'
                                  : agreement.status === 'COMPLETED'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {agreement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Link href={`/agreements/preview?id=${agreement.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Handshake className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No agreements found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.expenses && client.expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.expenses.map((expense: any) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-sm">
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm">{expense.description}</TableCell>
                          <TableCell>
                            {expense.category ? (
                              <Badge variant="outline">{expense.category.name}</Badge>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ${expense.amount?.toLocaleString() || '0.00'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No expenses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Internal Notes</CardTitle>
                <Button
                  onClick={() => {
                    setNoteContent('');
                    setAddNoteDialogOpen(true);
                  }}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note: any) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(note)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(note)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No notes yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setNoteContent('');
                      setAddNoteDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={addNoteDialogOpen} onOpenChange={setAddNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a new note for this client. Notes are visible to all team members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter note content..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddNoteDialogOpen(false);
                setNoteContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={createNoteMutation.isPending}
            >
              {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={editNoteDialogOpen} onOpenChange={setEditNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Update the note content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter note content..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditNoteDialogOpen(false);
                setNoteContent('');
                setSelectedNote(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditNote}
              disabled={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? 'Updating...' : 'Update Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Note Dialog */}
      <Dialog open={deleteNoteDialogOpen} onOpenChange={setDeleteNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteNoteDialogOpen(false);
                setSelectedNote(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDocumentDialogOpen} onOpenChange={setUploadDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload KYC Document</DialogTitle>
            <DialogDescription>
              Upload a document for this client. Maximum file size is 10MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Name</label>
              <Input
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KYC Document">KYC Document</SelectItem>
                  <SelectItem value="ID Proof">ID Proof</SelectItem>
                  <SelectItem value="Address Proof">Address Proof</SelectItem>
                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">File</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef) {
                          fileInputRef.value = '';
                        }
                      }}
                      className="mt-2"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-600">Click to select a file</p>
                    <p className="text-xs text-slate-500">Max file size: 10MB</p>
                    <Input
                      ref={(el) => setFileInputRef(el)}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDocumentDialogOpen(false);
                setSelectedFile(null);
                setDocumentName('');
                setDocumentType('KYC Document');
                if (fileInputRef) {
                  fileInputRef.value = '';
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadDocument}
              disabled={uploadDocumentMutation.isPending || !selectedFile || !documentName.trim()}
            >
              {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog open={deleteDocumentDialogOpen} onOpenChange={setDeleteDocumentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDocument?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDocumentDialogOpen(false);
                setSelectedDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDocument}
              disabled={deleteDocumentMutation.isPending}
            >
              {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
