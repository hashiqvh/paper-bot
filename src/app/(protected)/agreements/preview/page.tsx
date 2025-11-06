"use client";

import { Button } from '@/components/ui/button';
import { mockClients } from '@/lib/mockData';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgreementPreview() {
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Get formData from sessionStorage
    const savedFormData = typeof window !== 'undefined' 
      ? sessionStorage.getItem('agreementFormData')
      : null;

    if (!savedFormData) {
      router.push('/agreements/new');
      return;
    }

    try {
      const parsed = JSON.parse(savedFormData);
      setFormData(parsed);
    } catch (error) {
      router.push('/agreements/new');
    }
  }, [router]);

  if (!formData) {
    return null;
  }

  const selectedClient = mockClients.find(c => c.id === formData.clientId);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/agreements/new')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Agreement Preview</h1>
              <p className="text-sm text-slate-600">Review before sending for signature</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button className="gap-2">
              <Send className="w-4 h-4" />
              Send for Signature
            </Button>
          </div>
        </div>
      </div>

      {/* Agreement-style Preview */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-12 space-y-8">
          {/* Header */}
          <div className="border-b pb-6 text-center">
            <h1 className="text-3xl mb-2">SERVICE AGREEMENT</h1>
            <p className="text-sm text-slate-600">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Parties */}
          <div>
            <h2 className="text-lg mb-3">PARTIES</h2>
            <p className="text-sm mb-4">This Service Agreement is entered into between:</p>
            <div className="bg-slate-50 p-6 rounded-lg space-y-2">
              <p className="text-sm"><strong>Service Provider:</strong> [Your Company Name]</p>
              {selectedClient && (
                <>
                  <p className="text-sm"><strong>Client:</strong> {selectedClient.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedClient.email}</p>
                  <p className="text-sm"><strong>Country:</strong> {selectedClient.country}</p>
                </>
              )}
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h2 className="text-lg mb-3">SERVICE DETAILS</h2>
            <div className="bg-slate-50 p-6 rounded-lg space-y-2">
              <p className="text-sm"><strong>Service Type:</strong> {formData.service || 'Not specified'}</p>
              <p className="text-sm"><strong>Service Fee:</strong> ${formData.fee ? Number(formData.fee).toLocaleString() : '0'} USD</p>
              {formData.startDate && (
                <p className="text-sm"><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
              )}
              {formData.endDate && (
                <p className="text-sm"><strong>End Date:</strong> {new Date(formData.endDate).toLocaleDateString()}</p>
              )}
              {formData.proposalId && (
                <p className="text-sm"><strong>Related Proposal:</strong> {formData.proposalId}</p>
              )}
            </div>
          </div>

          {/* Content Sections */}
          {formData.content?.scope && (
            <div>
              <h2 className="text-lg mb-3">1. SCOPE OF SERVICES</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{formData.content.scope}</p>
            </div>
          )}

          {formData.content?.terms && (
            <div>
              <h2 className="text-lg mb-3">2. GENERAL TERMS</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{formData.content.terms}</p>
            </div>
          )}

          {formData.content?.obligations && (
            <div>
              <h2 className="text-lg mb-3">3. OBLIGATIONS</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{formData.content.obligations}</p>
            </div>
          )}

          {formData.content?.termination && (
            <div>
              <h2 className="text-lg mb-3">4. TERMINATION</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{formData.content.termination}</p>
            </div>
          )}

          {/* Signature Section */}
          <div className="border-t pt-8 mt-12">
            <h2 className="text-lg mb-6">SIGNATURES</h2>
            <p className="text-sm mb-6">
              By signing below, both parties acknowledge and agree to all terms and conditions outlined in this agreement.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-slate-600 mb-4">Client Signature:</p>
                <div className="border-b border-slate-300 h-12"></div>
                <p className="text-xs text-slate-500 mt-2">Date: __________</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-4">Service Provider:</p>
                <div className="border-b border-slate-300 h-12"></div>
                <p className="text-xs text-slate-500 mt-2">Date: __________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 border-t pt-6 mt-8">
            <p>This agreement is legally binding upon signature by both parties.</p>
            <p className="mt-1">© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
