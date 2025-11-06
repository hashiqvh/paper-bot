import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockClients, mockInvoices } from '@/lib/mockData';
import { DollarSign, FileText } from 'lucide-react';

export function ClientDashboard() {
  // In a real app, this would be filtered by the logged-in client
  const client = mockClients[0]; // Michael Roberts
  const myInvoices = mockInvoices.filter(inv => inv.clientId === client.id);

  return (
    <div className="space-y-6">
      <div>
        <h1>Welcome back, {client.name.split(' ')[0]}</h1>
        <p className="text-slate-600 mt-1">Here's your account overview</p>
      </div>

      {/* Account Status */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Account Status</p>
              <p className="text-2xl mt-2">{client.accountType} Account</p>
              <p className="text-sm opacity-90 mt-1">KYC: {client.kycStatus}</p>
            </div>
            <Badge variant="secondary" className="bg-white text-blue-600">
              {client.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Invoices</CardTitle>
          <Button variant="ghost" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myInvoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm">{invoice.service}</p>
                    <p className="text-xs text-slate-500">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">${invoice.total.toLocaleString()}</p>
                  <Badge 
                    variant={
                      invoice.status === 'Paid' ? 'default' :
                      invoice.status === 'Overdue' ? 'destructive' :
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>View Documents</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Pay Invoice</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Request Statement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
