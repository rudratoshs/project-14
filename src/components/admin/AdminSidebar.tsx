import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  Plus,
  UserCircle,
  LogOut,
  Shield,
  Lock
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface AdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { icon: BarChart, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Shield, label: 'Roles', href: '/admin/roles' },
  { icon: Lock, label: 'Permissions', href: '/admin/permissions' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: HelpCircle, label: 'Help', href: '/admin/help' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
];

export default function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r transition-all duration-300",
      open ? "w-64" : "w-20"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        <div className="flex items-center">
          <UserCircle className={cn(
            "h-8 w-8 text-primary transition-all duration-300",
            open ? "mr-3" : "mr-0"
          )} />
          <span className={cn(
            "font-bold text-xl transition-all duration-300",
            open ? "opacity-100" : "opacity-0 w-0"
          )}>
            Admin
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => onOpenChange(!open)}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform duration-300",
            !open && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <Button
            className={cn(
              "w-full justify-start bg-primary/10 text-primary hover:bg-primary/20",
              !open && "justify-center"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {open && "New Course"}
          </Button>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg transition-colors",
                  !open && "justify-center",
                  isActive 
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {open && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer with User Info and Logout */}
      <div className="p-4 border-t space-y-4">
        <div className={cn(
          "flex items-center",
          !open && "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="h-4 w-4 text-primary" />
          </div>
          {open && (
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full group relative overflow-hidden",
              isLoggingOut && "pointer-events-none"
            )}
            onClick={handleLogout}
          >
            <motion.div
              className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity"
              initial={false}
              animate={isLoggingOut ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 0.3 }}
            />
            
            <span className={cn(
              "flex items-center text-gray-600 group-hover:text-red-600 transition-colors",
              !open && "justify-center"
            )}>
              <LogOut className="h-4 w-4" />
              {open && <span className="ml-2">Logout</span>}
            </span>

            {isLoggingOut && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </Button>
        </motion.div>
      </div>
    </aside>
  );
}