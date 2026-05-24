import { Lead, TeamMember, AdCampaign, WhatsappTemplate, AppReminder, NotificationMsg } from "./types";

export const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "team_1",
    name: "Abhiraj Gupta",
    role: "Admin",
    avatarColor: "bg-indigo-600 text-white",
    leadsAssigned: 12,
    dealsClosed: 8,
    revenueGenerated: 240000,
    activeRate: 66.6
  },
  {
    id: "team_2",
    name: "Sanya Roy",
    role: "Sales Executive",
    avatarColor: "bg-purple-600 text-white",
    leadsAssigned: 18,
    dealsClosed: 5,
    revenueGenerated: 150000,
    activeRate: 27.7
  },
  {
    id: "team_3",
    name: "Karan Johar",
    role: "Ad Campaign Manager",
    avatarColor: "bg-emerald-600 text-white",
    leadsAssigned: 6,
    dealsClosed: 3,
    revenueGenerated: 90000,
    activeRate: 50.0
  },
  {
    id: "team_4",
    name: "Meera Patel",
    role: "Content Strategist",
    avatarColor: "bg-amber-600 text-white",
    leadsAssigned: 8,
    dealsClosed: 4,
    revenueGenerated: 120000,
    activeRate: 50.0
  }
];

export const DEFAULT_CAMPAIGNS: AdCampaign[] = [
  {
    id: "camp_1",
    name: "Meta Lead Gen - High Budget Ecom",
    platform: "Meta Ads",
    status: "Active",
    spend: 42000,
    leads: 84,
    cpl: 500,
    ctr: 2.8,
    conversions: 8,
    revenue: 240000
  },
  {
    id: "camp_2",
    name: "Dental & Local Medical Clinic Reels",
    platform: "Meta Ads",
    status: "Active",
    spend: 18000,
    leads: 45,
    cpl: 400,
    ctr: 3.2,
    conversions: 4,
    revenue: 120000
  },
  {
    id: "camp_3",
    name: "SaaS Cold Custom Outreaches",
    platform: "Instagram DM",
    status: "Active",
    spend: 5000,
    leads: 20,
    cpl: 250,
    ctr: 4.8,
    conversions: 2,
    revenue: 80000
  },
  {
    id: "camp_4",
    name: "Local Gym Lead Funnel campaign",
    platform: "TikTok Ads",
    status: "Paused",
    spend: 15000,
    leads: 30,
    cpl: 500,
    ctr: 1.9,
    conversions: 1,
    revenue: 30000
  }
];

export const DEFAULT_TEMPLATES: WhatsappTemplate[] = [
  {
    id: "tpl_1",
    name: "Quick Intro Greeting",
    triggerStatus: "New Lead",
    message: "Hi {{name}}! 👋 I saw your SMM inquiry for {{businessName}}. I’ve put together a 5-step social scale audit specific to your niche, including competitor ad designs. Can we chat tomorrow for 10 minutes?"
  },
  {
    id: "tpl_2",
    name: "Interested Niche Proposition",
    triggerStatus: "Interested",
    message: "Hello {{name}}! Great speaking earlier. SMM Agency is excited to work with {{businessName}}. Based on your monthly budget, we propose running a Meta Reels Campaign to get 40+ leads. Let's schedule our setup call: {{onboarding_link}}."
  },
  {
    id: "tpl_3",
    name: "No Response / Follow-up 1",
    triggerStatus: "No Reply",
    message: "Hi {{name}}, just checking back regarding our marketing audit for {{businessName}}. Social platforms are dropping organic reach this week, making paid ad triggers critical. Do you have time for a brief call Thursday?"
  },
  {
    id: "tpl_4",
    name: "Meeting Scheduled Confirmation",
    triggerStatus: "Meeting Scheduled",
    message: "Confirming our live SMM Audit strategy Zoom tomorrow at 11:30 AM, {{name}}! I have Karan and Meera on our team joining to show exactly how we plan to double your leads. Looking forward to it!"
  },
  {
    id: "tpl_5",
    name: "Follow-up After Demo",
    triggerStatus: "Follow-up",
    message: "Hey {{name}}, thanks again for the call! Following up regarding the proposed social ad dashboard setup of ₹{{budget}}. Let me know if you would like me to trigger the onboarding contract."
  },
  {
    id: "tpl_6",
    name: "Not Interested Closing",
    triggerStatus: "Not Interested",
    message: "No worries at all, {{name}}! Completely understand. If you ever need high-impact ad campaigns or content strategy in the future, don't hesitate to write. Keep crushing!"
  }
];

export const DEFAULT_REMINIDERS: AppReminder[] = [];

export const DEFAULT_NOTIFICATIONS: NotificationMsg[] = [];

export const INITIAL_LEADS: Lead[] = [];
