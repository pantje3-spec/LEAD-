import { useState, useEffect } from "react";
import { Lead, LeadStatus, STATUS_LOOKUP, TeamMember, WhatsappTemplate, AppReminder } from "../types";
import { 
  Home, Users, Bell, Phone, Mail, MessageSquare, Plus, 
  Settings, Battery, Wifi, Flame, Sparkles, Send, Search, Check, Smartphone, CheckSquare, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { User } from "firebase/auth";

interface MobileCRMProps {
  leads: Lead[];
  team: TeamMember[];
  reminders: AppReminder[];
  onUpdateLead: (updated: Lead) => void;
  onAddLead: (newLead: Partial<Lead>) => void;
  whatsappTemplates: WhatsappTemplate[];
  currentUser?: User | null;
  isAuthLoading?: boolean;
  isSyncing?: boolean;
  loginWithGoogle?: () => void;
  loginWithEmail?: (email: string, password: string) => Promise<void>;
  logoutUser?: () => void;
  isFullscreen?: boolean;
}

export default function MobileCRM({ 
  leads, 
  team, 
  reminders,
  onUpdateLead, 
  onAddLead,
  whatsappTemplates,
  currentUser,
  isAuthLoading,
  isSyncing,
  loginWithGoogle,
  loginWithEmail,
  logoutUser,
  isFullscreen = false
}: MobileCRMProps) {

  const [bottomTab, setBottomTab] = useState<"home" | "leads" | "reminders">("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMobileStatus, setSelectedMobileStatus] = useState<LeadStatus | "All">("All");
  const [activeLeadDetailsId, setActiveLeadDetailsId] = useState<string | null>(null);

  // Mobile Log In Form States
  const [showMobileLoginForm, setShowMobileLoginForm] = useState(false);
  const [mobileEmail, setMobileEmail] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [mobileLoginError, setMobileLoginError] = useState("");
  const [mobileIsLoggingIn, setMobileIsLoggingIn] = useState(false);
  
  // Business / Lead Categories
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("crm_categories_list_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fall back below
      }
    }
    return [
      "Ecommerce Brand",
      "Dental Clinic",
      "Real Estate",
      "Fitness Studio",
      "SaaS Startup",
      "Hospital",
      "Salon",
      "Fitness"
    ];
  });
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // Mobile Quick Add Lead Modal
  const [isMobileAddOpen, setIsMobileAddOpen] = useState(false);
  const [newMobileName, setNewMobileName] = useState("");
  const [newMobileBusiness, setNewMobileBusiness] = useState("");
  const [newMobileBusinessType, setNewMobileBusinessType] = useState("Ecommerce Brand");
  const [newMobilePhone, setNewMobilePhone] = useState("");
  const [newMobileBudget, setNewMobileBudget] = useState(25000);

  // Simulated push notifications banner state
  const [mobileNotification, setMobileNotification] = useState<{title: string, desc: string} | null>(null);

  // Monitor leads count to trigger iOS style push notification when a lead is added from desktop
  const [lastLeadsCount, setLastLeadsCount] = useState(leads.length);
  useEffect(() => {
    if (leads.length > lastLeadsCount) {
      // Latest lead
      const newestLead = leads[leads.length - 1];
      setMobileNotification({
        title: "New Lead Capture! ⚡",
        desc: `${newestLead.name} (${newestLead.businessName}) just submitted an inquiry.`
      });
      // Auto dismiss
      const timer = setTimeout(() => {
        setMobileNotification(null);
      }, 4500);
      setLastLeadsCount(leads.length);
      return () => clearTimeout(timer);
    } else if (leads.length < lastLeadsCount) {
      setLastLeadsCount(leads.length);
    }
  }, [leads, lastLeadsCount]);

  const handleMobileStatusChange = (id: string, nextStatus: LeadStatus) => {
    const original = leads.find(l => l.id === id);
    if (!original) return;
    const updated: Lead = {
      ...original,
      status: nextStatus,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "status_change",
          description: `Status changed to "${nextStatus}" via Mobile MobileApp interface`,
          timestamp: new Date().toISOString()
        },
        ...original.activities
      ]
    };
    onUpdateLead(updated);
  };

  const handleMobileAddSubmit = () => {
    if (!newMobileName.trim() || !newMobileBusiness.trim()) return;

    let finalCategory = newMobileBusinessType;
    if (newMobileBusinessType === "__ADD_NEW__") {
      const trimmed = customCategoryInput.trim();
      if (trimmed) {
        if (!availableCategories.includes(trimmed)) {
          const updated = [...availableCategories, trimmed];
          setAvailableCategories(updated);
          localStorage.setItem("crm_categories_list_v1", JSON.stringify(updated));
        }
        finalCategory = trimmed;
      } else {
        finalCategory = "General";
      }
    }

    onAddLead({
      name: newMobileName,
      businessName: newMobileBusiness,
      businessType: finalCategory,
      phone: newMobilePhone || "+91 90000 11111",
      email: `${newMobileName.toLowerCase().replace(/\s/g, "")}@example.com`,
      budget: Number(newMobileBudget),
      status: "New Lead",
      assignedTo: team[0]?.name || "Abhiraj Gupta",
      leadSource: "Instagram DM"
    });

    // Reset Form
    setNewMobileName("");
    setNewMobileBusiness("");
    setNewMobilePhone("");
    setNewMobileBudget(25000);
    setNewMobileBusinessType("Ecommerce Brand");
    setCustomCategoryInput("");
    setIsMobileAddOpen(false);

    // Instant Mobile Push alert
    setMobileNotification({
      title: "Success! Lead Logged 📲",
      desc: "Client saved and synced real-time with the web platform dashboard."
    });
    setTimeout(() => setMobileNotification(null), 3000);
  };

  // Filter leads for mobile list
  const filteredMobileLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedMobileStatus === "All" || l.status === selectedMobileStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate quick statistics for mobile home
  const totalLeadsCount = leads.length;
  const activeFollowupsCount = leads.filter(l => l.status === "Follow-up").length;
  const closedCount = leads.filter(l => l.status === "Closed").length;
  const leadBudgetsSum = leads.reduce((acc, current) => acc + (current.status === "Closed" ? current.budget : 0), 0);

  return (
    <div 
      className={
        isFullscreen 
          ? "relative w-full max-w-sm sm:max-w-md h-[88vh] sm:h-[780px] bg-slate-50 dark:bg-slate-950 rounded-2xl sm:rounded-[36px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col mx-auto"
          : "relative mx-auto w-[350px] h-[720px] bg-slate-950 rounded-[48px] border-[12px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-800 flex flex-col"
      }
    >
      
      {/* Phone Notch/Island */}
      {!isFullscreen && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-[18px] bg-slate-950 rounded-full z-50 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
        </div>
      )}

      {/* Phone Status Bar */}
      <div className={`absolute top-0 inset-x-0 h-9 bg-transparent text-[10px] text-slate-800 dark:text-slate-300 font-bold px-7 pt-2 select-none z-40 flex justify-between items-center ${isFullscreen ? "px-5 pt-1.5" : "px-7"}`}>
        <span>07:12</span>
        <div className="flex gap-1 items-center">
          <Wifi className="w-3.5 h-3.5" />
          <Battery className="w-4 h-4 text-emerald-500 shrink-0" />
        </div>
      </div>

      {/* Simulated Device Push Notification Banner */}
      <AnimatePresence>
        {mobileNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 12, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="absolute top-10 inset-x-3.5 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl z-50 flex items-start gap-2.5 text-xs select-none leading-tight pointer-events-auto cursor-pointer"
            onClick={() => {
              setMobileNotification(null);
              setBottomTab("leads");
            }}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-slate-100">{mobileNotification.title}</div>
              <div className="text-slate-300 mt-0.5 line-clamp-2">{mobileNotification.desc}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Interactive Container */}
      <div className="w-full h-full pt-9 pb-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col relative select-none">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
          
          {/* TAB 1: HOME DASHBOARD */}
          {bottomTab === "home" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Profile Bar */}
              <div className="flex justify-between items-center bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {currentUser ? (
                    currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || "User"} 
                        className="w-9 h-9 rounded-full border border-indigo-200 object-cover shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {currentUser.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : "US"}
                      </div>
                    )
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-extrabold text-xs flex items-center justify-center shrink-0">
                      AG
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">SMM Agency CRM</p>
                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                      {currentUser ? (currentUser.displayName || "Agency Leader") : "Abhiraj Gupta (Local)"}
                    </h3>
                  </div>
                </div>
                
                {currentUser ? (
                  <button
                    onClick={logoutUser}
                    className="text-[8px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-350 p-1 px-2 rounded-md font-extrabold transition uppercase"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => setShowMobileLoginForm(!showMobileLoginForm)}
                    className="text-[8px] bg-indigo-600 hover:bg-indigo-700 text-white p-1 px-2 rounded-md font-extrabold transition uppercase"
                  >
                    {showMobileLoginForm ? "Close" : "Connect"}
                  </button>
                )}
              </div>

               {/* Mobile Credentials Login Form */}
              {showMobileLoginForm && !currentUser && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-[11px] animate-slideIn">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">🔒 Admin Credentials Gateway</span>
                    <span className="text-[10px] text-indigo-500 font-mono font-bold">Firebase Sync</span>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!loginWithEmail) return;
                      setMobileIsLoggingIn(true);
                      setMobileLoginError("");
                      try {
                        await loginWithEmail(mobileEmail, mobilePassword);
                        setShowMobileLoginForm(false);
                      } catch (err: any) {
                        setMobileLoginError(err.message || "Failed to authenticate.");
                      } finally {
                        setMobileIsLoggingIn(false);
                      }
                    }}
                    className="space-y-2"
                  >
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Login ID (Email):</span>
                      <input 
                        type="email"
                        value={mobileEmail}
                        onChange={(e) => setMobileEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
                        required
                        disabled={mobileIsLoggingIn}
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Secret Password:</span>
                      <input 
                        type="password"
                        value={mobilePassword}
                        onChange={(e) => setMobilePassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
                        required
                        disabled={mobileIsLoggingIn}
                      />
                    </div>

                    {mobileLoginError && (
                      <p className="text-[9px] text-rose-500 font-bold leading-tight">{mobileLoginError}</p>
                    )}

                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="submit"
                        disabled={mobileIsLoggingIn}
                        className="flex-1 bg-indigo-600 hover:bg-slate-950 text-white p-2 rounded-lg font-black uppercase text-[10px] cursor-pointer flex items-center justify-center gap-1"
                      >
                        {mobileIsLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Sign In & Connect"}
                      </button>
                      <button
                        type="button"
                        onClick={loginWithGoogle}
                        className="p-2 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-extrabold uppercase shrink-0"
                      >
                        Google
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Status Real-time Sync Alert Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition duration-305 ${currentUser ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className={`w-2 h-2 rounded-full inline-block shrink-0 ${currentUser ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                  {currentUser ? "Realtime Cloud Sync Connected" : "Local Mode Only (Disconnected)"}
                </span>
                {!currentUser && (
                  <button 
                    onClick={() => setShowMobileLoginForm(true)}
                    className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase underline"
                  >
                    Click to login
                  </button>
                )}
              </div>

              {/* Mobile Analytics Bento Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Total Leads</span>
                  <div className="text-xl font-black mt-0.5 text-slate-950 dark:text-slate-50">{totalLeadsCount}</div>
                  <div className="text-[9px] text-indigo-500 font-bold mt-1">Updated just now</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Closed Signups</span>
                  <div className="text-xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">{closedCount}</div>
                  <div className="text-[9px] text-slate-400 mt-1">Conversions: +12%</div>
                </div>

                <div className="col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-950 p-4 rounded-xl text-white shadow-sm border border-indigo-950">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-indigo-200 font-bold uppercase text-[9px]">Monthly Signed Retainers</span>
                      <div className="text-2xl font-black mt-1">₹{(leadBudgetsSum).toLocaleString("en-IN")}</div>
                    </div>
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-indigo-300 mt-2">Active campaigns driving {leads.length - closedCount} pipelines.</p>
                </div>
              </div>

              {/* Hot leads (Highest AI Score) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Hot Pipelines (High AI Score)
                  </h4>
                  <button 
                    onClick={() => setBottomTab("leads")} 
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {leads.filter(l => l.status !== "Closed" && l.status !== "Not Interested")
                    .sort((a,b) => (b.aiScore || 0) - (a.aiScore || 0))
                    .slice(0, 3)
                    .map(lead => (
                      <div 
                        key={lead.id} 
                        onClick={() => setActiveLeadDetailsId(lead.id)}
                        className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-800 shadow-xs cursor-pointer text-xs flex justify-between items-center transition"
                      >
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-100">{lead.businessName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{lead.name}</span> · 
                            <span className={STATUS_LOOKUP[lead.status].color}>{lead.status}</span>
                          </div>
                        </div>
                        {lead.aiScore && (
                          <div className="text-right sr-only sm:not-sr-only">
                            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-extrabold font-mono">
                              {lead.aiScore}% AI
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS LIST VIEW */}
          {bottomTab === "leads" && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100" id="leads-list-mobile-title">Mobile Workspace CRM</h3>
              </div>

              {/* Status filtering capsules horizontal scroll */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {["All", "New Lead", "Contacted", "Follow-up", "Interested", "Closed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedMobileStatus(st as any)}
                    className={`py-1 px-3 rounded-full text-[10px] font-extrabold shrink-0 cursor-pointer transition ${
                      selectedMobileStatus === st 
                        ? "bg-indigo-600 text-white" 
                        : "bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Mobile Search input */}
              <div className="relative text-xs">
                <input 
                  type="text" 
                  placeholder="Filter by name/brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl py-2 px-8.5 text-xs outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-600 transition"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Mobile Leads Scrollable Stack */}
              <div className="space-y-2.5">
                {filteredMobileLeads.map((lead) => {
                  return (
                    <div 
                      key={lead.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-800 text-xs shadow-xs relative"
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-start mb-1.5" onClick={() => setActiveLeadDetailsId(lead.id)}>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 leading-tight">{lead.businessName}</h4>
                          <span className="text-[10px] text-slate-400">{lead.name} · {lead.businessType}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg} border ${STATUS_LOOKUP[lead.status].border}`}>
                          {lead.status}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-500 font-medium mb-2.5 flex justify-between" onClick={() => setActiveLeadDetailsId(lead.id)}>
                        <span>Budget: <strong>₹{lead.budget.toLocaleString("en-IN")}</strong></span>
                        <span className="font-mono text-[9px]">Source: {lead.leadSource}</span>
                      </div>

                      {/* Hot actions buttons */}
                      <div className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800/60 pt-2 text-[10px] justify-between">
                        
                        {/* Swipe change action */}
                        <div className="flex items-center gap-1">
                          <select 
                            value={lead.status} 
                            onChange={(e) => handleMobileStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-1.5 font-bold text-slate-600 dark:text-slate-300 outline-none hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                          >
                            <option value="New Lead">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="No Reply">No Response</option>
                            <option value="Replied">Replied</option>
                            <option value="Interested">Interested</option>
                            <option value="Meeting Scheduled">Meeting</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Closed">Closed</option>
                            <option value="Not Interested">Not Int.</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Direct Whatsapp Quick Launcher */}
                          <button
                            onClick={() => {
                              const tpl = whatsappTemplates.find(t => t.triggerStatus === lead.status) || whatsappTemplates[0];
                              const message = tpl ? tpl.message.replace(/\{\{name\}\}/g, lead.name).replace(/\{\{businessName\}\}/g, lead.businessName) : "Hello SMM Inquiry!";
                              const encodedText = encodeURIComponent(message);
                              const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
                              window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`, "_blank");
                            }}
                            className="p-1 px-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-md transition font-extrabold flex items-center gap-1 cursor-pointer border border-emerald-100 dark:border-emerald-900"
                          >
                            <Send className="w-2.5 h-2.5" /> WhatsApp
                          </button>

                          <button 
                            onClick={() => setActiveLeadDetailsId(lead.id)}
                            className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition font-extrabold cursor-pointer"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredMobileLeads.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 italic bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    No matching leads found inside mobile simulator view.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: REMINDERS / ACTIONS AREA */}
          {bottomTab === "reminders" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tasks & Reminders</h3>
              
              <div className="space-y-2.5">
                {reminders.map((rem) => (
                  <div 
                    key={rem.id}
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs text-xs space-y-1 relative"
                  >
                    <div className="flex justify-between items-start">
                      <span className={`inline-block py-0.5 px-2 rounded-md text-[9px] font-bold ${
                        rem.type === "meeting" ? "bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900" :
                        rem.type === "followup" ? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900" :
                        "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900"
                      }`}>
                        {rem.type.toUpperCase().replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{rem.time}</span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{rem.businessName} - {rem.leadName}</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{rem.text}</p>
                    
                    <div className="pt-1.5 flex justify-between items-center text-[10px] border-t border-slate-50 dark:border-slate-800/40 mt-2">
                      <span className="text-slate-400">Scheduled: {rem.date}</span>
                      <button 
                        className="py-0.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 rounded-md transition font-extrabold cursor-pointer"
                        onClick={() => {
                          const associated = leads.find(l => l.id === rem.leadId);
                          if (associated) setActiveLeadDetailsId(associated.id);
                        }}
                      >
                        Action Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Floating Add Lead Button */}
        {bottomTab === "leads" && (
          <button 
            onClick={() => setIsMobileAddOpen(true)}
            className="absolute bottom-16 right-4 w-12 h-12 bg-indigo-600 hover:bg-slate-900 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition transform active:scale-95 z-40 hover:rotate-90 duration-300"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Bottom Simulated iOS App Navigation Bar */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-850 px-6 flex justify-around items-center z-40">
          <button 
            onClick={() => setBottomTab("home")}
            className={`flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-800 transition ${bottomTab === "home" ? "text-indigo-600 dark:text-indigo-400" : ""}`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          
          <button 
            onClick={() => setBottomTab("leads")}
            className={`flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-800 transition ${bottomTab === "leads" ? "text-indigo-600 dark:text-indigo-400" : ""}`}
          >
            <Users className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold">Leads</span>
          </button>

          <button 
            onClick={() => setBottomTab("reminders")}
            className={`flex flex-col items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-800 transition ${bottomTab === "reminders" ? "text-indigo-600 dark:text-indigo-400" : ""}`}
          >
            <CheckSquare className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold">Tasks</span>
          </button>
        </div>

        {/* iOS Quick Home Indicator Bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-[4px] bg-slate-300 dark:bg-slate-800 rounded-full z-40 select-nonepointer-events-none" />
      </div>

      {/* MOBILE POPUP LEAD SHEET DETAILS MODAL */}
      <AnimatePresence>
        {activeLeadDetailsId && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col justify-end">
            {(() => {
              const leadDetail = leads.find(l => l.id === activeLeadDetailsId);
              if (!leadDetail) return null;
              return (
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white dark:bg-slate-900 rounded-t-3xl p-4 space-y-4 max-h-[85%] overflow-y-auto"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{leadDetail.businessName}</h4>
                      <p className="text-[10px] text-slate-400">Contact: {leadDetail.name}</p>
                    </div>
                    <button 
                      onClick={() => setActiveLeadDetailsId(null)}
                      className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Proposed Budget</div>
                        <div className="text-sm font-black text-slate-900 dark:text-slate-100">₹{leadDetail.budget.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/40 p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Acquisition Web</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{leadDetail.leadSource}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-indigo-500 font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 animate-pulse" /> SMM Pitch Suggestion:
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic">
                        "{leadDetail.pitchIdea || 'Schedule an audit Zoom calling to formulate a Meta Reels pitch.'}"
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Interaction Audit Notes</p>
                      <div className="max-h-24 overflow-y-auto space-y-1.5 border-l border-slate-200 dark:border-slate-800 pl-3">
                        {leadDetail.notes.map(n => (
                          <div key={n.id} className="text-[10px] leading-relaxed">
                            <span className="text-indigo-500 font-extrabold">{n.author}:</span> {n.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => setActiveLeadDetailsId(null)}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold text-center text-xs dark:bg-slate-800 cursor-pointer"
                    >
                      Dismiss Sheet
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE POPUP LEAD CREATE SHEET */}
      <AnimatePresence>
        {isMobileAddOpen && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex flex-col justify-end">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white dark:bg-slate-900 rounded-t-3xl p-4.5 space-y-3.5 max-h-[85%] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Log New Lead In Hand</h4>
                <button 
                  onClick={() => setIsMobileAddOpen(false)}
                  className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Company / Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Aura Skincare"
                    value={newMobileBusiness}
                    onChange={(e) => setNewMobileBusiness(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contact Name</label>
                    <input 
                      type="text" 
                      placeholder="Vikram Sen"
                      value={newMobileName}
                      onChange={(e) => setNewMobileName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Market Segment</label>
                    <select 
                      value={newMobileBusinessType} 
                      onChange={(e) => setNewMobileBusinessType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl p-2 text-xs outline-none"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__ADD_NEW__" className="text-indigo-600 font-bold">+ Custom Category...</option>
                    </select>

                    {newMobileBusinessType === "__ADD_NEW__" && (
                      <div className="mt-1.5 p-1.5 bg-indigo-50/10 dark:bg-indigo-950/10 border border-indigo-100/10 rounded-lg">
                        <div className="flex gap-1.5">
                          <input 
                            type="text" 
                            placeholder="e.g., Hospital, Salon"
                            value={customCategoryInput}
                            onChange={(e) => setCustomCategoryInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px] outline-none text-slate-850 dark:text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const trimmed = customCategoryInput.trim();
                              if (trimmed) {
                                if (!availableCategories.includes(trimmed)) {
                                  const updated = [...availableCategories, trimmed];
                                  setAvailableCategories(updated);
                                  localStorage.setItem("crm_categories_list_v1", JSON.stringify(updated));
                                }
                                setNewMobileBusinessType(trimmed);
                                setCustomCategoryInput("");
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Contact WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="+91 9876543210"
                      value={newMobilePhone}
                      onChange={(e) => setNewMobilePhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Meta Ads Budget (₹)</label>
                    <input 
                      type="number" 
                      value={newMobileBudget}
                      onChange={(e) => setNewMobileBudget(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-600 font-mono font-bold text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => setIsMobileAddOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-350 rounded-xl font-bold text-center text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleMobileAddSubmit}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-bold text-center text-xs transition cursor-pointer"
                >
                  Submit & Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
