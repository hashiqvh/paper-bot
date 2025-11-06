'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockClients } from '@/lib/mockData';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface ClientDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ClientDetail({ params }: ClientDetailProps) {
  const router = useRouter();
  const { id } = use(params);
  const client = mockClients.find(c => c.id === id);

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Client not found</p>
        <Link href="/clients">
          <Button variant="link" className="mt-4">Back to Clients</Button>
        </Link>
      </div>
    );
  }

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
        <Button>Edit Client</Button>
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
                  <Badge variant={
                    client.status === 'Active' ? 'default' :
                    client.status === 'Verified' ? 'secondary' :
                    client.status === 'Lead' ? 'outline' :
                    'destructive'
                  }>
                    {client.status}
                  </Badge>
                  <Badge variant={
                    client.kycStatus === 'Approved' ? 'default' :
                    client.kycStatus === 'Rejected' ? 'destructive' :
                    'secondary'
                  }>
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
                  <span>Joined {new Date(client.dateAdded).toLocaleDateString()}</span>
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
                  <p className="mt-1">{new Date(client.dateAdded).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>KYC Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {client.documents.length > 0 ? (
                <div className="space-y-4">
                  {client.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="text-sm">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          doc.status === 'Approved' ? 'default' :
                          doc.status === 'Rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No documents uploaded yet</p>
                  <Button className="mt-4">Upload Document</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-slate-500">No notes yet</p>
                <Button className="mt-4">Add Note</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
