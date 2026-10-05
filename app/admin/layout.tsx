"use client";

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
  UsersIcon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  ChevronsUpDownIcon,
  TrophyIcon,
  BookOpenIcon,
  BarChart3Icon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth.context";
import { useRole } from "@/hooks/use-role";
import { NotificationBell } from "@/components/notifications/NotificationBell";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  adminOnly?: boolean;
  docenteAllowed?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigationItems: NavGroup[] = [
  {
    group: "Inicio",
    items: [{ title: "Dashboard", icon: LayoutDashboardIcon, href: "/admin" }],
  },
  {
    group: "Gestión",
    items: [
      {
        title: "Usuarios",
        icon: UsersIcon,
        href: "/admin/usuarios",
        adminOnly: true,
      },
      {
        title: "Cursos",
        icon: BookOpenIcon,
        href: "/admin/cursos",
        adminOnly: true,
        docenteAllowed: true,
      },
      {
        title: "Logros",
        icon: TrophyIcon,
        href: "/admin/logros",
        adminOnly: true,
      },
      {
        title: "Reportes",
        icon: BarChart3Icon,
        href: "/admin/reportes",
        adminOnly: true,
        docenteAllowed: true,
      },
    ],
  },
  {
    group: "Sistema",
    items: [
      { title: "Notificaciones", icon: BellIcon, href: "/admin/notificaciones" },
      { title: "Configuración", icon: SettingsIcon, href: "/admin/configuracion" },
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
  const { user, logout } = useAuth();
  const { isAdministrador, isDocente } = useRole();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        {/* Sidebar Header */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/admin">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-white shadow-md">
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
          {navigationItems.map((group) => {
            const itemsToRender = group.items.filter((item) => {
              if (item.adminOnly && !isAdministrador) {
                if (item.docenteAllowed && isDocente) {
                  return true;
                }
                return false;
              }
              return true;
            });

            if (itemsToRender.length === 0) return null;

            return (
              <SidebarGroup key={group.group}>
                <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {itemsToRender.map((item) => (
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
            );
          })}
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
                      <AvatarImage src="" alt={user?.name || "Usuario"} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                        {user?.name
                          ? user.name.substring(0, 2).toUpperCase()
                          : "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className="truncate text-sm font-semibold">
                        {user?.name || "Usuario"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || ""}
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
                        {user?.name
                          ? user.name.substring(0, 2).toUpperCase()
                          : "US"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.name || "Usuario"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/notificaciones" className="cursor-pointer flex items-center">
                      <BellIcon className="mr-2 h-4 w-4" />
                      Notificaciones
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/configuracion" className="cursor-pointer flex items-center">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => logout()}
                    style={{ cursor: "pointer" }}
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Cerrar sesión
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
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
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
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="admin-page-enter p-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
