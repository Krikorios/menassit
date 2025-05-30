import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Mic, 
  Plus,
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isAfter, isBefore, startOfDay } from "date-fns";

interface TaskListProps {
  status?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
}

export default function TaskList({ 
  status, 
  limit, 
  showHeader = true, 
  className 
}: TaskListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: tasksData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["/api/tasks", { status }],
    staleTime: 30 * 1000,
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => taskService.completeTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task completed",
        description: "Task marked as completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTaskStatus = (task: any) => {
    if (task.status === "completed") return "completed";
    if (!task.dueDate) return "normal";
    
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const today = startOfDay(now);
    const taskDueDay = startOfDay(dueDate);
    
    if (isBefore(taskDueDay, today)) return "overdue";
    if (taskDueDay.getTime() === today.getTime()) return "due-today";
    return "normal";
  };

  const getStatusBadge = (task: any) => {
    const status = getTaskStatus(task);
    
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Overdue</Badge>;
      case "due-today":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Due Today</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tasks</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Skeleton className="w-5 h-5" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tasks</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Failed to load tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = tasksData?.tasks || [];
  const displayTasks = limit ? tasks.slice(0, limit) : tasks;

  if (displayTasks.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tasks</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
            <p className="text-sm">Create a task using voice commands or the dashboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tasks</span>
              <Badge variant="secondary">{tasks.length}</Badge>
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                task.status === "completed" && "opacity-60",
                `priority-${task.priority}`
              )}
            >
              {/* Completion Checkbox */}
              <div className="flex-shrink-0">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleCompleteTask(task.id)}
                  disabled={completeTaskMutation.isPending}
                  className="w-5 h-5"
                />
              </div>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium text-sm",
                      task.status === "completed" && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h4>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mt-2">
                      {/* Priority Badge */}
                      <Badge variant="outline" className={cn("text-xs", getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      
                      {/* Voice Created Indicator */}
                      {task.createdViaVoice && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Mic className="w-3 h-3" />
                          <span>Voice</span>
                        </div>
                      )}
                      
                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusBadge(task)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {limit && tasks.length > limit && (
          <div className="text-center mt-4">
            <Button variant="ghost" size="sm">
              View All Tasks ({tasks.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
