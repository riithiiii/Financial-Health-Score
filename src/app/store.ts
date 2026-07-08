import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Screen = "splash" | "login" | "dashboard" | "health" | "expenses" | "savings" | "goals" | "loans" | "ai-coach" | "simulator" | "report" | "transactions" | "education" | "notifications" | "profile";

export type LinkedAccountType = "Savings" | "Current" | "Credit Card" | "Loan" | "FD" | "PPF" | "Mutual Fund" | "Demat" | "Collect";

export type LinkedAccount = {
  id: number;
  type: LinkedAccountType;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  nickname: string;
  balance: number;
  status: "Verified" | "Pending";
  linkedAt: string;
};

export type AppSettings = {
  general: {
    language: string;
    currency: string;
    dateFormat: string;
    timezone: string;
  };
  security: {
    mpin: string;
    password: string;
    twoFactor: boolean;
    sessionTimeout: number;
    biometric: boolean;
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    emi: boolean;
    goals: boolean;
    savings: boolean;
    investments: boolean;
    security: boolean;
    reports: boolean;
  };
  privacy: {
    shareData: boolean;
    ads: boolean;
    location: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontScale: number;
  };
  appearance: {
    theme: "Light" | "Dark" | "System";
  };
  session: {
    autoLogout: boolean;
    rememberMe: boolean;
  };
  dataBackup: {
    autoBackup: boolean;
    lastBackup: string;
  };
};

export type SupportTicket = {
  id: number;
  category: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

export type LoginHistoryEntry = {
  id: number;
  device: string;
  location: string;
  time: string;
  status: "Success" | "Failed";
};

export type DeviceSession = {
  id: string;
  device: string;
  location: string;
  time: string;
  current: boolean;
};

export type AppUser = {
  customerId: string;
  accountNumber: string;
  customerName: string;
  branch: string;
  profilePhoto: string;
  email: string;
  phone: string;
  occupation: string;
  address: string;
  financialScore: number;
  lastLogin: string;
  notificationCount: number;
  monthlyIncome: number;
  monthlyExpense: number;
  cashFlow: number;
  savings: number;
  goalProgress: number;
  upcomingEmi: number;
  netWorth: number;
  investmentValue: number;
  creditUtilization: number;
  emergencyFund: number;
  linkedAccounts: LinkedAccount[];
};

export type AppNotification = {
  id: number;
  title: string;
  body: string;
  time: string;
  type: "warning" | "success" | "info" | "alert";
  read: boolean;
};

export type GoalStatus = "active" | "paused" | "completed" | "archived";

export type AutoSavingsRule = {
  active: boolean;
  salaryDate: number;
  monthlyTransfer: number;
  goalId: number | null;
  frequency: "monthly" | "biweekly" | "fortnightly";
};

export type LoanPlan = {
  id: number;
  name: string;
  bank: string;
  principal: number;
  outstanding: number;
  emi: number;
  rate: number;
  months: number;
  paid: number;
};

export type FinancialGoal = {
  id: number;
  name: string;
  category: string;
  target: number;
  current: number;
  monthlyContribution: number;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  icon: string;
  color: string;
  status: GoalStatus;
};

export type AppStore = {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string;
  welcomeSeen: boolean;
  searchQuery: string;
  notifications: AppNotification[];
  goals: FinancialGoal[];
  recommendations: string[];
  autoSavings: AutoSavingsRule;
  loanPlans: LoanPlan[];
  settings: AppSettings;
  supportTickets: SupportTicket[];
  loginHistory: LoginHistoryEntry[];
  devices: DeviceSession[];
  login: (credentials: { customerId: string; accountNumber: string; mpin: string }) => Promise<boolean>;
  logout: () => void;
  setAuthError: (message: string) => void;
  setLoading: (loading: boolean) => void;
  dismissWelcome: () => void;
  setSearchQuery: (query: string) => void;
  markNotificationsRead: () => void;
  markNotificationRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  clearNotifications: () => void;
  refreshNotifications: (user?: AppUser | null) => void;
  updateUser: (user: AppUser) => void;
  updateProfile: (updates: Partial<AppUser>) => void;
  addGoal: (goal: Omit<FinancialGoal, "id" | "status"> & { status?: GoalStatus }) => void;
  updateGoal: (id: number, updates: Partial<FinancialGoal>) => void;
  deleteGoal: (id: number) => void;
  archiveGoal: (id: number) => void;
  toggleGoalStatus: (id: number) => void;
  addNotification: (notification: Omit<AppNotification, "id" | "read">) => void;
  setAutoSavingsRule: (rule: AutoSavingsRule) => void;
  applySipOptimization: (input: { currentSIP: number; suggestedSIP: number; riskProfile: "Conservative" | "Moderate" | "Aggressive" }) => void;
  applyLiquidFundTransfer: (amount: number) => void;
  applyLoanPrepayment: (loanId: number, input: { amount: number; type: "partial" | "full" }) => void;
  linkAccount: (account: Omit<LinkedAccount, "id" | "status" | "linkedAt"> & { status?: "Verified" | "Pending" }) => void;
  deleteLinkedAccount: (id: number) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, "id" | "status" | "createdAt">) => void;
  recordLogin: (device?: string, location?: string, status?: "Success" | "Failed") => void;
  updateDevice: (id: string, updates: Partial<DeviceSession>) => void;
  logoutAllDevices: () => void;
  changeMpin: (newMpin: string) => void;
  changePassword: (newPassword: string) => void;
};

const createDemoGoals = (): FinancialGoal[] => [
  { id: 1, name: "Emergency Fund", category: "Safety", target: 255000, current: 180000, monthlyContribution: 12500, deadline: "Dec 2026", priority: "High", icon: "🛡️", color: "#123A72", status: "active" },
  { id: 2, name: "Europe Vacation", category: "Travel", target: 150000, current: 45000, monthlyContribution: 8750, deadline: "Jun 2027", priority: "Medium", icon: "✈️", color: "#2563EB", status: "active" },
  { id: 3, name: "New Laptop", category: "Lifestyle", target: 80000, current: 62000, monthlyContribution: 9000, deadline: "Aug 2026", priority: "Low", icon: "💻", color: "#16A34A", status: "completed" },
];

const deriveRecommendations = (user: AppUser | null, goals: FinancialGoal[]) => {
  if (!user) return [];
  const items: string[] = [];
  if (user.monthlyExpense > user.monthlyIncome * 0.65) items.push("Reduce discretionary spending by 8% to preserve cash flow.");
  if (user.creditUtilization > 20) items.push("Keep credit utilization below 20% to support a stronger score.");
  if (user.cashFlow < 25000) items.push("Increase your monthly savings transfer by ₹5,000 for stronger resilience.");
  if (goals.some((goal) => goal.status === "active" && goal.current / goal.target < 0.6)) items.push("Raise monthly contributions for active goals to stay on track.");
  if (user.financialScore < 750) items.push("Use your surplus to prepay the highest-rate EMI and lift your score.");
  if (items.length === 0) items.push("Your profile is balanced. Continue the current pace and add one extra SIP.");
  return items;
};

const createDemoUser = (): AppUser => ({
  customerId: "CUST1001",
  accountNumber: "123456789012",
  customerName: "Rahul Sharma",
  branch: "Andheri East Branch",
  profilePhoto: "",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  occupation: "Senior Product Manager",
  address: "A-12, Horizon Apartments, Andheri East, Mumbai",
  financialScore: 742,
  lastLogin: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
  notificationCount: 3,
  monthlyIncome: 85000,
  monthlyExpense: 52400,
  cashFlow: 32600,
  savings: 342000,
  goalProgress: 71,
  upcomingEmi: 38500,
  netWorth: 8420000,
  investmentValue: 520000,
  creditUtilization: 18,
  emergencyFund: 180000,
  linkedAccounts: [
    { id: 1, type: "Savings", bankName: "IDBI Bank", accountNumber: "****4521", ifsc: "IBKL0001234", nickname: "Primary Savings", balance: 247500, status: "Verified", linkedAt: "20 Jun 2026" },
    { id: 2, type: "Mutual Fund", bankName: "Zerodha", accountNumber: "ZR****7821", ifsc: "ZERODHA", nickname: "Growth SIP", balance: 275000, status: "Verified", linkedAt: "22 Jun 2026" },
  ],
});

const createNotifications = (user: AppUser | null): AppNotification[] => {
  if (!user) return [];
  return [
    {
      id: 1,
      title: "EMI Due in 3 Days",
      body: `Home Loan EMI of ₹${user.upcomingEmi.toLocaleString("en-IN")} is due soon.`,
      time: "2h ago",
      type: "warning",
      read: false,
    },
    {
      id: 2,
      title: "Salary Credited",
      body: `A salary credit of ₹${user.monthlyIncome.toLocaleString("en-IN")} was posted today.`,
      time: "5h ago",
      type: "success",
      read: false,
    },
    {
      id: 3,
      title: "Goal Milestone Reached",
      body: `Your emergency fund goal is ${user.goalProgress}% complete.`,
      time: "1d ago",
      type: "info",
      read: true,
    },
    {
      id: 4,
      title: "Budget Exceeded",
      body: `Dining expenses crossed your budget this week.`,
      time: "2d ago",
      type: "alert",
      read: false,
    },
    {
      id: 5,
      title: "Large Transaction Flagged",
      body: `A transaction of ₹${(user.monthlyExpense / 4).toLocaleString("en-IN")} was detected and reviewed.`,
      time: "3d ago",
      type: "warning",
      read: false,
    },
    {
      id: 6,
      title: "AI Insight",
      body: `Your financial score is ${user.financialScore}. Consider increasing SIPs by ₹2,000 monthly.`,
      time: "4d ago",
      type: "info",
      read: true,
    },
  ];
};

export const getSearchResults = (query: string) => {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const items = [
    { title: "Emergency Fund Goal", category: "Goals", description: "Track the current progress of your emergency fund target.", screen: "goals" as const },
    { title: "Home Loan EMI", category: "Loans", description: "View the next scheduled EMI and outstanding balance.", screen: "loans" as const },
    { title: "Recent Transactions", category: "Transactions", description: "Browse your latest incoming and outgoing transactions.", screen: "transactions" as const },
    { title: "Expense Analysis", category: "Expenses", description: "Review monthly expense categories and budget trends.", screen: "expenses" as const },
    { title: "Savings Planner", category: "Savings", description: "Inspect your monthly surplus and savings projection.", screen: "savings" as const },
    { title: "Investment Value", category: "Investments", description: "Check the current value of your portfolio and SIP allocations.", screen: "dashboard" as const },
    { title: "AI Recommendations", category: "AI recommendations", description: "Open the AI Coach for personalized guidance.", screen: "ai-coach" as const },
    { title: "June Report", category: "Reports", description: "Open the monthly financial report and insights.", screen: "report" as const },
  ];

  return items.filter((item) => `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(lower)).slice(0, 6);
};

const createDefaultSettings = (): AppSettings => ({
  general: { language: "English", currency: "INR", dateFormat: "DD/MM/YYYY", timezone: "IST" },
  security: { mpin: "1234", password: "Password@123", twoFactor: true, sessionTimeout: 10, biometric: true },
  notifications: { push: true, email: true, sms: false, emi: true, goals: true, savings: true, investments: true, security: true, reports: true },
  privacy: { shareData: true, ads: false, location: true },
  accessibility: { reducedMotion: false, highContrast: false, fontScale: 1 },
  appearance: { theme: "Light" },
  session: { autoLogout: true, rememberMe: true },
  dataBackup: { autoBackup: true, lastBackup: new Date().toLocaleDateString("en-IN") },
});

const createDefaultDevices = (): DeviceSession[] => [
  { id: "device-1", device: "MacBook Pro · Chrome", location: "Mumbai, Maharashtra", time: "Current", current: true },
  { id: "device-2", device: "iPhone 15 · Safari", location: "Mumbai, Maharashtra", time: "2h ago", current: false },
  { id: "device-3", device: "Windows PC · Edge", location: "Pune, Maharashtra", time: "3d ago", current: false },
];

const createDefaultHistory = (): LoginHistoryEntry[] => [
  { id: 1, device: "MacBook Pro · Chrome", location: "Mumbai, Maharashtra", time: "Today · 09:10", status: "Success" },
  { id: 2, device: "iPhone 15 · Safari", location: "Mumbai, Maharashtra", time: "Yesterday · 20:42", status: "Success" },
  { id: 3, device: "Windows PC · Edge", location: "Pune, Maharashtra", time: "2 days ago · 18:28", status: "Failed" },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: createDemoUser(),
      isAuthenticated: false,
      isLoading: false,
      authError: "",
      welcomeSeen: false,
      searchQuery: "",
      notifications: createNotifications(createDemoUser()),
      goals: createDemoGoals(),
      recommendations: deriveRecommendations(createDemoUser(), createDemoGoals()),
      autoSavings: { active: false, salaryDate: 28, monthlyTransfer: 15000, goalId: 1, frequency: "monthly" },
      loanPlans: [
        { id: 1, name: "Home Loan", bank: "HDFC Bank", principal: 4500000, outstanding: 3820000, emi: 38500, rate: 8.5, months: 240, paid: 36 },
        { id: 2, name: "Car Loan", bank: "IDBI Bank", principal: 850000, outstanding: 340000, emi: 15200, rate: 9.2, months: 60, paid: 36 },
        { id: 3, name: "Personal Loan", bank: "SBI", principal: 200000, outstanding: 82000, emi: 8800, rate: 14.5, months: 24, paid: 13 },
      ],
      settings: createDefaultSettings(),
      supportTickets: [],
      loginHistory: createDefaultHistory(),
      devices: createDefaultDevices(),
      login: async ({ customerId, accountNumber, mpin }) => {
        const trimmedCustomerId = customerId.trim();
        const trimmedAccountNumber = accountNumber.trim();
        const trimmedMpin = mpin.trim();
        const normalizedId = trimmedCustomerId.toUpperCase();
        const normalizedAccount = trimmedAccountNumber.replace(/\s+/g, "");

        if (!trimmedCustomerId || !trimmedAccountNumber || !trimmedMpin) {
          set({ authError: "Please enter your Customer ID, Account Number, and MPIN." });
          return false;
        }

        if (normalizedId !== "CUST1001") {
          set({ authError: "Customer ID is invalid. Please use CUST1001." });
          return false;
        }

        if (normalizedAccount !== "123456789012") {
          set({ authError: "Account number is invalid. Please use 123456789012." });
          return false;
        }

        if (trimmedMpin.length !== 4 || !/^\d+$/.test(trimmedMpin)) {
          set({ authError: "MPIN must be a 4-digit number." });
          return false;
        }

        if (trimmedMpin !== "1234") {
          set({ authError: "Incorrect MPIN. Please try again." });
          return false;
        }

        const user = createDemoUser();
        user.lastLogin = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
        user.notificationCount = 3;

        const goals = get().goals;
        const recommendations = deriveRecommendations(user, goals);
        set({
          user,
          isAuthenticated: true,
          authError: "",
          isLoading: false,
          notifications: createNotifications(user),
          recommendations,
          loginHistory: [{ id: Date.now(), device: "Current Browser", location: "Mumbai, Maharashtra", time: "Just now", status: "Success" }, ...get().loginHistory].slice(0, 6),
        });
        return true;
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          authError: "",
          isLoading: false,
          searchQuery: "",
          notifications: [],
          recommendations: [],
        });
      },
      setAuthError: (message) => set({ authError: message }),
      setLoading: (loading) => set({ isLoading: loading }),
      dismissWelcome: () => set({ welcomeSeen: true }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      markNotificationsRead: () => {
        const current = get().notifications;
        const nextUser = get().user ? { ...get().user, notificationCount: 0 } : null;
        set({ notifications: current.map((item) => ({ ...item, read: true })), user: nextUser });
      },
      markNotificationRead: (id) => {
        const current = get().notifications.map((item) => (item.id === id ? { ...item, read: true } : item));
        const unread = current.filter((item) => !item.read).length;
        const nextUser = get().user ? { ...get().user, notificationCount: unread } : null;
        set({ notifications: current, user: nextUser });
      },
      deleteNotification: (id) => {
        const current = get().notifications.filter((item) => item.id !== id);
        const unread = current.filter((item) => !item.read).length;
        const nextUser = get().user ? { ...get().user, notificationCount: unread } : null;
        set({ notifications: current, user: nextUser });
      },
      clearNotifications: () => {
        const nextUser = get().user ? { ...get().user, notificationCount: 0 } : null;
        set({ notifications: [], user: nextUser });
      },
      refreshNotifications: (user = get().user) => {
        const current = get().notifications;
        const unread = current.filter((item) => !item.read).length;
        const nextUser = user ? { ...user, notificationCount: unread } : null;
        set({ notifications: createNotifications(user), user: nextUser });
      },
      updateUser: (user) => set({ user, notifications: createNotifications(user), recommendations: deriveRecommendations(user, get().goals) }),
      updateProfile: (updates) => {
        const current = get().user;
        if (!current) return;
        const nextUser: AppUser = { ...current, ...updates };
        set({ user: nextUser, notifications: createNotifications(nextUser), recommendations: deriveRecommendations(nextUser, get().goals) });
      },
      addNotification: (notification) => {
        const item: AppNotification = { id: Date.now(), read: false, ...notification };
        const current = get().notifications;
        const unread = current.filter((item) => !item.read).length + 1;
        const nextUser = get().user ? { ...get().user, notificationCount: unread } : null;
        set((state) => ({ notifications: [item, ...state.notifications].slice(0, 8), user: nextUser }));
      },
      addGoal: (goal) => {
        const nextGoal: FinancialGoal = {
          id: Date.now(),
          status: goal.status ?? "active",
          ...goal,
        };
        const goals = [nextGoal, ...get().goals];
        const user = get().user;
        set({ goals, recommendations: deriveRecommendations(user, goals) });
      },
      updateGoal: (id, updates) => {
        const goals = get().goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal));
        const user = get().user;
        set({ goals, recommendations: deriveRecommendations(user, goals) });
      },
      deleteGoal: (id) => {
        const goals = get().goals.filter((goal) => goal.id !== id);
        const user = get().user;
        set({ goals, recommendations: deriveRecommendations(user, goals) });
      },
      archiveGoal: (id) => {
        const goals = get().goals.map((goal) => (goal.id === id ? { ...goal, status: "archived" } : goal));
        const user = get().user;
        set({ goals, recommendations: deriveRecommendations(user, goals) });
      },
      toggleGoalStatus: (id) => {
        const goals = get().goals.map((goal) => {
          if (goal.id !== id) return goal;
          if (goal.status === "completed") return { ...goal, status: "active" };
          if (goal.status === "paused") return { ...goal, status: "active" };
          if (goal.status === "active") return { ...goal, status: "paused" };
          return goal;
        });
        const user = get().user;
        set({ goals, recommendations: deriveRecommendations(user, goals) });
      },
      setAutoSavingsRule: (rule) => {
        const user = get().user;
        const nextUser = user ? { ...user, financialScore: Math.min(900, user.financialScore + 3) } : user;
        const items = deriveRecommendations(nextUser, get().goals);
        set({ autoSavings: rule, user: nextUser ?? null, recommendations: items });
      },
      applySipOptimization: ({ currentSIP, suggestedSIP, riskProfile }) => {
        const user = get().user;
        if (!user) return;
        const increase = suggestedSIP - currentSIP;
        const returnBoost = riskProfile === "Aggressive" ? 12 : riskProfile === "Moderate" ? 9 : 7;
        const nextUser: AppUser = {
          ...user,
          financialScore: Math.min(900, user.financialScore + 6),
          cashFlow: user.cashFlow + increase,
          savings: user.savings + increase * 12,
          investmentValue: user.investmentValue + increase * 12,
          goalProgress: Math.min(100, user.goalProgress + 4),
        };
        const nextNotifications = createNotifications(nextUser);
        const nextRecommendations = deriveRecommendations(nextUser, get().goals);
        set({ user: nextUser, notifications: nextNotifications, recommendations: [...nextRecommendations, `SIP optimization set to ₹${suggestedSIP.toLocaleString("en-IN")}/month with ${returnBoost}% projected returns.`] });
      },
      applyLiquidFundTransfer: (amount) => {
        const user = get().user;
        if (!user) return;
        const nextUser: AppUser = {
          ...user,
          savings: Math.max(0, user.savings - amount),
          investmentValue: user.investmentValue + amount,
          financialScore: Math.min(900, user.financialScore + 4),
          cashFlow: user.cashFlow + Math.round(amount * 0.03),
        };
        set({ user: nextUser, notifications: createNotifications(nextUser), recommendations: deriveRecommendations(nextUser, get().goals) });
      },
      applyLoanPrepayment: (loanId, input) => {
        const loanPlans = get().loanPlans.map((loan) => {
          if (loan.id !== loanId) return loan;
          if (input.type === "full") {
            return { ...loan, outstanding: 0, emi: 0, months: 0, paid: loan.months };
          }
          const prepayment = Math.min(input.amount, loan.outstanding);
          const newOutstanding = Math.max(0, loan.outstanding - prepayment);
          const newEmi = Math.max(1000, Math.round(loan.emi * 0.9));
          return { ...loan, outstanding: newOutstanding, emi: newEmi };
        });
        const user = get().user;
        const nextUser = user ? {
          ...user,
          financialScore: Math.min(900, user.financialScore + 4),
          upcomingEmi: Math.max(0, user.upcomingEmi - 2000),
          cashFlow: user.cashFlow + (input.type === "full" ? 18000 : 12000),
          savings: user.savings + (input.type === "full" ? 18000 : 12000),
          netWorth: Math.max(0, user.netWorth + (input.type === "full" ? 180000 : 120000)),
          goalProgress: Math.min(100, user.goalProgress + 2),
        } : user;
        set({ loanPlans, user: nextUser ?? null, notifications: createNotifications(nextUser ?? user), recommendations: deriveRecommendations(nextUser ?? user, get().goals) });
      },
      linkAccount: (account) => {
        const user = get().user;
        if (!user) return;
        const linkedAccount: LinkedAccount = {
          id: Date.now(),
          status: account.status ?? "Verified",
          linkedAt: new Date().toLocaleDateString("en-IN"),
          ...account,
        };
        const balance = linkedAccount.balance ?? 0;
        const positiveSavings = ["Savings", "Current", "FD", "PPF"].includes(linkedAccount.type) ? balance : 0;
        const positiveInvestments = ["Mutual Fund", "Demat", "Collect"].includes(linkedAccount.type) ? balance : 0;
        const netWorthDelta = linkedAccount.type === "Loan" ? -balance : linkedAccount.type === "Credit Card" ? -Math.max(0, balance * 0.2) : 0;
        const nextUser: AppUser = {
          ...user,
          linkedAccounts: [linkedAccount, ...user.linkedAccounts],
          savings: user.savings + positiveSavings,
          investmentValue: user.investmentValue + positiveInvestments,
          netWorth: Math.max(0, user.netWorth + netWorthDelta),
          financialScore: Math.min(900, user.financialScore + 2),
        };
        set({ user: nextUser, notifications: createNotifications(nextUser), recommendations: deriveRecommendations(nextUser, get().goals) });
      },
      deleteLinkedAccount: (id) => {
        const user = get().user;
        if (!user) return;
        const account = user.linkedAccounts.find((item) => item.id === id);
        if (!account) return;
        const balance = account.balance ?? 0;
        const savingsDelta = ["Savings", "Current", "FD", "PPF"].includes(account.type) ? -balance : 0;
        const investmentDelta = ["Mutual Fund", "Demat", "Collect"].includes(account.type) ? -balance : 0;
        const nextUser: AppUser = {
          ...user,
          linkedAccounts: user.linkedAccounts.filter((item) => item.id !== id),
          savings: Math.max(0, user.savings + savingsDelta),
          investmentValue: Math.max(0, user.investmentValue + investmentDelta),
        };
        set({ user: nextUser, notifications: createNotifications(nextUser), recommendations: deriveRecommendations(nextUser, get().goals) });
      },
      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
      },
      createSupportTicket: (ticket) => {
        const item: SupportTicket = { id: Date.now(), status: "Open", createdAt: new Date().toLocaleDateString("en-IN"), ...ticket };
        set((state) => ({ supportTickets: [item, ...state.supportTickets].slice(0, 8) }));
        const user = get().user;
        if (user) {
          set({ notifications: createNotifications(user), recommendations: deriveRecommendations(user, get().goals) });
        }
      },
      recordLogin: (device = "Current Browser", location = "Mumbai, Maharashtra", status = "Success") => {
        set((state) => ({ loginHistory: [{ id: Date.now(), device, location, time: "Just now", status }, ...state.loginHistory].slice(0, 6) }));
      },
      updateDevice: (id, updates) => {
        set((state) => ({ devices: state.devices.map((device) => (device.id === id ? { ...device, ...updates } : device)) }));
      },
      logoutAllDevices: () => {
        set({ devices: [] });
      },
      changeMpin: (newMpin) => {
        set((state) => ({ settings: { ...state.settings, security: { ...state.settings.security, mpin: newMpin } } }));
      },
      changePassword: (newPassword) => {
        set((state) => ({ settings: { ...state.settings, security: { ...state.settings.security, password: newPassword } } }));
      },
    }),
    {
      name: "idbi-finhealth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        welcomeSeen: state.welcomeSeen,
        searchQuery: state.searchQuery,
        notifications: state.notifications,
        goals: state.goals,
        recommendations: state.recommendations,
        autoSavings: state.autoSavings,
        loanPlans: state.loanPlans,
        settings: state.settings,
        supportTickets: state.supportTickets,
        loginHistory: state.loginHistory,
        devices: state.devices,
      }),
    }
  )
);

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
