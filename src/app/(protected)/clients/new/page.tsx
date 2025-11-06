'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateClient } from '@/hooks/useClients';
import { clientSchema } from '@/lib/validations/clients';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import countries from 'world-countries';

export default function NewClient() {
  const router = useRouter();
  const createClientMutation = useCreateClient();

  // Get sorted list of countries
  const countryOptions = useMemo(() => {
    return countries
      .map((country) => ({
        value: country.name.common,
        label: country.name.common,
        flag: country.flag,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const form = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      country: '',
      status: 'LEAD' as const,
      kycStatus: 'PENDING' as const,
      accountType: 'Client',
      notes: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createClientMutation.mutateAsync(data);
      toast.success('Client added successfully!');
      router.push('/clients');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client');
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/clients')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Add New Client</h1>
            <p className="text-slate-600">Create a new client record</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Enter the basic details of the new client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name and Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone and Country */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    {...form.register('phone')}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Combobox
                    options={countryOptions}
                    value={form.watch('country')}
                    onValueChange={(value) => form.setValue('country', value)}
                    placeholder="Select a country"
                    searchPlaceholder="Search countries..."
                    emptyText="No country found."
                  />
                  {form.formState.errors.country && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the client..."
                  rows={4}
                  {...form.register('notes')}
                />
                {form.formState.errors.notes && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.notes.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Status</CardTitle>
                <CardDescription>Set client status and KYC verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Client Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value: 'LEAD' | 'VERIFIED' | 'ACTIVE' | 'SUSPENDED') =>
                      form.setValue('status', value)
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {/* KYC Status */}
                <div className="space-y-2">
                  <Label htmlFor="kycStatus">KYC Status</Label>
                  <Select
                    value={form.watch('kycStatus')}
                    onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED') =>
                      form.setValue('kycStatus', value)
                    }
                  >
                    <SelectTrigger id="kycStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.kycStatus && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.kycStatus.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={createClientMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                  {createClientMutation.isPending ? 'Saving...' : 'Save Client'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/clients')}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
