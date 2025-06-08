import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  Zap,
  Monitor,
  UserCheck,
  Focus,
  Palette,
  MessageCircle,
  Heart
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const getNavigation = (t: any) => [
  {
    name: t('navigation.dashboard'),
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: t('navigation.tasks'),
    href: "/tasks",
    icon: Calendar,
    badge: "3", // This would come from task count
  },
  {
    name: t('navigation.finances'),
    href: "/finances", 
    icon: DollarSign,
  },
  {
    name: t('navigation.chat'),
    href: "/chat",
    icon: MessageCircle,
    badge: "2", // This would come from unread message count
  },
  {
    name: t('navigation.professionals'),
    href: "/professionals",
    icon: UserCheck,
  },
  {
    name: t('navigation.voice'),
    href: "/voice",
    icon: Mic,
  },
  {
    name: t('navigation.ai'),
    href: "/ai",
    icon: Brain,
  },
  {
    name: t('navigation.focus'),
    href: "/focus",
    icon: Focus,
  },
  {
    name: t('navigation.themes'),
    href: "/themes",
    icon: Palette,
  },
  {
    name: t('navigation.comfort', 'Comfort Hub'),
    href: "/comfort",
    icon: Heart,
    badge: "NEW", // Highlight this new feature
  },
];

const getManagementNavigation = (t: any) => [
  {
    name: t('navigation.analytics'),
    href: "/analytics",
    icon: BarChart3,
    roles: ["pro", "admin"],
  },
  {
    name: t('navigation.monitoring'),
    href: "/monitoring",
    icon: Monitor,
    roles: ["pro", "admin"],
  },
  {
    name: t('navigation.settings'),
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

function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const navigation = getNavigation(t);
  const managementNavigation = getManagementNavigation(t);

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
    <div className={cn("pb-12 min-h-screen", className)} data-tour="navigation">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              {t('common.navigation') || 'Navigation'}
            </h2>
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    data-tour={item.href === "/dashboard" ? "dashboard" : item.href === "/tasks" ? "tasks" : item.href === "/finances" ? "finances" : item.href === "/voice" ? "voice" : item.href === "/ai" ? "ai" : undefined}
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
            {t('common.management') || 'Management'}
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

export default Sidebar;
