import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  LayoutDashboard,
  Mic,
  Brain,
  Settings,
  Users,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: Calendar,
    badge: "3", // This would come from task count
  },
  {
    name: "Finances",
    href: "/finances", 
    icon: DollarSign,
  },
  {
    name: "Voice Commands",
    href: "/voice",
    icon: Mic,
  },
  {
    name: "AI Assistant",
    href: "/ai",
    icon: Brain,
  },
];

const managementNavigation = [
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["pro", "admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const adminNavigation = [
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "System Status",
    href: "/admin/system",
    icon: Shield,
    roles: ["admin"],
  },
  {
    name: "Model Management",
    href: "/admin/models",
    icon: Zap,
    roles: ["admin"],
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location.startsWith(href);
  };

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    return user && roles.includes(user.role);
  };

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Management
          </h2>
          <div className="space-y-1">
            {managementNavigation
              .filter((item) => canAccess(item.roles))
              .map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
          </div>
        </div>

        {user?.role === "admin" && (
          <>
            <Separator />
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Administration
              </h2>
              <div className="space-y-1">
                {adminNavigation
                  .filter((item) => canAccess(item.roles))
                  .map((item) => (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "secondary" : "ghost"}
                        className="w-full justify-start"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                        {item.name === "User Management" && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            ADMIN
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
