"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Users, 
  Shield,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Building2,
  ChevronDown
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "RFQs", href: "/dashboard/rfqs", icon: FileText },
  { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
  { name: "Deliveries", href: "/dashboard/deliveries", icon: Truck },
  { name: "Contractors", href: "/dashboard/contractors", icon: Users },
  { name: "Compliance", href: "/dashboard/compliance", icon: Shield },
  { name: "Budget", href: "/dashboard/budget", icon: BarChart3 },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className={cn("flex flex-col h-full bg-slate-900", className)}>
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-500" />
          <span className="text-lg font-bold text-white">BuildProcure</span>
        </Link>
      </div>

      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{(session?.user as any)?.organisationName}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <Bell className="h-5 w-5" />
          Notifications
        </button>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Link>
      </div>
    </div>
  );
}