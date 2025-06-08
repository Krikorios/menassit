import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useVoiceIntegration } from "@/hooks/useVoiceIntegration";
import { VoiceShortcuts } from "@/components/voice/VoiceShortcuts";
import { ProjectManager } from "@/components/tasks/ProjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Plus, Calendar, Clock, Search, Filter, Trash2, CheckCircle2, 
  PlayCircle, MoreHorizontal, Edit, ArrowUpDown, AlertTriangle, FolderOpen 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { speak } = useVoiceIntegration();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  });

  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const allTasks: Task[] = (tasksResponse as any)?.tasks || [];

  // Voice announcement when page loads
  useEffect(() => {
    if (allTasks.length > 0) {
      const timer = setTimeout(() => {
        speak(`Tasks page loaded. You have ${allTasks.length} tasks. Say "create task" followed by a task name to add a new task.`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allTasks.length, speak]);

  // Enhanced filtering and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = allTasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [allTasks, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const createTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setOpen(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
      toast({
        title: "Task created",
        description: "Your task has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Task has been successfully updated.",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been successfully deleted.",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: Partial<Task> }) => {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
            credentials: "include",
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setSelectedTasks([]);
      toast({
        title: "Tasks updated",
        description: `${selectedTasks.length} tasks have been updated.`,
      });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
    speak(`Creating task "${newTask.title}"`);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask.id, updates: editingTask });
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredAndSortedTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "secondary";
      case "in_progress": return "default";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Task statistics
  const taskStats = useMemo(() => {
    return {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === "pending").length,
      inProgress: allTasks.filter(t => t.status === "in_progress").length,
      completed: allTasks.filter(t => t.status === "completed").length,
      overdue: allTasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== "completed").length,
    };
  }, [allTasks]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <VoiceShortcuts page="tasks" />
      <Sidebar className="w-64 border-r" />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <PageHeader
            title="Tasks"
            description="Manage your tasks and track your progress"
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>
                    Add a new task to your todo list.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </PageHeader>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{taskStats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedTasks.length > 0 && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => bulkUpdateMutation.mutate({ ids: selectedTasks, updates: { status: "completed" } })}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bulkUpdateMutation.mutate({ ids: selectedTasks, updates: { status: "in_progress" } })}
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    Start Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      selectedTasks.forEach(id => deleteTaskMutation.mutate(id));
                      setSelectedTasks([]);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredAndSortedTasks.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                      ? "No tasks match your filters"
                      : "No tasks yet"
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Get started by creating your first task."
                    }
                  </p>
                  {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                    <Button onClick={() => setOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                  <Checkbox
                    checked={selectedTasks.length === filteredAndSortedTasks.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    Select all ({filteredAndSortedTasks.length} tasks)
                  </span>
                </div>

                {/* Task Cards */}
                {filteredAndSortedTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {task.title}
                                {task.dueDate && isOverdue(task.dueDate) && task.status !== "completed" && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </CardTitle>
                              {task.description && (
                                <CardDescription className="mt-1">
                                  {task.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Badge variant={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {task.status !== "completed" && (
                                    <DropdownMenuItem 
                                      onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { status: "completed" } })}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  )}
                                  {task.status === "pending" && (
                                    <DropdownMenuItem 
                                      onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { status: "in_progress" } })}
                                    >
                                      <PlayCircle className="w-4 h-4 mr-2" />
                                      Start Progress
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteTaskMutation.mutate(task.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-4">
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 ${
                              isOverdue(task.dueDate) && task.status !== "completed" 
                                ? "text-red-600 font-medium" 
                                : ""
                            }`}>
                              <Clock className="w-4 h-4" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Edit Task Dialog */}
          <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Update your task details.
                </DialogDescription>
              </DialogHeader>
              {editingTask && (
                <form onSubmit={handleEditTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingTask.description || ""}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-priority">Priority</Label>
                      <Select value={editingTask.priority} onValueChange={(value: any) => setEditingTask({ ...editingTask, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select value={editingTask.status} onValueChange={(value: any) => setEditingTask({ ...editingTask, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-dueDate">Due Date</Label>
                      <Input
                        id="edit-dueDate"
                        type="date"
                        value={editingTask.dueDate || ""}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateTaskMutation.isPending}>
                    {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}