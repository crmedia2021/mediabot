import { motion, type Variants } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Download, Zap, Gift, CreditCard, Shield, BarChart3,
  ArrowRight, Youtube, Instagram, Twitter, Facebook,
  Link2, Music, Check, Sparkles, Globe, Users, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const platforms = [
  { name: "YouTube", icon: Youtube, color: "#FF0000", bg: "bg-red-500/10" },
  { name: "Instagram", icon: Instagram, color: "#E4405F", bg: "bg-pink-500/10" },
  { name: "TikTok", icon: Music, color: "#00F2EA", bg: "bg-cyan-500/10" },
  { name: "Twitter/X", icon: Twitter, color: "#1DA1F2", bg: "bg-blue-500/10" },
  { name: "Facebook", icon: Facebook, color: "#1877F2", bg: "bg-blue-600/10" },
  { name: "Direct Links", icon: Link2, color: "#8B5CF6", bg: "bg-violet-500/10" },
];

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Download videos in seconds with our optimized processing pipeline. No waiting, no buffering.", color: "from-amber-500 to-orange-500" },
  { icon: Shield, title: "Free & Premium Modes", description: "Use for free with no limits, or switch to credit mode for priority processing and extra features.", color: "from-emerald-500 to-teal-500" },
  { icon: Gift, title: "Referral Rewards", description: "Invite friends and earn bonus credits. Both you and your friend get rewarded instantly.", color: "from-violet-500 to-purple-500" },
  { icon: CreditCard, title: "Flexible Payments", description: "Buy credit packages via Telegram, PayPal, or crypto. Multiple currencies supported.", color: "from-blue-500 to-indigo-500" },
  { icon: BarChart3, title: "Full Analytics", description: "Track your downloads, spending, and referral earnings with a beautiful personal dashboard.", color: "from-pink-500 to-rose-500" },
  { icon: Globe, title: "Multi-Platform", description: "Works as a Telegram bot, web app, or via our REST API. Access from anywhere, anytime.", color: "from-cyan-500 to-sky-500" },
];

const stats = [
  { value: "6+", label: "Platforms Supported", icon: Globe },
  { value: "100%", label: "Free to Start", icon: Sparkles },
  { value: "24/7", label: "Always Online", icon: Zap },
  { value: "5K+", label: "Daily Downloads", icon: Download },
];

const steps = [
  { step: "1", title: "Sign Up", description: "Create your account in seconds with email or Telegram" },
  { step: "2", title: "Paste Link", description: "Copy any video link from YouTube, TikTok, Instagram, or more" },
  { step: "3", title: "Download", description: "Choose quality and download instantly to your device" },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">CRMedia Bot</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")} className="hidden sm:flex">
              {isAuthenticated ? "Dashboard" : "Sign In"}
            </Button>
            <Button size="sm" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25">
              Get Started <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Free downloads from 6+ platforms
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Download Media From<br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Any Platform</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            One bot for all your media downloads. YouTube, Instagram, TikTok, Twitter, Facebook — just paste a link and go.{" "}
            <span className="text-foreground font-medium">Completely free</span> or unlock premium with credits.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/25 px-8 h-12 text-base">
              Start Downloading <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="h-12 px-8 text-base">
              Learn More
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-muted/50 mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold">Supports Every Major Platform</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">Paste a link from any supported platform and we handle the rest</motion.p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((platform, i) => (
              <motion.div key={platform.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                whileHover={{ y: -4, scale: 1.02 }} className={`relative p-6 rounded-2xl border border-border/50 ${platform.bg} text-center cursor-default transition-shadow hover:shadow-lg`}>
                <platform.icon className="w-8 h-8 mx-auto mb-3" style={{ color: platform.color }} />
                <div className="text-sm font-medium">{platform.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold">Three Steps to Download</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg">It&apos;s as easy as copy, paste, done</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div key={step.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/25">{step.step}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                {i < steps.length - 1 && <div className="hidden md:block absolute top-7 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-border to-transparent" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold">Everything You Need</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">A complete media download platform with powerful features</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:shadow-xl transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-bold">Simple, Transparent Pricing</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">Start free, upgrade when you need more</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="relative p-8 rounded-2xl border border-border/50 bg-card">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">$0</span><span className="text-muted-foreground">/forever</span></div>
              <ul className="space-y-3 mb-8">
                {["Unlimited downloads", "All platforms supported", "720p & 1080p quality", "Basic analytics"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>Get Started Free</Button>
            </motion.div>
            {/* Pro */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="relative p-8 rounded-2xl border-2 border-violet-500/50 bg-card shadow-xl shadow-violet-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold">Most Popular</div>
              <div className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">$7.99</span><span className="text-muted-foreground">/150 credits</span></div>
              <ul className="space-y-3 mb-8">
                {["150 credits per purchase", "Priority processing", "4K quality available", "Full analytics dashboard", "Referral bonuses"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25" onClick={() => navigate("/auth")}>
                Get Pro <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </motion.div>
            {/* Enterprise */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="relative p-8 rounded-2xl border border-border/50 bg-card">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Enterprise</div>
              <div className="flex items-baseline gap-1 mb-6"><span className="text-4xl font-bold">$19.99</span><span className="text-muted-foreground">/500 credits</span></div>
              <ul className="space-y-3 mb-8">
                {["500 credits per purchase", "Fastest processing", "4K quality + HDR", "Advanced analytics API", "Priority support", "Custom batch downloads"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>Get Enterprise</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, stat: "10K+", label: "Active Users", desc: "Trust CRMedia for daily downloads" },
              { icon: Download, stat: "500K+", label: "Downloads", desc: "And counting every day" },
              { icon: TrendingUp, stat: "99.9%", label: "Uptime", desc: "Always available when you need it" },
            ].map((item, i) => (
              <motion.div key={item.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center p-8 rounded-2xl bg-muted/30">
                <item.icon className="w-8 h-8 text-violet-500 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-1">{item.stat}</div>
                <div className="text-sm font-medium mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="relative p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Downloading?</h2>
              <p className="text-violet-100 text-lg mb-8 max-w-lg mx-auto">Join thousands of users who download media from every major platform with CRMedia Bot</p>
              <Button size="lg" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="bg-white text-violet-700 hover:bg-white/90 shadow-xl px-8 h-12 text-base font-semibold">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Download className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm">CRMedia Bot</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Sign In</button>
              <span className="text-xs">&copy; 2026 CRMedia Bot</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
