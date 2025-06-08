import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2 } from "lucide-react";

const budgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(["weekly", "monthly", "yearly"]),
  categoryId: z.number().optional(),
  alertThreshold: z.number().min(1).max(100).default(80),
  isActive: z.boolean().default(true),
  startDate: z.string(),
  endDate: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface Budget {
  id: number;
  name: string;
  amount: number;
  period: string;
  categoryId?: number;
  category?: { name: string; color: string };
  alertThreshold: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  used: number;
  remaining: number;
  percentage: number;
  createdAt: string;
}

export function BudgetPlanner() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: "",
      amount: 0,
      period: "monthly",
      alertThreshold: 80,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["/api/finances/budgets"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/finances/categories"],
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetFormData) => apiRequest("/api/finances/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finances/budgets"] });
      setOpen(false);
      form.reset();
      toast({
        title: t("success.created"),
        description: t("finances.budgetCreated"),
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, ...data }: BudgetFormData & { id: number }) => 
      apiRequest(`/api/finances/budgets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finances/budgets"] });
      setEditingBudget(null);
      form.reset();
      toast({
        title: t("success.updated"),
        description: t("finances.budgetUpdated"),
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/finances/budgets/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/finances/budgets"] });
      toast({
        title: t("success.deleted"),
        description: t("finances.budgetDeleted"),
      });
    },
  });

  const handleSubmit = (data: BudgetFormData) => {
    if (editingBudget) {
      updateBudgetMutation.mutate({ ...data, id: editingBudget.id });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    form.reset({
      name: budget.name,
      amount: budget.amount,
      period: budget.period as "weekly" | "monthly" | "yearly",
      categoryId: budget.categoryId,
      alertThreshold: budget.alertThreshold,
      isActive: budget.isActive,
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate?.split('T')[0],
    });
    setOpen(true);
  };

  const getBudgetStatus = (budget: Budget) => {
    if (budget.percentage >= budget.alertThreshold) {
      return { color: "destructive", icon: AlertTriangle };
    } else if (budget.percentage >= 70) {
      return { color: "yellow", icon: TrendingUp };
    }
    return { color: "green", icon: TrendingDown };
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-2 bg-muted rounded"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("finances.budgetPlanning")}</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBudget(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t("finances.createBudget")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? t("finances.editBudget") : t("finances.createBudget")}
              </DialogTitle>
              <DialogDescription>
                {t("finances.budgetDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("finances.budgetName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("finances.enterBudgetName")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("finances.amount")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("finances.period")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("finances.selectPeriod")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">{t("finances.weekly")}</SelectItem>
                            <SelectItem value="monthly">{t("finances.monthly")}</SelectItem>
                            <SelectItem value="yearly">{t("finances.yearly")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("finances.category")} ({t("common.optional")})</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("finances.selectCategory")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("finances.alertThreshold")} (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("finances.startDate")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("finances.endDate")} ({t("common.optional")})</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("finances.activeBudget")}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t("finances.activeBudgetDescription")}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}>
                    {editingBudget ? t("common.update") : t("common.create")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget: Budget) => {
          const status = getBudgetStatus(budget);
          const StatusIcon = status.icon;

          return (
            <Card key={budget.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudgetMutation.mutate(budget.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {budget.category?.name && (
                    <Badge variant="secondary" className="mr-2">
                      <div 
                        className="w-2 h-2 rounded-full mr-1" 
                        style={{ backgroundColor: budget.category.color }}
                      />
                      {budget.category.name}
                    </Badge>
                  )}
                  {t(`finances.${budget.period}`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">${budget.used.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`h-4 w-4 ${status.color === 'destructive' ? 'text-destructive' : status.color === 'yellow' ? 'text-yellow-500' : 'text-green-500'}`} />
                      <span className="text-sm font-medium">{budget.percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <Progress value={budget.percentage} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("finances.budgetRemaining")}</p>
                      <p className="font-medium">${budget.remaining.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("finances.alertThreshold")}</p>
                      <p className="font-medium">{budget.alertThreshold}%</p>
                    </div>
                  </div>

                  {!budget.isActive && (
                    <Badge variant="outline" className="w-full justify-center">
                      {t("finances.inactive")}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("finances.noBudgets")}</h3>
            <p className="text-muted-foreground text-center mb-4">
              {t("finances.noBudgetsDescription")}
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("finances.createFirstBudget")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}