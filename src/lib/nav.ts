import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Apple,
  IndianRupee,
  Receipt,
  Wrench,
  UserCog,
  Package,
  ShoppingCart,
  Sparkles,
  PhoneCall,
  Bell,
  BarChart3,
  Shield,
  Building2,
  Settings as SettingsIcon,
  UserSquare2,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Overview" | "Members" | "Operations" | "Money" | "People" | "Growth" | "System";
};

export const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "Overview" },

  { label: "Members", to: "/members", icon: Users, group: "Members" },
  { label: "Membership Plans", to: "/plans", icon: BadgeCheck, group: "Members" },
  { label: "Memberships", to: "/memberships", icon: ClipboardList, group: "Members" },
  { label: "Attendance", to: "/attendance", icon: CalendarCheck, group: "Members" },

  { label: "Trainers", to: "/trainers", icon: UserSquare2, group: "Operations" },
  { label: "Workout Plans", to: "/workouts", icon: Dumbbell, group: "Operations" },
  { label: "Diet Plans", to: "/diet", icon: Apple, group: "Operations" },
  { label: "Equipment", to: "/equipment", icon: Wrench, group: "Operations" },

  { label: "Payments", to: "/payments", icon: IndianRupee, group: "Money" },
  { label: "Expenses", to: "/expenses", icon: Receipt, group: "Money" },
  { label: "Reports", to: "/reports", icon: BarChart3, group: "Money" },

  { label: "Staff", to: "/staff", icon: UserCog, group: "People" },
  { label: "Roles & Permissions", to: "/roles", icon: Shield, group: "People" },
  { label: "Branches", to: "/branches", icon: Building2, group: "People" },

  { label: "Inventory", to: "/products", icon: Package, group: "Growth" },
  { label: "Product Sales", to: "/sales", icon: ShoppingCart, group: "Growth" },
  { label: "Leads", to: "/leads", icon: Sparkles, group: "Growth" },
  { label: "Follow-ups", to: "/followups", icon: PhoneCall, group: "Growth" },
  { label: "Notifications", to: "/notifications", icon: Bell, group: "Growth" },

  { label: "Settings", to: "/settings", icon: SettingsIcon, group: "System" },
];
