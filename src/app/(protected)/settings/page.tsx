"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenseCategories } from "@/contexts/ExpenseCategoriesContext";
import {
  Check,
  Copy,
  PenTool,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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
  const {
    categories: expenseCategories,
    addCategory,
    removeCategory,
  } = useExpenseCategories();
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [signature, setSignature] = useState<string | null>(
    null,
  );
  const [wallets, setWallets] = useState<WalletAddress[]>([
    {
      id: "1",
      cryptocurrency: "USDT (TRC20)",
      address: "TPgazse1uRb4DAAqS6Dg4SF62BMyUae97Y",
      label: "Primary USDT Wallet",
      isPrimary: true,
    },
  ]);

  const [newWallet, setNewWallet] = useState({
    cryptocurrency: "",
    address: "",
    label: "",
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const handleAddWallet = () => {
    if (
      !newWallet.cryptocurrency ||
      !newWallet.address ||
      !newWallet.label
    ) {
      toast.error("Please fill in all wallet fields");
      return;
    }

    const wallet: WalletAddress = {
      id: Math.random().toString(36).substr(2, 9),
      cryptocurrency: newWallet.cryptocurrency,
      address: newWallet.address,
      label: newWallet.label,
      isPrimary: wallets.length === 0,
    };

    setWallets([...wallets, wallet]);
    setNewWallet({
      cryptocurrency: "",
      address: "",
      label: "",
    });
    toast.success("Wallet added successfully");
  };

  const handleDeleteWallet = (id: string) => {
    setWallets(wallets.filter((w) => w.id !== id));
    toast.success("Wallet removed");
  };

  const handleSetPrimary = (id: string) => {
    setWallets(
      wallets.map((w) => ({
        ...w,
        isPrimary: w.id === id,
      })),
    );
    toast.success("Primary wallet updated");
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (
      expenseCategories.some(
        (cat) =>
          cat.name.toLowerCase() ===
          newCategory.trim().toLowerCase(),
      )
    ) {
      toast.error("Category already exists");
      return;
    }

    addCategory(newCategory);
    setNewCategory("");
    toast.success("Expense category added successfully");
  };

  const handleDeleteCategory = (id: string) => {
    const category = expenseCategories.find((c) => c.id === id);
    if (category?.isDefault) {
      toast.error("Cannot delete default categories");
      return;
    }
    removeCategory(id);
    toast.success("Category removed");
  };

  const handleSignatureUpload = (
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

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignature(reader.result as string);
      toast.success("Signature uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setSignature(null);
    if (signatureInputRef.current) {
      signatureInputRef.current.value = "";
    }
    toast.success("Signature removed");
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1>Settings</h1>
        <p className="text-slate-600 mt-1">
          Manage your account and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
          </TabsTrigger>
          {user?.role === "admin" && (
            <>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="payment">
                Payment Details
              </TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  defaultValue="UTC-5 (Eastern Time)"
                />
              </div>
              <Button>Save Changes</Button>
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
                      onClick={handleRemoveSignature}
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">
                  Current Password
                </Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Confirm New Password
                </Label>
                <Input id="confirm" type="password" />
              </div>
              <Button>Update Password</Button>
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
                  defaultChecked={user?.twoFactorEnabled}
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

        <TabsContent
          value="notifications"
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "New client added",
                  description:
                    "Get notified when a new client is added",
                },
                {
                  label: "Proposal accepted",
                  description:
                    "Get notified when a client accepts a proposal",
                },
                {
                  label: "Invoice overdue",
                  description:
                    "Get notified about overdue invoices",
                },
                {
                  label: "KYC submission",
                  description:
                    "Get notified when clients submit KYC documents",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch defaultChecked />
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
                  label: "Activity log",
                  description:
                    "Important system events and changes",
                },
                {
                  label: "Security alerts",
                  description:
                    "Suspicious activity and login attempts",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <>
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      defaultValue="Forex Agency Pro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">
                      License Number
                    </Label>
                    <Input
                      id="license"
                      placeholder="FCA12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="123 Finance St, New York, NY 10001"
                    />
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportPhone">
                        Support Phone
                      </Label>
                      <Input
                        id="supportPhone"
                        type="tel"
                        placeholder="+1 555-0000"
                      />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Addresses</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Manage cryptocurrency wallet addresses for
                    receiving payments
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Existing Wallets */}
                  <div className="space-y-3">
                    {wallets.map((wallet) => (
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
                                handleDeleteWallet(wallet.id)
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

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="walletLabel">
                          Wallet Label *
                        </Label>
                        <Input
                          id="walletLabel"
                          placeholder="e.g., Primary USDT Wallet"
                          value={newWallet.label}
                          onChange={(e) =>
                            setNewWallet({
                              ...newWallet,
                              label: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cryptocurrency">
                          Cryptocurrency *
                        </Label>
                        <Select
                          value={newWallet.cryptocurrency}
                          onValueChange={(value: string) =>
                            setNewWallet({
                              ...newWallet,
                              cryptocurrency: value,
                            })
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="walletAddress">
                          Wallet Address *
                        </Label>
                        <Input
                          id="walletAddress"
                          placeholder="Enter wallet address"
                          value={newWallet.address}
                          onChange={(e) =>
                            setNewWallet({
                              ...newWallet,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddWallet}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentInstructions">
                      Custom Payment Instructions
                    </Label>
                    <textarea
                      id="paymentInstructions"
                      className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      placeholder="Add any special instructions for clients making payments..."
                      defaultValue="Please ensure you send the exact amount stated in the invoice. Include your invoice number in the transaction memo if possible."
                    />
                  </div>
                  <Button>Save Instructions</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Catalog</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Managed Account Service",
                    "Account Setup",
                    "Premium Account Setup",
                    "VIP Account Management",
                  ].map((service, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="text-sm">{service}</span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    Add Service
                  </Button>
                </CardContent>
              </Card>

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
                    {expenseCategories.map((category) => (
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
                              handleDeleteCategory(category.id)
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Category */}
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-sm">
                      Add New Category
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Marketing, Legal, Training"
                        value={newCategory}
                        onChange={(e) =>
                          setNewCategory(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddCategory();
                          }
                        }}
                      />
                      <Button
                        onClick={handleAddCategory}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Tax & Commission Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vat">VAT Rate (%)</Label>
                    <Input
                      id="vat"
                      type="number"
                      defaultValue="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ibCommission">
                      Default IB Commission (%)
                    </Label>
                    <Input
                      id="ibCommission"
                      type="number"
                      defaultValue="10"
                    />
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}