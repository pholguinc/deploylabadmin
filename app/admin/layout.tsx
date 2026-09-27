"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  RocketIcon,
  LayoutDashboardIcon,
  ServerIcon,
  BoxIcon,
  UsersIcon,
  SettingsIcon,
  ActivityIcon,
  ShieldIcon,
  BellIcon,
  LogOutIcon,
  ChevronsUpDownIcon,
  DatabaseIcon,
  GlobeIcon,
  GitBranchIcon,
  TerminalIcon,
  KeyIcon,
  TrophyIcon,
  BookOpenIcon,
} from "lucide-react";

const navigationItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboardIcon, href: "/admin" },
      { title: "Activity", icon: ActivityIcon, href: "/admin/activity" },
      { title: "Analytics", icon: ActivityIcon, href: "/admin/analytics" },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      { title: "Servers", icon: ServerIcon, href: "/admin/servers" },
      { title: "Databases", icon: DatabaseIcon, href: "/admin/databases" },
      { title: "Domains", icon: GlobeIcon, href: "/admin/domains" },
      { title: "Deployments", icon: GitBranchIcon, href: "/admin/deployments" },
    ],
  },
  {
    group: "Management",
    items: [
      { title: "Projects", icon: BoxIcon, href: "/admin/projects" },
      { title: "Usuarios", icon: UsersIcon, href: "/admin/usuarios" },
      { title: "Logros", icon: TrophyIcon, href: "/admin/logros" },
      { title: "Cursos", icon: BookOpenIcon, href: "/admin/cursos" },
      { title: "Team", icon: UsersIcon, href: "/admin/team" },
      { title: "Security", icon: ShieldIcon, href: "/admin/security" },
      { title: "API Keys", icon: KeyIcon, href: "/admin/api-keys" },
    ],
  },
  {
    group: "System",
    items: [
      { title: "Console", icon: TerminalIcon, href: "/admin/console" },
      { title: "Settings", icon: SettingsIcon, href: "/admin/settings" },
    ],
  },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        {/* Sidebar Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/20">
                    <RocketIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">DeployLab</span>
                    <span className="text-xs text-muted-foreground">
                      Admin Panel
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent>
          {navigationItems.map((group) => (
            <SidebarGroup key={group.group}>
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Sidebar Footer - User */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src="" alt="Admin" />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                        DL
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="truncate text-sm font-semibold">
                        Admin User
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        admin@deploylab.io
                      </span>
                    </div>
                    <ChevronsUpDownIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  side="top"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                        DL
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Admin User</span>
                      <span className="text-xs text-muted-foreground">
                        admin@deploylab.io
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <BellIcon className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5">
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="admin-page-enter p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
