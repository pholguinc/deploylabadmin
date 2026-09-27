import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ServerIcon,
  ActivityIcon,
  GitBranchIcon,
  UsersIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CircleIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  XCircleIcon,
} from "lucide-react";

const stats = [
  {
    title: "Active Servers",
    value: "24",
    change: "+3",
    trend: "up" as const,
    icon: ServerIcon,
    description: "from last month",
    color: "from-violet-500 to-indigo-500",
    shadowColor: "shadow-violet-500/20",
  },
  {
    title: "Deployments",
    value: "142",
    change: "+18",
    trend: "up" as const,
    icon: GitBranchIcon,
    description: "this week",
    color: "from-blue-500 to-cyan-500",
    shadowColor: "shadow-blue-500/20",
  },
  {
    title: "Uptime",
    value: "99.98%",
    change: "+0.02%",
    trend: "up" as const,
    icon: ActivityIcon,
    description: "30-day average",
    color: "from-emerald-500 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
  },
  {
    title: "Team Members",
    value: "12",
    change: "+2",
    trend: "up" as const,
    icon: UsersIcon,
    description: "active now",
    color: "from-amber-500 to-orange-500",
    shadowColor: "shadow-amber-500/20",
  },
];

const recentDeployments = [
  {
    project: "api-gateway",
    environment: "production",
    status: "success",
    time: "2 min ago",
    branch: "main",
    user: "Carlos M.",
  },
  {
    project: "web-dashboard",
    environment: "staging",
    status: "running",
    time: "5 min ago",
    branch: "feat/auth",
    user: "Ana R.",
  },
  {
    project: "auth-service",
    environment: "production",
    status: "success",
    time: "15 min ago",
    branch: "main",
    user: "Diego L.",
  },
  {
    project: "payment-api",
    environment: "staging",
    status: "failed",
    time: "1 hr ago",
    branch: "fix/timeout",
    user: "Laura S.",
  },
  {
    project: "notification-svc",
    environment: "production",
    status: "success",
    time: "2 hr ago",
    branch: "main",
    user: "Miguel A.",
  },
];

const serverStatus = [
  { name: "us-east-1", status: "healthy", load: 42, memory: 67 },
  { name: "us-west-2", status: "healthy", load: 38, memory: 54 },
  { name: "eu-west-1", status: "warning", load: 78, memory: 82 },
  { name: "ap-south-1", status: "healthy", load: 25, memory: 41 },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "success":
    case "healthy":
      return <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />;
    case "running":
      return <ClockIcon className="h-4 w-4 animate-pulse text-blue-500" />;
    case "warning":
      return <AlertCircleIcon className="h-4 w-4 text-amber-500" />;
    case "failed":
      return <XCircleIcon className="h-4 w-4 text-red-500" />;
    default:
      return <CircleIcon className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    production: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    staging: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${variants[status] || ""}`}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your infrastructure and deployments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className="admin-card-enter relative overflow-hidden border-border/50"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadowColor}`}
              >
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">
                  {stat.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts / Details row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Deployments */}
        <Card className="admin-card-enter border-border/50 lg:col-span-4" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>
                  Latest deployment activity across projects
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUpIcon className="h-3 w-3" />
                142 this week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeployments.map((deploy, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={deploy.status} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{deploy.project}</span>
                        <StatusBadge status={deploy.environment} />
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <GitBranchIcon className="h-3 w-3" />
                        {deploy.branch}
                        <span>·</span>
                        {deploy.user}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {deploy.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Server Status */}
        <Card className="admin-card-enter border-border/50 lg:col-span-3" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
            <CardDescription>
              Real-time health of your infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {serverStatus.map((server) => (
                <div key={server.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={server.status} />
                      <span className="font-medium">{server.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        server.status === "healthy"
                          ? "border-emerald-500/30 text-emerald-500"
                          : "border-amber-500/30 text-amber-500"
                      }
                    >
                      {server.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>CPU Load</span>
                      <span>{server.load}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          server.load > 70
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gradient-to-r from-violet-500 to-indigo-500"
                        }`}
                        style={{ width: `${server.load}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Memory</span>
                      <span>{server.memory}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          server.memory > 75
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500"
                        }`}
                        style={{ width: `${server.memory}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
