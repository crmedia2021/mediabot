import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Users, Download, CreditCard, Settings, BarChart3,
  Coins, Gift, Loader2, LogOut, Shield, RefreshCw,
  Activity, Search, Home, LayoutDashboard, ChevronLeft,
  ChevronRight, TrendingUp, Zap, DollarSign, UserCheck,
  UserX, Crown, AlertTriangle, Server, Database, Key,
  Globe, Eye, Edit3, Trash2, Plus, Minus, Package,
} from "lucide-react";
import { useNavigate } from "react-router";

const statusConfig: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const roleConfig: Record<string, { color: string; icon: typeof Shield }> = {
  super_admin: { color: "bg-red-500/10 text-red-600 border-red-500/20", icon: Crown },
  admin: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Shield },
  user: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Users },
  member: { color: "bg-violet-500/10 text-violet-600 border-violet-500/20", icon: Users },
};

type SidebarTab = "overview" | "users" | "downloads" | "payments" | "settings" | "system" | "activity";

const sidebarItems: { id: SidebarTab; label: string; icon: typeof Home; adminOnly?: boolean }[] = [
  { id: "overview", label: "Analytics", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "system", label: "System Config", icon: Server, adminOnly: true },
  { id: "activity", label: "Activity Log", icon: Activity },
];

export default function Admin() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdminQuery = useQuery(api.admin.isAdmin);
  const isSuperAdminQuery = useQuery(api.admin.isSuperAdmin);
  const initSettings = useMutation(api.settings.initSettings);

  useEffect(() => {
    if (!authLoading && user && isAdminQuery) initSettings().catch(console.error);
  }, [authLoading, user, isAdminQuery, initSettings]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && isAdminQuery === false) navigate("/dashboard");
  }, [authLoading, user, isAdminQuery, navigate]);

  if (authLoading || !user || isAdminQuery === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminQuery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-lg font-semibold">Access Denied</h2>
            <p className="text-sm text-muted-foreground mt-1">Admin privileges required.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 bg-card border-r border-border/50 flex flex-col fixed h-full z-40`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/50">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm block leading-tight">Admin Panel</span>
                <span className="text-[10px] text-muted-foreground">CRMedia Bot</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => {
            if (item.adminOnly && !isSuperAdminQuery) return null;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id ? "bg-violet-500/10 text-violet-600" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border/50 space-y-1">
          <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-all">
            <Home className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>User Dashboard</span>}
          </button>
          <button onClick={async () => { await signOut(); navigate("/"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold capitalize">{activeTab === "system" ? "System Config" : activeTab}</h1>
            <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
              {isSuperAdminQuery ? "Super Admin" : "Admin"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "users" && <UsersTab />}
              {activeTab === "downloads" && <DownloadsTab />}
              {activeTab === "payments" && <PaymentsTab />}
              {activeTab === "settings" && <SettingsTab />}
              {activeTab === "system" && isSuperAdminQuery && <SystemTab />}
              {activeTab === "activity" && <ActivityTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab() {
  const analytics = useQuery(api.admin.getAnalytics);

  const stats = [
    { label: "Total Users", value: analytics?.totalUsers ?? 0, icon: Users, color: "from-violet-500 to-purple-500" },
    { label: "Downloads", value: analytics?.totalDownloads ?? 0, icon: Download, color: "from-blue-500 to-cyan-500" },
    { label: "Revenue", value: `$${(analytics?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "Credits Active", value: analytics?.totalCreditsInCirculation ?? 0, icon: Coins, color: "from-amber-500 to-orange-500" },
    { label: "Free Users", value: analytics?.freeUsers ?? 0, icon: UserCheck, color: "from-green-500 to-emerald-500" },
    { label: "Credit Users", value: analytics?.creditUsers ?? 0, icon: CreditCard, color: "from-blue-500 to-indigo-500" },
    { label: "Referrals", value: analytics?.totalReferrals ?? 0, icon: Gift, color: "from-pink-500 to-rose-500" },
    { label: "7-Day Active", value: analytics?.recentUsers ?? 0, icon: TrendingUp, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 4).map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(4).map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {analytics?.platformCounts && Object.keys(analytics.platformCounts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Downloads by Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(analytics.platformCounts).map(([platform, count]) => (
                <div key={platform} className="text-center p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-xs text-muted-foreground capitalize mt-1">{platform}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────
function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const users = useQuery(api.admin.getAllUsers, { limit: 100, role: roleFilter || undefined });
  const adjustUserCredits = useMutation(api.admin.adjustUserCredits);
  const manageUserRole = useMutation(api.admin.manageUserRole);

  const [adjustingUser, setAdjustingUser] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const filteredUsers = users?.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.telegramUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreditAdjust = async (userId: string) => {
    if (!adjustAmount || !adjustReason) return;
    try {
      await adjustUserCredits({ targetUserId: userId, amount: parseInt(adjustAmount), reason: adjustReason });
      setAdjustingUser(null);
      setAdjustAmount("");
      setAdjustReason("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users by name, email, or telegram..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["", "super_admin", "admin", "user"].map((role) => (
            <Button key={role} variant={roleFilter === role ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(role)}>
              {role || "All"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filteredUsers?.map((u) => {
              const rc = roleConfig[u.role ?? "user"];
              return (
                <div key={u._id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{u.name ?? "Anonymous"}</span>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${rc?.color ?? ""}`}>{u.role ?? "user"}</Badge>
                        <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${u.mode === "credit" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"}`}>{u.mode}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{u.email ?? "No email"}</span>
                        {u.telegramUsername && <span>@{u.telegramUsername}</span>}
                        <span>{u.credits} credits</span>
                        <span>{u.totalDownloads} downloads</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAdjustingUser(adjustingUser === (u._id as string) ? null : (u._id as string))}>
                        <Coins className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => {
                        const newRole = u.role === "admin" ? "user" : "admin";
                        if (confirm(`Change role to ${newRole}?`)) {
                          await manageUserRole({ targetUserId: u._id as string, newRole: newRole as any });
                        }
                      }}>
                        <Shield className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {adjustingUser === (u._id as string) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 ml-13 p-3 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex gap-2 mb-2">
                        <Input placeholder="Amount (+/-)" type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="h-8 text-sm" />
                        <Input placeholder="Reason" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="h-8 text-sm" />
                      </div>
                      <Button size="sm" onClick={() => handleCreditAdjust(u._id as string)} disabled={!adjustAmount || !adjustReason} className="h-8">
                        <Coins className="w-3 h-3 mr-1.5" /> Apply
                      </Button>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Downloads Tab ──────────────────────────────────────────────────────────
function DownloadsTab() {
  const downloads = useQuery(api.downloads.getAllDownloads, { limit: 50 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">All Downloads ({downloads?.length ?? 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {downloads?.map((dl) => (
            <div key={dl._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{dl.url.slice(0, 80)}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">{dl.platform}</Badge>
                  <span className="text-[10px] text-muted-foreground">{new Date(dl._creationTime).toLocaleString()}</span>
                </div>
              </div>
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${statusConfig[dl.status] ?? ""}`}>{dl.status}</Badge>
              <div className="text-xs text-muted-foreground">{dl.creditsSpent} credits</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Payments Tab ───────────────────────────────────────────────────────────
function PaymentsTab() {
  const payments = useQuery(api.payments.getAllPayments, { limit: 50 });

  const totalRevenue = payments?.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0) ?? 0;
  const pendingPayments = payments?.filter((p) => p.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-500">${totalRevenue.toFixed(2)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold">{payments?.length ?? 0}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{pendingPayments}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" /><p className="text-sm">No payments yet.</p></div>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">${p.amount} {p.currency}</div>
                    <div className="text-xs text-muted-foreground">{p.creditsAwarded} credits • {p.method} • {p.packageName ?? "N/A"}</div>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${statusConfig[p.status] ?? ""}`}>{p.status}</Badge>
                  <div className="text-[10px] text-muted-foreground">{new Date(p._creationTime).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────────
function SettingsTab() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const initCreditPackages = useMutation(api.settings.initCreditPackages);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key: string, value: boolean) => {
    setSaving(true);
    try { await updateSettings({ settings: { [key]: value } }); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleNumberChange = async (key: string, value: number) => {
    setSaving(true);
    try { await updateSettings({ settings: { [key]: value } }); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4" /> Mode Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "freeModeEnabled", label: "Free Mode Enabled", desc: "Allow all users to use the bot for free" },
            { key: "weeklyTopupEnabled", label: "Weekly Top-Up", desc: "Auto-add credits weekly for credit mode users" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <div><Label className="text-sm">{s.label}</Label><p className="text-xs text-muted-foreground">{s.desc}</p></div>
              <Switch checked={(settings as any)?.[s.key] ?? true} onCheckedChange={(v) => handleToggle(s.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="w-4 h-4" /> Platform Toggles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(["youtube", "instagram", "tiktok", "twitter", "facebook"] as const).map((p) => (
            <div key={p} className="flex items-center justify-between">
              <Label className="text-sm capitalize">{p}</Label>
              <Switch checked={(settings as any)?.[`${p}Enabled`] ?? true} onCheckedChange={(v) => handleToggle(`${p}Enabled`, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Coins className="w-4 h-4" /> Credit Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "creditRate", label: "Credits per Download" },
            { key: "weeklyTopupAmount", label: "Weekly Top-Up Amount" },
            { key: "referralBonus", label: "Referral Bonus (referrer)" },
            { key: "referredBonus", label: "Referred Bonus (new user)" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <Label className="text-sm">{s.label}</Label>
              <Input type="number" value={(settings as any)?.[s.key] ?? 0} onChange={(e) => handleNumberChange(s.key, parseInt(e.target.value) || 0)} className="w-20 h-8 text-sm text-right" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> Credit Packages</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Initialize default credit packages.</p>
          <Button size="sm" variant="outline" onClick={() => initCreditPackages()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Init Default Packages
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── System Config Tab (Super Admin Only) ───────────────────────────────────
function SystemTab() {
  const systemConfig = useQuery(api.admin.getSystemConfig);

  if (!systemConfig) {
    return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: systemConfig.userCount, icon: Users },
          { label: "Settings", value: systemConfig.settingsCount, icon: Settings },
          { label: "Super Admins", value: systemConfig.roles.superAdmin, icon: Crown },
          { label: "Admins", value: systemConfig.roles.admin, icon: Shield },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4" /> All Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {systemConfig.settings.map((s: any) => (
              <div key={s.key} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{s.key}</div>
                  <div className="text-xs text-muted-foreground">{s.description}</div>
                </div>
                <div className="text-sm font-mono bg-muted/50 px-3 py-1 rounded-lg">
                  {typeof s.value === "boolean" ? (s.value ? "✓ true" : "✗ false") : String(s.value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Activity Log Tab ───────────────────────────────────────────────────────
function ActivityTab() {
  const activityLogs = useQuery(api.admin.getActivityLogs, { limit: 50 });
  const [typeFilter, setTypeFilter] = useState<string>("");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["", "download", "purchase", "referral", "admin_action", "login", "mode_switch", "system"].map((t) => (
          <Button key={t} variant={typeFilter === t ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(t)}>
            {t || "All"}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {activityLogs?.filter((l) => !typeFilter || l.type === typeFilter).map((log) => (
              <div key={log._id} className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-0.5 shrink-0">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{log.action}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{log.type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</div>
                </div>
                <div className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log._creationTime).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
