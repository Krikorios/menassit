import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/Sidebar";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: financialSummary = { income: 0, expenses: 0, net: 0 }, isLoading: financialLoading } = useQuery({
    queryKey: ["/api/financial/summary"],
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ["/api/financial/records"],
  });

  if (tasksLoading || financialLoading || recordsLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate task analytics
  const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
  const pendingTasks = tasks.filter((task: any) => task.status === 'pending').length;
  const inProgressTasks = tasks.filter((task: any) => task.status === 'in_progress').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate financial analytics
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyRecords = records.filter((record: any) => {
    const recordDate = new Date(record.createdAt);
    return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
  });
  
  const monthlyIncome = monthlyRecords
    .filter((record: any) => record.type === 'income')
    .reduce((sum: number, record: any) => sum + record.amount, 0);
  
  const monthlyExpenses = monthlyRecords
    .filter((record: any) => record.type === 'expense')
    .reduce((sum: number, record: any) => sum + record.amount, 0);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Insights and performance metrics for your tasks and finances
            </p>
          </div>

          {/* Task Analytics */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {completionRate.toFixed(1)}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground">Active tasks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">Awaiting action</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Financial Analytics */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${financialSummary.income.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This month: ${monthlyIncome.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${financialSummary.expenses.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This month: ${monthlyExpenses.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${financialSummary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${financialSummary.net.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly: ${(monthlyIncome - monthlyExpenses).toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Task Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of your task statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{completedTasks}</span>
                      <Badge variant="secondary">{totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}%</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-sm">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{inProgressTasks}</span>
                      <Badge variant="secondary">{totalTasks > 0 ? ((inProgressTasks / totalTasks) * 100).toFixed(0) : 0}%</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{pendingTasks}</span>
                      <Badge variant="secondary">{totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(0) : 0}%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>
                  Your financial performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Savings Rate</span>
                    <Badge variant={financialSummary.income > 0 && (financialSummary.net / financialSummary.income) > 0.2 ? "default" : "secondary"}>
                      {financialSummary.income > 0 ? ((financialSummary.net / financialSummary.income) * 100).toFixed(1) : 0}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Trends</span>
                    <Badge variant={(monthlyIncome - monthlyExpenses) >= 0 ? "default" : "destructive"}>
                      {(monthlyIncome - monthlyExpenses) >= 0 ? "Positive" : "Negative"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transaction Count</span>
                    <Badge variant="outline">
                      {records.length} total
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <Badge variant="outline">
                      {monthlyRecords.length} transactions
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your productivity and financial health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completionRate < 70 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Task Management:</strong> Your completion rate is {completionRate.toFixed(1)}%. 
                      Consider breaking down large tasks into smaller, manageable pieces.
                    </p>
                  </div>
                )}
                
                {pendingTasks > inProgressTasks && pendingTasks > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Productivity:</strong> You have {pendingTasks} pending tasks. 
                      Start working on them to improve your productivity flow.
                    </p>
                  </div>
                )}
                
                {financialSummary.net < 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Financial Health:</strong> Your expenses exceed your income. 
                      Review your spending patterns and consider creating a budget.
                    </p>
                  </div>
                )}
                
                {financialSummary.income > 0 && (financialSummary.net / financialSummary.income) > 0.3 && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      <strong>Great Job!</strong> You're saving over 30% of your income. 
                      Consider investing your savings for long-term growth.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}