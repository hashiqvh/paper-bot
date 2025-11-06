"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import { useCreateProposal } from "@/hooks/useProposals";
import { useServices } from "@/hooks/useSettings";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NewProposal() {
  const router = useRouter();
  const { data: clientsData } = useClients();
  const { data: servicesData } = useServices();
  const createProposalMutation = useCreateProposal();
  
  // Default form data
  const defaultFormData = {
    clientId: "",
    service: "",
    fee: "",
    validity: "30",
    notes: "",
    content: {
      introduction:
        "Dear [Client Name],\n\nThank you for your interest in our services. We are pleased to present this proposal for your consideration.",
      serviceDetails:
        "This proposal outlines our comprehensive service offering designed to meet your specific needs.",
      deliverables:
        "• Service deliverable 1\n• Service deliverable 2\n• Service deliverable 3",
      timeline:
        "Project Duration: [X] weeks/months\n\nPhase 1: Initial setup and onboarding\nPhase 2: Implementation\nPhase 3: Review and optimization",
      paymentTerms:
        "Payment Schedule:\n• Initial deposit: [X]% upon agreement signing\n• Milestone payments: [Details]\n• Final payment: Upon completion",
      termsAndConditions:
        "1. This proposal is valid for 30 days from the date of issue.\n2. All fees are quoted in USD.\n3. Services will commence upon receipt of signed agreement and initial payment.\n4. Either party may terminate with 30 days written notice.",
    },
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Restore form data from sessionStorage when component mounts (if coming back from preview)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isDataLoaded) {
      const savedFormData = sessionStorage.getItem('proposalFormData');
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);
          setFormData(parsed);
          setIsDataLoaded(true);
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      } else {
        setIsDataLoaded(true);
      }
    }
  }, [isDataLoaded]);

  const clients = clientsData?.clients || [];
  const services = servicesData?.services || [];
  
  // Debug: Log to understand the data structure
  if (servicesData && services.length === 0) {
    console.log('Services data structure:', servicesData);
  }
  
  // Filter active services - include services where isActive is true or undefined/null (default to active)
  const activeServices = services.filter((s: any) => {
    // If isActive is explicitly false, exclude it
    // Otherwise include it (true, undefined, null all mean active)
    return s.isActive !== false;
  });
  
  // If no active services but services exist, show all services for debugging
  const servicesToShow = activeServices.length > 0 ? activeServices : services;
  
  const selectedClient = clients.find((c) => c.id === formData.clientId);

  // Validation function
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.clientId) {
      errors.push("Client is required");
    }

    if (!formData.service) {
      errors.push("Service type is required");
    }

    if (!formData.fee) {
      errors.push("Service fee is required");
    } else {
      const fee = parseFloat(formData.fee);
      if (isNaN(fee) || fee <= 0) {
        errors.push("Fee must be a positive number");
      }
    }

    if (formData.validity) {
      const validity = parseInt(formData.validity);
      if (isNaN(validity) || validity <= 0) {
        errors.push("Validity period must be a positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validation = validateForm();
  const isFormValid = validation.isValid;

  const handleSubmit = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();

    const validationResult = validateForm();
    if (!validationResult.isValid) {
      toast.error(
        validationResult.errors[0] || "Please fill in all required fields"
      );
      return;
    }

    const fee = parseFloat(formData.fee);
    if (isNaN(fee) || fee <= 0) {
      toast.error("Fee must be a positive number");
      return;
    }

    try {
      // Calculate validUntil date
      const validUntil = formData.validity
        ? new Date(
            Date.now() + parseInt(formData.validity) * 24 * 60 * 60 * 1000
          )
        : undefined;

      // Store content in notes as JSON
      const notesWithContent = JSON.stringify({
        content: formData.content,
        notes: formData.notes || "",
      });

      await createProposalMutation.mutateAsync({
        clientId: formData.clientId,
        service: formData.service,
        fee,
        status: sendImmediately ? "SENT" : "DRAFT",
        validUntil: validUntil?.toISOString(),
        notes: notesWithContent,
      });

      // Clear sessionStorage after successful submission
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('proposalFormData');
      }

      toast.success(
        sendImmediately
          ? "Proposal sent successfully!"
          : "Proposal saved as draft!"
      );
      router.push("/proposals");
    } catch (error: any) {
      toast.error(error.message || "Failed to create proposal");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Save to sessionStorage for preview
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('proposalFormData', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        content: {
          ...prev.content,
          [field]: value,
        },
      };
      // Save to sessionStorage for preview
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('proposalFormData', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/proposals")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1>Create New Proposal</h1>
            <p className="text-slate-600">
              Draft a service proposal with editable PDF content
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            const validationResult = validateForm();
            if (!validationResult.isValid) {
              toast.error(
                validationResult.errors[0] ||
                  "Please fill in all required fields"
              );
              return;
            }
            sessionStorage.setItem(
              "proposalFormData",
              JSON.stringify(formData)
            );
            router.push("/proposals/preview");
          }}
          disabled={!isFormValid}
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
                <CardDescription>
                  Enter the client and service details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Selection */}
                <div className="space-y-2">
                  <Label htmlFor="clientId">
                    Select Client <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value: string) =>
                      handleChange("clientId", value)
                    }
                  >
                    <SelectTrigger
                      id="clientId"
                      className={!formData.clientId ? "border-red-300" : ""}
                    >
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} - {client.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.clientId && (
                    <p className="text-xs text-red-500">
                      Client selection is required
                    </p>
                  )}
                  {selectedClient && (
                    <p className="text-xs text-slate-500">
                      Status: {selectedClient.status} | KYC:{" "}
                      {selectedClient.kycStatus}
                    </p>
                  )}
                  {clients.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No clients available
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
                    onValueChange={(value: string) =>
                      handleChange("service", value)
                    }
                  >
                    <SelectTrigger
                      id="service"
                      className={!formData.service ? "border-red-300" : ""}
                    >
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesData?.isLoading ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500">
                          Loading services...
                        </div>
                      ) : servicesToShow.length > 0 ? (
                        servicesToShow.map((service: any) => (
                          <SelectItem key={service.id} value={service.name}>
                            {service.name}
                            {service.description && (
                              <span className="text-slate-500 ml-2">
                                - {service.description}
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : services.length > 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500">
                          No active services. {services.length} service(s) found
                          but all are inactive.
                        </div>
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-slate-500">
                          No services available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  {!formData.service && (
                    <p className="text-xs text-red-500">
                      Service type is required
                    </p>
                  )}
                  {activeServices.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No active services available. Please add services in
                      Settings.
                    </p>
                  )}
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
                      onChange={(e) => handleChange("fee", e.target.value)}
                      className={
                        !formData.fee || parseFloat(formData.fee) <= 0
                          ? "border-red-300"
                          : ""
                      }
                      required
                    />
                    {!formData.fee && (
                      <p className="text-xs text-red-500">
                        Service fee is required
                      </p>
                    )}
                    {formData.fee &&
                      (isNaN(parseFloat(formData.fee)) ||
                        parseFloat(formData.fee) <= 0) && (
                        <p className="text-xs text-red-500">
                          Fee must be a positive number
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validity">Proposal Valid For (days)</Label>
                    <Input
                      id="validity"
                      type="number"
                      placeholder="30"
                      value={formData.validity}
                      onChange={(e) => handleChange("validity", e.target.value)}
                      className={
                        formData.validity &&
                        (isNaN(parseInt(formData.validity)) ||
                          parseInt(formData.validity) <= 0)
                          ? "border-red-300"
                          : ""
                      }
                    />
                    {formData.validity &&
                      (isNaN(parseInt(formData.validity)) ||
                        parseInt(formData.validity) <= 0) && (
                        <p className="text-xs text-red-500">
                          Validity must be a positive number
                        </p>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PDF Content Sections */}
            <Card>
              <CardHeader>
                <CardTitle>Proposal Document Content</CardTitle>
                <CardDescription>
                  Edit the content that will appear in the PDF
                </CardDescription>
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
                      onChange={(e) =>
                        handleContentChange("introduction", e.target.value)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="service" className="space-y-2 mt-4">
                    <Label htmlFor="serviceDetails">Service Details</Label>
                    <Textarea
                      id="serviceDetails"
                      placeholder="Detailed description of the service offering..."
                      rows={8}
                      value={formData.content.serviceDetails}
                      onChange={(e) =>
                        handleContentChange("serviceDetails", e.target.value)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="deliverables" className="space-y-2 mt-4">
                    <Label htmlFor="deliverables">Deliverables</Label>
                    <Textarea
                      id="deliverables"
                      placeholder="List of deliverables..."
                      rows={8}
                      value={formData.content.deliverables}
                      onChange={(e) =>
                        handleContentChange("deliverables", e.target.value)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-2 mt-4">
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Textarea
                      id="timeline"
                      placeholder="Project phases and timeline..."
                      rows={8}
                      value={formData.content.timeline}
                      onChange={(e) =>
                        handleContentChange("timeline", e.target.value)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="payment" className="space-y-2 mt-4">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Textarea
                      id="paymentTerms"
                      placeholder="Payment schedule and terms..."
                      rows={8}
                      value={formData.content.paymentTerms}
                      onChange={(e) =>
                        handleContentChange("paymentTerms", e.target.value)
                      }
                    />
                  </TabsContent>

                  <TabsContent value="terms" className="space-y-2 mt-4">
                    <Label htmlFor="termsAndConditions">
                      Terms & Conditions
                    </Label>
                    <Textarea
                      id="termsAndConditions"
                      placeholder="Legal terms and conditions..."
                      rows={8}
                      value={formData.content.termsAndConditions}
                      onChange={(e) =>
                        handleContentChange(
                          "termsAndConditions",
                          e.target.value
                        )
                      }
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleSubmit(e as any, true);
                  }}
                  disabled={createProposalMutation.isPending || !isFormValid}
                >
                  <Send className="w-4 h-4" />
                  {createProposalMutation.isPending
                    ? "Sending..."
                    : "Send to Client"}
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={createProposalMutation.isPending || !isFormValid}
                >
                  <Save className="w-4 h-4" />
                  {createProposalMutation.isPending
                    ? "Saving..."
                    : "Save as Draft"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/proposals")}
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
