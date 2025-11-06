"use client";

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
import { mockClients } from '@/lib/mockData';
import { ArrowLeft, Eye, Save, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewProposal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clientId: '',
    service: '',
    fee: '',
    status: 'Draft',
    validity: '30',
    content: {
      introduction: 'Dear [Client Name],\n\nThank you for your interest in our services. We are pleased to present this proposal for your consideration.',
      serviceDetails: 'This proposal outlines our comprehensive service offering designed to meet your specific needs.',
      deliverables: '• Service deliverable 1\n• Service deliverable 2\n• Service deliverable 3',
      timeline: 'Project Duration: [X] weeks/months\n\nPhase 1: Initial setup and onboarding\nPhase 2: Implementation\nPhase 3: Review and optimization',
      paymentTerms: 'Payment Schedule:\n• Initial deposit: [X]% upon agreement signing\n• Milestone payments: [Details]\n• Final payment: Upon completion',
      termsAndConditions: '1. This proposal is valid for 30 days from the date of issue.\n2. All fees are quoted in USD.\n3. Services will commence upon receipt of signed agreement and initial payment.\n4. Either party may terminate with 30 days written notice.',
    },
  });

  const handleSubmit = (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId || !formData.service || !formData.fee) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would normally save to backend/database
    const proposalData = {
      ...formData,
      status: sendImmediately ? 'Sent' : 'Draft',
      sentDate: sendImmediately ? new Date().toISOString() : undefined,
    };
    
    console.log('New proposal data:', proposalData);
    
    toast.success(sendImmediately ? 'Proposal sent successfully!' : 'Proposal saved as draft!');
    router.push('/proposals');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/proposals')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Create New Proposal</h1>
            <p className="text-slate-600">Draft a service proposal with editable PDF content</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            sessionStorage.setItem('proposalFormData', JSON.stringify(formData));
            router.push('/proposals/preview');
          }}
        >
          <Eye className="w-4 h-4" />
          Preview PDF
        </Button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the client and service details</CardDescription>
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
                  {selectedClient && (
                    <p className="text-xs text-slate-500">
                      Status: {selectedClient.status} | KYC: {selectedClient.kycStatus}
                    </p>
                  )}
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="service">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.service}
                    onValueChange={(value: string) => handleChange('service', value)}
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

                {/* Fee and Validity */}
                <div className="grid gap-4 sm:grid-cols-2">
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
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validity">Proposal Valid For (days)</Label>
                    <Input
                      id="validity"
                      type="number"
                      placeholder="30"
                      value={formData.validity}
                      onChange={(e) => handleChange('validity', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PDF Content Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Document Content</CardTitle>
                <CardDescription>Edit the content that will appear in the PDF</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="introduction" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                    <TabsTrigger value="introduction">Introduction</TabsTrigger>
                    <TabsTrigger value="service">Service</TabsTrigger>
                    <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                  </TabsList>

                  <TabsContent value="introduction" className="space-y-2 mt-4">
                    <Label htmlFor="introduction">Introduction</Label>
                    <Textarea
                      id="introduction"
                      placeholder="Opening message to the client..."
                      rows={8}
                      value={formData.content.introduction}
                      onChange={(e) => handleContentChange('introduction', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="service" className="space-y-2 mt-4">
                    <Label htmlFor="serviceDetails">Service Details</Label>
                    <Textarea
                      id="serviceDetails"
                      placeholder="Detailed description of the service offering..."
                      rows={8}
                      value={formData.content.serviceDetails}
                      onChange={(e) => handleContentChange('serviceDetails', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="deliverables" className="space-y-2 mt-4">
                    <Label htmlFor="deliverables">Deliverables</Label>
                    <Textarea
                      id="deliverables"
                      placeholder="List of deliverables..."
                      rows={8}
                      value={formData.content.deliverables}
                      onChange={(e) => handleContentChange('deliverables', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-2 mt-4">
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Textarea
                      id="timeline"
                      placeholder="Project phases and timeline..."
                      rows={8}
                      value={formData.content.timeline}
                      onChange={(e) => handleContentChange('timeline', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="payment" className="space-y-2 mt-4">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Textarea
                      id="paymentTerms"
                      placeholder="Payment schedule and terms..."
                      rows={8}
                      value={formData.content.paymentTerms}
                      onChange={(e) => handleContentChange('paymentTerms', e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="terms" className="space-y-2 mt-4">
                    <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                    <Textarea
                      id="termsAndConditions"
                      placeholder="Legal terms and conditions..."
                      rows={8}
                      value={formData.content.termsAndConditions}
                      onChange={(e) => handleContentChange('termsAndConditions', e.target.value)}
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
                <CardTitle>Proposal Status</CardTitle>
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
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
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
                  Send to Client
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
                  onClick={() => router.push('/proposals')}
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
                    <p className="text-slate-600">Country</p>
                    <p>{selectedClient.country}</p>
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
