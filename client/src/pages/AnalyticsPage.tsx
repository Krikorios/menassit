import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Target, DollarSign, Activity } from "lucide-react";
import RealTimeAnalytics from "@/components/analytics/RealTimeAnalytics";

interface Task {
  id: number;
  status: string;
  completed: boolean;
}

interface FinancialRecord {
  type: string;
  amount: number;
  createdAt: string;
}

interface FinancialSummary {
  income: number;
  expenses: number;
  net: number;
}

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
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate task analytics
  const tasksArray = Array.isArray(tasks) ? tasks as Task[] : [];
  const completedTasks = tasksArray.filter(task => task.status === 'completed' || task.completed).length;
  const pendingTasks = tasksArray.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasksArray.filter(task => task.status === 'in_progress').length;
  const totalTasks = tasksArray.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate financial analytics
  const summary = financialSummary as FinancialSummary;
  const recordsArray = Array.isArray(records) ? records as FinancialRecord[] : [];
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyRecords = recordsArray.filter(record => {
    const recordDate = new Date(record.createdAt);
    return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
  });
  
  const monthlyIncome = monthlyRecords
    .filter(record => record.type === 'income')
    .reduce((sum, record) => sum + record.amount, 0);
  
  const monthlyExpenses = monthlyRecords
    .filter(record => record.type === 'expense')
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
          </div>

          <Tabs defaultValue="realtime" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="realtime" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Real-Time Analytics
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Task Analytics
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="realtime" className="space-y-6">
              <RealTimeAnalytics />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                      <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <BarChart3 className="h-4 w-4 text-green-600" />
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
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-600">{pendingTasks}</div>
                      <p className="text-xs text-muted-foreground">Awaiting action</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Insights */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Performance Insights</h3>
                  {completionRate >= 80 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Excellent!</strong> You're maintaining a high completion rate of {completionRate.toFixed(1)}%. 
                        Keep up the great work!
                      </p>
                    </div>
                  )}
                  {completionRate < 50 && totalTasks > 0 && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Room for Improvement:</strong> Your completion rate is {completionRate.toFixed(1)}%. 
                        Consider breaking tasks into smaller, manageable chunks.
                      </p>
                    </div>
                  )}
                  {totalTasks === 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Get Started:</strong> Create your first task to begin tracking your productivity!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        ${summary?.income?.toFixed(2) || '0.00'}
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
                        ${summary?.expenses?.toFixed(2) || '0.00'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This month: ${monthlyExpenses.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        ${summary?.net?.toFixed(2) || '0.00'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total financial position
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Insights */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Financial Insights</h3>
                  {summary?.net > 0 && summary?.income > 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Positive Growth!</strong> You're maintaining a positive net worth. 
                        Consider investing your surplus for long-term growth.
                      </p>
                    </div>
                  )}
                  {summary?.net < 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Action Needed:</strong> Your expenses exceed income. 
                        Review your spending patterns and consider cost reduction strategies.
                      </p>
                    </div>
                  )}
                  {summary?.income === 0 && summary?.expenses === 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Start Tracking:</strong> Add your income and expenses to get personalized financial insights!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}