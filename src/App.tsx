import { useState, useEffect } from "react";
import { Lead, TeamMember, AdCampaign, WhatsappTemplate, AppReminder, NotificationMsg } from "./types";
import { 
  INITIAL_LEADS, DEFAULT_TEAM, DEFAULT_CAMPAIGNS, 
  DEFAULT_TEMPLATES, DEFAULT_REMINIDERS, DEFAULT_NOTIFICATIONS 
} from "./mockData";
import DesktopCRM from "./components/DesktopCRM";
import MobileCRM from "./components/MobileCRM";
import LeadDetailsModal from "./components/LeadDetailsModal";
import { useFirebaseSync } from "./useFirebaseSync";
import { Lock, Mail, Key, RefreshCw, ShieldCheck, HelpCircle } from "lucide-react";

export default function App() {
  // Global States loaded from LocalStorage (for real-world SaaS persistent experience)
  const [leads, setLeads] = useState<Lead[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [whatsappTemplates, setWhatsappTemplates] = useState<WhatsappTemplate[]>([]);
  const [reminders, setReminders] = useState<AppReminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationMsg[]>([]);

  // UI Selection States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Responsive layout mode
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [viewPreference, setViewPreference] = useState<"auto" | "desktop" | "mobile">("auto");

  // Gateway Form States
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Fetch window dimensions
  useEffect(() => {
    const checkSize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Firebase Live Sync Handler
  const {
    currentUser,
    isAuthLoading,
    isSyncing,
    loginWithGoogle,
    loginWithEmail,
    logoutUser,
    saveLeadToCloud,
    deleteLeadFromCloud,
    saveTeamMemberToCloud
  } = useFirebaseSync(
    leads,
    team,
    [],
    (syncedLeads) => {
      setLeads(syncedLeads);
      localStorage.setItem("leads_crm", JSON.stringify(syncedLeads));
    },
    (syncedTeam) => {
      setTeam(syncedTeam);
      localStorage.setItem("team_crm", JSON.stringify(syncedTeam));
    },
    () => {}
  );

  // 1. Initial State Hydration
  useEffect(() => {
    // Force reset old preloaded mock data to guarantee a pristine start state
    const hasBeenReset = localStorage.getItem("leads_reset_clean_slate_1");
    if (!hasBeenReset) {
      localStorage.removeItem("leads_crm");
      localStorage.removeItem("reminders_crm");
      localStorage.removeItem("notifs_crm");
      localStorage.setItem("leads_reset_clean_slate_1", "true");
    }

    const savedLeads = localStorage.getItem("leads_crm");
    const savedTemplates = localStorage.getItem("templates_crm");
    const savedTeam = localStorage.getItem("team_crm");
    const savedReminders = localStorage.getItem("reminders_crm");
    const savedNotifications = localStorage.getItem("notifs_crm");

    if (savedLeads) setLeads(JSON.parse(savedLeads));
    else {
      setLeads([]);
      localStorage.setItem("leads_crm", JSON.stringify([]));
    }

    if (savedTemplates) setWhatsappTemplates(JSON.parse(savedTemplates));
    else {
      setWhatsappTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem("templates_crm", JSON.stringify(DEFAULT_TEMPLATES));
    }

    if (savedTeam) setTeam(JSON.parse(savedTeam));
    else {
      setTeam(DEFAULT_TEAM);
      localStorage.setItem("team_crm", JSON.stringify(DEFAULT_TEAM));
    }

    if (savedReminders) setReminders(JSON.parse(savedReminders));
    else {
      setReminders([]);
      localStorage.setItem("reminders_crm", JSON.stringify([]));
    }

    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    else {
      setNotifications([]);
      localStorage.setItem("notifs_crm", JSON.stringify([]));
    }

    setCampaigns(DEFAULT_CAMPAIGNS);

    // Initial load system dark mode setting
    const root = window.document.documentElement;
    root.classList.remove("dark");
  }, []);

  // 2. Global Dark Mode Toggle Synchronizer
  const handleToggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    const root = window.document.documentElement;
    if (nextDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // 3. Sync CRM Lead State Upgrades & Real-Time Stats Recalculation
  const handleUpdateLead = (updatedLead: Lead) => {
    const nextLeads = leads.map(l => l.id === updatedLead.id ? updatedLead : l);
    setLeads(nextLeads);
    localStorage.setItem("leads_crm", JSON.stringify(nextLeads));

    // Save to Cloud if signed in
    if (currentUser) {
      saveLeadToCloud(updatedLead);
    }

    // Dynamic Team Closed Retainer Stats Engine
    const updatedTeam = team.map(member => {
      const assigned = nextLeads.filter(l => l.assignedTo === member.name);
      const closed = assigned.filter(l => l.status === "Closed");
      const rev = closed.reduce((sum, l) => sum + l.budget, 0);
      const conversionRate = assigned.length > 0 ? (closed.length / assigned.length) * 105 : 0;
      const nextMember = {
        ...member,
        leadsAssigned: assigned.length,
        dealsClosed: closed.length,
        revenueGenerated: rev,
        activeRate: Math.min(conversionRate, 100)
      };
      
      if (currentUser) {
        saveTeamMemberToCloud(nextMember);
      }
      return nextMember;
    });
    setTeam(updatedTeam);
    localStorage.setItem("team_crm", JSON.stringify(updatedTeam));

    // If currently viewing active drawer, sync panel
    if (selectedLead && selectedLead.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  // 4. Log/Add New SMM Client Inward
  const handleAddLead = (partialLead: Partial<Lead>) => {
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name: partialLead.name || "Inquired Prospect",
      phone: partialLead.phone || "+91 99999 00000",
      email: partialLead.email || "prospect@example.com",
      businessName: partialLead.businessName || "New Startup",
      businessType: partialLead.businessType || "Ecommerce Brand",
      leadSource: partialLead.leadSource || "Meta Ads",
      budget: partialLead.budget || 30000,
      status: "New Lead",
      assignedTo: partialLead.assignedTo || "Abhiraj Gupta",
      dateAdded: new Date().toISOString(),
      notes: [
        {
          id: `n_system_${Date.now()}`,
          text: `Inward lead captured from SMM Campaign (Acquisition channel: ${partialLead.leadSource}). Assignee: ${partialLead.assignedTo}.`,
          timestamp: new Date().toISOString(),
          author: "CRM System"
        }
      ],
      activities: [
        {
          id: `act_sys_${Date.now()}`,
          type: "system",
          description: `Captured lead via ${partialLead.leadSource}. Assigned to ${partialLead.assignedTo}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const nextLeads = [...leads, newLead];
    setLeads(nextLeads);
    localStorage.setItem("leads_crm", JSON.stringify(nextLeads));

    // Save to cloud if signed in
    if (currentUser) {
      saveLeadToCloud(newLead);
    }

    // Push Global Real-Time Alert Log
    const newAlert: NotificationMsg = {
      id: `ntf_${Date.now()}`,
      title: "New Ad Lead captured! 🔥",
      description: `${newLead.businessName} inquired about SMM. Budget: ₹${newLead.budget.toLocaleString("en-IN")}.`,
      timestamp: "Just now",
      read: false
    };

    const nextNotifs = [newAlert, ...notifications];
    setNotifications(nextNotifs);
    localStorage.setItem("notifs_crm", JSON.stringify(nextNotifs));

    // Instantly recalculate Team quotas
    const updatedTeam = team.map(member => {
      const assigned = nextLeads.filter(l => l.assignedTo === member.name);
      const closed = assigned.filter(l => l.status === "Closed");
      const rev = closed.reduce((sum, l) => sum + l.budget, 0);
      const conversionRate = assigned.length > 0 ? (closed.length / assigned.length) * 105 : 0;
      const nextMember = {
        ...member,
        leadsAssigned: assigned.length,
        dealsClosed: closed.length,
        revenueGenerated: rev,
        activeRate: Math.min(conversionRate, 100)
      };

      if (currentUser) {
        saveTeamMemberToCloud(nextMember);
      }
      return nextMember;
    });
    setTeam(updatedTeam);
    localStorage.setItem("team_crm", JSON.stringify(updatedTeam));
  };

  // 5. Delete Client Lead Node
  const handleDeleteLead = (id: string) => {
    const nextLeads = leads.filter(l => l.id !== id);
    setLeads(nextLeads);
    localStorage.setItem("leads_crm", JSON.stringify(nextLeads));

    if (currentUser) {
      deleteLeadFromCloud(id);
    }
  };

  // Trigger Slide drawer details
  const handleSelectLeadToReview = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const isCurrentlyMobile = viewPreference === "mobile" || (viewPreference === "auto" && isMobileScreen);

  // 1. Loading State Screen
  if (isAuthLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <span className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-indigo-400 opacity-20"></span>
            <RefreshCw className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">SMM Agency Workspace</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Checking Cloud Gatekeeper Authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Strict Access Control Gateway Lock
  if (!currentUser) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4 font-sans select-none overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">SMM Workspace Locked</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Authenticate to access leads, team analytics, and marketing pipelines.</p>
            </div>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!loginWithEmail) return;
              setIsLoggingIn(true);
              setLoginError("");
              try {
                await loginWithEmail(emailInput, passwordInput);
              } catch (err: any) {
                setLoginError(err.message || "Failed to log in.");
              } finally {
                setIsLoggingIn(false);
              }
            }}
            className="space-y-4 text-xs"
          >
            <div className="space-y-1">
              <label className="block font-black text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">Administrator Email</label>
              <div className="relative">
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-150"
                  required
                  disabled={isLoggingIn}
                  placeholder="admin@smmagency.com"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-black text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wide">Secret Passcode</label>
              <div className="relative">
                <input 
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-medium outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-slate-800 dark:text-slate-150"
                  required
                  disabled={isLoggingIn}
                  placeholder="••••••••"
                />
                <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {loginError && (
              <p className="text-rose-500 text-[11px] font-bold leading-normal bg-rose-50/50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-slate-950 dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Unlocking workstation...
                </>
              ) : (
                <>Unlocks Portal Workspace</>
              )}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">or Connect securely via</span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800/80"></div>
          </div>

          <button
            onClick={loginWithGoogle}
            disabled={isLoggingIn}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.463 0 4.114 1.025 5.057 1.926l3.245-3.13C18.42 2.152 15.603 1 12.24 1 5.914 1 1 5.914 1 12.24s4.914 11.24 11.24 11.24c6.64 0 11.057-4.664 11.057-11.24 0-.756-.08-1.334-.183-1.955H12.24z" />
            </svg>
            Sign in with Google Cloud
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans select-none">
      
      {/* View preference indicator / switcher bar on top */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-205 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-xs transition shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-extrabold text-slate-700 dark:text-slate-350 tracking-wide uppercase text-[10px]">
            SMM Agent Workspace
          </span>
          <span className="text-[10px] text-slate-400">
            ({isCurrentlyMobile ? "Mobile Mode Active" : "Desktop Mode Active"})
          </span>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewPreference("auto")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
              viewPreference === "auto"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 dark:text-slate-450 hover:text-slate-700"
            }`}
          >
            Auto Detect
          </button>
          <button
            onClick={() => setViewPreference("desktop")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
              viewPreference === "desktop"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 dark:text-slate-450 hover:text-slate-700"
            }`}
          >
            🖥️ Desktop View
          </button>
          <button
            onClick={() => setViewPreference("mobile")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
              viewPreference === "mobile"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 dark:text-slate-450 hover:text-slate-700"
            }`}
          >
            📱 Mobile App
          </button>
        </div>
      </div>

      {/* 2. Unified Content Desk */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
          {isCurrentlyMobile ? (
            <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 overflow-y-auto">
              <MobileCRM 
                leads={leads}
                team={team}
                reminders={reminders}
                onUpdateLead={handleUpdateLead}
                onAddLead={handleAddLead}
                whatsappTemplates={whatsappTemplates}
                currentUser={currentUser}
                isAuthLoading={isAuthLoading}
                isSyncing={isSyncing}
                loginWithGoogle={loginWithGoogle}
                loginWithEmail={loginWithEmail}
                logoutUser={logoutUser}
                isFullscreen={!isMobileScreen} // Device bezel render check
              />
            </div>
          ) : (
            <DesktopCRM 
              leads={leads}
              team={team}
              campaigns={campaigns}
              whatsappTemplates={whatsappTemplates}
              reminders={reminders}
              notifications={notifications}
              onUpdateLead={handleUpdateLead}
              onAddLead={handleAddLead}
              onDeleteLead={handleDeleteLead}
              onSelectLead={handleSelectLeadToReview}
              onUpdateTemplates={(updated) => {
                setWhatsappTemplates(updated);
                localStorage.setItem("templates_crm", JSON.stringify(updated));
              }}
              onUpdateTeam={(updated) => {
                setTeam(updated);
                localStorage.setItem("team_crm", JSON.stringify(updated));
              }}
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              currentUser={currentUser}
              isAuthLoading={isAuthLoading}
              isSyncing={isSyncing}
              loginWithGoogle={loginWithGoogle}
              loginWithEmail={loginWithEmail}
              logoutUser={logoutUser}
            />
          )}
        </div>
      </div>

      {/* 3. Global Slide Drawer reviewing CRM details */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedLead(null);
          }}
          team={team}
          whatsappTemplates={whatsappTemplates}
          onUpdateLead={handleUpdateLead}
        />
      )}

    </div>
  );
}
