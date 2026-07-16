import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Download, CreditCard, Gift, Link2, Copy, Check, Coins,
  History, Users, Package, LogOut, ExternalLink, ArrowUpRight,
  ArrowDownRight, Loader2, Settings, Search, Home,
  LayoutDashboard, BarChart3, ShoppingCart, User as UserIcon,
  ChevronLeft, ChevronRight, Zap, Star, TrendingUp, Shield,
  Plus, Minus,
} from "lucide-react";
import { useNavigate } from "react-router";
import StripeCheckout from "@/components/StripeCheckout";

const platformColors: Record<string, string> = {
  youtube: "bg-red-500/10 text-red-500 border-red-500/20",
  instagram: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  tiktok: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  twitter: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  facebook: "bg-blue-600/10 text-blue-600 border-blue-600/20",
  other: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

const platformIcons: Record<string, string> = {
  youtube: "▶",
  instagram: "📷",
  tiktok: "🎵",
  twitter: "🐦",
  facebook: "📘",
  other: "🔗",
};

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Pending" },
  processing: { color: "bg-blue-500/10 text-blue-600 border-blue-500/20", label: "Processing" },
  completed: { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Completed" },
  failed: { color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Failed" },
};

const txConfig: Record<string, { color: string; icon: typeof ArrowDownRight; label: string }> = {
  spend: { color: "text-red-500 bg-red-500/10", icon: ArrowUpRight, label: "Spent" },
  topup: { color: "text-emerald-500 bg-emerald-500/10", icon: ArrowDownRight, label: "Top-up" },
  referral_bonus: { color: "text-violet-500 bg-violet-500/10", icon: Gift, label: "Referral" },
  purchase: { color: "text-blue-500 bg-blue-500/10", icon: ShoppingCart, label: "Purchase" },
  admin_adjustment: { color: "text-amber-500 bg-amber-500/10", icon: Settings, label: "Admin" },
  weekly_topup: { color: "text-cyan-500 bg-cyan-500/10", icon: Zap, label: "Weekly" },
};

type SidebarTab = "overview" | "downloads" | "credits" | "referrals" | "packages" | "settings";

const sidebarItems: { id: SidebarTab; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "downloads", label: "Downloads", icon: Download },
  { id: "credits", label: "Credits", icon: Coins },
  { id: "referrals", label: "Referrals", icon: Gift },
  { id: "packages", label: "Buy Credits", icon: ShoppingCart },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [applyingReferral, setApplyingReferral] = useState(false);
  const [checkoutPkg, setCheckoutPkg] = useState<any>(null);

  const ensureProfile = useMutation(api.users.ensureProfile);
  const createDownload = useMutation(api.downloads.createDownload);
  const switchMode = useMutation(api.credits.switchMode);
  const applyReferralCode = useMutation(api.referrals.applyReferralCode);
  const updateProfile = useMutation(api.users.updateProfile);
  const touchLastSeen = useMutation(api.users.touchLastSeen);

  const balance = useQuery(api.credits.getBalance);
  const transactions = useQuery(api.credits.getTransactions, { limit: 30 });
  const downloads = useQuery(api.downloads.getMyDownloads, { limit: 30 });
  const referrals = useQuery(api.referrals.getMyReferrals);
  const packages = useQuery(api.settings.getCreditPackages);
  const profile = useQuery(api.users.getProfile);
  const isAdmin = useQuery(api.admin.isAdmin);

  useEffect(() => {
    if (!authLoading && user) {
      ensureProfile().catch(console.error);
      touchLastSeen().catch(console.error);
    }
  }, [authLoading, user, ensureProfile, touchLastSeen]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!urlInput.trim()) return;
    setDownloading(true);
    try {
      await createDownload({ url: urlInput.trim() });
      setUrlInput("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSwitchMode = async (mode: "free" | "credit") => {
    try { await switchMode({ mode }); } catch (err) { console.error(err); }
  };

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return;
    setApplyingReferral(true);
    try {
      await applyReferralCode({ referralCode: referralInput.trim().toUpperCase() });
      setReferralInput("");
    } catch (err) { console.error(err); }
    finally { setApplyingReferral(false); }
  };

  const copyReferralCode = () => {
    if (referrals?.referralCode) {
      navigator.clipboard.writeText(referrals.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const credits = balance?.credits ?? 0;
  const mode = balance?.mode ?? "free";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-card border-r border-border/50 flex flex-col fixed h-full z-40`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-border/50">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Download className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">CRMedia</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-violet-500/10 text-violet-600"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-border/50 space-y-1">
          {isAdmin && (
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-500/10 transition-all"
            >
              <Shield className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Admin Panel</span>}
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-all"
          >
            <Home className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Home</span>}
          </button>
          <button
            onClick={async () => { await signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold capitalize">
              {activeTab === "packages" ? "Buy Credits" : activeTab}
            </h1>
            <Badge variant="secondary" className={`text-xs ${mode === "free" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
              {mode === "free" ? "Free Mode" : "Credit Mode"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-600">{credits}</span>
              <span className="text-xs text-amber-600/70">credits</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {(user.name ?? user.email ?? "?")[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <OverviewTab credits={credits} mode={mode} downloads={downloads} referrals={referrals} urlInput={urlInput} setUrlInput={setUrlInput} downloading={downloading} handleDownload={handleDownload} handleSwitchMode={handleSwitchMode} />}
              {activeTab === "downloads" && <DownloadsTab downloads={downloads} />}
              {activeTab === "credits" && <CreditsTab transactions={transactions} credits={credits} />}
              {activeTab === "referrals" && <ReferralsTab referrals={referrals} referralInput={referralInput} setReferralInput={setReferralInput} applyingReferral={applyingReferral} handleApplyReferral={handleApplyReferral} copiedCode={copiedCode} copyReferralCode={copyReferralCode} />}
              {activeTab === "packages" && <PackagesTab packages={packages} onPurchase={setCheckoutPkg} />}
              {activeTab === "settings" && <SettingsTab profile={profile} updateProfile={updateProfile} user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Stripe Checkout Dialog */}
      {checkoutPkg && (
        <StripeCheckout
          packageId={checkoutPkg._id}
          packageName={checkoutPkg.name}
          credits={checkoutPkg.credits}
          price={checkoutPkg.price}
          currency={checkoutPkg.currency}
          open={!!checkoutPkg}
          onOpenChange={(open) => !open && setCheckoutPkg(null)}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ credits, mode, downloads, referrals, urlInput, setUrlInput, downloading, handleDownload, handleSwitchMode }: any) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Credits", value: credits, icon: Coins, color: "from-amber-500 to-orange-500", sub: mode === "free" ? "Free mode" : "Credit mode" },
          { label: "Downloads", value: downloads?.length ?? 0, icon: Download, color: "from-blue-500 to-cyan-500", sub: "Total" },
          { label: "Referrals", value: referrals?.totalReferrals ?? 0, icon: Users, color: "from-violet-500 to-purple-500", sub: "People" },
          { label: "Bonus Earned", value: referrals?.totalBonusEarned ?? 0, icon: Gift, color: "from-emerald-500 to-teal-500", sub: "Credits" },
        ].map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-500" />
            Quick Download
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Paste a link (YouTube, Instagram, TikTok, Twitter, Facebook...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                className="pl-9 h-11"
              />
            </div>
            <Button
              onClick={handleDownload}
              disabled={!urlInput.trim() || downloading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white h-11 px-6"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Download
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {["youtube.com", "instagram.com", "tiktok.com", "x.com", "facebook.com"].map((p) => (
              <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Downloads */}
      {downloads && downloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {downloads.slice(0, 5).map((dl: any) => (
                <div key={dl._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${platformColors[dl.platform] ?? platformColors.other}`}>
                    {platformIcons[dl.platform] ?? "🔗"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{dl.title ?? dl.url.slice(0, 60)}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${platformColors[dl.platform] ?? ""}`}>{dl.platform}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(dl.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${statusConfig[dl.status]?.color ?? ""}`}>{statusConfig[dl.status]?.label ?? dl.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Downloads Tab ──────────────────────────────────────────────────────────
function DownloadsTab({ downloads }: { downloads: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          Download History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!downloads || downloads.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Download className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No downloads yet. Paste a link in the Overview tab!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {downloads.map((dl: any) => (
              <div key={dl._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${platformColors[dl.platform] ?? platformColors.other}`}>
                  {platformIcons[dl.platform] ?? "🔗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{dl.title ?? dl.url.slice(0, 80)}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${platformColors[dl.platform] ?? ""}`}>{dl.platform}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(dl.createdAt).toLocaleString()}</span>
                    {dl.quality && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{dl.quality}</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 border ${statusConfig[dl.status]?.color ?? ""}`}>{statusConfig[dl.status]?.label ?? dl.status}</Badge>
                  {dl.creditsSpent > 0 && <div className="text-[10px] text-muted-foreground mt-1">-{dl.creditsSpent} credits</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Credits Tab ────────────────────────────────────────────────────────────
function CreditsTab({ transactions, credits }: { transactions: any; credits: number }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Credits</p>
              <p className="text-4xl font-bold mt-1">{credits}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Coins className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => {
                const config = txConfig[tx.type] ?? txConfig.spend;
                const Icon = config.icon;
                return (
                  <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tx.description}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(tx.createdAt).toLocaleString()} • Balance: {tx.balanceAfter}
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${tx.amount >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {tx.amount >= 0 ? "+" : ""}{tx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Referrals Tab ──────────────────────────────────────────────────────────
function ReferralsTab({ referrals, referralInput, setReferralInput, applyingReferral, handleApplyReferral, copiedCode, copyReferralCode }: any) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="w-4 h-4 text-violet-500" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals?.referralCode ? (
              <div>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <code className="text-xl font-mono font-bold tracking-[0.3em] flex-1 text-center">{referrals.referralCode}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyReferralCode}>
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                  <p className="text-xs text-muted-foreground">
                    Share this code with friends. When they sign up and use it, you both earn bonus credits!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <div className="text-2xl font-bold">{referrals.totalReferrals}</div>
                    <div className="text-xs text-muted-foreground">Referrals</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/30">
                    <div className="text-2xl font-bold text-emerald-500">{referrals.totalBonusEarned}</div>
                    <div className="text-xs text-muted-foreground">Bonus Earned</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Your referral code will be generated automatically.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Have a Referral Code?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono tracking-[0.2em] text-center text-lg"
              />
              <Button onClick={handleApplyReferral} disabled={!referralInput.trim() || applyingReferral} className="px-6">
                {applyingReferral ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Enter a friend's referral code to earn bonus credits for both of you.
              </p>
            </div>
            {referrals?.referredBy && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xs text-emerald-600">
                  ✓ You were referred with code: <span className="font-mono font-bold">{referrals.referredBy}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Packages Tab ───────────────────────────────────────────────────────────
function PackagesTab({ packages, onPurchase }: { packages: any; onPurchase: (pkg: any) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Credit Packages</h2>
        <p className="text-sm text-muted-foreground">Purchase credits to use in Credit Mode</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages && packages.length > 0 ? (
          packages.map((pkg: any) => (
            <Card key={pkg._id} className={`relative overflow-hidden ${pkg.badge ? "border-violet-500/50 border-2" : ""}`}>
              {pkg.badge && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center text-[10px] font-semibold py-1">
                  {pkg.badge}
                </div>
              )}
              <CardContent className={`p-6 text-center ${pkg.badge ? "pt-10" : ""}`}>
                <div className="text-sm font-medium text-muted-foreground mb-1">{pkg.name}</div>
                <div className="text-4xl font-bold mb-1">{pkg.credits}</div>
                <div className="text-xs text-muted-foreground mb-4">credits</div>
                <Separator className="mb-4" />
                <div className="text-2xl font-bold mb-1">${pkg.price}</div>
                <div className="text-xs text-muted-foreground mb-5">{pkg.currency}</div>
                <Button
                  className="w-full"
                  variant={pkg.badge ? "default" : "outline"}
                  onClick={() => onPurchase(pkg)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Credit packages coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Settings Tab ───────────────────────────────────────────────────────────
function SettingsTab({ profile, updateProfile, user }: any) {
  const [name, setName] = useState(profile?.name ?? "");
  const [telegramId, setTelegramId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const linkTelegram = useMutation(api.users.linkTelegram);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleLinkTelegram = async () => {
    if (!telegramId.trim()) return;
    setSaving(true);
    try {
      await linkTelegram({ telegramId: telegramId.trim(), telegramUsername: telegramUsername.trim() || undefined });
      setTelegramId("");
      setTelegramUsername("");
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Display Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Your name" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input value={user?.email ?? "Not set"} disabled className="mt-1" />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">📱</span>
            Link Telegram
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Telegram User ID</Label>
            <Input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} className="mt-1" placeholder="Your Telegram user ID" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Telegram Username (optional)</Label>
            <Input value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} className="mt-1" placeholder="@username" />
          </div>
          {profile?.telegramId ? (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-emerald-600">
                ✓ Linked to Telegram: @{profile.telegramUsername ?? profile.telegramId}
              </p>
            </div>
          ) : (
            <Button variant="outline" onClick={handleLinkTelegram} disabled={!telegramId.trim() || saving}>
              Link Telegram Account
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-lg">💳</span>
            Stripe Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.stripeCustomerId ? (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-emerald-600">✓ Stripe account linked</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Stripe account will be linked automatically when you make your first purchase.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
