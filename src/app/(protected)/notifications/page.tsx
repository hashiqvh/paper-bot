import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CheckCheck, DollarSign, FileText, Users } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: "1",
      type: "client",
      title: "New client added",
      message:
        "Sofia Martinez has been added to your client list",
      time: "5 minutes ago",
      read: false,
      icon: Users,
    },
    {
      id: "2",
      type: "proposal",
      title: "Proposal accepted",
      message:
        "Michael Roberts accepted the Managed Account Service proposal",
      time: "1 hour ago",
      read: false,
      icon: CheckCheck,
    },
    {
      id: "3",
      type: "invoice",
      title: "Invoice overdue",
      message:
        "Invoice #INV4 for Michael Roberts is now overdue",
      time: "2 hours ago",
      read: false,
      icon: DollarSign,
    },
    {
      id: "4",
      type: "kyc",
      title: "KYC document submitted",
      message:
        "Emma Thompson submitted new KYC documents for review",
      time: "3 hours ago",
      read: true,
      icon: FileText,
    },
    {
      id: "5",
      type: "client",
      title: "Client status updated",
      message: "David Chen account status changed to Active",
      time: "Yesterday",
      read: true,
      icon: Users,
    },
    {
      id: "6",
      type: "invoice",
      title: "Payment received",
      message:
        "Payment of $2,400 received from Michael Roberts",
      time: "2 days ago",
      read: true,
      icon: DollarSign,
    },
  ];

  const unreadCount = notifications.filter(
    (n) => !n.read,
  ).length;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-slate-600 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
        <Button variant="outline">Mark all as read</Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <Card
              key={notification.id}
              className={notification.read ? "opacity-60" : ""}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div
                    className={`p-2 rounded-lg h-fit ${
                      notification.type === "client"
                        ? "bg-blue-50"
                        : notification.type === "proposal"
                          ? "bg-green-50"
                          : notification.type === "invoice"
                            ? "bg-orange-50"
                            : "bg-purple-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        notification.type === "client"
                          ? "text-blue-600"
                          : notification.type === "proposal"
                            ? "text-green-600"
                            : notification.type === "invoice"
                              ? "text-orange-600"
                              : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-sm">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge
                          variant="default"
                          className="ml-2"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button variant="ghost" size="sm">
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}