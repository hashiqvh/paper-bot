"use client";

import { Button } from '@/components/ui/button';
import { useProposal } from '@/hooks/useProposals';
import { ArrowLeft, Download, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface ProposalPreviewProps {
  params: Promise<{ id: string }>;
}

export default function ProposalPreview({ params }: ProposalPreviewProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading, error } = useProposal(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load proposal</p>
          <Button onClick={() => router.push('/proposals')}>
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  const proposal = data.proposal;
  const selectedClient = proposal.client;

  // Parse content if it's stored as JSON string in notes
  let content: any = {};
  try {
    if (proposal.notes) {
      const parsed = JSON.parse(proposal.notes);
      if (parsed && typeof parsed === 'object' && parsed.content) {
        content = parsed.content;
      }
    }
  } catch (e) {
    // If parsing fails or notes doesn't contain JSON, use default structure
    content = {};
  }

  // Calculate validity days from validUntil date
  const validityDays = proposal.validUntil
    ? Math.ceil(
        (new Date(proposal.validUntil).getTime() - new Date(proposal.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 30;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/proposals')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl">Proposal Preview</h1>
              <p className="text-sm text-slate-600">Review proposal details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            {proposal.status === 'DRAFT' && (
              <Button className="gap-2">
                <Send className="w-4 h-4" />
                Send to Client
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* PDF-style Preview */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-12 space-y-8">
          {/* Header */}
          <div className="border-b pb-6">
            <h1 className="text-3xl mb-2">SERVICE PROPOSAL</h1>
            <p className="text-sm text-slate-600">
              Proposal Date: {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
            {proposal.validUntil && (
              <p className="text-sm text-slate-600">
                Valid Until: {new Date(proposal.validUntil).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Client Information */}
          {selectedClient && (
            <div className="bg-slate-50 p-6 rounded-lg space-y-2">
              <h2 className="text-lg mb-3">PREPARED FOR</h2>
              <p className="text-sm"><strong>Client Name:</strong> {selectedClient.name}</p>
              <p className="text-sm"><strong>Email:</strong> {selectedClient.email}</p>
              {selectedClient.country && (
                <p className="text-sm"><strong>Country:</strong> {selectedClient.country}</p>
              )}
            </div>
          )}

          {/* Service & Fee */}
          <div className="bg-slate-50 p-6 rounded-lg space-y-2">
            <h2 className="text-lg mb-3">SERVICE OVERVIEW</h2>
            <p className="text-sm"><strong>Service Type:</strong> {proposal.service || 'Not specified'}</p>
            <p className="text-sm"><strong>Proposed Fee:</strong> ${proposal.fee ? proposal.fee.toLocaleString() : '0'} USD</p>
          </div>

          {/* Introduction */}
          {content.introduction && (
            <div>
              <h2 className="text-lg mb-3">1. INTRODUCTION</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.introduction}</p>
            </div>
          )}

          {/* Service Details */}
          {content.serviceDetails && (
            <div>
              <h2 className="text-lg mb-3">2. SERVICE DETAILS</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.serviceDetails}</p>
            </div>
          )}

          {/* Deliverables */}
          {content.deliverables && (
            <div>
              <h2 className="text-lg mb-3">3. DELIVERABLES</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.deliverables}</p>
            </div>
          )}

          {/* Timeline */}
          {content.timeline && (
            <div>
              <h2 className="text-lg mb-3">4. PROJECT TIMELINE</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.timeline}</p>
            </div>
          )}

          {/* Payment Terms */}
          {content.paymentTerms && (
            <div>
              <h2 className="text-lg mb-3">5. PAYMENT TERMS</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.paymentTerms}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          {content.termsAndConditions && (
            <div>
              <h2 className="text-lg mb-3">6. TERMS AND CONDITIONS</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{content.termsAndConditions}</p>
            </div>
          )}

          {/* Notes */}
          {proposal.notes && (
            <div className="bg-slate-50 p-6 rounded-lg">
              <h2 className="text-lg mb-3">NOTES</h2>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{proposal.notes}</p>
            </div>
          )}

          {/* Acceptance Section */}
          <div className="border-t pt-8 mt-12">
            <h2 className="text-lg mb-6">ACCEPTANCE</h2>
            <p className="text-sm mb-6">
              By signing below, you agree to the terms outlined in this proposal.
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
            <p>This proposal is confidential and intended solely for the use of the recipient.</p>
            <p className="mt-1">© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

