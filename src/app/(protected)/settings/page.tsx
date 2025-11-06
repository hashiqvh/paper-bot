"use client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCompany,
  useCreateExpenseCategory,
  useCreateService,
  useCreateWallet,
  useDeleteExpenseCategory,
  useDeleteService,
  useDeleteSignature,
  useDeleteWallet,
  useExpenseCategories,
  useNotificationPreferences,
  useProfile,
  useServices,
  useSmtpSettings,
  useSystemSettings,
  useUpdate2FA,
  useUpdateCompany,
  useUpdateExpenseCategory,
  useUpdateNotificationPreferences,
  useUpdatePassword,
  useUpdateProfile,
  useUpdateService,
  useUpdateSmtpSettings,
  useUpdateSystemSettings,
  useUpdateWallet,
  useUploadSignature,
  useWallets,
} from "@/hooks/useSettings";
import {
  companySchema,
  passwordSchema,
  profileSchema,
  serviceSchema,
  smtpSettingsSchema,
  systemSettingsSchema,
  walletSchema,
  type CompanyData,
  type NotificationPreferencesData,
  type PasswordData,
  type ProfileData,
  type ServiceData,
  type SmtpSettingsData,
  type SystemSettingsData,
  type WalletData,
} from "@/lib/validations/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  PenTool,
  Plus,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface WalletAddress {
  id: string;
  cryptocurrency: string;
  address: string;
  label: string;
  isPrimary: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // API Hooks
  const { data: profileData } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const update2FAMutation = useUpdate2FA();
  const { data: companyData, refetch: refetchCompany } = useCompany();
  const updateCompanyMutation = useUpdateCompany();
  const { data: walletsData, refetch: refetchWallets } = useWallets();
  const createWalletMutation = useCreateWallet();
  const deleteWalletMutation = useDeleteWallet();
  const updateWalletMutation = useUpdateWallet();
  const { data: notificationPreferencesData, refetch: refetchNotifications } = useNotificationPreferences();
  const updateNotificationPreferencesMutation = useUpdateNotificationPreferences();
  const { data: systemSettingsData, refetch: refetchSystemSettings } = useSystemSettings();
  const updateSystemSettingsMutation = useUpdateSystemSettings();
  const uploadSignatureMutation = useUploadSignature();
  const deleteSignatureMutation = useDeleteSignature();
  const { data: servicesData, refetch: refetchServices } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const { data: expenseCategoriesData, refetch: refetchExpenseCategories } = useExpenseCategories();
  const createExpenseCategoryMutation = useCreateExpenseCategory();
  const updateExpenseCategoryMutation = useUpdateExpenseCategory();
  const deleteExpenseCategoryMutation = useDeleteExpenseCategory();
  const { data: smtpSettingsData, refetch: refetchSmtpSettings } = useSmtpSettings();
  const updateSmtpSettingsMutation = useUpdateSmtpSettings();

  // Forms
  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      timezone: "UTC",
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const companyForm = useForm<CompanyData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      address: "",
      supportEmail: "",
      supportPhone: "",
    },
  });

  const walletForm = useForm<WalletData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      label: "",
      cryptocurrency: "",
      address: "",
      isPrimary: false,
    },
    mode: "onChange",
  });


  const systemSettingsForm = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      taxEnabled: false,
      vatRate: 20,
    },
  });

  const serviceForm = useForm<ServiceData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  const smtpSettingsForm = useForm<SmtpSettingsData>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: "",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromEmail: "",
      fromName: "",
    },
  });

  // Load data when component mounts
  useEffect(() => {
    if (profileData?.user) {
      profileForm.reset({
        name: profileData.user.name,
        email: profileData.user.email,
        phone: profileData.user.phone || "",
        timezone: profileData.user.timezone || "UTC",
      });
    }
  }, [profileData, profileForm]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      refetchCompany();
      refetchWallets();
      refetchSystemSettings();
      refetchSmtpSettings();
    }
    refetchNotifications();
  }, [user?.role, refetchCompany, refetchWallets, refetchSystemSettings, refetchSmtpSettings, refetchNotifications]);

  useEffect(() => {
    if (companyData?.company) {
      companyForm.reset({
        name: companyData.company.name,
        licenseNumber: companyData.company.licenseNumber || "",
        address: companyData.company.address || "",
        supportEmail: companyData.company.supportEmail || "",
        supportPhone: companyData.company.supportPhone || "",
      });
    }
  }, [companyData, companyForm]);


  useEffect(() => {
    if (systemSettingsData?.settings) {
      const settings = systemSettingsData.settings;
      const enabled = settings.taxEnabled ?? false;
      setTaxEnabled(enabled);
      systemSettingsForm.reset({
        taxEnabled: enabled,
        vatRate: enabled ? (settings.vatRate ?? 20) : undefined,
      });
    }
  }, [systemSettingsData, systemSettingsForm]);

  useEffect(() => {
    if (notificationPreferencesData?.preferences) {
      // Notification preferences are handled by Switch components directly
    }
  }, [notificationPreferencesData]);

  useEffect(() => {
    if (smtpSettingsData?.settings) {
      const settings = smtpSettingsData.settings;
      smtpSettingsForm.reset({
        host: settings.host || "",
        port: settings.port || 587,
        secure: settings.secure ?? true,
        username: settings.username || "",
        password: "", // Don't populate password field
        fromEmail: settings.fromEmail || "",
        fromName: settings.fromName || "",
      });
    }
  }, [smtpSettingsData, smtpSettingsForm]);

  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    // Sync signature with API data
    if (profileData?.user) {
      setSignature(profileData.user.signature || null);
    }
  }, [profileData]);

  const wallets = walletsData?.wallets || [];
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [passwordSuccessDialogOpen, setPasswordSuccessDialogOpen] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);
  const [deleteWalletDialogOpen, setDeleteWalletDialogOpen] = useState(false);
  const [walletToDelete, setWalletToDelete] = useState<string | null>(null);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteServiceDialogOpen, setDeleteServiceDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);
  const [deleteSignatureDialogOpen, setDeleteSignatureDialogOpen] = useState(false);

  const handleAddWallet = async (data: WalletData) => {
    // Clear previous messages
    setWalletError(null);
    setWalletSuccess(null);

    try {
      await createWalletMutation.mutateAsync({
        ...data,
        isPrimary: wallets.length === 0,
      });
      walletForm.reset();
      setWalletSuccess("Wallet added successfully");
      toast.success("Wallet added successfully");
      // Clear success message after 3 seconds
      setTimeout(() => setWalletSuccess(null), 3000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add wallet";
      setWalletError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteWalletClick = (id: string) => {
    setWalletToDelete(id);
    setDeleteWalletDialogOpen(true);
  };

  const handleDeleteWallet = async () => {
    if (!walletToDelete) return;

    // Clear previous messages
    setWalletError(null);
    setWalletSuccess(null);

    try {
      await deleteWalletMutation.mutateAsync(walletToDelete);
      setWalletSuccess("Wallet removed successfully");
      toast.success("Wallet removed");
      setDeleteWalletDialogOpen(false);
      setWalletToDelete(null);
      // Clear success message after 3 seconds
      setTimeout(() => setWalletSuccess(null), 3000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete wallet";
      setWalletError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSetPrimary = async (id: string) => {
    // Clear previous messages
    setWalletError(null);
    setWalletSuccess(null);

    try {
      await updateWalletMutation.mutateAsync({
        id,
        data: { isPrimary: true },
      });
      setWalletSuccess("Primary wallet updated successfully");
      toast.success("Primary wallet updated");
      // Clear success message after 3 seconds
      setTimeout(() => setWalletSuccess(null), 3000);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update wallet";
      setWalletError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCategory = async () => {
    // Clear previous errors
    setCategoryError(null);

    // Validate empty input
    if (!newCategory.trim()) {
      setCategoryError("Please enter a category name");
      toast.error("Please enter a category name");
      return;
    }

    // Validate minimum length
    if (newCategory.trim().length < 2) {
      setCategoryError("Category name must be at least 2 characters");
      toast.error("Category name must be at least 2 characters");
      return;
    }

    // Validate maximum length
    if (newCategory.trim().length > 50) {
      setCategoryError("Category name must be less than 50 characters");
      toast.error("Category name must be less than 50 characters");
      return;
    }

    // Validate duplicate
    const categories = expenseCategoriesData?.categories || [];
    if (
      categories.some(
        (cat: any) =>
          cat.name.toLowerCase() ===
          newCategory.trim().toLowerCase(),
      )
    ) {
      setCategoryError("Category already exists");
      toast.error("Category already exists");
      return;
    }

    try {
      await createExpenseCategoryMutation.mutateAsync({
        name: newCategory.trim(),
      });
      setNewCategory("");
      setCategoryError(null);
      toast.success("Expense category added successfully");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to add category";
      setCategoryError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategoryClick = (id: string) => {
    const categories = expenseCategoriesData?.categories || [];
    const category = categories.find((c: any) => c.id === id);
    if (category?.isDefault) {
      toast.error("Cannot delete default categories");
      return;
    }
    setCategoryToDelete(id);
    setDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteExpenseCategoryMutation.mutateAsync(categoryToDelete);
      toast.success("Category removed");
      setDeleteCategoryDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleSignatureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Create preview and upload
    const reader = new FileReader();
    reader.onloadend = () => {
      // Show preview immediately
      setSignature(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadSignatureMutation.mutateAsync(file);
      // Update signature with file URL from API response
      if (result?.signature) {
        setSignature(result.signature);
      }
      toast.success("Signature uploaded successfully");
    } catch (error: any) {
      // Revert preview on error
      setSignature(profileData?.user?.signature || null);
      toast.error(error.message || "Failed to upload signature");
    }
  };

  const handleRemoveSignatureClick = () => {
    setDeleteSignatureDialogOpen(true);
  };

  const handleRemoveSignature = async () => {
    try {
      await deleteSignatureMutation.mutateAsync();
      // Clear signature state after successful deletion
      setSignature(null);
      if (signatureInputRef.current) {
        signatureInputRef.current.value = "";
      }
      toast.success("Signature removed");
      setDeleteSignatureDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to remove signature");
    }
  };

  const handleOpenServiceDialog = (service?: any) => {
    if (service) {
      setEditingService(service);
      serviceForm.reset({
        name: service.name,
        description: service.description || "",
        isActive: service.isActive ?? true,
      });
    } else {
      setEditingService(null);
      serviceForm.reset({
        name: "",
        description: "",
        isActive: true,
      });
    }
    setServiceDialogOpen(true);
  };

  const handleCloseServiceDialog = () => {
    setServiceDialogOpen(false);
    setEditingService(null);
    serviceForm.reset({
      name: "",
      description: "",
      isActive: true,
    });
  };

  const handleSubmitService = async (data: ServiceData) => {
    try {
      if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          data,
        });
        toast.success("Service updated successfully");
      } else {
        await createServiceMutation.mutateAsync(data);
        toast.success("Service created successfully");
      }
      handleCloseServiceDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to save service");
    }
  };

  return (
    <div className="space-y-6 w-full pb-6 ">
      <div>
        <h1>Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full overflow-visible">
        <TabsList className="overflow-visible">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
          </TabsTrigger>
          {user?.role === "ADMIN" && (
            <>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="payment">
                Payment Details
              </TabsTrigger>
              <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6 overflow-visible">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={profileForm.handleSubmit(async (data) => {
                  try {
                    await updateProfileMutation.mutateAsync(data);
                    toast.success("Profile updated successfully");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to update profile");
                  }
                })}
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-red-500 text-sm">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 555-0000"
                      {...profileForm.register("phone")}
                    />
                    {profileForm.formState.errors.phone && (
                      <p className="text-red-500 text-sm">
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="UTC"
                      {...profileForm.register("timezone")}
                    />
                    {profileForm.formState.errors.timezone && (
                      <p className="text-red-500 text-sm">
                        {profileForm.formState.errors.timezone.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="mt-4"
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Upload your signature to use in agreements,
                proposals, and official documents
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {signature ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-6 bg-slate-50">
                    <div className="flex items-center justify-center">
                      <img
                        src={signature}
                        alt="Digital Signature"
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        signatureInputRef.current?.click()
                      }
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Replace Signature
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRemoveSignatureClick}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() =>
                    signatureInputRef.current?.click()
                  }
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 transition-colors bg-slate-50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Click to upload your signature
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG or SVG (Max 2MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <input
                ref={signatureInputRef}
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="hidden"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <strong>Tip:</strong> For best results, use a
                  transparent background PNG with your
                  handwritten signature. You can sign on white
                  paper, scan it, and remove the background
                  using free tools like remove.bg
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 overflow-visible">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={passwordForm.handleSubmit(async (data) => {
                  try {
                    await updatePasswordMutation.mutateAsync(data);
                    passwordForm.reset();
                    setPasswordSuccessDialogOpen(true);
                  } catch (error: any) {
                    toast.error(error.message || "Failed to update password");
                  }
                })}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">
                      Current Password
                    </Label>
                    <Input
                      id="current"
                      type="password"
                      {...passwordForm.register("currentPassword")}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">New Password</Label>
                    <Input
                      id="new"
                      type="password"
                      {...passwordForm.register("newPassword")}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm"
                      type="password"
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={updatePasswordMutation.isPending}
                  className="mt-4"
                >
                  {updatePasswordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Enable 2FA</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add an extra layer of security to your
                    account
                  </p>
                </div>
                <Switch
                  checked={user?.twoFactorEnabled || false}
                  onCheckedChange={async (checked) => {
                    try {
                      await update2FAMutation.mutateAsync({ enabled: checked });
                      toast.success(
                        checked
                          ? "2FA enabled successfully"
                          : "2FA disabled successfully"
                      );
                    } catch (error: any) {
                      toast.error(error.message || "Failed to update 2FA");
                    }
                  }}
                />
              </div>
              {user?.twoFactorEnabled && (
                <Button variant="outline">Configure 2FA</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm">Current Session</p>
                    <p className="text-xs text-slate-500">
                      Last activity: Just now
                    </p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <Button variant="destructive" className="mt-4">
                Sign Out All Devices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Success Dialog */}
        <Dialog open={passwordSuccessDialogOpen} onOpenChange={setPasswordSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center">Password Updated Successfully</DialogTitle>
              <DialogDescription className="text-center">
                Your password has been updated successfully. Please use your new password for future logins.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button
                onClick={() => setPasswordSuccessDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent
          value="notifications"
          className="space-y-6 overflow-visible"
        >
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "newClientAdded",
                  label: "New client added",
                  description:
                    "Get notified when a new client is added",
                },
                {
                  key: "proposalAccepted",
                  label: "Proposal accepted",
                  description:
                    "Get notified when a client accepts a proposal",
                },
                {
                  key: "invoiceOverdue",
                  label: "Invoice overdue",
                  description:
                    "Get notified about overdue invoices",
                },
                {
                  key: "kycSubmission",
                  label: "KYC submission",
                  description:
                    "Get notified when clients submit KYC documents",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={
                      notificationPreferencesData?.preferences?.[
                        item.key as keyof typeof notificationPreferencesData.preferences
                      ] ?? true
                    }
                    onCheckedChange={async (checked) => {
                      try {
                        await updateNotificationPreferencesMutation.mutateAsync({
                          ...notificationPreferencesData?.preferences,
                          [item.key]: checked,
                        } as NotificationPreferencesData);
                        toast.success("Notification preferences updated");
                      } catch (error: any) {
                        toast.error(error.message || "Failed to update preferences");
                      }
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "activityLog",
                  label: "Activity log",
                  description:
                    "Important system events and changes",
                },
                {
                  key: "securityAlerts",
                  label: "Security alerts",
                  description:
                    "Suspicious activity and login attempts",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    checked={
                      notificationPreferencesData?.preferences?.[
                        item.key as keyof typeof notificationPreferencesData.preferences
                      ] ?? true
                    }
                    onCheckedChange={async (checked) => {
                      try {
                        await updateNotificationPreferencesMutation.mutateAsync({
                          ...notificationPreferencesData?.preferences,
                          [item.key]: checked,
                        } as NotificationPreferencesData);
                        toast.success("Notification preferences updated");
                      } catch (error: any) {
                        toast.error(error.message || "Failed to update preferences");
                      }
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "ADMIN" && (
          <>
            <TabsContent value="company" className="space-y-6 overflow-visible">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={companyForm.handleSubmit(async (data) => {
                      try {
                        await updateCompanyMutation.mutateAsync(data);
                        toast.success("Company profile updated successfully");
                      } catch (error: any) {
                        toast.error(error.message || "Failed to update company profile");
                      }
                    })}
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          {...companyForm.register("name")}
                        />
                        {companyForm.formState.errors.name && (
                          <p className="text-red-500 text-sm">
                            {companyForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="license">
                          License Number
                        </Label>
                        <Input
                          id="license"
                          placeholder="FCA12345678"
                          {...companyForm.register("licenseNumber")}
                        />
                        {companyForm.formState.errors.licenseNumber && (
                          <p className="text-red-500 text-sm">
                            {companyForm.formState.errors.licenseNumber.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Finance St, New York, NY 10001"
                          {...companyForm.register("address")}
                        />
                        {companyForm.formState.errors.address && (
                          <p className="text-red-500 text-sm">
                            {companyForm.formState.errors.address.message}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="support">
                            Support Email
                          </Label>
                          <Input
                            id="support"
                            type="email"
                            placeholder="support@company.com"
                            {...companyForm.register("supportEmail")}
                          />
                          {companyForm.formState.errors.supportEmail && (
                            <p className="text-red-500 text-sm">
                              {companyForm.formState.errors.supportEmail.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supportPhone">
                            Support Phone
                          </Label>
                          <Input
                            id="supportPhone"
                            type="tel"
                            placeholder="+1 555-0000"
                            {...companyForm.register("supportPhone")}
                          />
                          {companyForm.formState.errors.supportPhone && (
                            <p className="text-red-500 text-sm">
                              {companyForm.formState.errors.supportPhone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={updateCompanyMutation.isPending}
                      className="mt-4"
                    >
                      {updateCompanyMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6 overflow-visible">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Addresses</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Manage cryptocurrency wallet addresses for
                    receiving payments
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Success Alert */}
                  {walletSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
                      <AlertDescription className="text-green-700">
                        {walletSuccess}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Wallet Error Alert */}
                  {walletError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{walletError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Existing Wallets */}
                  <div className="space-y-3">
                    {wallets.map((wallet: any) => (
                      <div
                        key={wallet.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm">
                                {wallet.label}
                              </p>
                              {wallet.isPrimary && (
                                <Badge
                                  variant="default"
                                  className="text-xs"
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mb-2">
                              {wallet.cryptocurrency}
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded break-all flex-1">
                                {wallet.address}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCopyAddress(
                                    wallet.address,
                                    wallet.id,
                                  )
                                }
                              >
                                {copiedId === wallet.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!wallet.isPrimary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSetPrimary(wallet.id)
                                }
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteWalletClick(wallet.id)
                              }
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {wallets.length === 0 && (
                      <div className="text-center py-8 text-slate-500">
                        <p>No wallet addresses added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Add New Wallet */}
                  <div className="pt-6 border-t space-y-4">
                    <h3 className="text-sm">Add New Wallet</h3>

                    <form
                      onSubmit={walletForm.handleSubmit((data) => {
                        handleAddWallet(data as WalletData);
                      })}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="walletLabel">
                            Wallet Label *
                          </Label>
                          <Input
                            id="walletLabel"
                            placeholder="e.g., Primary USDT Wallet"
                            {...walletForm.register("label")}
                          />
                          {walletForm.formState.errors.label && (
                            <p className="text-red-500 text-sm">
                              {walletForm.formState.errors.label.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cryptocurrency">
                            Cryptocurrency *
                          </Label>
                          <Select
                            value={walletForm.watch("cryptocurrency")}
                            onValueChange={(value: string) =>
                              walletForm.setValue("cryptocurrency", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select cryptocurrency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bitcoin (BTC)">
                                Bitcoin (BTC)
                              </SelectItem>
                              <SelectItem value="Ethereum (ETH)">
                                Ethereum (ETH)
                              </SelectItem>
                              <SelectItem value="USDT (TRC20)">
                                USDT (TRC20)
                              </SelectItem>
                              <SelectItem value="USDT (ERC20)">
                                USDT (ERC20)
                              </SelectItem>
                              <SelectItem value="USDC">
                                USDC
                              </SelectItem>
                              <SelectItem value="BNB">
                                BNB (Binance Coin)
                              </SelectItem>
                              <SelectItem value="Litecoin (LTC)">
                                Litecoin (LTC)
                              </SelectItem>
                              <SelectItem value="Ripple (XRP)">
                                Ripple (XRP)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {walletForm.formState.errors.cryptocurrency && (
                            <p className="text-red-500 text-sm">
                              {walletForm.formState.errors.cryptocurrency.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="walletAddress">
                            Wallet Address *
                          </Label>
                          <Input
                            id="walletAddress"
                            placeholder="Enter wallet address"
                            {...walletForm.register("address")}
                          />
                          {walletForm.formState.errors.address && (
                            <p className="text-red-500 text-sm">
                              {walletForm.formState.errors.address.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="gap-2 mt-4"
                        disabled={createWalletMutation.isPending}
                      >
                        <Plus className="w-4 h-4" />
                        {createWalletMutation.isPending
                          ? "Adding..."
                          : "Add Wallet"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="smtp" className="space-y-6 overflow-visible">
              <Card>
                <CardHeader>
                  <CardTitle>SMTP Configuration</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Configure your email server settings for sending emails
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={smtpSettingsForm.handleSubmit(async (data) => {
                      try {
                        await updateSmtpSettingsMutation.mutateAsync(data);
                        toast.success("SMTP settings updated successfully");
                      } catch (error: any) {
                        toast.error(error.message || "Failed to update SMTP settings");
                      }
                    })}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtpHost">SMTP Host *</Label>
                          <Input
                            id="smtpHost"
                            placeholder="smtp.gmail.com"
                            {...smtpSettingsForm.register("host")}
                          />
                          {smtpSettingsForm.formState.errors.host && (
                            <p className="text-red-500 text-sm">
                              {smtpSettingsForm.formState.errors.host.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtpPort">Port *</Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            placeholder="587"
                            {...smtpSettingsForm.register("port", {
                              valueAsNumber: true,
                            })}
                          />
                          {smtpSettingsForm.formState.errors.port && (
                            <p className="text-red-500 text-sm">
                              {smtpSettingsForm.formState.errors.port.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">Username *</Label>
                        <Input
                          id="smtpUsername"
                          placeholder="your-email@gmail.com"
                          {...smtpSettingsForm.register("username")}
                        />
                        {smtpSettingsForm.formState.errors.username && (
                          <p className="text-red-500 text-sm">
                            {smtpSettingsForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">
                          Password {!smtpSettingsData?.settings && "*"}
                        </Label>
                        <Input
                          id="smtpPassword"
                          type="password"
                          placeholder="Enter SMTP password"
                          {...smtpSettingsForm.register("password")}
                        />
                        {smtpSettingsForm.formState.errors.password && (
                          <p className="text-red-500 text-sm">
                            {smtpSettingsForm.formState.errors.password.message}
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          {smtpSettingsData?.settings 
                            ? "Leave blank to keep current password" 
                            : "Password is required for new SMTP settings"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="smtpSecure">Use Secure Connection (TLS/SSL)</Label>
                          <p className="text-xs text-slate-500 mt-1">
                            Enable for secure email transmission
                          </p>
                        </div>
                        <Switch
                          id="smtpSecure"
                          checked={smtpSettingsForm.watch("secure") ?? true}
                          onCheckedChange={(checked) =>
                            smtpSettingsForm.setValue("secure", checked)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="smtpFromEmail">From Email *</Label>
                          <Input
                            id="smtpFromEmail"
                            type="email"
                            placeholder="noreply@company.com"
                            {...smtpSettingsForm.register("fromEmail")}
                          />
                          {smtpSettingsForm.formState.errors.fromEmail && (
                            <p className="text-red-500 text-sm">
                              {smtpSettingsForm.formState.errors.fromEmail.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="smtpFromName">From Name *</Label>
                          <Input
                            id="smtpFromName"
                            placeholder="Company Name"
                            {...smtpSettingsForm.register("fromName")}
                          />
                          {smtpSettingsForm.formState.errors.fromName && (
                            <p className="text-red-500 text-sm">
                              {smtpSettingsForm.formState.errors.fromName.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={updateSmtpSettingsMutation.isPending}
                      className="mt-4"
                    >
                      {updateSmtpSettingsMutation.isPending
                        ? "Saving..."
                        : "Save SMTP Settings"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 overflow-hidden">
              <Card>
                <CardHeader>
                  <CardTitle>Service Catalog</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {servicesData?.services && servicesData.services.length > 0 ? (
                    servicesData.services.map((service: any) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium">{service.name}</span>
                          {service.description && (
                            <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!service.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenServiceDialog(service)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setServiceToDelete(service);
                              setDeleteServiceDialogOpen(true);
                            }}
                            disabled={deleteServiceMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>No services added yet</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleOpenServiceDialog()}
                  >
                    Add Service
                  </Button>
                </CardContent>
              </Card>

              {/* Service Dialog */}
              <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? "Edit Service" : "Add New Service"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingService
                        ? "Update the service information below."
                        : "Enter the details for the new service."}
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={serviceForm.handleSubmit((data) => handleSubmitService(data))}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="serviceName">Service Name *</Label>
                      <Input
                        id="serviceName"
                        placeholder="e.g., Managed Account Service"
                        {...serviceForm.register("name")}
                      />
                      {serviceForm.formState.errors.name && (
                        <p className="text-red-500 text-sm">
                          {serviceForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serviceDescription">Description</Label>
                      <textarea
                        id="serviceDescription"
                        className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none"
                        placeholder="Enter service description (optional)"
                        {...serviceForm.register("description")}
                      />
                      {serviceForm.formState.errors.description && (
                        <p className="text-red-500 text-sm">
                          {serviceForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="serviceActive">Active</Label>
                        <p className="text-xs text-slate-500 mt-1">
                          Enable or disable this service
                        </p>
                      </div>
                      <Switch
                        id="serviceActive"
                        checked={serviceForm.watch("isActive") ?? true}
                        onCheckedChange={(checked) =>
                          serviceForm.setValue("isActive", checked)
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseServiceDialog}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          createServiceMutation.isPending ||
                          updateServiceMutation.isPending
                        }
                      >
                        {createServiceMutation.isPending ||
                        updateServiceMutation.isPending
                          ? "Saving..."
                          : editingService
                          ? "Update Service"
                          : "Create Service"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Manage expense categories for tracking
                    business expenses
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Categories */}
                  <div className="space-y-2">
                    {expenseCategoriesData?.categories && expenseCategoriesData.categories.length > 0 ? (
                      expenseCategoriesData.categories.map((category: any) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {category.name}
                            </span>
                            {category.isDefault && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                Default
                              </Badge>
                            )}
                          </div>
                          {!category.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteCategoryClick(category.id)
                              }
                              disabled={deleteExpenseCategoryMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <p>No expense categories added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Add New Category */}
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm">
                      Add New Category
                    </h3>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Marketing, Legal, Training"
                          value={newCategory}
                          onChange={(e) => {
                            setNewCategory(e.target.value);
                            // Clear error when user starts typing
                            if (categoryError) {
                              setCategoryError(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddCategory();
                            }
                          }}
                          className={categoryError ? "border-red-500" : ""}
                        />
                        <Button
                          onClick={handleAddCategory}
                          className="gap-2"
                          disabled={createExpenseCategoryMutation.isPending}
                        >
                          <Plus className="w-4 h-4" />
                          {createExpenseCategoryMutation.isPending ? "Adding..." : "Add"}
                        </Button>
                      </div>
                      {categoryError && (
                        <Alert variant="destructive">
                          <AlertTitle>Validation Error</AlertTitle>
                          <AlertDescription>{categoryError}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Enable Tax</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Enable tax calculation for invoices
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Switch
                        checked={taxEnabled}
                        onCheckedChange={async (checked) => {
                          setTaxEnabled(checked);
                          systemSettingsForm.setValue("taxEnabled", checked);
                          if (!checked) {
                            systemSettingsForm.setValue("vatRate", undefined);
                          } else {
                            const currentVatRate = systemSettingsForm.getValues("vatRate");
                            systemSettingsForm.setValue("vatRate", currentVatRate || 20);
                          }
                          // Auto-save when toggling
                          try {
                            await updateSystemSettingsMutation.mutateAsync({
                              taxEnabled: checked,
                              vatRate: checked ? (systemSettingsForm.getValues("vatRate") || 20) : undefined,
                            });
                            toast.success(checked ? "Tax enabled" : "Tax disabled");
                          } catch (error: any) {
                            toast.error(error.message || "Failed to update tax settings");
                          }
                        }}
                      />
                    </div>
                  </div>
                  {taxEnabled && (
                    <form
                      onSubmit={systemSettingsForm.handleSubmit(async (data) => {
                        try {
                          await updateSystemSettingsMutation.mutateAsync(data);
                          toast.success("Tax settings updated successfully");
                        } catch (error: any) {
                          toast.error(error.message || "Failed to update system settings");
                        }
                      })}
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="vat">Tax Percentage (%)</Label>
                          <Input
                            id="vat"
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="Enter tax percentage"
                            {...systemSettingsForm.register("vatRate", {
                              valueAsNumber: true,
                            })}
                          />
                          {systemSettingsForm.formState.errors.vatRate && (
                            <p className="text-red-500 text-sm">
                              {systemSettingsForm.formState.errors.vatRate.message}
                            </p>
                          )}
                        </div>
                        <Button
                          type="submit"
                          disabled={updateSystemSettingsMutation.isPending}
                        >
                          {updateSystemSettingsMutation.isPending
                            ? "Saving..."
                            : "Save Settings"}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Delete Wallet Confirmation Dialog */}
      <Dialog open={deleteWalletDialogOpen} onOpenChange={setDeleteWalletDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Delete Wallet</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this wallet address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteWalletDialogOpen(false);
                setWalletToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWallet}
              disabled={deleteWalletMutation.isPending}
            >
              {deleteWalletMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Delete Category</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete this expense category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteCategoryDialogOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={deleteExpenseCategoryMutation.isPending}
            >
              {deleteExpenseCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Confirmation Dialog */}
      <Dialog open={deleteServiceDialogOpen} onOpenChange={setDeleteServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Delete Service</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteServiceDialogOpen(false);
                setServiceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!serviceToDelete) return;
                try {
                  await deleteServiceMutation.mutateAsync(serviceToDelete.id);
                  toast.success("Service deleted");
                  setDeleteServiceDialogOpen(false);
                  setServiceToDelete(null);
                } catch (error: any) {
                  toast.error(error.message || "Failed to delete service");
                }
              }}
              disabled={deleteServiceMutation.isPending}
            >
              {deleteServiceMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Signature Confirmation Dialog */}
      <Dialog open={deleteSignatureDialogOpen} onOpenChange={setDeleteSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Remove Signature</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to remove your digital signature? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteSignatureDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveSignature}
              disabled={deleteSignatureMutation.isPending}
            >
              {deleteSignatureMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}