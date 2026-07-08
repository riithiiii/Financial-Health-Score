import { useState, useEffect, useRef } from "react";
import { getInitials, getSearchResults, useAppStore, type AppSettings, type AutoSavingsRule, type FinancialGoal, type LoanPlan, type LinkedAccount, type SupportTicket } from "./store";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Home, TrendingUp, Brain, Target, User, Bell, Settings,
  CreditCard, BookOpen, FileText, ChevronRight, ChevronLeft,
  ArrowUpRight, ArrowDownRight, Plus, Search, X, Menu,
  Shield, Calendar, BarChart2, MessageSquare, Wallet,
  LogOut, CheckCircle, AlertCircle, Clock, Download,
  Lock, Eye, EyeOff, Activity, Send, Edit2, ChevronDown,
  Phone, Mail, Building2, ArrowRight, TrendingDown,
  Zap, Award, Info, Filter, Sliders, RefreshCw,
} from "lucide-react";

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const C = {
  navy: "#123A72",
  navyDark: "#0D2B57",
  navyMid: "#1A4D9A",
  accent: "#2563EB",
  accentBg: "#EFF6FF",
  bg: "#F8FAFC",
  white: "#FFFFFF",
  success: "#16A34A",
  successBg: "#F0FDF4",
  warning: "#D97706",
  warningBg: "#FFFBEB",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  text: "#111827",
  textSec: "#6B7280",
  border: "#E5E7EB",
  muted: "#F1F5F9",
};

type Screen =
  | "splash" | "login"
  | "dashboard" | "health" | "expenses" | "savings"
  | "goals" | "loans" | "ai-coach" | "simulator"
  | "report" | "transactions" | "education" | "help"
  | "security-center" | "notifications" | "profile";

// ─── FORMATTERS ───────────────────────────────────────────────────────────────
const fmt = (v: number) => {
  const a = Math.abs(v);
  if (a >= 100000) return `₹${(a / 100000).toFixed(1)}L`;
  if (a >= 1000) return `₹${(a / 1000).toFixed(0)}K`;
  return `₹${a.toLocaleString("en-IN")}`;
};
const fmtFull = (v: number) =>
  `₹${Math.abs(v).toLocaleString("en-IN")}`;

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Jan", income: 82000, expenses: 48200, savings: 33800 },
  { month: "Feb", income: 85000, expenses: 51300, savings: 33700 },
  { month: "Mar", income: 85000, expenses: 47100, savings: 37900 },
  { month: "Apr", income: 88000, expenses: 55200, savings: 32800 },
  { month: "May", income: 85000, expenses: 49800, savings: 35200 },
  { month: "Jun", income: 85000, expenses: 52400, savings: 32600 },
];

const EXP_CATS = [
  { name: "Housing", value: 22500, color: C.navy, pct: 43 },
  { name: "Food & Dining", value: 8500, color: C.accent, pct: 16 },
  { name: "Shopping", value: 6800, color: "#7C3AED", pct: 13 },
  { name: "Transport", value: 4200, color: C.success, pct: 8 },
  { name: "Health", value: 3200, color: C.warning, pct: 6 },
  { name: "Entertainment", value: 2400, color: "#0891B2", pct: 5 },
  { name: "Others", value: 4800, color: C.textSec, pct: 9 },
];

const TXN = [
  { id: 1, name: "HDFC Home Loan EMI", cat: "Loan", amount: -22500, date: "28 Jun 2026", type: "debit" },
  { id: 2, name: "Salary — Infosys Ltd", cat: "Income", amount: 85000, date: "28 Jun 2026", type: "credit" },
  { id: 3, name: "BigBasket Grocery", cat: "Groceries", amount: -2340, date: "27 Jun 2026", type: "debit" },
  { id: 4, name: "Swiggy Order", cat: "Food & Dining", amount: -485, date: "27 Jun 2026", type: "debit" },
  { id: 5, name: "SIP — Axis Bluechip", cat: "Investment", amount: -10000, date: "26 Jun 2026", type: "debit" },
  { id: 6, name: "Amazon Purchase", cat: "Shopping", amount: -3299, date: "25 Jun 2026", type: "debit" },
  { id: 7, name: "Freelance — TechCorp", cat: "Income", amount: 15000, date: "24 Jun 2026", type: "credit" },
  { id: 8, name: "Ola Cabs", cat: "Transport", amount: -340, date: "24 Jun 2026", type: "debit" },
  { id: 9, name: "BSES Electricity Bill", cat: "Utilities", amount: -1850, date: "23 Jun 2026", type: "debit" },
  { id: 10, name: "Netflix Subscription", cat: "Entertainment", amount: -649, date: "22 Jun 2026", type: "debit" },
  { id: 11, name: "Zomato Order", cat: "Food & Dining", amount: -620, date: "21 Jun 2026", type: "debit" },
  { id: 12, name: "Fuel — HP Petrol", cat: "Transport", amount: -2100, date: "20 Jun 2026", type: "debit" },
  { id: 13, name: "PhonePe Transfer", cat: "Transfer", amount: -5000, date: "19 Jun 2026", type: "debit" },
  { id: 14, name: "Airtel Recharge", cat: "Utilities", amount: -399, date: "18 Jun 2026", type: "debit" },
  { id: 15, name: "Medical — Apollo Pharmacy", cat: "Health", amount: -1240, date: "17 Jun 2026", type: "debit" },
];

const GOALS = [
  { id: 1, name: "Emergency Fund", target: 255000, current: 180000, deadline: "Dec 2026", color: C.navy, monthly: 12500 },
  { id: 2, name: "Europe Vacation", target: 150000, current: 45000, deadline: "Jun 2027", color: C.accent, monthly: 8750 },
  { id: 3, name: "New Laptop", target: 80000, current: 62000, deadline: "Aug 2026", color: C.success, monthly: 9000 },
  { id: 4, name: "Car Down Payment", target: 200000, current: 30000, deadline: "Mar 2027", color: C.warning, monthly: 18500 },
];

const LOANS = [
  { id: 1, name: "Home Loan", bank: "HDFC Bank", principal: 4500000, outstanding: 3820000, emi: 38500, rate: 8.5, months: 240, paid: 36 },
  { id: 2, name: "Car Loan", bank: "IDBI Bank", principal: 850000, outstanding: 340000, emi: 15200, rate: 9.2, months: 60, paid: 36 },
  { id: 3, name: "Personal Loan", bank: "SBI", principal: 200000, outstanding: 82000, emi: 8800, rate: 14.5, months: 24, paid: 13 },
];

const HEALTH_FACTORS = [
  { name: "Credit Score", score: 82, status: "good" as const, detail: "742 / 900" },
  { name: "Savings Rate", score: 64, status: "good" as const, detail: "38.4% of income" },
  { name: "Debt-to-Income", score: 45, status: "moderate" as const, detail: "32% DTI ratio" },
  { name: "Emergency Fund", score: 71, status: "good" as const, detail: "7.1 months covered" },
  { name: "Investment Rate", score: 55, status: "moderate" as const, detail: "11.8% of income" },
  { name: "Bill Payments", score: 97, status: "excellent" as const, detail: "100% on-time" },
];

const AI_INSIGHTS = [
  { type: "warning" as const, text: "Dining expenses are 28% above last month. Meal planning could save ₹2,400 monthly." },
  { type: "success" as const, text: "SIP contributions are consistent. You are on track to meet your retirement corpus by 2047." },
  { type: "info" as const, text: "Refinancing your personal loan at a lower rate could save ₹8,200 in remaining interest." },
  { type: "warning" as const, text: "Shopping spend hit ₹6,800 this month — highest in 6 months. Review discretionary spending." },
];

const NOTIFS = [
  { id: 1, title: "EMI Due in 3 Days", body: "HDFC Home Loan EMI of ₹38,500 is due on 1 Jul 2026.", time: "2h ago", type: "warning" as const, read: false },
  { id: 2, title: "Unusual Spending Detected", body: "You spent ₹4,200 on dining this week — 3x your weekly average.", time: "5h ago", type: "alert" as const, read: false },
  { id: 3, title: "Goal Milestone Reached", body: "Emergency Fund goal is 71% complete. Keep up the momentum!", time: "1d ago", type: "success" as const, read: true },
  { id: 4, title: "Monthly Report Ready", body: "Your June 2026 financial report is ready. Review your spending summary.", time: "2d ago", type: "info" as const, read: true },
  { id: 5, title: "SIP Auto-Debit Successful", body: "SIP of ₹10,000 for Axis Bluechip Fund was debited successfully.", time: "3d ago", type: "success" as const, read: true },
  { id: 6, title: "Credit Score Updated", body: "Your CIBIL score improved by 8 points to 742. Excellent progress!", time: "5d ago", type: "info" as const, read: true },
];

const EDU_MODULES = [
  { id: 1, title: "Understanding Your Credit Score", cat: "Credit", duration: "8 min", level: "Beginner", done: true, points: 50 },
  { id: 2, title: "Mutual Funds: A Beginner's Guide", cat: "Investments", duration: "12 min", level: "Beginner", done: true, points: 75 },
  { id: 3, title: "Tax Saving under Section 80C", cat: "Taxation", duration: "15 min", level: "Intermediate", done: false, points: 100 },
  { id: 4, title: "EMI vs Lumpsum: Making the Right Choice", cat: "Loans", duration: "10 min", level: "Beginner", done: false, points: 60 },
  { id: 5, title: "Building a 6-Month Emergency Fund", cat: "Planning", duration: "7 min", level: "Beginner", done: false, points: 50 },
  { id: 6, title: "Retirement Planning in Your 30s", cat: "Planning", duration: "20 min", level: "Advanced", done: false, points: 150 },
  { id: 7, title: "Debt Avalanche vs Debt Snowball", cat: "Debt", duration: "9 min", level: "Intermediate", done: false, points: 80 },
  { id: 8, title: "Understanding NPS and PPF", cat: "Investments", duration: "11 min", level: "Intermediate", done: false, points: 90 },
];

const CHAT_INIT = [
  { role: "ai" as const, text: "Hello, Rahul. I have reviewed your financial profile. Your Financial Health Score stands at 742 — Good. How can I help you improve your finances today?" },
];

const AI_REPLIES: Record<string, string> = {
  default: "Based on your spending patterns and income, I recommend increasing your SIP contributions by ₹2,000 per month. This would compound to approximately ₹3.8L over 10 years at a 12% CAGR. Would you like me to create a rebalancing plan?",
  credit: "Your CIBIL score of 742 is Good. To push it above 750 (Excellent), focus on: (1) keeping credit utilization below 20%, (2) maintaining 100% on-time payments, and (3) avoiding new credit applications for 6 months. You are approximately 3-4 months away from Excellent tier.",
  savings: "Your current savings rate is 38.4%, which is above the recommended 30%. To optimize further, consider moving ₹15,000 from your savings account to a liquid mutual fund — you would earn approximately 6.8% vs 3.5% in savings. This could yield ₹2,205 in additional annual returns.",
  loan: "Prepaying ₹50,000 on your Home Loan would reduce your tenure by approximately 8 months and save ₹1.24L in interest. Given your current surplus, this is a high-impact move. Alternatively, investing that ₹50,000 in equity SIP at 12% CAGR would yield ₹89,000 in 10 years — a net gain of ₹39,000 over loan prepayment.",
  budget: "Based on your June spending, I suggest this budget allocation: Housing ₹22,500 (26%), Food ₹7,500 (9%), Transport ₹4,000 (5%), Shopping ₹5,000 (6%), Health ₹3,000 (4%), Investments ₹17,000 (20%), Emergency Fund ₹12,000 (14%), Others ₹4,000 (5%), Discretionary ₹15,000 (18%). This keeps expenses at 62% and savings at 38%.",
};

const QUICK_Qs = [
  "How can I improve my credit score?",
  "Best savings strategy for my income?",
  "Should I prepay my home loan?",
  "Create a monthly budget for me",
];

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

const CircularScore = ({ score, max = 900, size = 160 }: { score: number; max?: number; size?: number }) => {
  const sw = 11;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const prog = (score / max) * circ;
  const color = score >= 700 ? C.success : score >= 500 ? C.warning : C.error;
  const label = score >= 750 ? "Excellent" : score >= 700 ? "Good" : score >= 500 ? "Fair" : "Poor";
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
          style={{ transition: "stroke-dasharray 1.2s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center justify-center z-10">
        <span className="font-bold leading-none" style={{ color: C.text, fontSize: size > 120 ? 32 : 22 }}>{score}</span>
        <span className="text-xs mt-0.5" style={{ color: C.textSec }}>/ {max}</span>
        <span className="text-xs font-semibold mt-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}18`, color }}>{label}</span>
      </div>
    </div>
  );
};

const ProgressBar = ({ value, max, color = C.navy, height = 6 }: { value: number; max: number; color?: string; height?: number }) => (
  <div className="w-full rounded-full overflow-hidden" style={{ backgroundColor: C.muted, height }}>
    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }} />
  </div>
);

const StatusBadge = ({ status, label }: { status: "good" | "moderate" | "excellent" | "poor"; label?: string }) => {
  const cfg = {
    good: { bg: C.accentBg, text: C.accent, t: label || "Good" },
    moderate: { bg: C.warningBg, text: C.warning, t: label || "Moderate" },
    excellent: { bg: C.successBg, text: C.success, t: label || "Excellent" },
    poor: { bg: C.errorBg, text: C.error, t: label || "Poor" },
  }[status];
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      {cfg.t}
    </span>
  );
};

const Chip = ({ label, color = C.navy }: { label: string; color?: string }) => (
  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${color}12`, color }}>
    {label}
  </span>
);

const Card = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div className={`rounded-xl border ${className}`} style={{ backgroundColor: C.white, borderColor: C.border, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", ...style }}>
    {children}
  </div>
);

const Btn = ({
  children, variant = "primary", size = "md", onClick, className = "", disabled = false, full = false, type = "button",
}: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg"; onClick?: () => void; className?: string; disabled?: boolean; full?: boolean; type?: "button" | "submit" | "reset";
}) => {
  const v = {
    primary: { bg: C.navy, color: C.white, border: C.navy },
    secondary: { bg: C.white, color: C.navy, border: C.border },
    ghost: { bg: "transparent", color: C.textSec, border: "transparent" },
    danger: { bg: C.error, color: C.white, border: C.error },
    accent: { bg: C.accent, color: C.white, border: C.accent },
  }[variant];
  const s = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-sm" }[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rounded-lg font-semibold border transition-all ${s} ${full ? "w-full" : ""} ${disabled ? "opacity-40 cursor-not-allowed" : "hover:opacity-90 active:scale-95"} ${className}`}
      style={{ backgroundColor: v.bg, color: v.color, borderColor: v.border }}>
      {children}
    </button>
  );
};

const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-semibold" style={{ color: C.text }}>{title}</h2>
    {action && (
      <button onClick={onAction} className="text-xs font-medium flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: C.accent }}>
        {action} <ChevronRight size={12} />
      </button>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border p-3 text-xs" style={{ backgroundColor: C.white, borderColor: C.border, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p className="font-semibold mb-1.5" style={{ color: C.text }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 mb-0.5" style={{ color: p.color }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold">{fmtFull(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const InsightCard = ({ type, text }: { type: "warning" | "success" | "info" | "alert"; text: string }) => {
  const cfg = {
    warning: { icon: AlertCircle, color: C.warning, bg: C.warningBg },
    success: { icon: CheckCircle, color: C.success, bg: C.successBg },
    info: { icon: Info, color: C.accent, bg: C.accentBg },
    alert: { icon: Zap, color: C.error, bg: C.errorBg },
  }[type];
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: cfg.bg }}>
      <Icon size={15} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
      <p className="text-xs leading-relaxed" style={{ color: C.text }}>{text}</p>
    </div>
  );
};

// ─── LAYOUT COMPONENTS ────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Screen; label: string; icon: React.ElementType; group?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, group: "Main" },
  { id: "health", label: "Health Score", icon: Activity, group: "Main" },
  { id: "expenses", label: "Expense Analysis", icon: BarChart2, group: "Analytics" },
  { id: "savings", label: "Savings Planner", icon: Wallet, group: "Analytics" },
  { id: "goals", label: "Goals", icon: Target, group: "Analytics" },
  { id: "loans", label: "Loans & EMI", icon: CreditCard, group: "Analytics" },
  { id: "ai-coach", label: "AI Coach", icon: Brain, group: "AI Features" },
  { id: "simulator", label: "Financial Simulator", icon: Sliders, group: "AI Features" },
  { id: "report", label: "Monthly Report", icon: FileText, group: "Reports" },
  { id: "transactions", label: "Transactions", icon: ArrowRight, group: "Reports" },
  { id: "education", label: "Education", icon: BookOpen, group: "Resources" },
  { id: "help", label: "Help & Support", icon: MessageSquare, group: "Account" },
  { id: "security-center", label: "Account & Security", icon: Shield, group: "Account" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "Account" },
  { id: "profile", label: "Profile & Settings", icon: Settings, group: "Account" },
];

const BOTTOM_NAV: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "expenses", label: "Analytics", icon: BarChart2 },
  { id: "ai-coach", label: "AI Coach", icon: Brain },
  { id: "goals", label: "Goals", icon: Target },
  { id: "profile", label: "Profile", icon: User },
];

const Sidebar = ({ active, setScreen, unreadCount }: { active: Screen; setScreen: (s: Screen) => void; unreadCount: number }) => {
  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  const { user, logout } = useAppStore();
  const displayName = user?.customerName ?? "Customer";
  const initials = getInitials(displayName);
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: C.navy, width: 240 }}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Shield size={18} color="white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">IDBI FinHealth</div>
          <div className="text-white/40 text-xs">Powered by AI</div>
        </div>
      </div>
      <div className="h-px mx-5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1" style={{ scrollbarWidth: "none" }}>
        {groups.map((g) => (
          <div key={g} className="mb-1">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest px-3 mb-1 mt-3">{g}</p>
            {NAV_ITEMS.filter((n) => n.group === g).map((item) => {
              const isActive = active === item.id;
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setScreen(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    color: isActive ? "white" : "rgba(255,255,255,0.55)",
                  }}>
                  <Icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === "notifications" && unreadCount > 0 && (
                    <span className="text-xs font-bold rounded-full px-1.5 py-0.5 leading-none" style={{ backgroundColor: C.error, color: "white", fontSize: 10 }}>{unreadCount}</span>
                  )}
                  {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-l" style={{ backgroundColor: "white" }} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="h-px mx-5" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold" style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "white" }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-semibold truncate">{displayName}</div>
          <div className="text-white/40 text-xs truncate">{user?.email ?? "Secure banking"}</div>
        </div>
        <button onClick={() => logout()} className="opacity-50 hover:opacity-100 transition-opacity">
          <LogOut size={15} color="white" />
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ title, screen, setScreen, unreadCount }: { title: string; screen: Screen; setScreen: (s: Screen) => void; unreadCount: number }) => {
  const { user, searchQuery, setSearchQuery } = useAppStore();
  const results = getSearchResults(searchQuery);
  const initials = getInitials(user?.customerName ?? "Customer");
  return (
    <div className="h-14 border-b flex items-center justify-between px-6 flex-shrink-0" style={{ backgroundColor: C.white, borderColor: C.border }}>
      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold" style={{ color: C.text }}>{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textSec }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-8 pr-4 py-2 text-xs rounded-lg border outline-none transition-all" style={{ borderColor: C.border, color: C.text, backgroundColor: C.muted, width: 220 }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.border)} />
          {searchQuery.trim() && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl border p-2 shadow-sm" style={{ backgroundColor: C.white, borderColor: C.border }}>
              {results.map((result) => (
                <button key={result.title} onMouseDown={() => { setSearchQuery(""); setScreen(result.screen); }} className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50">
                  <div className="mt-0.5 w-2 h-2 rounded-full" style={{ backgroundColor: C.accent }} />
                  <div>
                    <div className="text-xs font-semibold" style={{ color: C.text }}>{result.title}</div>
                    <div className="text-[11px]" style={{ color: C.textSec }}>{result.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setScreen("notifications")} className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50">
          <Bell size={16} style={{ color: C.textSec }} />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: C.error }} />}
        </button>
        <button onClick={() => setScreen("profile")} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: C.navy, color: "white" }}>{initials}</button>
      </div>
    </div>
  );
};

const MobileHeader = ({ title, setScreen, unreadCount, showBack, onBack, onOpenDrawer }: { title: string; setScreen: (s: Screen) => void; unreadCount: number; showBack?: boolean; onBack?: () => void; onOpenDrawer?: () => void }) => (
  <div className="h-14 border-b flex items-center justify-between px-4 flex-shrink-0" style={{ backgroundColor: C.white, borderColor: C.border }}>
    <div className="flex items-center gap-2 min-w-0">
      <button onClick={onOpenDrawer} className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-50" aria-label="Open navigation menu">
        <Menu size={18} style={{ color: C.text }} />
      </button>
      {showBack ? (
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-50">
          <ChevronLeft size={20} style={{ color: C.text }} />
        </button>
      ) : (
        <div className="flex items-center gap-2 ml-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.navy }}>
            <Shield size={13} color="white" />
          </div>
          <span className="font-bold text-sm truncate" style={{ color: C.navy }}>IDBI FinHealth</span>
        </div>
      )}
      {showBack && <span className="font-semibold text-sm truncate" style={{ color: C.text }}>{title}</span>}
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => setScreen("notifications")} className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50" aria-label="Open notifications">
        <Bell size={18} style={{ color: C.textSec }} />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: C.error }} />}
      </button>
    </div>
  </div>
);

const MobileNavDrawer = ({ active, setScreen, unreadCount, open, onClose }: { active: Screen; setScreen: (s: Screen) => void; unreadCount: number; open: boolean; onClose: () => void }) => {
  const groups = [...new Set(NAV_ITEMS.map((n) => n.group))];
  return (
    <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 transition-all duration-300 ${open ? "bg-black/35 opacity-100" : "bg-transparent opacity-0"}`} onClick={onClose} />
      <div className={`relative h-full w-[85vw] max-w-[320px] overflow-y-auto border-r shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`} style={{ backgroundColor: C.navy, borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="px-5 py-5 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
              <Shield size={18} color="white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">IDBI FinHealth</div>
              <div className="text-white/45 text-xs">Secure mobile banking</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10" aria-label="Close navigation menu">
            <X size={17} color="white" />
          </button>
        </div>
        <nav className="px-3 py-4 flex flex-col gap-1">
          {groups.map((g) => (
            <div key={g} className="mb-1">
              <p className="px-3 mb-1 mt-3 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.35)" }}>{g}</p>
              {NAV_ITEMS.filter((item) => item.group === g).map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { setScreen(item.id); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent", color: isActive ? "white" : "rgba(255,255,255,0.65)" }}>
                    <Icon size={16} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.id === "notifications" && unreadCount > 0 && (
                      <span className="text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none" style={{ backgroundColor: C.error, color: "white" }}>{unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

const BottomNav = ({ active, setScreen }: { active: Screen; setScreen: (s: Screen) => void }) => (
  <div className="border-t flex items-center justify-around px-2 py-1" style={{ backgroundColor: C.white, borderColor: C.border }}>
    {BOTTOM_NAV.map((item) => {
      const isActive = active === item.id || (item.id === "expenses" && ["expenses", "savings", "loans", "health", "simulator", "report", "transactions"].includes(active));
      const Icon = item.icon;
      return (
        <button key={item.id} onClick={() => setScreen(item.id)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all"
          style={{ color: isActive ? C.navy : C.textSec }}>
          <Icon size={20} />
          <span className="text-xs font-medium">{item.label}</span>
          {isActive && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: C.navy }} />}
        </button>
      );
    })}
  </div>
);

// ─── SCREENS ──────────────────────────────────────────────────────────────────

// SPLASH
const SplashScreen = ({ onDone }: { onDone: () => void }) => {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setProg((p) => {
        if (p >= 100) { clearInterval(t); setTimeout(onDone, 400); return 100; }
        return p + 2.5;
      });
    }, 50);
    return () => clearInterval(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: C.navy }}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Shield size={40} color="white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">IDBI FinHealth</h1>
            <p className="text-white/50 text-sm mt-1 font-medium">Financial Intelligence. Reimagined.</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3 w-48">
          <div className="w-full h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${prog}%`, backgroundColor: "rgba(255,255,255,0.7)", transition: "width 50ms linear" }} />
          </div>
          <p className="text-white/30 text-xs">Initializing secure session...</p>
        </div>
      </div>
      <div className="absolute bottom-8 flex items-center gap-1.5">
        <Lock size={11} color="rgba(255,255,255,0.25)" />
        <span className="text-white/25 text-xs">IDBI Bank Limited · Regulated by RBI</span>
      </div>
    </div>
  );
};

// LOGIN
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ customerId: "CUST1001", accountNumber: "123456789012", mpin: "1234" });
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { login, authError, setAuthError, isLoading, setLoading } = useAppStore();
  const inputStyle = { borderColor: C.border, color: C.text, backgroundColor: C.white };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    setStatusMessage(null);
    setSubmitting(true);
    const success = await login({ customerId: form.customerId, accountNumber: form.accountNumber, mpin: form.mpin });
    setSubmitting(false);
    setLoading(false);
    if (success) onLogin();
  };

  const handleForgotMpin = () => {
    setForm((f) => ({ ...f, mpin: "1234" }));
    setStatusMessage("Demo MPIN is 1234. For security, use your registered device to reset it.");
  };

  const handleMobileOtp = () => {
    setStatusMessage("A demo OTP was sent to your registered mobile ending in 3210. Use 123456 to continue.");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.bg }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 flex-shrink-0" style={{ backgroundColor: C.navy, width: 420 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
            <Shield size={20} color="white" />
          </div>
          <span className="text-xl font-bold text-white">IDBI FinHealth</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">Your complete financial health, in one place.</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">AI-powered insights, real-time analytics, and personalized recommendations to help you achieve financial freedom.</p>
          <div className="flex flex-col gap-3">
            {["AI Financial Health Score", "Smart Expense Analysis", "Goal-based Planning", "Intelligent EMI Management", "Personalized AI Coach"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle size={15} style={{ color: C.success }} />
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/25 text-xs">IDBI Bank Limited · Regulated by Reserve Bank of India · Deposits Insured</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.navy }}>
              <Shield size={17} color="white" />
            </div>
            <span className="font-bold text-base" style={{ color: C.navy }}>IDBI FinHealth</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: C.text }}>
            {tab === "login" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="text-sm mb-7" style={{ color: C.textSec }}>
            {tab === "login" ? "Enter your credentials to access your dashboard" : "Start your financial health journey today"}
          </p>

          <div className="flex rounded-lg p-1 mb-6" style={{ backgroundColor: C.muted }}>
            {(["login", "signup"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 text-sm font-semibold rounded-md transition-all"
                style={{ backgroundColor: tab === t ? C.white : "transparent", color: tab === t ? C.navy : C.textSec, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Customer ID</label>
              <input type="text" placeholder="CUST1001" value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Account Number</label>
              <input type="text" placeholder="123456789012" value={form.accountNumber} onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all" style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: C.text }}>MPIN</label>
                <button type="button" onClick={handleForgotMpin} className="text-xs font-medium" style={{ color: C.accent }}>Forgot MPIN?</button>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} inputMode="numeric" maxLength={4} placeholder="Enter 4-digit MPIN" value={form.mpin} onChange={(e) => setForm((f) => ({ ...f, mpin: e.target.value.replace(/\D/g, "") }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none pr-10 transition-all" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textSec }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {authError && <div className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.errorBg, borderColor: `${C.error}30`, color: C.error }}>{authError}</div>}
            {statusMessage && <div className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.accentBg, borderColor: `${C.accent}30`, color: C.navy }}>{statusMessage}</div>}
            <button type="submit" disabled={submitting || isLoading} className="w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 mt-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: C.navy, color: "white", opacity: submitting || isLoading ? 0.8 : 1 }}>
              {submitting || isLoading ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Shield size={15} />} {tab === "login" ? (submitting || isLoading ? "Signing In..." : "Sign In Securely") : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
            <span className="text-xs font-medium" style={{ color: C.textSec }}>OR</span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
          </div>
          <button type="button" onClick={handleMobileOtp} className="w-full py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            style={{ borderColor: C.border, color: C.text, backgroundColor: C.white }}>
            <Phone size={14} /> Sign in with Mobile OTP
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <Lock size={11} style={{ color: C.textSec }} />
            <span className="text-xs" style={{ color: C.textSec }}>256-bit SSL · RBI compliant · ISO 27001 certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// DASHBOARD
const DashboardScreen = ({ setScreen }: { setScreen: (s: Screen) => void }) => {
  const { user, goals, recommendations, autoSavings, welcomeSeen, dismissWelcome } = useAppStore();
  const [showWelcome, setShowWelcome] = useState(!welcomeSeen);
  const score = user?.financialScore ?? 742;
  const monthlyIncome = user?.monthlyIncome ?? 85000;
  const monthlyExpense = user?.monthlyExpense ?? 52400;
  const cashFlow = user?.cashFlow ?? 32600;
  const savings = user?.savings ?? 342000;
  const netWorth = user?.netWorth ?? 8420000;
  const investmentValue = user?.investmentValue ?? 520000;
  const creditUtilization = user?.creditUtilization ?? 18;
  const emergencyFund = user?.emergencyFund ?? 180000;
  const name = user?.customerName ?? "Customer";
  const lastLogin = user?.lastLogin ?? "Recently logged in";

  useEffect(() => {
    setShowWelcome(!welcomeSeen);
  }, [welcomeSeen]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    dismissWelcome();
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {showWelcome && (
        <Card className="p-4 border-l-4" style={{ borderColor: C.accent, backgroundColor: C.accentBg }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold" style={{ color: C.navy }}>Welcome back, {name}</div>
              <div className="text-xs mt-1" style={{ color: C.textSec }}>Your account is already optimized for strong cash flow. Today’s best move is to review your upcoming EMI and keep your SIP steady.</div>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={() => setScreen("ai-coach")}>Ask AI Coach</Btn>
              <Btn variant="primary" size="sm" onClick={handleWelcomeClose}>Continue</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: C.text }}>Good Morning, {name}</h1>
          <p className="text-sm" style={{ color: C.textSec }}>{lastLogin} · Here is your financial snapshot</p>
          {autoSavings.active && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: C.successBg, color: C.success }}>
              <CheckCircle size={12} /> Auto Savings Active
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => setScreen("report")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity"
            style={{ borderColor: C.border, color: C.textSec, backgroundColor: C.white }}>
            <Download size={13} /> Export Report
          </button>
        </div>
      </div>

      <Card className="p-4" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.accent} 100%)` }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.7)" }}>Premium focus</div>
            <div className="text-lg font-semibold text-white mt-1">Your financial health is strong — keep your SIP and emergency fund momentum going.</div>
            <div className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>Score {score} · Next milestone: reach 750 with one extra prepayment review</div>
          </div>
          <div className="rounded-xl px-3 py-2 text-sm font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "white" }}>
            Monthly progress {Math.min(100, Math.round((cashFlow / 50000) * 100))}%
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { icon: TrendingUp, label: "Monthly Income", value: fmt(monthlyIncome), change: "+3.7%", dir: "up" as const, color: C.success },
          { icon: TrendingDown, label: "Monthly Expenses", value: fmt(monthlyExpense), change: "+5.2%", dir: "down" as const, color: C.error },
          { icon: Wallet, label: "Total Savings", value: fmt(savings), change: `+${fmt(cashFlow)}`, dir: "up" as const, color: C.navy },
          { icon: CreditCard, label: "Net Worth", value: fmt(netWorth), change: `EMI ${fmt(user?.upcomingEmi ?? 38500)}`, dir: "neutral" as const, color: C.warning },
        ].map((s, i) => (
          <Card key={i} className="p-4 lg:p-5 cursor-pointer hover:shadow-md transition-shadow" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}14` }}>
                <s.icon size={17} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-medium flex items-center gap-0.5"
                style={{ color: s.dir === "up" ? C.success : s.dir === "down" ? C.error : C.textSec }}>
                {s.dir === "up" && <ArrowUpRight size={11} />}
                {s.dir === "down" && <ArrowUpRight size={11} style={{ transform: "rotate(90deg)" }} />}
                {s.change}
              </span>
            </div>
            <div className="text-lg font-bold mb-0.5" style={{ color: C.text }}>{s.value}</div>
            <div className="text-xs" style={{ color: C.textSec }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Middle row: Health + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Score */}
        <Card className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setScreen("health")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>Financial Health Score</h3>
            <ChevronRight size={15} style={{ color: C.textSec }} />
          </div>
          <div className="flex flex-col items-center gap-4">
            <CircularScore score={score} size={140} />
            <div className="grid grid-cols-3 gap-2 w-full text-center">
              {[
                { label: "Savings", val: `${Math.min(100, Math.round((savings / 1000000) * 100))}%`, c: C.success },
                { label: "Utilization", val: `${creditUtilization}%`, c: C.warning },
                { label: "Emergency", c: C.success, val: `${Math.round((emergencyFund / 200000) * 100)}%` },
              ].map((f) => (
                <div key={f.label} className="rounded-lg p-2" style={{ backgroundColor: C.muted }}>
                  <div className="text-xs font-bold" style={{ color: f.c }}>{f.val}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{f.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Monthly Income vs Expenses" action="View Report" onAction={() => setScreen("report")} />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.navy} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.error} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={C.error} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="income" name="Income" stroke={C.navy} strokeWidth={2} fill="url(#incGrad)" dot={false} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={C.error} strokeWidth={2} fill="url(#expGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row: Expenses + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expense Breakdown */}
        <Card className="p-5">
          <SectionHeader title="Expense Breakdown" action="Analyse" onAction={() => setScreen("expenses")} />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={EXP_CATS} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {EXP_CATS.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {EXP_CATS.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs flex-1" style={{ color: C.textSec }}>{c.name}</span>
                <span className="text-xs font-semibold" style={{ color: C.text }}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} style={{ color: C.accent }} />
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Financial Insights</h3>
            <Chip label="4 new" color={C.accent} />
          </div>
          <div className="flex flex-col gap-2.5">
            {recommendations.slice(0, 3).map((ins, i) => <InsightCard key={i} type={i % 2 === 0 ? "success" : "warning"} text={ins} />)}
          </div>
          <Btn variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setScreen("ai-coach")}>
            Ask AI Coach <ArrowRight size={13} className="inline ml-1" />
          </Btn>
        </Card>
      </div>

      {/* Recent Transactions + Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionHeader title="Recent Transactions" action="View All" onAction={() => setScreen("transactions")} />
          <div className="flex flex-col gap-3">
            {TXN.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.type === "credit" ? C.successBg : C.muted }}>
                  {t.type === "credit" ? <ArrowDownRight size={16} style={{ color: C.success }} /> : <ArrowUpRight size={16} style={{ color: C.textSec }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: C.text }}>{t.name}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{t.cat} · {t.date}</div>
                </div>
                <span className="text-sm font-semibold flex-shrink-0" style={{ color: t.type === "credit" ? C.success : C.text }}>
                  {t.type === "credit" ? "+" : "-"}{fmtFull(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals + EMIs */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <SectionHeader title="Savings Goals" action="View All" onAction={() => setScreen("goals")} />
            <div className="flex flex-col gap-3">
              {goals.filter((goal) => goal.status === "active").slice(0, 3).map((g) => {
                const pct = Math.round((g.current / g.target) * 100);
                return (
                  <div key={g.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: C.text }}>{g.name}</span>
                      <span className="text-xs font-semibold" style={{ color: C.textSec }}>{pct}%</span>
                    </div>
                    <ProgressBar value={g.current} max={g.target} color={g.color} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs" style={{ color: C.textSec }}>{fmt(g.current)}</span>
                      <span className="text-xs" style={{ color: C.textSec }}>{fmt(g.target)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Upcoming EMIs" action="Manage" onAction={() => setScreen("loans")} />
            <div className="flex flex-col gap-2">
              {LOANS.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.text }}>{l.name}</div>
                    <div className="text-xs" style={{ color: C.textSec }}>{l.bank} · Due 1 Jul</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: C.text }}>₹{l.emi.toLocaleString("en-IN")}</div>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: C.warningBg, color: C.warning }}>In 1 day</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// HEALTH SCORE
const HealthScoreScreen = ({ setScreen }: { setScreen: (s: Screen) => void }) => {
  const { user } = useAppStore();
  const score = user?.financialScore ?? 742;
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score Card */}
        <Card className="p-6 flex flex-col items-center gap-5">
          <div className="text-center">
            <h2 className="text-base font-semibold mb-1" style={{ color: C.text }}>Your Financial Health Score</h2>
            <p className="text-xs" style={{ color: C.textSec }}>Last updated: {user?.lastLogin ?? "Recently refreshed"}</p>
          </div>
          <CircularScore score={score} size={180} />
          <div className="w-full p-3 rounded-xl text-center" style={{ backgroundColor: C.successBg }}>
            <p className="text-xs font-semibold" style={{ color: C.success }}>Your score improved by 12 points since last month</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full text-center">
            {[{ l: "Previous", v: "730" }, { l: "Average", v: "680" }, { l: "Best", v: "742" }].map((s) => (
              <div key={s.l} className="rounded-lg p-2" style={{ backgroundColor: C.muted }}>
                <div className="text-sm font-bold" style={{ color: C.text }}>{s.v}</div>
                <div className="text-xs" style={{ color: C.textSec }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Score Factors */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Score Breakdown by Category</h3>
          <div className="flex flex-col gap-4">
            {HEALTH_FACTORS.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: C.text }}>{f.name}</span>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold" style={{ color: C.text }}>{f.score}/100</span>
                    <span className="text-xs ml-2" style={{ color: C.textSec }}>{f.detail}</span>
                  </div>
                </div>
                <ProgressBar value={f.score} max={100} color={f.status === "excellent" ? C.success : f.status === "good" ? C.accent : f.status === "moderate" ? C.warning : C.error} height={8} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Score History */}
      <Card className="p-5">
        <SectionHeader title="Score History — Last 6 Months" />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={[
            { month: "Jan", score: 698 }, { month: "Feb", score: 705 }, { month: "Mar", score: 718 },
            { month: "Apr", score: 724 }, { month: "May", score: 730 }, { month: "Jun", score: 742 },
          ]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.accent} stopOpacity={0.15} />
                <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
            <YAxis domain={[680, 760]} tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
            <Area type="monotone" dataKey="score" name="Score" stroke={C.accent} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 4, fill: C.accent, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Improvement Tips */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} style={{ color: C.accent }} />
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Recommendations to Improve Your Score</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: TrendingUp, title: "Increase Investment Rate", desc: "Raising your SIP by ₹2,000/month could add 8-10 points to your score over 3 months.", impact: "+10 pts", color: C.success },
            { icon: CreditCard, title: "Reduce Credit Utilization", desc: "Keeping your credit card utilization below 20% can improve your score by 5-7 points.", impact: "+7 pts", color: C.accent },
            { icon: Target, title: "Build Emergency Fund", desc: "Completing your Emergency Fund goal will increase your financial resilience score.", impact: "+6 pts", color: C.navy },
          ].map((tip) => (
            <div key={tip.title} className="p-4 rounded-xl border" style={{ borderColor: C.border }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tip.color}12` }}>
                  <tip.icon size={16} style={{ color: tip.color }} />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: C.successBg, color: C.success }}>{tip.impact}</span>
              </div>
              <h4 className="text-sm font-semibold mb-1.5" style={{ color: C.text }}>{tip.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: C.textSec }}>{tip.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// EXPENSES
const ExpensesScreen = () => {
  const [period, setPeriod] = useState("Jun 2026");
  const { user } = useAppStore();
  const monthlyExpense = user?.monthlyExpense ?? 52400;
  const cashFlow = user?.cashFlow ?? 32600;
  const creditUtilization = user?.creditUtilization ?? 18;
  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["Apr 2026", "May 2026", "Jun 2026"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
              style={{ backgroundColor: period === p ? C.navy : C.white, color: period === p ? "white" : C.textSec, borderColor: period === p ? C.navy : C.border }}>
              {p}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium hover:opacity-80 transition-opacity" style={{ borderColor: C.border, color: C.textSec }}>
          <Download size={12} /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Spent", value: fmt(monthlyExpense), change: "+5.2%", up: true },
          { label: "Cash Flow", value: fmt(cashFlow), change: "Available", up: false },
          { label: "Utilization", value: `${creditUtilization}%`, change: `of ₹${(monthlyExpense * 1.15).toLocaleString("en-IN")}`, up: false },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-lg font-bold mb-0.5" style={{ color: C.text }}>{s.value}</div>
            <div className="text-xs mb-1" style={{ color: C.textSec }}>{s.label}</div>
            <span className="text-xs" style={{ color: s.up ? C.error : C.success }}>{s.change}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar Chart */}
        <Card className="p-5 lg:col-span-3">
          <SectionHeader title="Monthly Expense Comparison" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Income" fill={C.navy} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill={`${C.error}CC`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="By Category" />
          <div className="flex flex-col gap-2.5">
            {EXP_CATS.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-medium" style={{ color: C.text }}>{c.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold" style={{ color: C.text }}>{fmtFull(c.value)}</span>
                    <span className="text-xs ml-1.5" style={{ color: C.textSec }}>{c.pct}%</span>
                  </div>
                </div>
                <ProgressBar value={c.value} max={52400} color={c.color} height={5} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Spending Behavior */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} style={{ color: C.accent }} />
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Spending Behavior Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Weekend Spending", detail: "You spend 42% more on weekends vs weekdays. Peak spending: Saturday evenings.", icon: Calendar, color: C.warning },
            { title: "Impulse Purchases", detail: "3 transactions flagged as impulse buys totalling ₹4,800. Consider a 24-hour rule.", icon: Zap, color: C.error },
            { title: "Subscription Audit", detail: "You have 5 active subscriptions costing ₹2,847/month. 2 may be underutilized.", icon: RefreshCw, color: C.navy },
          ].map((b) => (
            <div key={b.title} className="p-4 rounded-xl" style={{ backgroundColor: C.muted }}>
              <div className="flex items-center gap-2 mb-2">
                <b.icon size={14} style={{ color: b.color }} />
                <span className="text-xs font-semibold" style={{ color: C.text }}>{b.title}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: C.textSec }}>{b.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// SAVINGS PLANNER
const SavingsScreen = () => {
  const { user, goals, autoSavings, setAutoSavingsRule, addNotification, applySipOptimization, applyLiquidFundTransfer } = useAppStore();
  const [showSipModal, setShowSipModal] = useState(false);
  const [showLiquidModal, setShowLiquidModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [sipDraft, setSipDraft] = useState({ currentSIP: 10000, suggestedSIP: 15000, riskProfile: "Moderate" as "Conservative" | "Moderate" | "Aggressive" });
  const [liquidAmount, setLiquidAmount] = useState(50000);
  const [autoDraft, setAutoDraft] = useState<AutoSavingsRule>({ active: autoSavings.active, salaryDate: autoSavings.salaryDate, monthlyTransfer: autoSavings.monthlyTransfer, goalId: autoSavings.goalId, frequency: autoSavings.frequency });
  const savingsProjection = [
    { month: "Jul", amount: 32600 },
    { month: "Aug", amount: 65200 },
    { month: "Sep", amount: 97800 },
    { month: "Oct", amount: 130400 },
    { month: "Nov", amount: 163000 },
    { month: "Dec", amount: 195600 },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Current Savings Overview</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: "Total Savings", value: fmt(user?.savings ?? 342000), color: C.navy },
              { label: "Monthly Surplus", value: fmt(user?.cashFlow ?? 32600), color: C.success },
              { label: "Savings Rate", value: `${Math.round(((user?.cashFlow ?? 32600) / (user?.monthlyIncome ?? 85000)) * 100)}%`, color: C.accent },
              { label: "Emergency Fund", value: fmt(user?.emergencyFund ?? 180000), color: C.warning },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: C.muted }}>
                <span className="text-sm" style={{ color: C.textSec }}>{s.label}</span>
                <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="6-Month Savings Projection" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={savingsProjection} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.success} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
              <Area type="monotone" dataKey="amount" name="Projected Savings" stroke={C.success} strokeWidth={2.5} fill="url(#savGrad)" dot={{ r: 4, fill: C.success, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {autoSavings.active && (
        <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: `${C.success}30`, backgroundColor: C.successBg, color: C.success }}>
          Auto Savings is active for salary date {autoSavings.salaryDate} with a transfer of {fmtFull(autoSavings.monthlyTransfer)} every {autoSavings.frequency}.
        </div>
      )}

      {/* Recommendations */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} style={{ color: C.accent }} />
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Savings Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Optimize SIP Allocation", desc: "Increasing your monthly SIP by ₹2,000 could yield an additional ₹3.8L over 10 years at 12% CAGR.", action: "Set Up", priority: "High", onClick: () => setShowSipModal(true) },
            { title: "Move Savings to Liquid Fund", desc: "Shifting ₹50,000 from savings account to a liquid fund could earn 3.3% more annually (~₹1,650 extra).", action: "Explore", priority: "Medium", onClick: () => setShowLiquidModal(true) },
            { title: "Automate Savings on Salary Day", desc: "Setting up auto-transfer of ₹15,000 on salary credit date prevents lifestyle inflation.", action: "Automate", priority: "High", onClick: () => setShowAutoModal(true) },
            { title: "Tax-loss Harvesting", desc: "Your ELSS portfolio has unrealized gains. Partial redemption and reinvestment can optimize your tax liability.", action: "Consult", priority: "Low", onClick: () => setShowTaxModal(true) },
          ].map((r) => (
            <div key={r.title} className="p-4 rounded-xl border flex gap-3" style={{ borderColor: C.border }}>
              <CheckCircle size={16} style={{ color: C.success, flexShrink: 0, marginTop: 2 }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold" style={{ color: C.text }}>{r.title}</span>
                  <Chip label={r.priority} color={r.priority === "High" ? C.error : r.priority === "Medium" ? C.warning : C.textSec} />
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: C.textSec }}>{r.desc}</p>
                <Btn variant="secondary" size="sm" onClick={r.onClick}>{r.action}</Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {showSipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Optimize SIP Allocation</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Adjust your monthly SIP and review projected growth.</p>
              </div>
              <button onClick={() => setShowSipModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                    <div className="text-xs" style={{ color: C.textSec }}>Current SIP</div>
                    <div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(sipDraft.currentSIP)}</div>
                  </div>
                  <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                    <div className="text-xs" style={{ color: C.textSec }}>Suggested SIP</div>
                    <div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(sipDraft.suggestedSIP)}</div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Current SIP</label>
                  <input type="number" value={sipDraft.currentSIP} onChange={(e) => setSipDraft((d) => ({ ...d, currentSIP: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Suggested SIP</label>
                  <input type="number" value={sipDraft.suggestedSIP} onChange={(e) => setSipDraft((d) => ({ ...d, suggestedSIP: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Risk Profile</label>
                  <select value={sipDraft.riskProfile} onChange={(e) => setSipDraft((d) => ({ ...d, riskProfile: e.target.value as "Conservative" | "Moderate" | "Aggressive" }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }}>
                    <option value="Conservative">Conservative</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border p-4" style={{ borderColor: C.border }}>
                  <div className="text-xs font-semibold mb-2" style={{ color: C.textSec }}>Expected Yearly Returns</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={[
                      { name: "Y1", value: 9000 },
                      { name: "Y2", value: 18000 },
                      { name: "Y3", value: 26000 },
                      { name: "Y4", value: 42000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                      <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
                      <Area type="monotone" dataKey="value" stroke={C.accent} fill={C.accentBg} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs" style={{ color: C.textSec }}>Monthly Investment Preview</div>
                  <div className="text-lg font-semibold" style={{ color: C.text }}>{fmtFull(sipDraft.suggestedSIP)}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>Projected annual return: {sipDraft.riskProfile === "Aggressive" ? "12%" : sipDraft.riskProfile === "Moderate" ? "9%" : "7%"}</div>
                </div>
                <div className="flex gap-3">
                  <Btn variant="secondary" full onClick={() => setShowSipModal(false)}>Cancel</Btn>
                  <Btn variant="primary" full onClick={() => { applySipOptimization({ currentSIP: sipDraft.currentSIP, suggestedSIP: sipDraft.suggestedSIP, riskProfile: sipDraft.riskProfile }); addNotification({ title: "SIP Optimized", body: `Your SIP has been updated to ${fmtFull(sipDraft.suggestedSIP)}.`, time: "Just now", type: "success" }); setShowSipModal(false); }}>Confirm</Btn>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showLiquidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Move Savings to Liquid Fund</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Simulate a transfer and review the impact before moving funds.</p>
              </div>
              <button onClick={() => setShowLiquidModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs" style={{ color: C.textSec }}>Available Balance</div>
                  <div className="text-lg font-semibold" style={{ color: C.text }}>{fmt(user?.savings ?? 342000)}</div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Suggested Transfer Amount</label>
                  <input type="number" value={liquidAmount} onChange={(e) => setLiquidAmount(Number(e.target.value))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs" style={{ color: C.textSec }}>Expected Annual Return</div>
                  <div className="text-sm font-semibold" style={{ color: C.success }}>6.8%</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs font-semibold" style={{ color: C.textSec }}>Liquidity Comparison</div>
                  <div className="mt-2 text-sm" style={{ color: C.text }}>Savings Account · High liquidity · 3.5% return</div>
                  <div className="text-sm" style={{ color: C.text }}>Liquid Fund · High liquidity · 6.8% return</div>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs font-semibold" style={{ color: C.textSec }}>Tax Implication</div>
                  <div className="mt-2 text-sm" style={{ color: C.text }}>Estimated tax impact: {fmtFull(Math.round(liquidAmount * 0.05))}</div>
                </div>
                <div className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs font-semibold" style={{ color: C.textSec }}>Risk Meter</div>
                  <ProgressBar value={35} max={100} color={C.warning} height={8} />
                </div>
                <div className="flex gap-3">
                  <Btn variant="secondary" full onClick={() => setShowLiquidModal(false)}>Cancel</Btn>
                  <Btn variant="primary" full onClick={() => { applyLiquidFundTransfer(liquidAmount); addNotification({ title: "Transfer Simulated", body: `₹${liquidAmount.toLocaleString("en-IN")} transferred to a liquid fund.`, time: "Just now", type: "success" }); setShowLiquidModal(false); }}>Transfer</Btn>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Auto Savings</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Create a recurring transfer rule for your savings goals.</p>
              </div>
              <button onClick={() => setShowAutoModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Salary Date</label>
                <input type="number" value={autoDraft.salaryDate} onChange={(e) => setAutoDraft((d) => ({ ...d, salaryDate: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Monthly Transfer</label>
                <input type="number" value={autoDraft.monthlyTransfer} onChange={(e) => setAutoDraft((d) => ({ ...d, monthlyTransfer: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Goal</label>
                <select value={autoDraft.goalId ?? ""} onChange={(e) => setAutoDraft((d) => ({ ...d, goalId: e.target.value ? Number(e.target.value) : null }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }}>
                  {goals.map((goal) => (<option key={goal.id} value={goal.id}>{goal.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Frequency</label>
                <select value={autoDraft.frequency} onChange={(e) => setAutoDraft((d) => ({ ...d, frequency: e.target.value as AutoSavingsRule["frequency"] }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }}>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="fortnightly">Fortnightly</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: C.border }}>
              <span className="text-sm" style={{ color: C.textSec }}>Pause / Resume automation</span>
              <button onClick={() => setAutoDraft((d) => ({ ...d, active: !d.active }))} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: autoDraft.active ? C.successBg : C.muted, color: autoDraft.active ? C.success : C.textSec }}>
                {autoDraft.active ? "Active" : "Paused"}
              </button>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="secondary" full onClick={() => setShowAutoModal(false)}>Cancel</Btn>
              <Btn variant="primary" full onClick={() => { setAutoSavingsRule(autoDraft); addNotification({ title: "Auto Savings Updated", body: `Auto Savings is now ${autoDraft.active ? "active" : "paused"}.`, time: "Just now", type: "success" }); setShowAutoModal(false); }}>Save Rule</Btn>
            </div>
          </Card>
        </div>
      )}

      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Tax-loss Harvesting</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Review your unrealized gains and recommended offset strategy.</p>
              </div>
              <button onClick={() => setShowTaxModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Unrealized Gains", value: fmtFull(240000) },
                { label: "Unrealized Losses", value: fmtFull(82000) },
                { label: "Estimated Tax Savings", value: fmtFull(32000) },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                  <div className="text-xs" style={{ color: C.textSec }}>{item.label}</div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border p-4" style={{ borderColor: C.border }}>
              <div className="text-sm font-semibold" style={{ color: C.text }}>Suggested Optimization</div>
              <div className="mt-2 text-sm" style={{ color: C.textSec }}>Harvest losses from the underperforming ELSS units and rebalance into a high-conviction SIP basket to optimize tax liability without losing market exposure.</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// GOALS
const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, deleteGoal, archiveGoal, toggleGoalStatus, user } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalError, setGoalError] = useState("");
  const [draft, setDraft] = useState({ name: "", category: "Safety", target: 500000, current: 0, monthlyContribution: 10000, deadline: "Dec 2027", priority: "High" as const, icon: "🎯", color: C.navy });
  const activeGoals = goals.filter((goal) => goal.status === "active");
  const completed = goals.filter((goal) => goal.status === "completed").length;
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);

  const resetDraft = () => {
    setDraft({ name: "", category: "Safety", target: 500000, current: 0, monthlyContribution: 10000, deadline: "Dec 2027", priority: "High", icon: "🎯", color: C.navy });
    setEditingGoal(null);
    setGoalError("");
  };

  const openEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setDraft({
      name: goal.name,
      category: goal.category,
      target: goal.target,
      current: goal.current,
      monthlyContribution: goal.monthlyContribution,
      deadline: goal.deadline,
      priority: goal.priority,
      icon: goal.icon,
      color: goal.color,
    });
    setShowAdd(true);
  };

  const saveGoal = () => {
    const trimmedName = draft.name.trim();
    const target = Number(draft.target);
    const current = Number(draft.current);
    const monthlyContribution = Number(draft.monthlyContribution);

    if (!trimmedName) {
      setGoalError("Please enter a goal name before saving.");
      return;
    }
    if (target <= 0 || current < 0 || monthlyContribution < 0) {
      setGoalError("Enter valid values for target, current amount, and monthly contribution.");
      return;
    }
    if (current > target) {
      setGoalError("Current amount cannot exceed the target amount.");
      return;
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, { ...draft, name: trimmedName, target, current, monthlyContribution });
    } else {
      addGoal({ ...draft, name: trimmedName, target, current, monthlyContribution, status: "active" });
    }
    resetDraft();
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: C.text }}>{activeGoals.length}</div>
            <div className="text-xs" style={{ color: C.textSec }}>Active Goals</div>
          </div>
          <div className="w-px" style={{ backgroundColor: C.border }} />
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: C.success }}>{activeGoals.filter((goal) => (goal.current / goal.target) * 100 >= 60).length}</div>
            <div className="text-xs" style={{ color: C.textSec }}>On Track</div>
          </div>
          <div className="w-px" style={{ backgroundColor: C.border }} />
          <div className="text-center">
            <div className="text-xl font-bold" style={{ color: C.navy }}>{fmt(totalTarget)}</div>
            <div className="text-xs" style={{ color: C.textSec }}>Total Target</div>
          </div>
        </div>
        <Btn variant="primary" size="sm" onClick={() => { resetDraft(); setShowAdd(true); }}>
          <Plus size={13} className="inline mr-1" /> New Goal
        </Btn>
      </div>

      {goals.length === 0 ? (
        <Card className="p-6 text-center" style={{ borderColor: `${C.accent}20` }}>
          <div className="text-sm font-semibold" style={{ color: C.text }}>No goals yet</div>
          <p className="text-xs mt-2" style={{ color: C.textSec }}>Create your first savings milestone to track progress and automate contributions.</p>
          <Btn variant="primary" size="sm" className="mt-4" onClick={() => { resetDraft(); setShowAdd(true); }}>Create Goal</Btn>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          const remaining = g.target - g.current;
          const status = pct >= 80 ? "excellent" : pct >= 50 ? "good" : "moderate";
          return (
            <Card key={g.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold" style={{ color: C.text }}>{g.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={11} style={{ color: C.textSec }} />
                    <span className="text-xs" style={{ color: C.textSec }}>Target: {g.deadline}</span>
                    <StatusBadge status={status} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: g.color }}>{pct}%</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{g.status}</div>
                </div>
              </div>
              <ProgressBar value={g.current} max={g.target} color={g.color} height={10} />
              <div className="flex justify-between mt-2 mb-4">
                <span className="text-xs font-semibold" style={{ color: C.text }}>{fmtFull(g.current)}</span>
                <span className="text-xs" style={{ color: C.textSec }}>{fmtFull(g.target)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2.5 rounded-lg text-center" style={{ backgroundColor: C.muted }}>
                  <div className="text-xs font-semibold" style={{ color: C.text }}>{fmtFull(remaining)}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>Remaining</div>
                </div>
                <div className="p-2.5 rounded-lg text-center" style={{ backgroundColor: C.muted }}>
                  <div className="text-xs font-semibold" style={{ color: C.text }}>{fmtFull(g.monthlyContribution)}/mo</div>
                  <div className="text-xs" style={{ color: C.textSec }}>Monthly SIP</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Btn variant="secondary" size="sm" onClick={() => openEdit(g)}>Edit</Btn>
                <Btn variant="ghost" size="sm" onClick={() => toggleGoalStatus(g.id)}>{g.status === "paused" ? "Resume" : g.status === "completed" ? "Reopen" : "Pause"}</Btn>
                <Btn variant="ghost" size="sm" onClick={() => archiveGoal(g.id)}>Archive</Btn>
                <Btn variant="danger" size="sm" onClick={() => deleteGoal(g.id)}>Delete</Btn>
              </div>
            </Card>
          );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold" style={{ color: C.text }}>Create New Goal</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="flex flex-col gap-4">
              {goalError && <div className="rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.errorBg, borderColor: `${C.error}30`, color: C.error }}>{goalError}</div>}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Goal Name</label>
                <input value={draft.name} onChange={(e) => { setGoalError(""); setDraft((d) => ({ ...d, name: e.target.value })); }} placeholder="e.g. House Down Payment" className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Category</label>
                  <input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Priority</label>
                  <select value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as "High" | "Medium" | "Low" }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Target Amount</label>
                  <input type="number" value={draft.target} onChange={(e) => setDraft((d) => ({ ...d, target: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Current Amount</label>
                  <input type="number" value={draft.current} onChange={(e) => setDraft((d) => ({ ...d, current: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Monthly Contribution</label>
                  <input type="number" value={draft.monthlyContribution} onChange={(e) => setDraft((d) => ({ ...d, monthlyContribution: Number(e.target.value) }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>Deadline</label>
                  <input value={draft.deadline} onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <Btn variant="secondary" full onClick={() => { resetDraft(); setShowAdd(false); }}>Cancel</Btn>
                <Btn variant="primary" full onClick={saveGoal}>{editingGoal ? "Save Goal" : "Create Goal"}</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// LOANS
const LoansScreen = () => {
  const { user, loanPlans, applyLoanPrepayment, addNotification } = useAppStore();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showPrepay, setShowPrepay] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanPlan | null>(null);
  const [filterMonth, setFilterMonth] = useState("All");
  const [filterYear, setFilterYear] = useState("2026");
  const [prepayType, setPrepayType] = useState<"partial" | "full">("partial");
  const [prepayAmount, setPrepayAmount] = useState(50000);
  const [closureResult, setClosureResult] = useState<null | { type: "partial" | "full"; loanName: string; interestSaved: number; newEmi: number; remainingPrincipal: number; closureDate: string; scoreImpact: number; healthScore: number; }>(null);

  const totalEMI = loanPlans.reduce((s, l) => s + l.emi, 0);
  const totalOutstanding = loanPlans.reduce((s, l) => s + l.outstanding, 0);
  const buildSchedule = (loan: LoanPlan) => {
    const items: Array<{ month: string; principal: number; interest: number; balance: number }> = [];
    let balance = loan.outstanding;
    for (let i = 1; i <= 6; i += 1) {
      const interest = Math.round(balance * (loan.rate / 100 / 12));
      const principal = loan.emi - interest;
      balance = Math.max(0, balance - principal);
      items.push({ month: `${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i - 1]} ${filterYear}`, principal, interest, balance });
    }
    return items;
  };
  const schedule = selectedLoan ? buildSchedule(selectedLoan) : [];
  const monthlySavings = prepayType === "full" ? selectedLoan ? Math.round(selectedLoan.emi * 0.4) : 0 : Math.round(prepayAmount * 0.08);
  const newTenure = selectedLoan ? Math.max(1, Math.round((selectedLoan.months - selectedLoan.paid) - Math.max(1, Math.round(prepayAmount / Math.max(1000, selectedLoan.emi))))) : 1;

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Outstanding", value: `₹${(totalOutstanding / 100000).toFixed(1)}L`, color: C.navy },
          { label: "Monthly EMI", value: fmt(user?.upcomingEmi ?? totalEMI), color: C.warning },
          { label: "DTI Ratio", value: `${Math.round(((user?.upcomingEmi ?? 38500) / (user?.monthlyIncome ?? 85000)) * 100)}%`, color: C.accent },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-lg font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: C.textSec }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {loanPlans.map((l) => {
        const paidPct = Math.round((l.paid / l.months) * 100);
        return (
          <Card key={l.id} className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: C.accentBg }}>
                    <Building2 size={18} style={{ color: C.accent }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: C.text }}>{l.name}</h3>
                    <p className="text-xs" style={{ color: C.textSec }}>{l.bank} · {l.rate}% p.a.</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between mb-1.5 text-xs" style={{ color: C.textSec }}>
                    <span>Repaid: {paidPct}%</span>
                    <span>{l.paid} of {l.months} EMIs paid</span>
                  </div>
                  <ProgressBar value={l.paid} max={l.months} color={C.navy} height={8} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:w-auto">
                {[
                  { l: "Principal", v: `₹${(l.principal / 100000).toFixed(1)}L` },
                  { l: "Outstanding", v: `₹${(l.outstanding / 100000).toFixed(1)}L` },
                  { l: "EMI / Month", v: `₹${l.emi.toLocaleString("en-IN")}` },
                ].map((s) => (
                  <div key={s.l} className="text-center p-2.5 rounded-lg" style={{ backgroundColor: C.muted }}>
                    <div className="text-sm font-bold" style={{ color: C.text }}>{s.v}</div>
                    <div className="text-xs" style={{ color: C.textSec }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              <Btn variant="secondary" size="sm" onClick={() => { setSelectedLoan(l); setShowSchedule(true); }}>View Schedule</Btn>
              <Btn variant="ghost" size="sm" onClick={() => { setSelectedLoan(l); setShowPrepay(true); }}>Prepay</Btn>
            </div>
          </Card>
        );
      })}

      {showSchedule && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>{selectedLoan.name} Schedule</h3>
                <p className="text-xs" style={{ color: C.textSec }}>EMI calendar and repayment breakdown for the selected loan.</p>
              </div>
              <button onClick={() => setShowSchedule(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} placeholder="Search month" className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
              <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }}>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
              <Btn variant="secondary" size="sm" onClick={() => { const rows = schedule.map((entry) => `${entry.month},${entry.principal},${entry.interest},${entry.balance}`).join("\n"); const blob = new Blob([`Month,Principal,Interest,Balance\n${rows}`], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${selectedLoan.name.toLowerCase().replace(/\s+/g, "-")}-schedule.csv`; a.click(); URL.revokeObjectURL(url); }}>Download Schedule</Btn>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>EMI</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(selectedLoan.emi)}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Principal vs Interest</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(schedule[0]?.principal ?? 0)} / {fmtFull(schedule[0]?.interest ?? 0)}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Remaining Balance</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(selectedLoan.outstanding)}</div></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}><th className="py-2 pr-3 text-left text-xs font-semibold" style={{ color: C.textSec }}>Month</th><th className="py-2 pr-3 text-left text-xs font-semibold" style={{ color: C.textSec }}>Principal</th><th className="py-2 pr-3 text-left text-xs font-semibold" style={{ color: C.textSec }}>Interest</th><th className="py-2 pr-3 text-left text-xs font-semibold" style={{ color: C.textSec }}>Balance</th></tr></thead>
                <tbody>{schedule.filter((entry) => filterMonth === "All" || entry.month.toLowerCase().includes(filterMonth.toLowerCase())).map((entry) => (<tr key={entry.month} style={{ borderBottom: `1px solid ${C.border}` }}><td className="py-2 pr-3 text-sm" style={{ color: C.text }}>{entry.month}</td><td className="py-2 pr-3 text-sm" style={{ color: C.text }}>{fmtFull(entry.principal)}</td><td className="py-2 pr-3 text-sm" style={{ color: C.text }}>{fmtFull(entry.interest)}</td><td className="py-2 pr-3 text-sm" style={{ color: C.text }}>{fmtFull(entry.balance)}</td></tr>))}</tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {showPrepay && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Prepayment Calculator</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Calculate the impact of part or full prepayment on your loan.</p>
              </div>
              <button onClick={() => setShowPrepay(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setPrepayType("partial")} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: prepayType === "partial" ? C.navy : C.muted, color: prepayType === "partial" ? "white" : C.textSec }}>Partial Prepayment</button>
              <button onClick={() => setPrepayType("full")} className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: prepayType === "full" ? C.navy : C.muted, color: prepayType === "full" ? "white" : C.textSec }}>Full Prepayment</button>
            </div>
            {prepayType === "partial" ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: C.text }}>Prepayment Amount</label>
                <input type="number" value={prepayAmount} onChange={(e) => setPrepayAmount(Number(e.target.value))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: C.border, color: C.text }} />
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Interest Saved</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(prepayType === "full" ? Math.round(selectedLoan.outstanding * 0.06) : Math.round(prepayAmount * 0.07))}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>EMI Reduction</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(prepayType === "full" ? Math.round(selectedLoan.emi * 0.5) : Math.round(selectedLoan.emi * 0.08))}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>New Tenure</div><div className="text-sm font-semibold" style={{ color: C.text }}>{newTenure} months</div></div>
            </div>
            <div className="mt-4 rounded-lg border p-3" style={{ borderColor: C.border }}>
              <div className="text-xs font-semibold" style={{ color: C.textSec }}>Updated Repayment Schedule</div>
              <div className="mt-2 text-sm" style={{ color: C.text }}>Your repayment tenure reduces to approx. {newTenure} months and EMI drops by {fmtFull(prepayType === "full" ? Math.round(selectedLoan.emi * 0.5) : Math.round(selectedLoan.emi * 0.08))}.</div>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="secondary" full onClick={() => setShowPrepay(false)}>Cancel</Btn>
              <Btn variant="primary" full onClick={() => { if (selectedLoan) {
                const amount = prepayType === "full" ? selectedLoan.outstanding : prepayAmount;
                applyLoanPrepayment(selectedLoan.id, { amount, type: prepayType });
                const result = prepayType === "full"
                  ? { type: "full" as const, loanName: selectedLoan.name, interestSaved: Math.round(selectedLoan.outstanding * 0.08), newEmi: 0, remainingPrincipal: 0, closureDate: new Date().toLocaleDateString("en-IN"), scoreImpact: 8, healthScore: Math.min(900, (user?.financialScore ?? 742) + 8) }
                  : { type: "partial" as const, loanName: selectedLoan.name, interestSaved: Math.round(prepayAmount * 0.07), newEmi: Math.max(1000, Math.round(selectedLoan.emi * 0.9)), remainingPrincipal: Math.max(0, selectedLoan.outstanding - prepayAmount), closureDate: new Date().toLocaleDateString("en-IN"), scoreImpact: 3, healthScore: Math.min(900, (user?.financialScore ?? 742) + 3) };
                setClosureResult(result);
                addNotification({ title: prepayType === "full" ? "Loan Closed" : "Loan Updated", body: `${selectedLoan.name} was updated with a ${prepayType} prepayment.`, time: "Just now", type: "success" });
                setShowPrepay(false);
              } }}>Save Update</Btn>
            </div>
          </Card>
        </div>
      )}

      {closureResult && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl p-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-base font-semibold" style={{ color: C.text }}>{closureResult.type === "full" ? "Congratulations!" : "Prepayment Updated"}</h3>
              <p className="text-sm mt-2" style={{ color: C.textSec }}>{closureResult.type === "full" ? "Your loan has been successfully closed. Your monthly cash flow is now stronger and your debt burden has reduced." : `${closureResult.loanName} repayment details updated. Your revised EMI is now more affordable and your payoff timeline is shorter.`}</p>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Interest Saved</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(closureResult.interestSaved)}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>New EMI</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(closureResult.newEmi)}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Remaining Principal</div><div className="text-sm font-semibold" style={{ color: C.text }}>{fmtFull(closureResult.remainingPrincipal)}</div></div>
              <div className="rounded-lg border p-3" style={{ borderColor: C.border }}><div className="text-xs" style={{ color: C.textSec }}>Closure Date</div><div className="text-sm font-semibold" style={{ color: C.text }}>{closureResult.closureDate}</div></div>
            </div>
            <div className="mt-4 rounded-lg border p-3" style={{ borderColor: C.border }}>
              <div className="text-xs" style={{ color: C.textSec }}>Credit Score Impact</div>
              <div className="text-sm font-semibold" style={{ color: C.text }}>+{closureResult.scoreImpact} points</div>
              <div className="text-xs mt-1" style={{ color: C.textSec }}>Updated Financial Health Score: {closureResult.healthScore}</div>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="secondary" full onClick={() => setClosureResult(null)}>Close</Btn>
              <Btn variant="primary" full onClick={() => setClosureResult(null)}>Continue</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* AI Debt Strategy */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} style={{ color: C.accent }} />
          <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Debt Optimization Strategy</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InsightCard type="info" text="Debt Avalanche method: Pay off Personal Loan first (14.5% rate). Once cleared, redirect ₹8,800 EMI to Car Loan. Total interest saved: ₹42,000." />
          <InsightCard type="success" text="Your Home Loan rate of 8.5% is competitive. No refinancing needed at this time. Review in Jan 2027 when RBI repo rate cycle may shift." />
        </div>
      </Card>
    </div>
  );
};

// AI COACH
const AICoachScreen = () => {
  const { user, recommendations } = useAppStore();
  const [messages, setMessages] = useState(CHAT_INIT);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const getReply = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("credit")) return AI_REPLIES.credit;
    if (lower.includes("saving")) return AI_REPLIES.savings;
    if (lower.includes("loan") || lower.includes("prepay")) return AI_REPLIES.loan;
    if (lower.includes("budget")) return AI_REPLIES.budget;
    return AI_REPLIES.default;
  };

  const send = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user" as const, text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "ai" as const, text: getReply(msg) }]);
      setTyping(false);
    }, 1200);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 112px)" }}>
      {/* Context bar */}
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ backgroundColor: C.white, borderColor: C.border }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accentBg }}>
          <Brain size={16} style={{ color: C.accent }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: C.text }}>IDBI AI Financial Coach</div>
          <div className="text-xs" style={{ color: C.success }}>Online · Personalized for {user?.customerName ?? "Customer"} · Score {user?.financialScore ?? 742}</div>
        </div>
        <Chip label="AI Powered" color={C.accent} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ backgroundColor: m.role === "ai" ? C.accentBg : C.navy, color: m.role === "ai" ? C.accent : "white" }}>
              {m.role === "ai" ? <Brain size={14} /> : "RS"}
            </div>
            <div className="max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed"
              style={{
                backgroundColor: m.role === "ai" ? C.white : C.navy,
                color: m.role === "ai" ? C.text : "white",
                borderRadius: m.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                border: m.role === "ai" ? `1px solid ${C.border}` : "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accentBg }}>
              <Brain size={14} style={{ color: C.accent }} />
            </div>
            <div className="p-3.5 rounded-2xl" style={{ backgroundColor: C.white, border: `1px solid ${C.border}` }}>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: C.textSec, animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="px-5 py-3 border-t" style={{ backgroundColor: C.white, borderColor: C.border }}>
        <div className="text-xs font-semibold mb-2" style={{ color: C.textSec }}>Live recommendations</div>
        <div className="flex flex-col gap-2">
          {recommendations.slice(0, 3).map((item) => (
            <div key={item} className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: C.border, color: C.textSec }}>{item}</div>
          ))}
        </div>
      </div>

      {/* Quick Questions */}
      <div className="px-5 py-2 border-t" style={{ backgroundColor: C.white, borderColor: C.border }}>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {QUICK_Qs.map((q) => (
            <button key={q} onClick={() => send(q)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium hover:opacity-80 transition-opacity"
              style={{ borderColor: C.accent, color: C.accent, backgroundColor: C.accentBg }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t" style={{ backgroundColor: C.white, borderColor: C.border }}>
        <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: C.border }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your finances..."
            className="flex-1 text-sm outline-none" style={{ color: C.text, backgroundColor: "transparent" }} />
          <button onClick={() => send()} className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ backgroundColor: C.navy }}>
            <Send size={14} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// SIMULATOR
const SimulatorScreen = () => {
  const [salary, setSalary] = useState(85000);
  const [savings, setSavingsRate] = useState(38);
  const [sipAmount, setSipAmount] = useState(10000);
  const [loanPrepay, setLoanPrepay] = useState(0);
  const [years, setYears] = useState(10);

  const monthlySavings = Math.round((salary * savings) / 100);
  const totalSIP = sipAmount * 12 * years;
  const sipCorpus = Math.round(sipAmount * (((Math.pow(1.01, years * 12) - 1) / 0.01) * 1.01));
  const savingsCorpus = monthlySavings * 12 * years;

  const projData = Array.from({ length: years }, (_, i) => ({
    year: `Y${i + 1}`,
    current: Math.round(32600 * 12 * (i + 1)),
    optimized: Math.round(monthlySavings * 12 * (i + 1) + sipCorpus * ((i + 1) / years)),
  }));

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="rounded-xl p-4 border" style={{ backgroundColor: C.accentBg, borderColor: `${C.accent}30` }}>
        <div className="flex items-center gap-2">
          <Sliders size={16} style={{ color: C.accent }} />
          <p className="text-sm font-semibold" style={{ color: C.accent }}>What-If Financial Simulator</p>
        </div>
        <p className="text-xs mt-1" style={{ color: C.navy }}>Adjust the parameters below to simulate different financial scenarios and see the projected impact on your wealth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Controls */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-5" style={{ color: C.text }}>Adjust Scenario Parameters</h3>
          <div className="flex flex-col gap-5">
            {[
              { label: "Monthly Salary", value: salary, setter: setSalary, min: 30000, max: 300000, step: 5000, fmt: (v: number) => `₹${(v / 1000).toFixed(0)}K` },
              { label: "Savings Rate", value: savings, setter: setSavingsRate, min: 10, max: 70, step: 1, fmt: (v: number) => `${v}%` },
              { label: "Monthly SIP", value: sipAmount, setter: setSipAmount, min: 1000, max: 50000, step: 1000, fmt: (v: number) => `₹${(v / 1000).toFixed(0)}K` },
              { label: "Time Horizon", value: years, setter: setYears, min: 1, max: 30, step: 1, fmt: (v: number) => `${v} yrs` },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: C.textSec }}>{s.label}</label>
                  <span className="text-xs font-bold" style={{ color: C.navy }}>{s.fmt(s.value)}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={(e) => s.setter(Number(e.target.value))}
                  className="w-full accent-navy h-1.5 rounded-full cursor-pointer"
                  style={{ accentColor: C.navy }} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: C.border }}>{s.fmt(s.min)}</span>
                  <span className="text-xs" style={{ color: C.border }}>{s.fmt(s.max)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Projected Corpus", value: fmtFull(sipCorpus + savingsCorpus), sub: `Over ${years} years`, color: C.navy },
              { label: "SIP Returns", value: fmtFull(sipCorpus - totalSIP), sub: "Estimated gains at 12% CAGR", color: C.success },
              { label: "Monthly Savings", value: fmtFull(monthlySavings), sub: `${savings}% of income`, color: C.accent },
              { label: "Wealth Multiplier", value: `${(sipCorpus / (totalSIP || 1)).toFixed(1)}x`, sub: "Return on investment", color: C.warning },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: C.text }}>{s.label}</div>
                <div className="text-xs" style={{ color: C.textSec }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          <Card className="p-5 flex-1">
            <SectionHeader title="Wealth Growth Projection" />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="curGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.textSec} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={C.textSec} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.success} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${C.border}` }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="current" name="Current Path" stroke={C.textSec} strokeWidth={2} fill="url(#curGrad)" dot={false} strokeDasharray="5 3" />
                <Area type="monotone" dataKey="optimized" name="Optimized Path" stroke={C.success} strokeWidth={2.5} fill="url(#optGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

// MONTHLY REPORT
const ReportScreen = () => {
  const { user, settings } = useAppStore();

  const handleDownloadPdf = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    if (!printWindow) return;
    const reportHtml = `<!DOCTYPE html><html><head><title>Financial Report</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h1{font-size:24px;margin-bottom:8px}h2{font-size:16px;margin:20px 0 8px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #e5e7eb;padding:8px;font-size:12px;text-align:left} .box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:12px}</style></head><body><h1>Financial Report</h1><div class='box'><strong>Customer:</strong> ${user?.customerName ?? "Customer"}<br/><strong>Account:</strong> ${user?.accountNumber ?? "-"}<br/><strong>Generated:</strong> ${new Date().toLocaleDateString("en-IN")}</div><div class='box'><h2>Profile</h2><p>Income: ${fmtFull(user?.monthlyIncome ?? 85000)}<br/>Expenses: ${fmtFull(user?.monthlyExpense ?? 52400)}<br/>Savings: ${fmtFull(user?.cashFlow ?? 32600)}<br/>Investments: ${fmtFull(user?.investmentValue ?? 520000)}<br/>Loans: ${fmtFull(user?.upcomingEmi ?? 38500)}<br/>Financial Health Score: ${user?.financialScore ?? 742}</p></div><div class='box'><h2>Goals</h2><table><tr><th>Goal</th><th>Target</th><th>Current</th></tr><tr><td>Emergency Fund</td><td>${fmtFull(255000)}</td><td>${fmtFull(180000)}</td></tr><tr><td>Vacation Fund</td><td>${fmtFull(150000)}</td><td>${fmtFull(45000)}</td></tr></table></div><div class='box'><h2>AI Summary</h2><p>Your savings rate remains strong and your score has improved. Continue automating transfers and reducing discretionary spend to enhance financial resilience. The recommended next step is to review your EMI prepayment and maintain your SIP cadence.</p></div></body></html>`;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const rows = [
      ["Metric", "Value"],
      ["Customer", user?.customerName ?? "Customer"],
      ["Account", user?.accountNumber ?? "-"],
      ["Income", fmtFull(user?.monthlyIncome ?? 85000)],
      ["Expenses", fmtFull(user?.monthlyExpense ?? 52400)],
      ["Savings", fmtFull(user?.cashFlow ?? 32600)],
      ["Investment Value", fmtFull(user?.investmentValue ?? 520000)],
      ["Outstanding EMI", fmtFull(user?.upcomingEmi ?? 38500)],
      ["Financial Health Score", user?.financialScore ?? 742],
      ["Language", settings.general.language],
      ["Currency", settings.general.currency],
      ["Generated", new Date().toLocaleDateString("en-IN")],
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "financial-report.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleShareReport = async () => {
    const payload = `Financial Report for ${user?.customerName ?? "Customer"}\nAccount: ${user?.accountNumber ?? "-"}\nIncome: ${fmtFull(user?.monthlyIncome ?? 85000)}\nExpenses: ${fmtFull(user?.monthlyExpense ?? 52400)}\nSavings: ${fmtFull(user?.cashFlow ?? 32600)}\nFinancial Health Score: ${user?.financialScore ?? 742}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Financial Report", text: payload }); } catch (error) { /* noop */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(payload);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: C.text }}>June 2026 Financial Report</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSec }}>Generated on 30 Jun 2026 · AI Summary included</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn variant="secondary" size="sm" onClick={handleDownloadPdf}><Download size={13} className="inline mr-1.5" />Download PDF</Btn>
          <Btn variant="secondary" size="sm" onClick={handleExportExcel}>Export Excel</Btn>
          <Btn variant="secondary" size="sm" onClick={() => window.print()}>Print Report</Btn>
          <Btn variant="secondary" size="sm" onClick={handleShareReport}>Share Report</Btn>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Net Income", value: fmt(user?.monthlyIncome ?? 85000), vs: "+3.7% vs May", good: true },
          { label: "Total Expenses", value: fmt(user?.monthlyExpense ?? 52400), vs: "+5.2% vs May", good: false },
          { label: "Net Savings", value: fmt(user?.cashFlow ?? 32600), vs: "Updated from your profile", good: false },
          { label: "Health Score", value: `${user?.financialScore ?? 742}`, vs: `+${Math.max(0, (user?.financialScore ?? 742) - 730)} pts vs May`, good: true },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-xs mb-1" style={{ color: C.textSec }}>{s.label}</div>
            <div className="text-lg font-bold mb-1" style={{ color: C.text }}>{s.value}</div>
            <span className="text-xs font-medium" style={{ color: s.good ? C.success : C.warning }}>{s.vs}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="p-5">
          <SectionHeader title="Income vs Expenses — H1 2026" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textSec }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Income" fill={C.navy} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill={C.error} radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="savings" name="Savings" fill={C.success} radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Highlights */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={16} style={{ color: C.accent }} />
            <h3 className="text-sm font-semibold" style={{ color: C.text }}>AI Monthly Summary</h3>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: Award, label: "Best Month For", value: "On-time payments · 100% record maintained", color: C.success },
              { icon: AlertCircle, label: "Attention Required", value: "Dining expenses exceed budget by 13%", color: C.warning },
              { icon: TrendingUp, label: "Positive Trend", value: "SIP contributions consistent for 6 months straight", color: C.accent },
              { icon: Target, label: "Goal Progress", value: "Emergency fund at 71% — on track for Dec 2026", color: C.navy },
            ].map((h) => (
              <div key={h.label} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: C.muted }}>
                <h.icon size={14} style={{ color: h.color, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: h.color }}>{h.label}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{h.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Category table */}
      <Card className="p-5">
        <SectionHeader title="Expense Category Summary" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Category", "Budget", "Actual", "Variance", "Status"].map((h) => (
                  <th key={h} className="text-left py-2.5 pr-4 text-xs font-semibold" style={{ color: C.textSec }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Housing", budget: 23000, actual: 22500 },
                { cat: "Food & Dining", budget: 7500, actual: 8500 },
                { cat: "Shopping", budget: 5000, actual: 6800 },
                { cat: "Transport", budget: 4500, actual: 4200 },
                { cat: "Health", budget: 3000, actual: 3200 },
                { cat: "Entertainment", budget: 2000, actual: 2400 },
              ].map((r) => {
                const variance = r.actual - r.budget;
                const over = variance > 0;
                return (
                  <tr key={r.cat} style={{ borderBottom: `1px solid ${C.border}` }} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-sm" style={{ color: C.text }}>{r.cat}</td>
                    <td className="py-3 pr-4 text-sm" style={{ color: C.textSec }}>{fmtFull(r.budget)}</td>
                    <td className="py-3 pr-4 text-sm font-medium" style={{ color: C.text }}>{fmtFull(r.actual)}</td>
                    <td className="py-3 pr-4 text-xs font-semibold" style={{ color: over ? C.error : C.success }}>
                      {over ? "+" : "-"}{fmtFull(Math.abs(variance))}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={over ? (variance > 1000 ? "poor" : "moderate") : "good"} label={over ? "Over" : "Under"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// TRANSACTIONS
const TransactionsScreen = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showInfo, setShowInfo] = useState(false);

  const cats = ["All", "Income", "Food & Dining", "Groceries", "Investment", "Shopping", "Transport", "Utilities", "Loan"];
  const filtered = TXN.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || t.cat === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textSec }} />
          <input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: C.border, color: C.text }}
            onFocus={(e) => (e.target.style.borderColor = C.accent)} onBlur={(e) => (e.target.style.borderColor = C.border)} />
        </div>
        <button onClick={() => setCatFilter((current) => (current === "All" ? "Income" : "All"))} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: C.border, color: C.textSec }}>
          <Filter size={14} /> Filter <ChevronDown size={13} />
        </button>
        <button onClick={() => setShowInfo(true)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium" style={{ borderColor: C.border, color: C.textSec }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {cats.map((c) => (
          <button key={c} onClick={() => setCatFilter(c)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
            style={{ backgroundColor: catFilter === c ? C.navy : C.white, color: catFilter === c ? "white" : C.textSec, borderColor: catFilter === c ? C.navy : C.border }}>
            {c}
          </button>
        ))}
      </div>

      {showInfo && (
        <Card className="p-4" style={{ borderColor: `${C.warning}40` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold" style={{ color: C.text }}>Transaction history stays in-app</div>
              <div className="text-xs mt-1" style={{ color: C.textSec }}>Export is intentionally disabled for transaction history to keep your banking activity secure and searchable inside the app.</div>
            </div>
            <Btn variant="secondary" size="sm" onClick={() => setShowInfo(false)}>Close</Btn>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Transaction", "Category", "Date", "Amount"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: C.textSec }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.type === "credit" ? C.successBg : C.muted }}>
                        {t.type === "credit" ? <ArrowDownRight size={14} style={{ color: C.success }} /> : <ArrowUpRight size={14} style={{ color: C.textSec }} />}
                      </div>
                      <span className="text-sm font-medium" style={{ color: C.text }}>{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Chip label={t.cat} /></td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: C.textSec }}>{t.date}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: t.type === "credit" ? C.success : C.text }}>
                    {t.type === "credit" ? "+" : "-"}{fmtFull(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: C.textSec }}>
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No transactions found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// EDUCATION
const HelpCenterScreen = () => {
  const { supportTickets, createSupportTicket, settings } = useAppStore();
  const [activeSection, setActiveSection] = useState<"faq" | "contact" | "tickets" | "feedback">("faq");
  const [ticketDraft, setTicketDraft] = useState({ category: "General", subject: "", description: "", priority: "Medium" as "Low" | "Medium" | "High" });
  const [feedback, setFeedback] = useState("");
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const canSubmitTicket = ticketDraft.subject.trim().length > 0 && ticketDraft.description.trim().length > 0;

  const handleSubmitTicket = () => {
    if (!canSubmitTicket) {
      setTicketError("Please add both a subject and description before submitting your ticket.");
      setTicketSuccess("");
      return;
    }
    createSupportTicket({ category: ticketDraft.category, subject: ticketDraft.subject, description: ticketDraft.description, priority: ticketDraft.priority });
    setTicketDraft({ category: "General", subject: "", description: "", priority: "Medium" });
    setTicketError("");
    setTicketSuccess("Ticket submitted. A support agent will follow up shortly.");
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      setFeedbackMessage("Please share a few details so we can act on your feedback.");
      return;
    }
    setFeedback("");
    setFeedbackMessage("Thanks for your feedback. We’ve captured it successfully.");
  };

  const faqs = [
    { question: "How do I link my accounts?", answer: "Use the Link Account option on the Profile screen and complete a quick mock verification." },
    { question: "Can I export my financial reports?", answer: "Yes — PDF and Excel exports are available for most reports, except Transaction History." },
    { question: "What happens during full loan prepayment?", answer: "The loan is marked closed, moved to loan history, and the dashboard updates automatically." },
  ];

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: C.text }}>Help Center</h2>
            <p className="text-xs mt-0.5" style={{ color: C.textSec }}>Everything you need to manage support, tickets, and app guidance.</p>
          </div>
          <Chip label={`v${settings.general.language === "English" ? "1.0" : "1.0"}`} color={C.accent} />
        </div>
      </Card>

      <div className="flex border-b" style={{ borderColor: C.border }}>
        {(["faq", "contact", "tickets", "feedback"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveSection(tab)} className="px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors" style={{ borderColor: activeSection === tab ? C.navy : "transparent", color: activeSection === tab ? C.navy : C.textSec }}>
            {tab}
          </button>
        ))}
      </div>

      {activeSection === "faq" && (
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-4">
              <div className="text-sm font-semibold" style={{ color: C.text }}>{faq.question}</div>
              <div className="text-xs mt-1" style={{ color: C.textSec }}>{faq.answer}</div>
            </Card>
          ))}
        </div>
      )}

      {activeSection === "contact" && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Support Channels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Contact Support", detail: "Call 1800-419-4321" },
              { label: "Raise Ticket", detail: "Create a service request in minutes" },
              { label: "Chat Support", detail: "Mock agent available 24x7" },
              { label: "Feedback", detail: "Share product feedback instantly" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                <div className="text-sm font-semibold" style={{ color: C.text }}>{item.label}</div>
                <div className="text-xs mt-1" style={{ color: C.textSec }}>{item.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Category</label><select value={ticketDraft.category} onChange={(e) => setTicketDraft((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }}><option>General</option><option>Card</option><option>Loan</option><option>Investment</option><option>Security</option></select></div>
            <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Priority</label><select value={ticketDraft.priority} onChange={(e) => setTicketDraft((prev) => ({ ...prev, priority: e.target.value as "Low" | "Medium" | "High" }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Subject</label><input value={ticketDraft.subject} onChange={(e) => setTicketDraft((prev) => ({ ...prev, subject: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Description</label><textarea value={ticketDraft.description} onChange={(e) => setTicketDraft((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
          </div>
          {ticketError && <div className="mt-4 rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.errorBg, borderColor: `${C.error}30`, color: C.error }}>{ticketError}</div>}
          {ticketSuccess && <div className="mt-4 rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.successBg, borderColor: `${C.success}30`, color: C.success }}>{ticketSuccess}</div>}
          <div className="mt-4 flex gap-3">
            <Btn variant="secondary" onClick={() => { setTicketDraft({ category: "General", subject: "", description: "", priority: "Medium" }); setTicketError(""); setTicketSuccess(""); }}>Clear</Btn>
            <Btn variant="primary" disabled={!canSubmitTicket} onClick={handleSubmitTicket}>Submit Ticket</Btn>
          </div>
        </Card>
      )}

      {activeSection === "tickets" && (
        <div className="flex flex-col gap-3">
          {supportTickets.map((ticket) => (
            <Card key={ticket.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{ticket.subject}</div>
                  <div className="text-xs mt-1" style={{ color: C.textSec }}>{ticket.category} · {ticket.createdAt}</div>
                </div>
                <Chip label={ticket.status} color={ticket.status === "Resolved" ? C.success : ticket.status === "In Progress" ? C.warning : C.accent} />
              </div>
              <div className="text-xs mt-2" style={{ color: C.textSec }}>{ticket.description}</div>
            </Card>
          ))}
          {supportTickets.length === 0 && <Card className="p-4 text-sm" style={{ color: C.textSec }}>No tickets yet. Raise one from the contact section.</Card>}
        </div>
      )}

      {activeSection === "feedback" && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Share Feedback</h3>
          <textarea value={feedback} onChange={(e) => { setFeedback(e.target.value); setFeedbackMessage(""); }} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} placeholder="Tell us what you'd like improved in the app." />
          {feedbackMessage && <div className="mt-3 rounded-lg border px-3 py-2 text-sm" style={{ backgroundColor: C.accentBg, borderColor: `${C.accent}30`, color: C.navy }}>{feedbackMessage}</div>}
          <div className="mt-4 flex gap-3">
            <Btn variant="secondary" onClick={() => { setFeedback(""); setFeedbackMessage(""); }}>Clear</Btn>
            <Btn variant="primary" onClick={handleFeedbackSubmit}>Send Feedback</Btn>
          </div>
        </Card>
      )}
    </div>
  );
};

const SecurityCenterScreen = () => {
  const { loginHistory, devices, updateDevice, logoutAllDevices, settings, updateSettings, changeMpin, changePassword, logout } = useAppStore();
  const [mpin, setMpin] = useState(settings.security.mpin);
  const [password, setPassword] = useState(settings.security.password);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>Security Center</h2>
        <p className="text-xs mt-0.5" style={{ color: C.textSec }}>Review login activity, manage devices, and protect your account.</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Login History</h3>
          <div className="flex flex-col gap-2">
            {loginHistory.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3" style={{ borderColor: C.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: C.text }}>{entry.device}</span>
                  <Chip label={entry.status} color={entry.status === "Success" ? C.success : C.error} />
                </div>
                <div className="text-xs mt-1" style={{ color: C.textSec }}>{entry.location} · {entry.time}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Device Management</h3>
          <div className="flex flex-col gap-2">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: C.border }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: C.text }}>{device.device}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{device.location} · {device.time}</div>
                </div>
                <button onClick={() => updateDevice(device.id, { current: false })} className="text-xs" style={{ color: C.error }}>Remove</button>
              </div>
            ))}
          </div>
          <Btn variant="secondary" className="mt-4 w-full" onClick={() => logoutAllDevices()}>Logout All Devices</Btn>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Account Protection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Change MPIN</label>
            <input value={mpin} onChange={(e) => setMpin(e.target.value)} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} />
            <Btn variant="primary" className="mt-3" onClick={() => changeMpin(mpin)}>Update MPIN</Btn>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Change Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} />
            <Btn variant="primary" className="mt-3" onClick={() => changePassword(password)}>Update Password</Btn>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: C.border }}>
          <span className="text-sm" style={{ color: C.text }}>Session Timeout</span>
          <select value={settings.security.sessionTimeout} onChange={(e) => updateSettings({ security: { ...settings.security, sessionTimeout: Number(e.target.value) } })} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: C.border }}>
            <option value={5}>5 min</option>
            <option value={10}>10 min</option>
            <option value={15}>15 min</option>
          </select>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: C.border }}>
          <span className="text-sm" style={{ color: C.text }}>Two-Factor Authentication</span>
          <button onClick={() => updateSettings({ security: { ...settings.security, twoFactor: !settings.security.twoFactor } })} className="w-10 h-5 rounded-full flex items-center px-0.5" style={{ backgroundColor: settings.security.twoFactor ? C.navy : C.border, justifyContent: settings.security.twoFactor ? "flex-end" : "flex-start" }}>
            <div className="w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <Btn variant="secondary" onClick={() => logout()}>Logout</Btn>
        </div>
      </Card>
    </div>
  );
};

const EducationScreen = () => {
  const done = EDU_MODULES.filter((m) => m.done).length;
  const totalPoints = EDU_MODULES.filter((m) => m.done).reduce((s, m) => s + m.points, 0);
  const [activeModule, setActiveModule] = useState<typeof EDU_MODULES[0] | null>(null);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold mb-0.5" style={{ color: C.navy }}>{done}/{EDU_MODULES.length}</div>
          <div className="text-xs" style={{ color: C.textSec }}>Modules Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold mb-0.5" style={{ color: C.success }}>{totalPoints}</div>
          <div className="text-xs" style={{ color: C.textSec }}>Points Earned</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold mb-0.5" style={{ color: C.warning }}>Learner</div>
          <div className="text-xs" style={{ color: C.textSec }}>Current Level</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EDU_MODULES.map((m) => (
          <Card key={m.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveModule(m)}>
            <div className="flex items-start justify-between mb-3">
              <Chip label={m.cat} color={C.navy} />
              {m.done ? (
                <CheckCircle size={16} style={{ color: C.success }} />
              ) : (
                <span className="text-xs" style={{ color: C.textSec }}>{m.points} pts</span>
              )}
            </div>
            <h3 className="text-sm font-semibold mb-1.5 leading-snug" style={{ color: C.text }}>{m.title}</h3>
            <div className="flex items-center gap-3 text-xs" style={{ color: C.textSec }}>
              <span className="flex items-center gap-1"><Clock size={11} />{m.duration}</span>
              <span>{m.level}</span>
            </div>
            <Btn variant={m.done ? "ghost" : "secondary"} size="sm" className="mt-3 w-full" onClick={() => setActiveModule(m)}>
              {m.done ? "Review" : "Start Learning"}
            </Btn>
          </Card>
        ))}
      </div>

      {/* Module Modal */}
      {activeModule && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <Card className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Chip label={activeModule.cat} color={C.navy} />
                <h3 className="text-base font-semibold mt-2" style={{ color: C.text }}>{activeModule.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: C.textSec }}>
                  <span><Clock size={11} className="inline mr-1" />{activeModule.duration}</span>
                  <span>{activeModule.level}</span>
                  <span>{activeModule.points} points</span>
                </div>
              </div>
              <button type="button" aria-label="Close learning module" onClick={() => setActiveModule(null)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: C.muted }}>
              <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>
                This module covers key concepts in {activeModule.cat.toLowerCase()}. You will learn practical strategies that you can apply immediately to improve your financial health.
              </p>
            </div>
            <div className="flex gap-3">
              <Btn variant="secondary" full onClick={() => setActiveModule(null)}>Close</Btn>
              <Btn variant="primary" full onClick={() => setActiveModule(null)}>
                {activeModule.done ? "Review Module" : "Begin Module"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// NOTIFICATIONS
const NotificationsScreen = ({ setNotifRead }: { setNotifRead: () => void }) => {
  const { notifications, markNotificationsRead, markNotificationRead, deleteNotification, clearNotifications } = useAppStore();
  const [category, setCategory] = useState<"All" | "Today" | "Yesterday" | "This Week" | "EMI" | "Goals" | "Savings" | "Investments" | "Security" | "Reports">("All");
  useEffect(() => { setNotifRead(); }, [setNotifRead]);

  const markAll = () => markNotificationsRead();
  const categories = ["All", "Today", "Yesterday", "This Week", "EMI", "Goals", "Savings", "Investments", "Security", "Reports"] as const;

  const filtered = notifications.filter((n) => {
    if (category === "All") return true;
    if (category === "Today") return n.time.includes("h") || n.time.includes("Just now");
    if (category === "Yesterday") return n.title.includes("Salary") || n.title.includes("Goal") || n.time.includes("d");
    if (category === "This Week") return n.title.includes("Budget") || n.title.includes("Large") || n.title.includes("AI");
    if (category === "EMI") return n.title.toLowerCase().includes("emi");
    if (category === "Goals") return n.title.toLowerCase().includes("goal") || n.body.toLowerCase().includes("goal");
    if (category === "Savings") return n.title.toLowerCase().includes("sip") || n.title.toLowerCase().includes("transfer") || n.title.toLowerCase().includes("savings");
    if (category === "Investments") return n.title.toLowerCase().includes("investment") || n.body.toLowerCase().includes("sip");
    if (category === "Security") return n.title.toLowerCase().includes("security") || n.body.toLowerCase().includes("flagged");
    if (category === "Reports") return n.title.toLowerCase().includes("report") || n.body.toLowerCase().includes("report");
    return true;
  });

  const iconFor = (type: string) => {
    if (type === "warning") return { Icon: AlertCircle, color: C.warning, bg: C.warningBg };
    if (type === "success") return { Icon: CheckCircle, color: C.success, bg: C.successBg };
    if (type === "alert") return { Icon: Zap, color: C.error, bg: C.errorBg };
    return { Icon: Info, color: C.accent, bg: C.accentBg };
  };

  return (
    <div className="flex flex-col gap-4 p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: C.textSec }}>{notifications.filter((n) => !n.read).length} unread</span>
        <div className="flex gap-2">
          <button onClick={markAll} className="text-xs font-medium" style={{ color: C.accent }}>Mark all as read</button>
          <button onClick={clearNotifications} className="text-xs font-medium" style={{ color: C.error }}>Clear all</button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium" style={{ backgroundColor: category === item ? C.navy : C.white, color: category === item ? "white" : C.textSec, borderColor: category === item ? C.navy : C.border }}>
            {item}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card className="p-6 text-center" style={{ borderColor: `${C.accent}20` }}>
          <div className="text-sm font-semibold" style={{ color: C.text }}>No notifications in this view</div>
          <p className="text-xs mt-2" style={{ color: C.textSec }}>You’re all caught up for this category. New savings, loan, and security updates will appear here automatically.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((n) => {
            const { Icon, color, bg } = iconFor(n.type);
            return (
              <Card key={n.id} className="p-4 cursor-pointer hover:shadow-sm transition-shadow" style={{ opacity: n.read ? 0.7 : 1 }}
                onClick={() => markNotificationRead(n.id)}>
                <div className="flex items-start gap-3">
                  {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: C.accent }} />}
                  {n.read && <div className="w-1.5 h-1.5 flex-shrink-0" />}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold" style={{ color: C.text }}>{n.title}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: C.textSec }}>{n.time}</span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textSec }}>{n.body}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  {!n.read && <Btn variant="secondary" size="sm" onClick={(event) => { event.stopPropagation(); markNotificationRead(n.id); }}>Mark Read</Btn>}
                  <Btn variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); deleteNotification(n.id); }}>Delete</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// PROFILE
const ProfileScreen = ({ setScreen }: { setScreen: (s: Screen) => void }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ type: "Savings" as LinkedAccount["type"], bankName: "", accountNumber: "", ifsc: "", nickname: "", balance: 50000 });
  const [profileForm, setProfileForm] = useState({ customerName: "", email: "", phone: "", occupation: "", branch: "", address: "", monthlyIncome: 85000 });
  const { user, logout, updateProfile, linkAccount, deleteLinkedAccount, settings, updateSettings, changeMpin, changePassword, logoutAllDevices, recordLogin, devices, updateDevice } = useAppStore();
  const initials = getInitials(user?.customerName ?? "Customer");

  useEffect(() => {
    if (user) {
      setProfileForm({
        customerName: user.customerName,
        email: user.email,
        phone: user.phone,
        occupation: user.occupation,
        branch: user.branch,
        address: user.address,
        monthlyIncome: user.monthlyIncome,
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateProfile({
      customerName: profileForm.customerName,
      email: profileForm.email,
      phone: profileForm.phone,
      occupation: profileForm.occupation,
      branch: profileForm.branch,
      address: profileForm.address,
      monthlyIncome: profileForm.monthlyIncome,
    });
    setShowEditModal(false);
    recordLogin("Profile", "Mumbai, Maharashtra", "Success");
  };

  const handleLinkAccount = () => {
    if (!linkForm.bankName || !linkForm.accountNumber || !linkForm.ifsc || !linkForm.nickname) return;
    linkAccount({
      type: linkForm.type,
      bankName: linkForm.bankName,
      accountNumber: linkForm.accountNumber,
      ifsc: linkForm.ifsc,
      nickname: linkForm.nickname,
      balance: linkForm.balance,
      status: "Verified",
    });
    setShowLinkModal(false);
    setLinkForm({ type: "Savings", bankName: "", accountNumber: "", ifsc: "", nickname: "", balance: 50000 });
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-6">
      {/* Profile Header */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: C.navy, color: "white" }}>{initials}</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: C.text }}>{user?.customerName ?? "Customer"}</h2>
            <p className="text-sm" style={{ color: C.textSec }}>{user?.email ?? "Secure banking"} · {user?.phone ?? ""}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status="good" label="Verified KYC" />
              <Chip label="Premium Member" color={C.navy} />
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={() => setShowEditModal(true)}><Edit2 size={13} className="inline mr-1" />Edit</Btn>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: C.border }}>
        {(["profile", "security", "preferences"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors"
            style={{ borderColor: activeTab === t ? C.navy : "transparent", color: activeTab === t ? C.navy : C.textSec }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Personal Information</h3>
            <div className="flex flex-col gap-3">
              {[
                { l: "Full Name", v: user?.customerName ?? "Customer" },
                { l: "Customer ID", v: user?.customerId ?? "-" },
                { l: "Account Number", v: user?.accountNumber ?? "-" },
                { l: "Branch", v: user?.branch ?? "-" },
                { l: "Occupation", v: user?.occupation ?? "-" },
                { l: "Monthly Income", v: fmt(user?.monthlyIncome ?? 85000) },
                { l: "Address", v: user?.address ?? "-" },
                { l: "Financial Score", v: `${user?.financialScore ?? 0}` },
                { l: "Last Login", v: user?.lastLogin ?? "-" },
              ].map((f) => (
                <div key={f.l} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: C.border }}>
                  <span className="text-xs" style={{ color: C.textSec }}>{f.l}</span>
                  <span className="text-sm font-medium" style={{ color: C.text }}>{f.v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Linked Accounts</h3>
            {(user?.linkedAccounts ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg mb-2" style={{ backgroundColor: C.muted }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accentBg }}>
                    <Building2 size={14} style={{ color: C.accent }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: C.text }}>{a.nickname}</div>
                    <div className="text-xs" style={{ color: C.textSec }}>{a.bankName} · {a.accountNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Chip label={a.status} color={a.status === "Verified" ? C.success : C.warning} />
                  <button onClick={() => deleteLinkedAccount(a.id)} className="text-xs" style={{ color: C.error }}>Remove</button>
                </div>
              </div>
            ))}
            <Btn variant="secondary" size="sm" className="mt-2 w-full" onClick={() => setShowLinkModal(true)}><Plus size={13} className="inline mr-1" />Link Account</Btn>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Security Settings</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Two-Factor Authentication", enabled: settings.security.twoFactor, onToggle: () => updateSettings({ security: { ...settings.security, twoFactor: !settings.security.twoFactor } }) },
                { label: "Biometric Login", enabled: settings.security.biometric, onToggle: () => updateSettings({ security: { ...settings.security, biometric: !settings.security.biometric } }) },
                { label: "Transaction Alerts", enabled: settings.notifications.emi, onToggle: () => updateSettings({ notifications: { ...settings.notifications, emi: !settings.notifications.emi } }) },
                { label: "Login Notifications", enabled: settings.notifications.security, onToggle: () => updateSettings({ notifications: { ...settings.notifications, security: !settings.notifications.security } }) },
                { label: "Suspicious Activity Alerts", enabled: settings.notifications.security, onToggle: () => updateSettings({ notifications: { ...settings.notifications, security: !settings.notifications.security } }) },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: C.border }}>
                  <span className="text-sm" style={{ color: C.text }}>{s.label}</span>
                  <button onClick={s.onToggle} className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors" style={{ backgroundColor: s.enabled ? C.navy : C.border, justifyContent: s.enabled ? "flex-end" : "flex-start" }}>
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Active Sessions</h3>
            {devices.map((s) => (
              <div key={s.device} className="flex items-center justify-between p-3 rounded-lg mb-2" style={{ backgroundColor: C.muted }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: C.text }}>{s.device}</div>
                  <div className="text-xs" style={{ color: C.textSec }}>{s.location} · {s.time}</div>
                </div>
                {s.current ? <Chip label="Active" color={C.success} /> : <Btn variant="danger" size="sm" onClick={() => updateDevice(s.id, { current: false })}>Revoke</Btn>}
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "preferences" && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: C.text }}>Notification Preferences</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "EMI Due Reminders", sub: "3 days before due date", enabled: settings.notifications.emi, onToggle: () => updateSettings({ notifications: { ...settings.notifications, emi: !settings.notifications.emi } }) },
              { label: "Unusual Spending Alerts", sub: "When spending exceeds 150% of average", enabled: settings.notifications.savings, onToggle: () => updateSettings({ notifications: { ...settings.notifications, savings: !settings.notifications.savings } }) },
              { label: "Goal Milestone Updates", sub: "At 25%, 50%, 75%, 100%", enabled: settings.notifications.goals, onToggle: () => updateSettings({ notifications: { ...settings.notifications, goals: !settings.notifications.goals } }) },
              { label: "AI Weekly Digest", sub: "Every Monday morning", enabled: settings.notifications.reports, onToggle: () => updateSettings({ notifications: { ...settings.notifications, reports: !settings.notifications.reports } }) },
              { label: "Market Updates", sub: "Daily market summary", enabled: settings.notifications.investments, onToggle: () => updateSettings({ notifications: { ...settings.notifications, investments: !settings.notifications.investments } }) },
              { label: "Budget Exceeded Alerts", sub: "When category budget is exceeded", enabled: settings.notifications.push, onToggle: () => updateSettings({ notifications: { ...settings.notifications, push: !settings.notifications.push } }) },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: C.border }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: C.text }}>{p.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.textSec }}>{p.sub}</div>
                </div>
                <button onClick={p.onToggle} className="w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer" style={{ backgroundColor: p.enabled ? C.navy : C.border, justifyContent: p.enabled ? "flex-end" : "flex-start" }}>
                  <div className="w-4 h-4 rounded-full bg-white" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-2 flex flex-wrap gap-3">
        <Btn variant="secondary" onClick={() => { changeMpin("1234"); }}><Shield size={14} className="inline mr-2" />Reset MPIN</Btn>
        <Btn variant="secondary" onClick={() => { changePassword("Password@123"); }}><Lock size={14} className="inline mr-2" />Reset Password</Btn>
        <Btn variant="secondary" onClick={() => { logoutAllDevices(); }}><Shield size={14} className="inline mr-2" />Logout All Devices</Btn>
        <Btn variant="danger" onClick={() => { logout(); setScreen("login"); }}>
          <LogOut size={14} className="inline mr-2" />Sign Out
        </Btn>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Edit Profile</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Update your personal details and banking profile.</p>
              </div>
              <button onClick={() => setShowEditModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Full Name</label><input value={profileForm.customerName} onChange={(e) => setProfileForm((prev) => ({ ...prev, customerName: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Email</label><input value={profileForm.email} onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Phone Number</label><input value={profileForm.phone} onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Occupation</label><input value={profileForm.occupation} onChange={(e) => setProfileForm((prev) => ({ ...prev, occupation: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Monthly Income</label><input type="number" value={profileForm.monthlyIncome} onChange={(e) => setProfileForm((prev) => ({ ...prev, monthlyIncome: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Branch</label><input value={profileForm.branch} onChange={(e) => setProfileForm((prev) => ({ ...prev, branch: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Address</label><textarea value={profileForm.address} onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="secondary" full onClick={() => setShowEditModal(false)}>Cancel</Btn>
              <Btn variant="primary" full onClick={handleSaveProfile}>Save Changes</Btn>
            </div>
          </Card>
        </div>
      )}

      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold" style={{ color: C.text }}>Link New Account</h3>
                <p className="text-xs" style={{ color: C.textSec }}>Verify a savings, current, investment, or loan account in seconds.</p>
              </div>
              <button onClick={() => setShowLinkModal(false)}><X size={18} style={{ color: C.textSec }} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Account Type</label><select value={linkForm.type} onChange={(e) => setLinkForm((prev) => ({ ...prev, type: e.target.value as LinkedAccount["type"] }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }}><option value="Savings">Savings</option><option value="Current">Current</option><option value="Credit Card">Credit Card</option><option value="Loan">Loan</option><option value="FD">FD</option><option value="PPF">PPF</option><option value="Mutual Fund">Mutual Fund</option><option value="Demat">Demat</option><option value="Collect">Collect</option></select></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Bank Name</label><input value={linkForm.bankName} onChange={(e) => setLinkForm((prev) => ({ ...prev, bankName: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Account Number</label><input value={linkForm.accountNumber} onChange={(e) => setLinkForm((prev) => ({ ...prev, accountNumber: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>IFSC</label><input value={linkForm.ifsc} onChange={(e) => setLinkForm((prev) => ({ ...prev, ifsc: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Nickname</label><input value={linkForm.nickname} onChange={(e) => setLinkForm((prev) => ({ ...prev, nickname: e.target.value }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
              <div><label className="text-sm font-medium mb-1.5 block" style={{ color: C.text }}>Balance</label><input type="number" value={linkForm.balance} onChange={(e) => setLinkForm((prev) => ({ ...prev, balance: Number(e.target.value) }))} className="w-full rounded-lg border px-3.5 py-2.5 text-sm" style={{ borderColor: C.border }} /></div>
            </div>
            <div className="mt-5 flex gap-3">
              <Btn variant="secondary" full onClick={() => setShowLinkModal(false)}>Cancel</Btn>
              <Btn variant="primary" full onClick={handleLinkAccount}>Verify & Link</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN TITLE MAP ─────────────────────────────────────────────────────────
const SCREEN_TITLES: Record<Screen, string> = {
  splash: "Splash", login: "Login",
  dashboard: "Dashboard", health: "Financial Health Score",
  expenses: "Expense Analysis", savings: "Savings Planner",
  goals: "Goals", loans: "Loans & EMI",
  "ai-coach": "AI Financial Coach", simulator: "Financial Simulator",
  report: "Monthly Report", transactions: "Transactions",
  education: "Financial Education", help: "Help & Support",
  "security-center": "Account & Security", notifications: "Notifications",
  profile: "Profile & Settings",
};

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { isAuthenticated, notifications, logout } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!isAuthenticated && screen !== "splash" && screen !== "login") {
      setScreen("login");
    }
  }, [isAuthenticated, screen]);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [screen]);

  useEffect(() => {
    const handleActivity = () => {
      if (screen === "login" || screen === "splash") return;
      if (!isAuthenticated) return;
      const timeout = window.setTimeout(() => {
        logout();
        setScreen("login");
      }, 10 * 60 * 1000);
      return () => window.clearTimeout(timeout);
    };

    const resetTimer = () => {
      if (screen === "login" || screen === "splash") return;
      if (!isAuthenticated) return;
      window.clearTimeout((window as Window & { __idleTimeout?: number }).__idleTimeout);
      const timer = window.setTimeout(() => {
        logout();
        setScreen("login");
      }, 10 * 60 * 1000);
      (window as Window & { __idleTimeout?: number }).__idleTimeout = timer;
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.clearTimeout((window as Window & { __idleTimeout?: number }).__idleTimeout);
    };
  }, [isAuthenticated, logout, screen]);

  if (screen === "splash") return <SplashScreen onDone={() => setScreen(isAuthenticated ? "dashboard" : "login")} />;
  if (screen === "login") return <LoginScreen onLogin={() => setScreen("dashboard")} />;

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen setScreen={setScreen} />;
      case "health": return <HealthScoreScreen setScreen={setScreen} />;
      case "expenses": return <ExpensesScreen />;
      case "savings": return <SavingsScreen />;
      case "goals": return <GoalsScreen />;
      case "loans": return <LoansScreen />;
      case "ai-coach": return <AICoachScreen />;
      case "simulator": return <SimulatorScreen />;
      case "report": return <ReportScreen />;
      case "transactions": return <TransactionsScreen />;
      case "education": return <EducationScreen />;
      case "help": return <HelpCenterScreen />;
      case "security-center": return <SecurityCenterScreen />;
      case "notifications": return <NotificationsScreen setNotifRead={() => undefined} />;
      case "profile": return <ProfileScreen setScreen={setScreen} />;
      default: return <DashboardScreen setScreen={setScreen} />;
    }
  };

  const isNonDashboard = screen !== "dashboard";
  const title = SCREEN_TITLES[screen];

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: C.bg }}>
      <MobileNavDrawer active={screen} setScreen={setScreen} unreadCount={unread} open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0 border-r" style={{ borderColor: C.border, width: 240 }}>
        <Sidebar active={screen} setScreen={setScreen} unreadCount={unread} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Top Bar */}
        <div className="hidden lg:block">
          <TopBar title={title} screen={screen} setScreen={setScreen} unreadCount={unread} />
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <MobileHeader title={title} setScreen={setScreen} unreadCount={unread}
            showBack={isNonDashboard} onBack={() => setScreen("dashboard")} onOpenDrawer={() => setMobileDrawerOpen(true)} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {renderScreen()}
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden flex-shrink-0">
          <BottomNav active={screen} setScreen={setScreen} />
        </div>
      </div>
    </div>
  );
}
