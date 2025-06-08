import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { FinancialSkeleton, CardSkeleton, ChartSkeleton } from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FinancesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: ''
  });

  // Fetch financial records
  const { data: records, isLoading } = useQuery({
    queryKey: ['/api/financial-records'],
    queryFn: async () => {
      const response = await fetch('/api/financial-records');
      if (!response.ok) throw new Error('Failed to fetch records');
      return response.json();
    }
  });

  // Fetch financial summary
  const { data: summary } = useQuery({
    queryKey: ['/api/financial-records/summary'],
    queryFn: async () => {
      const response = await fetch('/api/financial-records/summary');
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    }
  });

  // Create record mutation
  const createMutation = useMutation({
    mutationFn: async (recordData: typeof newRecord) => {
      const response = await fetch('/api/financial-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recordData,
          amount: parseFloat(recordData.amount)
        })
      });
      if (!response.ok) throw new Error('Failed to create record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-records'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-records/summary'] });
      setOpen(false);
      setNewRecord({ type: 'expense', amount: '', category: '', description: '' });
      toast({ title: "Record created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create record", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.amount || !newRecord.category) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(newRecord);
  };

  // Income categories
  const incomeCategories = [
    'Salary', 'Freelancing', 'Investment', 'Business', 'Gift', 'Other'
  ];

  // Expense categories
  const expenseCategories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Education', 'Travel', 'Other'
  ];

  const categories = newRecord.type === 'income' ? incomeCategories : expenseCategories;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <PageHeader
              title="Financial Overview"
              description="Track your income and expenses"
            />
            
            {/* Summary cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            
            {/* Chart skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartSkeleton />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <FinancialSkeleton key={i} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageHeader
            title="Finances"
            description="Track your income, expenses, and financial goals"
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Financial Record</DialogTitle>
                  <DialogDescription>
                    Record a new income or expense transaction.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newRecord.type} onValueChange={(value: any) => setNewRecord({ ...newRecord, type: value, category: '' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newRecord.amount}
                      onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newRecord.category} onValueChange={(value) => setNewRecord({ ...newRecord, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description..."
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Record"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </PageHeader>

          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${summary?.income?.toFixed(2) || '0.00'}
                  </div>
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
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${(summary?.net || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${summary?.net?.toFixed(2) || '0.00'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest financial records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!records || records.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No financial records yet. Start by adding your first transaction.
                    </p>
                    <Button onClick={() => setOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${record.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {record.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium">{record.description || record.category}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {record.category} • {new Date(record.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                          </div>
                          <Badge variant={record.type === 'income' ? 'default' : 'secondary'}>
                            {record.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}