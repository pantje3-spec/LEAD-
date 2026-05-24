export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "No Reply"
  | "Replied"
  | "Interested"
  | "Meeting Scheduled"
  | "Follow-up"
  | "Closed"
  | "Not Interested";

export interface Note {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

export interface Activity {
  id: string;
  type: "status_change" | "whatsapp" | "call" | "note_added" | "assigned" | "system";
  description: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  businessType: string;
  leadSource: "Meta Ads" | "Google Search" | "Instagram DM" | "TikTok Ad" | "Referral";
  budget: number; // monthly spending power in INR
  status: LeadStatus;
  assignedTo: string; // Team Member name
  dateAdded: string; // ISO date string or formatted date
  followUpDate?: string; // Formatted date string (YYYY-MM-DD)
  notes: Note[];
  activities: Activity[];
  
  // AI Metrics (Populated by server-side Gemini in real-time or fallbacks)
  aiScore?: number; // 0 to 100
  aiPriority?: "High" | "Medium" | "Low";
  pitchIdea?: string;
  suggestedPlatform?: string;
  followUpTip?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "Admin" | "Sales Executive" | "Ad Campaign Manager" | "Content Strategist";
  avatarColor: string; // CSS color string or class
  leadsAssigned: number;
  dealsClosed: number;
  revenueGenerated: number; // INR
  activeRate: number; // conversion rate %
  staffId?: string; // Auto-generated or custom staff ID label
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: "Meta Ads" | "Google Ads" | "Instagram DM" | "TikTok Ads";
  status: "Active" | "Paused";
  spend: number; // INR spend
  leads: number; // leads generated
  cpl: number; // Cost per lead INR
  ctr: number; // Click Through Rate %
  conversions: number; // Closed clients from this campaign
  revenue: number; // INR earned
}

export interface WhatsappTemplate {
  id: string;
  name: string;
  triggerStatus: LeadStatus | "Custom";
  message: string;
}

export interface AppReminder {
  id: string;
  leadId: string;
  leadName: string;
  businessName: string;
  type: "followup" | "meeting" | "no_reply_warning" | "callback";
  date: string;
  time: string;
  text: string;
  completed: boolean;
}

export interface NotificationMsg {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export const STATUS_LOOKUP: Record<LeadStatus, { color: string; bg: string; border: string; desc: string }> = {
  "New Lead": {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-900",
    desc: "Newly imported from ad platform"
  },
  "Contacted": {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-900",
    desc: "Initial call or email complete"
  },
  "No Reply": {
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-950/40",
    border: "border-zinc-200 dark:border-zinc-800",
    desc: "Awaiting outreach response"
  },
  "Replied": {
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-900",
    desc: "Prospect responded to team outreach"
  },
  "Interested": {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-900",
    desc: "Warm prospect, ready to buy"
  },
  "Meeting Scheduled": {
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-200 dark:border-cyan-900",
    desc: "Live strategy audit demo scheduled"
  },
  "Follow-up": {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-900",
    desc: "Scheduled check-in due soon"
  },
  "Closed": {
    color: "text-rose-600 dark:text-pink-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-900",
    desc: "Client signed, onboarding complete"
  },
  "Not Interested": {
    color: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-900/60",
    border: "border-slate-200 dark:border-slate-800",
    desc: "Not a fit at this time"
  }
};

export interface RecurringTask {
  id: string;
  memberName: string;
  title: string;
  notes?: string;
  frequency: "Daily" | "Mon-Fri" | "Weekends";
  lastCompletedDate?: string; // YYYY-MM-DD
}
