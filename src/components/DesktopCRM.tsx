import React, { useState } from "react";
import { Lead, LeadStatus, STATUS_LOOKUP, TeamMember, AdCampaign, WhatsappTemplate, AppReminder, NotificationMsg } from "../types";
import { 
  Users, TrendingUp, DollarSign, Activity, Search, Shield, 
  MessageSquare, Settings, LayoutDashboard, Plus, Briefcase, 
  Trash2, Phone, Mail, ChevronRight, ExternalLink, Sparkles, Send, 
  CheckCircle2, Bell, Clock, Calendar, HelpCircle, Edit, RefreshCw,
  Download
} from "lucide-react";
import AnalyticsView from "./AnalyticsView";

interface DesktopCRMProps {
  leads: Lead[];
  team: TeamMember[];
  campaigns: AdCampaign[];
  whatsappTemplates: WhatsappTemplate[];
  reminders: AppReminder[];
  notifications: NotificationMsg[];
  onUpdateLead: (updated: Lead) => void;
  onAddLead: (newLead: Partial<Lead>) => void;
  onDeleteLead: (id: string) => void;
  onSelectLead: (lead: Lead) => void;
  onUpdateTemplates: (updated: WhatsappTemplate[]) => void;
  onUpdateTeam: (updated: TeamMember[]) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function DesktopCRM({
  leads,
  team,
  campaigns,
  whatsappTemplates,
  reminders,
  notifications,
  onUpdateLead,
  onAddLead,
  onDeleteLead,
  onSelectLead,
  onUpdateTemplates,
  onUpdateTeam,
  isDarkMode,
  onToggleDarkMode
}: DesktopCRMProps) {

  // Active Menu Tabs
  const [activeMenu, setActiveMenu] = useState<
    "dashboard" | "new_leads" | "followup" | "interested" | "replied" | "closed" | "not_interested" | "analytics" | "templates" | "team" | "settings" | "planner"
  >("dashboard");

  // AI Campaign Planner States
  const [plannerBusinessType, setPlannerBusinessType] = useState("Dental Clinic");
  const [plannerBudget, setPlannerBudget] = useState(30005);
  const [plannerGoal, setPlannerGoal] = useState("Lead Generation with Instant Forms");
  const [plannerResult, setPlannerResult] = useState<any>(null);
  const [isPlannerLoading, setIsPlannerLoading] = useState(false);
  const [plannerCopiedHook, setPlannerCopiedHook] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [selectedSource, setSelectedSource] = useState("All");
  const [budgetMiniFilter, setBudgetMiniFilter] = useState<number>(0);

  // New Lead Creator Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBusiness, setNewBusiness] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("Ecommerce Brand");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBudget, setNewBudget] = useState(25000);
  const [newSource, setNewSource] = useState<any>("Meta Ads");
  const [newAgent, setNewAgent] = useState("");

  // Search notification view state
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Quick WhatsApp template editor state
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState("");
  const [newTplTrigger, setNewTplTrigger] = useState<LeadStatus>("New Lead");
  const [newTplMessage, setNewTplMessage] = useState("");

  // Filter leads based on active side tab or global searches
  const getFilteredLeads = () => {
    return leads.filter((l) => {
      // Sidebar Tab Filters
      if (activeMenu === "new_leads" && l.status !== "New Lead") return false;
      if (activeMenu === "followup" && l.status !== "Follow-up") return false;
      if (activeMenu === "interested" && l.status !== "Interested") return false;
      if (activeMenu === "replied" && l.status !== "Replied") return false;
      if (activeMenu === "closed" && l.status !== "Closed") return false;
      if (activeMenu === "not_interested" && l.status !== "Not Interested") return false;

      // Table filters
      const matchesSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAgent = selectedAgent === "All" || l.assignedTo === selectedAgent;
      const matchesSource = selectedSource === "All" || l.leadSource === selectedSource;
      const matchesBudget = l.budget >= budgetMiniFilter;

      return matchesSearch && matchesAgent && matchesSource && matchesBudget;
    });
  };

  const filteredLeads = getFilteredLeads();

  // Create new lead helper
  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBusiness.trim()) return;

    onAddLead({
      name: newName,
      businessName: newBusiness,
      businessType: newBusinessType,
      phone: newPhone || "+91 90000 12345",
      email: newEmail || `${newName.toLowerCase().replace(/\s/g, "")}@example.com`,
      budget: Number(newBudget),
      leadSource: newSource,
      assignedTo: newAgent || team[0]?.name || "Abhiraj Gupta",
      status: "New Lead"
    });

    // Reset Form
    setNewName("");
    setNewBusiness("");
    setNewBusinessType("Ecommerce Brand");
    setNewPhone("");
    setNewEmail("");
    setNewBudget(25000);
    setNewSource("Meta Ads");
    setNewAgent("");
    setIsAddModalOpen(false);
  };

  // Create custom WhatsApp Template
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplName.trim() || !newTplMessage.trim()) return;

    const newTpl: WhatsappTemplate = {
      id: `tpl_${Date.now()}`,
      name: newTplName,
      triggerStatus: newTplTrigger,
      message: newTplMessage
    };

    onUpdateTemplates([...whatsappTemplates, newTpl]);
    setNewTplName("");
    setNewTplMessage("");
    setIsAddingTemplate(false);
  };

  // Delete WhatsApp Template
  const handleDeleteTemplate = (id: string) => {
    onUpdateTemplates(whatsappTemplates.filter(t => t.id !== id));
  };

  // Download filtered leads into CSV format
  const handleDownloadCSV = () => {
    const headers = [
      "Company Name",
      "Lead Contact Name",
      "Business Type",
      "SMM Budget (INR)",
      "Channels Source",
      "Assigned Specialist",
      "Pipeline Status",
      "Email Address",
      "Phone Number",
      "Created Date"
    ];
    
    const rows = filteredLeads.map(l => {
      const bType = l.businessType || "N/A";
      const createdDate = l.activities && l.activities.length > 0 
        ? l.activities[l.activities.length - 1].timestamp 
        : "N/A";

      // Properly escape comma/quotes/newlines for CSV safety
      const escapeField = (val: string) => {
        const clean = val.replace(/"/g, '""');
        return `"${clean}"`;
      };

      return [
        escapeField(l.businessName),
        escapeField(l.name),
        escapeField(bType),
        l.budget,
        escapeField(l.leadSource),
        escapeField(l.assignedTo),
        escapeField(l.status),
        escapeField(l.email),
        escapeField(l.phone),
        escapeField(createdDate)
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    // Dynamic clean name like leadflow_raw_ad_captures_2026-05-24.csv
    const dateStr = new Date().toISOString().slice(0, 10);
    const folderCleanName = activeMenu.replace("_", "-");
    link.setAttribute("download", `leadflow_export_${folderCleanName}_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic SMM campaign planner architect
  const handleGenerateCampaignPlan = async () => {
    setIsPlannerLoading(true);
    try {
      const response = await fetch("/api/ai/generate-campaign-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: plannerBusinessType,
          budget: plannerBudget,
          mainGoal: plannerGoal
        })
      });
      if (!response.ok) throw new Error("Failed generating ad campaign parameters");
      const data = await response.json();
      setPlannerResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlannerLoading(false);
    }
  };

  // Today's counter
  const todayLeadsCount = leads.filter(l => {
    const todayStr = "2026-05-24"; // System Mocking current date
    return l.dateAdded.startsWith(todayStr);
  }).length;

  const totalMonthlySpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  const totalMonthlyRevenue = leads.reduce((acc, c) => acc + (c.status === "Closed" ? c.budget : 0), 0);
  const activeFollowups = leads.filter(l => l.status === "Follow-up").length;
  const closedCount = leads.filter(l => l.status === "Closed").length;

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-500/20">
            LF
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 dark:text-slate-100">LeadFlow Pro</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">SMM Agency CRM</p>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 mb-2">Core Desk</div>
          
          {[
            { id: "dashboard", label: "Overview Dashboard", icon: LayoutDashboard },
            { id: "analytics", label: "Campaigns Analytics", icon: TrendingUp }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-xs font-semibold tracking-wide cursor-pointer transition ${
                  activeMenu === item.id 
                    ? "bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 pt-4 mb-2">Lead Channels</div>

          {[
            { id: "new_leads", label: "New Leads Folder", statusFlag: "New Lead" as LeadStatus },
            { id: "followup", label: "Follow-up Reminders", statusFlag: "Follow-up" as LeadStatus },
            { id: "interested", label: "Interested Leads", statusFlag: "Interested" as LeadStatus },
            { id: "replied", label: "Replied Leads", statusFlag: "Replied" as LeadStatus },
            { id: "closed", label: "Closed Client Wins", statusFlag: "Closed" as LeadStatus },
            { id: "not_interested", label: "Not Interested", statusFlag: "Not Interested" as LeadStatus },
          ].map(item => {
            const currentBadgeCount = leads.filter(l => l.status === item.statusFlag).length;
            const statusConfig = STATUS_LOOKUP[item.statusFlag];
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                className={`w-full flex items-center justify-between py-2 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeMenu === item.id 
                    ? "bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${statusConfig.color.replace("text-", "bg-")}`} />
                  {item.label}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {currentBadgeCount}
                </span>
              </button>
            );
          })}

          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-3 pt-4 mb-2">Agency Tools</div>

          {[
            { id: "planner", label: "AI Campaign Planner", icon: Sparkles },
            { id: "templates", label: "WhatsApp Templates", icon: Send },
            { id: "team", label: "Team Performance", icon: Users },
            { id: "settings", label: "CRM Workspace Settings", icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeMenu === item.id 
                    ? "bg-indigo-50 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Mini Profile Foot */}
        <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            AG
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">Abhiraj Gupta</h4>
            <p className="text-[10px] font-semibold text-indigo-500 truncate">Administrator Account</p>
          </div>
        </div>
      </aside>

      {/* 2. Main Desk Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex justify-between items-center shrink-0 gap-4">
          
          {/* Left search */}
          <div className="relative w-80 max-w-xs text-xs">
            <input 
              type="text"
              placeholder="Search leads, phones, emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-medium outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Right widgets */}
          <div className="flex items-center gap-4">
            
            {/* Dark & Light Toggle */}
            <button 
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
            >
              <span className="text-xs font-bold leading-none">{isDarkMode ? "☀️ Light" : "🌙 Dark"}</span>
            </button>

            {/* Notifications Panel */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Sync CRM Alerts</h4>
                    <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-extrabold">{notifications.length} New</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs space-y-0.5">
                        <div className="flex justify-between font-extrabold text-slate-800 dark:text-slate-200">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono font-normal">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{n.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button 
              id="new-lead-header-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="py-2 px-4 bg-indigo-600 hover:bg-slate-900 text-white xs:text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4 shrink-0" /> Log SMM Lead
            </button>
          </div>
        </header>

        {/* Dashboard Dynamic Sections */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* TAB: DASHBOARD PREPARED OUTLINE */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              
              {/* SaaS Gradient Stats Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Active Ad Leads", val: leads.length, desc: "Captured from campaigns", color: "from-blue-500 to-indigo-600", text: "text-blue-500" },
                  { title: "Monthly Signed Retainer", val: `₹${(totalMonthlyRevenue).toLocaleString("en-IN")}`, desc: "Active client contracts", color: "from-emerald-500 to-teal-600", text: "text-emerald-500" },
                  { title: "Pending Follow-Ups", val: activeFollowups, desc: "Callbacks due this week", color: "from-purple-500 to-pink-600", text: "text-purple-500" },
                  { title: "Campaign Ad Spend", val: `₹${(totalMonthlySpend).toLocaleString("en-IN")}`, desc: "Meta & Google budgets", color: "from-amber-500 to-orange-600", text: "text-amber-500" },
                ].map((card, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex justify-between select-none hover:translate-y-[-2px] transition duration-200">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{card.title}</p>
                      <h3 className="text-xl font-black mt-1.5 text-slate-900 dark:text-slate-50">{card.val}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">{card.desc}</p>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full bg-radial mt-1 shrink-0 ${card.text.replace("text-", "bg-")}`} />
                  </div>
                ))}
              </div>

              {/* Advanced Filter Widgets Bar */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-4 items-center justify-between text-xs">
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Lead Base:</span>
                  
                  {/* Filter by assigned agent */}
                  <select 
                    value={selectedAgent} 
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2.5 font-semibold text-slate-600 dark:text-slate-300 outline-none"
                  >
                    <option value="All">All Specialists</option>
                    {team.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>

                  {/* Filter by lead source */}
                  <select 
                    value={selectedSource} 
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg py-1.5 px-2.5 font-semibold text-slate-600 dark:text-slate-300 outline-none"
                  >
                    <option value="All">All Ad Sources</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="TikTok Ad">TikTok Ad</option>
                    <option value="Referral">Referral</option>
                  </select>

                  {/* Filter by budget slider */}
                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-slate-400">Min Budget:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{budgetMiniFilter.toLocaleString()}</span>
                    <input 
                      type="range"
                      min={0}
                      max={80000}
                      step={5000}
                      value={budgetMiniFilter}
                      onChange={(e) => setBudgetMiniFilter(Number(e.target.value))}
                      className="w-24 mt-1 accent-indigo-600 cursor-pointer"
                    />
                    {budgetMiniFilter > 0 && (
                      <button onClick={() => setBudgetMiniFilter(0)} className="text-indigo-600 font-bold hover:underline">Clear</button>
                    )}
                  </div>
                </div>

                <div className="text-slate-400 font-medium">
                  Showing <strong className="text-indigo-600 dark:text-indigo-400">{leads.length} leads</strong> total
                </div>
              </div>

              {/* Master Lead pipeline section (Kanban grid mimicking fast movement) */}
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Dynamic Outreach Pipelines</h3>
                  <p className="text-[11px] text-slate-400">Open any lead card below to evaluate performance & transition pipeline stages.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* COLUMN 1: NEW PIPELINES */}
                  <div className="space-y-3 bg-slate-100/55 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/60">
                    <div className="flex justify-between items-center font-bold px-1 select-none">
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest shrink-0">Captured & Raw</span>
                      <span className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {leads.filter(l => l.status === "New Lead" || l.status === "Contacted" || l.status === "No Reply").length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
                      {leads.filter(l => l.status === "New Lead" || l.status === "Contacted" || l.status === "No Reply").map(lead => (
                        <div 
                          key={lead.id} 
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-indigo-900/40 hover:border-slate-300 hover:shadow-md transition text-xs space-y-2.5 relative cursor-pointer"
                          onClick={() => onSelectLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{lead.businessName}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Contact: {lead.name}</p>
                            </div>
                            {lead.aiScore && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 font-extrabold text-indigo-600 dark:text-indigo-400 rounded-sm">
                                {lead.aiScore}% AI
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>SMM Budget: <strong>₹{lead.budget.toLocaleString("en-IN")}</strong></span>
                            <span className="font-mono text-[9px] text-indigo-500">{lead.leadSource}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-2 text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {lead.assignedTo.split(" ")[0]}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COLUMN 2: ACTIVE ENGAGEMENTS */}
                  <div className="space-y-3 bg-slate-100/55 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-855/60">
                    <div className="flex justify-between items-center font-bold px-1 select-none">
                      <span className="text-xs font-black text-purple-600 uppercase tracking-widest shrink-0">In Discussion / Warm</span>
                      <span className="bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {leads.filter(l => l.status === "Replied" || l.status === "Interested" || l.status === "Meeting Scheduled" || l.status === "Follow-up").length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
                      {leads.filter(l => l.status === "Replied" || l.status === "Interested" || l.status === "Meeting Scheduled" || l.status === "Follow-up").map(lead => (
                        <div 
                          key={lead.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-indigo-900/40 hover:border-slate-300 hover:shadow-md transition text-xs space-y-2.5 relative cursor-pointer"
                          onClick={() => onSelectLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{lead.businessName}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Contact: {lead.name}</p>
                            </div>
                            {lead.aiScore && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 font-extrabold text-indigo-600 dark:text-indigo-400 rounded-sm">
                                {lead.aiScore}% AI
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>SMM Budget: <strong>₹{lead.budget.toLocaleString("en-IN")}</strong></span>
                            <span className="font-mono text-[9px] text-indigo-500">{lead.leadSource}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-2 text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {lead.assignedTo.split(" ")[0]}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COLUMN 3: SIGNED ONBOARD & CLOSED */}
                  <div className="space-y-3 bg-slate-100/55 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-855/60">
                    <div className="flex justify-between items-center font-bold px-1 select-none">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest shrink-0">Closed Win / Lost</span>
                      <span className="bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {leads.filter(l => l.status === "Closed" || l.status === "Not Interested").length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[38rem] overflow-y-auto pr-1">
                      {leads.filter(l => l.status === "Closed" || l.status === "Not Interested").map(lead => (
                        <div 
                          key={lead.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-indigo-900/40 hover:border-slate-300 hover:shadow-md transition text-xs space-y-2.5 relative cursor-pointer"
                          onClick={() => onSelectLead(lead)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{lead.businessName}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">Contact: {lead.name}</p>
                            </div>
                            {lead.aiScore && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 font-extrabold text-indigo-600 dark:text-indigo-400 rounded-sm">
                                {lead.aiScore}% AI
                              </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-slate-500 flex justify-between">
                            <span>SMM Budget: <strong>₹{lead.budget.toLocaleString("en-IN")}</strong></span>
                            <span className="font-mono text-[9px] text-indigo-500">{lead.leadSource}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/40 pt-2 text-[10px]">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3" /> {lead.assignedTo.split(" ")[0]}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-[9px] ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg}`}>
                              {lead.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: MARKETING ANALYSED GRAPHS */}
          {activeMenu === "analytics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Campaign Performance Center</h2>
                  <p className="text-xs text-slate-400">Live ROI analytics computed from active Google & Meta social ad pools</p>
                </div>
              </div>
              <AnalyticsView leads={leads} campaigns={campaigns} team={team} />
            </div>
          )}

          {/* TAB: AI SMM CAMPAIGN PLANNER */}
          {activeMenu === "planner" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center animate-fadeIn">
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">AI Campaign Strategy Architect</h2>
                  <p className="text-xs text-slate-400">Generate instantly tailored multi-channel SMM marketing budgets, ad copy hooks, and strategic pipelines with Gemini.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                
                {/* Inputs card */}
                <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4 text-xs">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
                    <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200">SMM Criteria Inputs</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Client Niche / Industry</label>
                      <input 
                        type="text" 
                        value={plannerBusinessType}
                        onChange={(e) => setPlannerBusinessType(e.target.value)}
                        placeholder="e.g. Cosmetic Dentist, Clothing ecommerce, local Gym"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-600 dark:bg-slate-950 dark:border-slate-850 rounded-xl p-2.5 outline-none font-medium text-slate-800 dark:text-slate-200 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Monthly Inward Ad Spend Limit</label>
                      <div className="flex justify-between items-center mb-1.5 font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        <span>Min Budget</span>
                        <span>₹{plannerBudget.toLocaleString("en-IN")}</span>
                      </div>
                      <input 
                        type="range" 
                        min={10000}
                        max={200000}
                        step={5000}
                        value={plannerBudget}
                        onChange={(e) => setPlannerBudget(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Typical CPC/CPL scales proportionally to industry benchmarks.</p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 font-sans">Primary Campaign Goal</label>
                      <select 
                        value={plannerGoal}
                        onChange={(e) => setPlannerGoal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-850 rounded-xl p-2.5 outline-none font-medium text-slate-800 dark:text-slate-200 focus:border-indigo-600 transition"
                      >
                        <option value="Lead Generation with Instant Forms">High-Quality Lead Forms (WhatsApp Automation)</option>
                        <option value="Ecommerce Conversion & Catalog Ads">Direct Sales Purchase Conversions</option>
                        <option value="Local Store Visits & GMB Citations">Local Walk-Ins & Brand Reach</option>
                        <option value="Viral Video Reach & Organic Growth engagement">High-Reach Video Virality & Retargeting</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGenerateCampaignPlan}
                      disabled={isPlannerLoading || !plannerBusinessType.trim()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 font-bold rounded-xl text-white shadow-sm hover:shadow transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isPlannerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Deploy Campaign Architect
                    </button>
                  </div>
                </div>

                {/* Outputs card */}
                <div className="xl:col-span-2 space-y-4">
                  {plannerResult ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden text-xs animate-fadeIn">
                      {/* Top banner */}
                      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 border-b border-indigo-100/50 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Strategic Campaign Blueprint</div>
                          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">{plannerResult.campaignName}</h3>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/40 font-black text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-100/40">
                          {plannerResult.adPlatform}
                        </span>
                      </div>

                      {/* ROI Forecasting Grid */}
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-3.5 tracking-wider font-sans">ROI Metrics Forecasting Calculator</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Estimated Cost/Lead</p>
                              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">₹{plannerResult.targetCpl}</p>
                            </div>
                            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-extrabold font-mono">CPL</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Predicted Monthly Leads</p>
                              <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">{plannerResult.estimatedLeads}</p>
                            </div>
                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded font-extrabold font-mono">FLOW</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase font-bold">Predicted Signed Deals</p>
                              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{Math.max(1, Math.floor(plannerResult.estimatedLeads * 0.12))}</p>
                            </div>
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-extrabold font-mono">~12% CR</span>
                          </div>
                        </div>
                      </div>

                      {/* Creative Ad Hook */}
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider font-sans">High-Performing SMM Video Ad Script Hook</h4>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(plannerResult.strategicAdCreativeHook);
                              setPlannerCopiedHook(true);
                              setTimeout(() => setPlannerCopiedHook(false), 2000);
                            }}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            {plannerCopiedHook ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : "Copy Ad Copy Hook"}
                          </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl font-mono text-slate-700 dark:text-slate-300 relative">
                          <span className="absolute -left-1 -top-1.5 text-4xl text-indigo-200/55 dark:text-indigo-900/30 font-serif leading-none">“</span>
                          <p className="pl-3 py-1 text-xs select-text">{plannerResult.strategicAdCreativeHook}</p>
                        </div>
                      </div>

                      {/* Audience Setup Target Parameters */}
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Demographic Targeting Alignment specs</h4>
                        <p className="text-slate-600 dark:text-slate-300 italic py-1 leading-relaxed">{plannerResult.audienceSetup}</p>
                      </div>

                      {/* Implementation Milestones */}
                      <div className="p-5 space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Detailed Execution Milestones Schedule</h4>
                        <div className="space-y-4">
                          {plannerResult.campaignRoadmap?.map((step: string, idx: number) => (
                            <div key={idx} className="flex gap-3.5 items-start text-xs">
                              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100/30 dark:border-indigo-900/40 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-700 dark:text-indigo-300 shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-slate-755 dark:text-slate-300 leading-relaxed font-sans font-medium">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 flex items-center justify-center shadow-xs">
                        <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">No active campaign plan generated yet</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Input your client SMM details on the left, then trigger our campaign planner model to generate real-time metrics, platform selections, target demographics, copy scripts, and 4-week roadmaps.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: LEAD CHANNEL FOLDER TABLES (New, Followup, Interested, Replied, Closed, etc.) */}
          {["new_leads", "followup", "interested", "replied", "closed", "not_interested"].includes(activeMenu) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2.5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">
                    {activeMenu === "new_leads" ? "Raw Ad Captures Inbox" :
                     activeMenu === "followup" ? "Assigned Callback Log" :
                     activeMenu === "interested" ? "Warm Prospect Funnel" :
                     activeMenu === "replied" ? "Contact Message Response logs" :
                     activeMenu === "closed" ? "Onboarding Client Wins" : "Lost Inquiries Folder"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Direct listing of matches matching current folder rules.</p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <button 
                    onClick={handleDownloadCSV}
                    disabled={filteredLeads.length === 0}
                    className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-1.5 transition text-slate-700 dark:text-slate-300 shadow-2xs hover:shadow-xs cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                    id="btn-download-csv"
                    title="Export currently filtered list as an enterprise ready CSV reporting sheet"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 py-1.5 px-3 rounded-xl bg-indigo-50/55 dark:bg-indigo-950/20 border border-indigo-100/30">
                    Total: {filteredLeads.length}
                  </span>
                </div>
              </div>

              {/* CRM leads detailed listings table layout */}
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 select-none">
                      <th className="p-3.5 pl-4">Company Name</th>
                      <th className="p-3.5">Lead Contact</th>
                      <th className="p-3.5">Budget (INR)</th>
                      <th className="p-3.5">Channels Source</th>
                      <th className="p-3.5">Assigned Partner</th>
                      <th className="p-3.5">Status Trigger</th>
                      <th className="p-3.5 pr-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {filteredLeads.map(lead => {
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-300">
                          <td className="p-3.5 pl-4" onClick={() => onSelectLead(lead)}>
                            <div className="font-extrabold text-slate-900 dark:text-slate-100">{lead.businessName}</div>
                            <div className="text-[10px] text-slate-400 italic">{lead.businessType}</div>
                          </td>
                          <td className="p-3.5" onClick={() => onSelectLead(lead)}>
                            <div>{lead.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{lead.phone}</div>
                          </td>
                          <td className="p-3.5 font-bold font-mono">
                            ₹{lead.budget.toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5 font-mono text-[10px]">
                            {lead.leadSource}
                          </td>
                          <td className="p-3.5">
                            {lead.assignedTo}
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg} border ${STATUS_LOOKUP[lead.status].border}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-3.5 pr-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onSelectLead(lead)} 
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 text-xs font-bold rounded-md cursor-pointer"
                              >
                                Review
                              </button>
                              <button 
                                onClick={() => onDeleteLead(lead.id)}
                                className="p-1 rounded-md border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-slate-400 italic">
                          No SMM lead records fit this filter query currently.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: WHATSAPP TEMPLATES CREATION */}
          {activeMenu === "templates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Automatic WhatsApp Message Templates</h2>
                  <p className="text-xs text-slate-400">Design direct auto-replies matching custom CRM client status triggers</p>
                </div>

                <button 
                  onClick={() => setIsAddingTemplate(!isAddingTemplate)}
                  className="py-1.5 px-3 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Template
                </button>
              </div>

              {/* Adding Form Block */}
              {isAddingTemplate && (
                <form onSubmit={handleCreateTemplate} className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Construct Outreach Template Script</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Template Label</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Dental Clean Strategy"
                        value={newTplName}
                        onChange={(e) => setNewTplName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 dark:bg-slate-950 dark:border-slate-800 rounded-lg p-2.5 outline-none font-medium focus:border-indigo-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">CRM Status Trigger Placement</label>
                      <select 
                        value={newTplTrigger} 
                        onChange={(e) => setNewTplTrigger(e.target.value as LeadStatus)}
                        className="w-full bg-slate-50 border border-slate-250 dark:bg-slate-950 dark:border-slate-800 rounded-lg p-2 outline-none"
                      >
                        {Object.keys(STATUS_LOOKUP).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Message Body</label>
                      <span className="text-[10px] text-indigo-500 font-semibold font-mono">Supports {"{{name}}"}, {"{{businessName}}"}, {"{{budget}}"}</span>
                    </div>
                    <textarea 
                      value={newTplMessage}
                      onChange={(e) => setNewTplMessage(e.target.value)}
                      placeholder="Hi {{name}}, ready to scale {{businessName}} with reels?"
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-250 dark:bg-slate-950 dark:border-slate-800 rounded-lg p-3 outline-none focus:border-indigo-600 font-mono"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsAddingTemplate(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold"
                    >
                      Dismiss
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              )}

              {/* Templates Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whatsappTemplates.map(tpl => {
                  return (
                    <div key={tpl.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-5 rounded-2xl shadow-xs text-xs space-y-3 relative group">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-none">{tpl.name}</h4>
                          <span className="text-[9px] text-slate-400">Status rules: <strong className="text-indigo-600">{tpl.triggerStatus}</strong></span>
                        </div>

                        <button 
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1 rounded-md text-slate-350 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50 leading-relaxed font-mono text-slate-600 dark:text-slate-300">
                        {tpl.message}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB: TEAM MANAGEMENT ROSTER */}
          {activeMenu === "team" && (
            <div className="space-y-6">
              
              {/* Leader Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {team.map(m => {
                  return (
                    <div key={m.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${m.avatarColor} font-black flex items-center justify-center shrink-0`}>
                          {m.name.split(" ").map(p => p[0]).join("")}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100">{m.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{m.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-50 dark:border-slate-800/40">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Assigned</span>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-200">{m.leadsAssigned}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Closed Deals</span>
                          <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{m.dealsClosed}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400">Conversion Power</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(m.activeRate)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${m.activeRate}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Roster Table */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-805 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Team Active Sales Pipelines</h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-50 dark:border-slate-805">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="p-3 pl-4">Staff Member</th>
                        <th className="p-3">Designation</th>
                        <th className="p-3">Conversion Rate</th>
                        <th className="p-3">Revenue Earned (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {team.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 text-slate-600 dark:text-slate-300">
                          <td className="p-3 pl-4 font-extrabold text-slate-900 dark:text-slate-150">{m.name}</td>
                          <td className="p-3">{m.role}</td>
                          <td className="p-3 text-indigo-600 font-bold">{Math.round(m.activeRate)}%</td>
                          <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">₹{(m.revenueGenerated).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: CRM GLOBAL CONFIG SETTINGS */}
          {activeMenu === "settings" && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs max-w-xl space-y-6 text-xs">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">CRM Platform Configurations</h3>
                <p className="text-xs text-slate-400 mt-1">Configure options for lead distribution metrics & client tracking.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Cloud Storage Connection</h4>
                    <p className="text-[10px] text-slate-400">Saves client notes directly to the internal container sandbox.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] bg-emerald-50 dark:bg-emerald-950 font-black text-emerald-600 rounded-md">CONNECTED</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-slate-50 dark:border-slate-800">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Gemini 3.5 AI Model Grounding</h4>
                    <p className="text-[10px] text-slate-400">Uses server-side 'gemini-3.5-flash' for parsing budgets.</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-950 font-black text-indigo-600 rounded-md">ACTIVE</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Local Timezone Localization</h4>
                    <p className="text-[10px] text-slate-400">Synchronized currently at UTC 2026-05-24T07:12:43Z.</p>
                  </div>
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 p-1 px-2.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300">UTC +0</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* WEB POPUP MANUAL CREATE LEAD MODAL SHEET */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden text-xs">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Log Social Lead</h4>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLeadSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Radiant Clinic"
                    value={newBusiness}
                    onChange={(e) => setNewBusiness(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2.5 font-medium outline-none text-slate-800 dark:text-slate-100 focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lead Category focus</label>
                  <select 
                    value={newBusinessType} 
                    onChange={(e) => setNewBusinessType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="Ecommerce Brand">Ecommerce Brand</option>
                    <option value="Dental Clinic">Dental Clinic</option>
                    <option value="Real Estate">Real Estate Broker</option>
                    <option value="Fitness Studio">Fitness Studio</option>
                    <option value="SaaS Startup">SaaS Startup</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Key Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Sanya Sharma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2.5 font-medium outline-none text-slate-800 dark:text-slate-100 focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Proposed SMM Budget (₹)</label>
                  <input 
                    type="number" 
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2.5 font-bold outline-none text-slate-800 dark:text-slate-104 focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">WhatsApp Mobile</label>
                  <input 
                    type="text" 
                    placeholder="e.g., +91 91234 56789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2.5 outline-none font-mono focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Email address</label>
                  <input 
                    type="email" 
                    placeholder="e.g., sanya@radiant.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2.5 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Lead Source</label>
                  <select 
                    value={newSource} 
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 outline-none"
                  >
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Instagram DM">Instagram DM</option>
                    <option value="TikTok Ad">TikTok Ad</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assign CRM Executive</label>
                  <select 
                    value={newAgent} 
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl p-2 outline-none"
                  >
                    <option value="">Auto Assign Account</option>
                    {team.map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold"
                >
                  Dismiss
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-sm"
                >
                  Log Pipeline & Sync
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
