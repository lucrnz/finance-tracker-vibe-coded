import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { reportsApi, budgetsApi, transactionsApi } from '@/lib/api';
import { CATEGORY_COLORS } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(160, 60%, 45%)',
];

export function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['report', currentMonth, currentYear],
    queryFn: () => reportsApi.getMonthlyReport(currentMonth, currentYear),
  });

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', currentMonth, currentYear],
    queryFn: () => budgetsApi.getAll({ month: currentMonth, year: currentYear, limit: 100 }),
  });

  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions', 'expense', startDate, endDate],
    queryFn: () => transactionsApi.getAll({ 
      type: 'expense', 
      startDate, 
      endDate,
      limit: 100 
    }),
  });

  const pieChartData = useMemo(() => {
    if (!report?.expensesByCategory) return [];
    return Object.entries(report.expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [report?.expensesByCategory]);

  const barChartData = useMemo(() => {
    if (!report) return [];
    return [
      {
        name: format(currentDate, 'MMMM yyyy'),
        Income: report.totalIncome,
        Expenses: report.totalExpenses,
      },
    ];
  }, [report, currentDate]);

  const budgetProgress = useMemo(() => {
    if (!budgetsData?.budgets || !transactionsData?.transactions) return [];
    
    const expensesByCategory: Record<string, number> = {};
    transactionsData.transactions.forEach((t) => {
      if (t.type === 'expense') {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      }
    });

    return budgetsData.budgets.map((budget) => ({
      category: budget.category,
      budgeted: budget.amount,
      spent: expensesByCategory[budget.category] || 0,
      percentage: Math.min(
        ((expensesByCategory[budget.category] || 0) / budget.amount) * 100,
        100
      ),
    }));
  }, [budgetsData?.budgets, transactionsData?.transactions]);

  if (reportLoading || budgetsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your financial overview for {format(currentDate, 'MMMM yyyy')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${report?.totalIncome.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${report?.totalExpenses.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(report?.netBalance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${report?.netBalance.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetsData?.budgets.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>
              Distribution of your expenses this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${String(name ?? '')} (${(Number(percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={CATEGORY_COLORS[entry.name] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No expense data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>
              Comparison of your income and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Income" fill="hsl(142, 76%, 36%)" />
                <Bar dataKey="Expenses" fill="hsl(0, 84%, 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
          <CardDescription>
            Track your spending against your monthly budgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetProgress.length > 0 ? (
            <div className="space-y-6">
              {budgetProgress.map((budget) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{budget.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={budget.percentage >= 90 ? '[&>div]:bg-red-500' : budget.percentage >= 70 ? '[&>div]:bg-yellow-500' : ''}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No budgets set for this month.{' '}
              <a href="/budgets" className="text-primary hover:underline">
                Create a budget
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}