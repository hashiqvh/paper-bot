import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockClients, mockExpenses, mockInvoices } from '@/lib/mockData';
import { AlertCircle, ArrowDownRight, ArrowUpRight, DollarSign, TrendingUp, Users } from 'lucide-react';

export function AdminDashboard() {
  const activeClients = mockClients.filter(c => c.status === 'Active').length;
  const totalClients = mockClients.length;
  const paidInvoices = mockInvoices.filter(i => i.status === 'Paid');
  const monthlyRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = monthlyRevenue - totalExpenses;
  const pendingInvoices = mockInvoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length;

  const kpiCards = [
    {
      title: 'Active Clients',
      value: activeClients,
      total: totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      positive: true,
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+23%',
      positive: true,
    },
    {
      title: 'Net Profit',
      value: `$${netProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+8%',
      positive: true,
    },
    {
      title: 'Pending Invoices',
      value: pendingInvoices,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '-2',
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your Forex agency performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-slate-600">
                  {kpi.title}
                </CardTitle>
                <div className={`${kpi.bgColor} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{kpi.value}</div>
                {kpi.total && (
                  <p className="text-xs text-slate-500 mt-1">of {kpi.total} total</p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  {kpi.positive ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-xs ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </span>
                  <span className="text-xs text-slate-500">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockClients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </div>
                  <Badge variant={
                    client.status === 'Active' ? 'default' :
                    client.status === 'Verified' ? 'secondary' :
                    client.status === 'Lead' ? 'outline' :
                    'destructive'
                  }>
                    {client.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{invoice.clientName}</p>
                    <p className="text-xs text-slate-500">{invoice.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">${invoice.total}</p>
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

        {/* Client Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['Active', 'Verified', 'Lead', 'Suspended'].map((status) => {
                const count = mockClients.filter(c => c.status === status).length;
                const percentage = (count / totalClients) * 100;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{status}</span>
                      <span className="text-sm">{count} clients</span>
                    </div>
                    <Progress value={percentage} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-slate-600">Total Revenue</span>
                <span className="text-green-600">${monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-slate-600">Total Expenses</span>
                <span className="text-red-600">-${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Net Profit</span>
                <span className="text-lg text-green-600">${netProfit.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-slate-600">Profit Margin</span>
                  <span>{((netProfit / monthlyRevenue) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(netProfit / monthlyRevenue) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
