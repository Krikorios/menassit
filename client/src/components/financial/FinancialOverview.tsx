import { useQuery } from "@tanstack/react-query";
import { financialService } from "@/services/financialService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Mic,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface FinancialOverviewProps {
  period?: "week" | "month" | "year";
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function FinancialOverview({ 
  period = "month", 
  limit = 5, 
  showHeader = true, 
  className 
}: FinancialOverviewProps) {
  const { 
    data: summaryData, 
    isLoading: summaryLoading 
  } = useQuery({
    queryKey: ["/api/financial/summary", { period }],
    staleTime: 60 * 1000,
  });

  const { 
    data: recordsData, 
    isLoading: recordsLoading 
  } = useQuery({
    queryKey: ["/api/financial/records"],
    staleTime: 30 * 1000,
  });

  const isLoading = summaryLoading || recordsLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-600 dark:text-green-400";
    if (value < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === "income") {
      return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-600" />;
  };

  const getCategoryColor = (category: string, type: string) => {
    if (type === "income") {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
    
    const categoryColors: Record<string, string> = {
      "food": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      "transport": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      "entertainment": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      "utilities": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      "healthcare": "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
      "shopping": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    };
    
    return categoryColors[category.toLowerCase()] || "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = summaryData?.summary || { income: 0, expenses: 0, net: 0 };
  const records = recordsData?.records || [];
  const recentRecords = records.slice(0, limit);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(summary.income)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                This {period}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(summary.expenses)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Badge variant="secondary" className="text-xs">
                This {period}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Net Balance Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                <p className={cn(
                  "text-2xl font-bold",
                  getChangeColor(summary.net)
                )}>
                  {formatCurrency(summary.net)}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                summary.net >= 0 
                  ? "bg-primary-100 dark:bg-primary-900/50" 
                  : "bg-red-100 dark:bg-red-900/50"
              )}>
                <Wallet className={cn(
                  "w-6 h-6",
                  summary.net >= 0 
                    ? "text-primary-600 dark:text-primary-400" 
                    : "text-red-600 dark:text-red-400"
                )} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {summary.net >= 0 ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                  Positive
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                  Deficit
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        {showHeader && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Recent Transactions</span>
              </CardTitle>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </div>
          </CardHeader>
        )}
        
        <CardContent>
          {recentRecords.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No financial records found</p>
              <p className="text-sm">Add transactions using voice commands or manually</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      record.type === "income" 
                        ? "bg-green-100 dark:bg-green-900/50" 
                        : "bg-red-100 dark:bg-red-900/50"
                    )}>
                      {getTransactionIcon(record.type, parseFloat(record.amount))}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">
                          {record.description || record.category}
                        </p>
                        {record.createdViaVoice && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Mic className="w-3 h-3" />
                            <span>Voice</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getCategoryColor(record.category, record.type))}
                        >
                          {record.category}
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(record.date), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={cn(
                      "font-semibold text-sm",
                      record.type === "income" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {record.type === "income" ? "+" : "-"}{formatCurrency(parseFloat(record.amount))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
