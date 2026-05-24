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

export const DEFAULT_REMINIDERS: AppReminder[] = [
  {
    id: "rem_1",
    leadId: "lead_2",
    leadName: "Dr. Ananya Sharma",
    businessName: "Radiant Dental",
    type: "meeting",
    date: "2026-05-25",
    time: "11:30 AM",
    text: "Live audit strategy Zoom presentation",
    completed: false
  },
  {
    id: "rem_2",
    leadId: "lead_3",
    leadName: "Rahul Kapoor",
    businessName: "Urban Fitness",
    type: "followup",
    date: "2026-05-24",
    time: "4:00 PM",
    text: "Follow up on budget estimate sent yesterday",
    completed: false
  },
  {
    id: "rem_3",
    leadId: "lead_5",
    leadName: "Karan Johar (CEO)",
    businessName: "Luxe Couture",
    type: "callback",
    date: "2026-05-26",
    time: "2:00 PM",
    text: "Wants call after checking team proposal",
    completed: false
  },
  {
    id: "rem_4",
    leadId: "lead_1",
    leadName: "Rohan Malhotra",
    businessName: "Glitz Jewelers",
    type: "no_reply_warning",
    date: "2026-05-24",
    time: "10:00 AM",
    text: "No reply for 2 days. Send secondary Instagram follow-up.",
    completed: true
  }
];

export const DEFAULT_NOTIFICATIONS: NotificationMsg[] = [
  {
    id: "ntf_1",
    title: "New Lead Received 🔥",
    description: "Vikram Sen - Aura Skincare submitted an inquiry via Meta Lead Gen.",
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: "ntf_2",
    title: "Follow-up Due Soon ⏰",
    description: "Urban Fitness budget call scheduled with Rahul at 4:00 PM today.",
    timestamp: "1 hour ago",
    read: false
  },
  {
    id: "ntf_3",
    title: "Lead Closed 🎉",
    description: "Meera Patel successfully closed Luxe Couture for ₹60,000 /mo!",
    timestamp: "3 hours ago",
    read: true
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead_1",
    name: "Vikram Sen",
    phone: "+91 9876543210",
    email: "vikram@auraskincare.com",
    businessName: "Aura Skincare",
    businessType: "Ecommerce Brand",
    leadSource: "Meta Ads",
    budget: 45000,
    status: "New Lead",
    assignedTo: "Abhiraj Gupta",
    dateAdded: "2026-05-24T06:30:00Z",
    notes: [
      {
        id: "n_1_1",
        text: "Lead generated via Reels Lead Ad Campaign. Interested in getting local influencer partnerships and Meta catalog conversion ads.",
        timestamp: "2026-05-24T06:35:00Z",
        author: "System"
      }
    ],
    activities: [
      {
        id: "a_1_1",
        type: "system",
        description: "Lead automatically captured from Facebook Ad Campaign: 'Meta Lead Gen - High Budget Ecom'",
        timestamp: "2026-05-24T06:30:00Z"
      }
    ],
    aiScore: 82,
    aiPriority: "High",
    pitchIdea: "Trigger user-generated unboxing reels combined with a dynamic lookalike ad budget on Instagram.",
    suggestedPlatform: "Meta Ads (Instagram Display)",
    followUpTip: "Send a sample influencer marketing outline to show branding expertise immediately."
  },
  {
    id: "lead_2",
    name: "Dr. Ananya Sharma",
    phone: "+91 9988776655",
    email: "sharma.ananya@gmail.com",
    businessName: "Radiant Dental",
    businessType: "Dental Clinic",
    leadSource: "Google Search",
    budget: 30000,
    status: "Meeting Scheduled",
    assignedTo: "Sanya Roy",
    dateAdded: "2026-05-22T04:15:00Z",
    followUpDate: "2026-05-25",
    notes: [
      {
        id: "n_2_1",
        text: "Dr. Sharma wants to run local Google Maps optimization + local Instagram Reels targeting local families looking for root canal & brace cosmetic updates.",
        timestamp: "2026-05-22T05:00:00Z",
        author: "Sanya Roy"
      },
      {
        id: "n_2_2",
        text: "Confirmed zoom strategy presentation tomorrow at 11:30 AM. Standard dental setup pitch deck ready.",
        timestamp: "2026-05-24T01:10:00Z",
        author: "Sanya Roy"
      }
    ],
    activities: [
      {
        id: "a_2_1",
        type: "system",
        description: "Lead created via Google Search organic landing form",
        timestamp: "2026-05-22T04:15:00Z"
      },
      {
        id: "a_2_2",
        type: "status_change",
        description: "Status updated from 'New Lead' to 'Contacted'",
        timestamp: "2026-05-22T04:45:00Z"
      },
      {
        id: "a_2_3",
        type: "status_change",
        description: "Status changed to 'Meeting Scheduled' by Sanya Roy",
        timestamp: "2026-05-23T10:00:00Z"
      }
    ],
    aiScore: 90,
    aiPriority: "High",
    pitchIdea: "Run a localized 'First Visit - ₹499 Dental Clean' Meta Ad Campaign to build immediate lead lists of patients.",
    suggestedPlatform: "Meta Ads (Local Targeting)",
    followUpTip: "Offer their team a sample CRM automated booking follow-up sequence setup on the Zoom audit."
  },
  {
    id: "lead_3",
    name: "Rahul Kapoor",
    phone: "+91 9112233445",
    email: "contact@urbanfitness.in",
    businessName: "Urban Fitness",
    businessType: "Fitness Studio",
    leadSource: "Instagram DM",
    budget: 20000,
    status: "Follow-up",
    assignedTo: "Karan Johar",
    dateAdded: "2026-05-20T10:00:00Z",
    followUpDate: "2026-05-24",
    notes: [
      {
        id: "n_3_1",
        text: "Wants to boost gym member signups. Monthly target: 50 new members. Feels ₹20k budget could be thin but wants to trial.",
        timestamp: "2026-05-20T11:00:00Z",
        author: "Karan Johar"
      }
    ],
    activities: [
      {
        id: "a_3_1",
        type: "whatsapp",
        description: "Initial client proposal sent via WhatsApp template",
        timestamp: "2026-05-20T10:30:00Z"
      },
      {
        id: "a_3_2",
        type: "status_change",
        description: "Status changed to 'Follow-up' after client missed call yesterday",
        timestamp: "2026-05-23T14:30:00Z"
      }
    ],
    aiScore: 65,
    aiPriority: "Medium",
    pitchIdea: "Design a launch promotion 'Free 3-Day All-Access Pass' using lead capture forms integrated directly inside Instagram stories.",
    suggestedPlatform: "Instagram Ads",
    followUpTip: "Call at 4 PM to present visual mockups of high-impact fitness challenges and client progress templates."
  },
  {
    id: "lead_4",
    name: "Dr. Kabir Roy",
    phone: "+91 9555666777",
    email: "kabir@royortho.com",
    businessName: "Roy Orthodontics",
    businessType: "Dental Clinic",
    leadSource: "Referral",
    budget: 35000,
    status: "Replied",
    assignedTo: "Sanya Roy",
    dateAdded: "2026-05-21T08:00:00Z",
    notes: [
      {
        id: "n_4_1",
        text: "Referred by Dr. Sharma. Needs premium reels shooting + ad placements for smile makeovers.",
        timestamp: "2026-05-21T08:15:00Z",
        author: "Sanya Roy"
      }
    ],
    activities: [
      {
        id: "a_4_1",
        type: "system",
        description: "Lead manually entered under Referral source",
        timestamp: "2026-05-21T08:00:00Z"
      },
      {
        id: "a_4_2",
        type: "status_change",
        description: "Status changed to Replied by Sanya Roy after client emailed back",
        timestamp: "2026-05-23T09:12:00Z"
      }
    ],
    aiScore: 85,
    aiPriority: "High",
    pitchIdea: "Showcase video transformation comparisons utilizing high-contrast Instagram grids with professional surgeon profiles.",
    suggestedPlatform: "Instagram & Local SEO",
    followUpTip: "Send standard dentist proposal deck with 3 sample reels storyboards."
  },
  {
    id: "lead_5",
    name: "Karan Johar (CEO)",
    phone: "+91 9777888999",
    email: "growth@luxecouture.in",
    businessName: "Luxe Couture",
    businessType: "Luxury Fashion",
    leadSource: "Meta Ads",
    budget: 60000,
    status: "Closed",
    assignedTo: "Meera Patel",
    dateAdded: "2026-05-19T02:00:00Z",
    notes: [
      {
        id: "n_5_1",
        text: "Highly qualified lead. Signed SLA for ₹60,000 / month onboarding retainer today. Creative briefing underway.",
        timestamp: "2026-05-24T04:00:00Z",
        author: "Meera Patel"
      }
    ],
    activities: [
      {
        id: "a_5_1",
        type: "status_change",
        description: "Lead status finalized as CLOSED (Won) by Meera Patel",
        timestamp: "2026-05-24T04:00:00Z"
      }
    ],
    aiScore: 100,
    aiPriority: "High",
    pitchIdea: "Set up Facebook Pixel Advantage catalog models, running continuous seasonal carousel looks targeting luxury interest hubs.",
    suggestedPlatform: "Meta Ads & Pinterest",
    followUpTip: "Conduct creative brief kickoff and handoff to the design squad next Monday."
  },
  {
    id: "lead_6",
    name: "Pooja Malhotra",
    phone: "+91 9222333444",
    email: "pooja@bakeandshake.in",
    businessName: "Bake & Shake",
    businessType: "Bakery / Cafe",
    leadSource: "Instagram DM",
    budget: 15000,
    status: "No Reply",
    assignedTo: "Karan Johar",
    dateAdded: "2026-05-22T11:00:00Z",
    notes: [
      {
        id: "n_6_1",
        text: "Sent standard cafe template containing pricing. No response on phone or DM yet.",
        timestamp: "2026-05-23T05:00:00Z",
        author: "Karan Johar"
      }
    ],
    activities: [
      {
        id: "a_6_1",
        type: "status_change",
        description: "Status automatically moved to No Reply after 24 hrs silence",
        timestamp: "2026-05-23T11:30:00Z"
      }
    ],
    aiScore: 40,
    aiPriority: "Low",
    pitchIdea: "Create localized viral bakery hacks, aesthetic workspace highlights, and a 'Free Cupcake with any coffee' local Facebook voucher strategy.",
    suggestedPlatform: "Instagram Ads + Google Maps",
    followUpTip: "Send a quick casual follow-up message with zero pressure on WhatsApp to prompt check-in."
  },
  {
    id: "lead_7",
    name: "Rohit Bansal",
    phone: "+91 9333444555",
    email: "rohit@proppulse.com",
    businessName: "PropPulse Real Estate",
    businessType: "Real Estate Broker",
    leadSource: "TikTok Ad",
    budget: 50000,
    status: "Interested",
    assignedTo: "Karan Johar",
    dateAdded: "2026-05-23T14:40:00Z",
    notes: [
      {
        id: "n_7_1",
        text: "Real estate builder wants luxury housing project lead acquisition setup. Budget is competitive, demands high qualification filters on leads.",
        timestamp: "2026-05-23T15:00:00Z",
        author: "Karan Johar"
      }
    ],
    activities: [
      {
        id: "a_7_1",
        type: "system",
        description: "Lead captured from active SMM TikTok Builder form",
        timestamp: "2026-05-23T14:40:00Z"
      }
    ],
    aiScore: 78,
    aiPriority: "High",
    pitchIdea: "Utilize WhatsApp qualification chat widgets powered by Meta Lead Ads so prospects pre-qualify their exact purchase budget.",
    suggestedPlatform: "Meta Lead Gen & WhatsApp",
    followUpTip: "Present sample luxury WhatsApp pre-qualification chatbot outlines next call."
  },
  {
    id: "lead_8",
    name: "Tanmay Bhat",
    phone: "+91 9444555666",
    email: "ceo@cryptobase.io",
    businessName: "CryptoBase Platform",
    businessType: "SaaS Startup",
    leadSource: "Referral",
    budget: 90000,
    status: "Not Interested",
    assignedTo: "Abhiraj Gupta",
    dateAdded: "2026-05-20T03:00:00Z",
    notes: [
      {
        id: "n_8_1",
        text: "Checked in on growth consultation, but their internal board decided to keep scaling through organic YouTube community channels. SLA paused.",
        timestamp: "2026-05-21T02:00:00Z",
        author: "Abhiraj Gupta"
      }
    ],
    activities: [
      {
        id: "a_8_1",
        type: "status_change",
        description: "Moved to 'Not Interested' by Abhiraj Gupta after consulting call",
        timestamp: "2026-05-21T02:00:00Z"
      }
    ],
    aiScore: 10,
    aiPriority: "Low",
    pitchIdea: "Build crypto tutorials on Twitter spaces and coordinate viral meme assets on Reddit instead of heavy direct Facebook lead ads.",
    suggestedPlatform: "X (Twitter) & Reddit community",
    followUpTip: "Keep them on our newsletter lists to display periodic Shopify or digital scaling case studies."
  }
];
