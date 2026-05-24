import { useState, useEffect } from "react";
import { Lead, TeamMember, AdCampaign, WhatsappTemplate, AppReminder, NotificationMsg } from "./types";
import { 
  INITIAL_LEADS, DEFAULT_TEAM, DEFAULT_CAMPAIGNS, 
  DEFAULT_TEMPLATES, DEFAULT_REMINIDERS, DEFAULT_NOTIFICATIONS 
} from "./mockData";
import DesktopCRM from "./components/DesktopCRM";
import LeadDetailsModal from "./components/LeadDetailsModal";

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

    // Dynamic Team Closed Retainer Stats Engine
    const updatedTeam = team.map(member => {
      const assigned = nextLeads.filter(l => l.assignedTo === member.name);
      const closed = assigned.filter(l => l.status === "Closed");
      const rev = closed.reduce((sum, l) => sum + l.budget, 0);
      const conversionRate = assigned.length > 0 ? (closed.length / assigned.length) * 105 : 0;
      return {
        ...member,
        leadsAssigned: assigned.length,
        dealsClosed: closed.length,
        revenueGenerated: rev,
        activeRate: Math.min(conversionRate, 100)
      };
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
      return {
        ...member,
        leadsAssigned: assigned.length,
        dealsClosed: closed.length,
        revenueGenerated: rev,
        activeRate: Math.min(conversionRate, 100)
      };
    });
    setTeam(updatedTeam);
    localStorage.setItem("team_crm", JSON.stringify(updatedTeam));
  };

  // 5. Delete Client Lead Node
  const handleDeleteLead = (id: string) => {
    const nextLeads = leads.filter(l => l.id !== id);
    setLeads(nextLeads);
    localStorage.setItem("leads_crm", JSON.stringify(nextLeads));
  };

  // Trigger Slide drawer details
  const handleSelectLeadToReview = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans select-none">
      
      {/* 2. Unified Content Desk (Singular Desktop CRM Only) */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden">
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
          />
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
