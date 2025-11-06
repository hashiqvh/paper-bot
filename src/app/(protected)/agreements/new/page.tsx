'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { mockClients, mockProposals } from '@/lib/mockData';
import { ArrowLeft, CheckCircle, Eye, Save, Send } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function NewAgreement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proposalId = searchParams.get('proposalId') as string | null;
  const [formData, setFormData] = useState({
    clientId: '',
    proposalId: proposalId || '',
    service: '',
    fee: '',
    status: 'Draft',
    startDate: '',
    endDate: '',
    content: {
      scope: 'The service provider agrees to deliver the following services as outlined in the original proposal.',
      terms: '1. Services will be provided in accordance with industry standards.\n2. Client will provide necessary access and information.\n3. Payment terms as specified in the fee schedule.',
      obligations: 'Service Provider Obligations:\n• Deliver services as specified\n• Maintain confidentiality\n• Provide regular updates\n\nClient Obligations:\n• Provide timely feedback\n• Make payments on schedule\n• Provide necessary information',
      termination: 'Either party may terminate this agreement with 30 days written notice. Upon termination, client will pay for services rendered up to the termination date.',
    },
  });

  // Pre-populate if coming from accepted proposal
  useEffect(() => {
    if (proposalId) {
      const proposal = mockProposals.find(p => p.id === proposalId);
      if (proposal) {
        setFormData(prev => ({
          ...prev,
          clientId: proposal.clientId,
          proposalId: proposal.id,
          service: proposal.service,
          fee: proposal.fee.toString(),
        }));
      }
    }
  }, [proposalId]);

  const handleSubmit = (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId || !formData.service || !formData.fee) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would normally save to backend/database
    const agreementData = {
      ...formData,
      status: sendImmediately ? 'Sent' : 'Draft',
      sentDate: sendImmediately ? new Date().toISOString() : undefined,
    };
    
    console.log('New agreement data:', agreementData);
    
    toast.success(sendImmediately ? 'Agreement sent to client!' : 'Agreement saved as draft!');
    router.push('/agreements');
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const selectedClient = mockClients.find(c => c.id === formData.clientId);
  const selectedProposal = mockProposals.find(p => p.id === formData.proposalId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/agreements')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Create Service Agreement</h1>
            <p className="text-slate-600">Generate a formal service agreement from accepted proposal</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            sessionStorage.setItem('agreementFormData', JSON.stringify(formData));
            router.push('/agreements/preview');
          }}
        >
          <Eye className="w-4 h-4" />
          Preview Agreement
        </Button>
      </div>

      {/* Alert if coming from proposal */}
      {proposalId && selectedProposal && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Creating agreement from accepted proposal: <strong>{selectedProposal.id}</strong> - {selectedProposal.service}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agreement Details</CardTitle>
                <CardDescription>Specify the terms and dates for this agreement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Select Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value: string) => handleChange('clientId', value)}
                    disabled={!!proposalId}
                  >
                    <SelectTrigger id="clientId">
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proposal Selection */}
                <div className="space-y-2">
                  <Label htmlFor="proposalId">Related Proposal (Optional)</Label>
                  <Select
                    value={formData.proposalId}
                    onValueChange={(value: string) => {
                      handleChange('proposalId', value);
                      const proposal = mockProposals.find(p => p.id === value);
                      if (proposal) {
                        handleChange('service', proposal.service);
                        handleChange('fee', proposal.fee.toString());
                      }
                    }}
                  >
                    <SelectTrigger id="proposalId">
                      <SelectValue placeholder="Select a proposal" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProposals
                        .filter(p => p.status === 'Accepted' && p.clientId === formData.clientId)
                        .map((proposal) => (
                          <SelectItem key={proposal.id} value={proposal.id}>
                            {proposal.id} - {proposal.service}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="service">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value: string) => handleChange('service', value)}
                    disabled={!!proposalId}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Account Setup">Account Setup</SelectItem>
                      <SelectItem value="Managed Account Service">Managed Account Service</SelectItem>
                      <SelectItem value="Portfolio Management">Portfolio Management</SelectItem>
                      <SelectItem value="Trading Advisory">Trading Advisory</SelectItem>
                      <SelectItem value="Risk Management Consulting">Risk Management Consulting</SelectItem>
                      <SelectItem value="Custom Trading Solution">Custom Trading Solution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fee and Dates */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fee">
                      Service Fee (USD) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fee"
                      type="number"
                      placeholder="5000"
                      value={formData.fee}
                      onChange={(e) => handleChange('fee', e.target.value)}
                      disabled={!!proposalId}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Content Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Agreement Terms</CardTitle>
                <CardDescription>Edit the legal content of the service agreement</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="scope" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="scope">Scope</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="obligations">Obligations</TabsTrigger>
                    <TabsTrigger value="termination">Termination</TabsTrigger>
                  </TabsList>

                  <TabsContent value="scope" className="space-y-2 mt-4">
                    <Label htmlFor="scope">Scope of Services</Label>
                    <Textarea
                      id="scope"
                      placeholder="Describe the scope of services..."
                      rows={8}
                      value={formData.content.scope}
                      onChange={(e) => handleContentChange('scope', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="terms" className="space-y-2 mt-4">
                    <Label htmlFor="terms">General Terms</Label>
                    <Textarea
                      id="terms"
                      placeholder="General terms and conditions..."
                      rows={8}
                      value={formData.content.terms}
                      onChange={(e) => handleContentChange('terms', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="obligations" className="space-y-2 mt-4">
                    <Label htmlFor="obligations">Obligations</Label>
                    <Textarea
                      id="obligations"
                      placeholder="Obligations of both parties..."
                      rows={8}
                      value={formData.content.obligations}
                      onChange={(e) => handleContentChange('obligations', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="termination" className="space-y-2 mt-4">
                    <Label htmlFor="termination">Termination Clause</Label>
                    <Textarea
                      id="termination"
                      placeholder="Termination terms..."
                      rows={8}
                      value={formData.content.termination}
                      onChange={(e) => handleContentChange('termination', e.target.value)}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Status and Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agreement Status</CardTitle>
                <CardDescription>Set the current status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: string) => handleChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Signed">Signed</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button 
                  type="button"
                  className="w-full gap-2"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSubmit(e, true)}
                >
                  <Send className="w-4 h-4" />
                  Send for Signature
                </Button>
                <Button 
                  type="submit" 
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                    onClick={() => router.push('/agreements')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            {selectedClient && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-600">Name</p>
                    <p>{selectedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email</p>
                    <p>{selectedClient.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <p>{selectedClient.status}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
