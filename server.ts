import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Health API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SMM LeadFlow CRM backend is running" });
});

// 2. AI Lead Analyzer (Priority, Score, Suggested SMM Pitch)
app.post("/api/ai/analyze-lead", async (req: any, res: any) => {
  try {
    const { id, name, businessName, businessType, leadSource, budget, budgetUnit = "₹" } = req.body;
    
    if (!businessName || !businessType) {
      return res.status(400).json({ error: "Missing required fields (businessName, businessType)" });
    }

    let resultText = "";
    try {
      const ai = getGeminiClient();
      const prompt = `Analyze this social media marketing lead for our SMM Agency:
Client Business Name: ${businessName}
Business Industry/Category: ${businessType}
Lead Acquisition Source: ${leadSource}
Monthly Budget: ${budgetUnit}${budget}
Contact Person: ${name}

Provide a structured, executive scoring assessment in JSON format. Do not write any markdown blocks besides the pure JSON structure.

Required keys in JSON:
{
  "aiScore": <number between 10 and 100 representing closed deal probability>,
  "aiPriority": <string: either "High", "Medium", or "Low">,
  "pitchIdea": <string: 1-2 sentence hyper-tailored marketing tactic suggestion for their specific business category e.g., run a reels campaign for dental cosmetic or catalog ads for clothing ecom>,
  "suggestedPlatform": <string: e.g., "Meta Ads (Instagram & Facebook)", "TikTok Ads", "Google Maps local citations", "Google Ads">,
  "followUpTip": <string: a specific tactical follow-up instruction for the sales team>
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiScore: { type: Type.INTEGER, description: "Lead score 10-100" },
              aiPriority: { type: Type.STRING, description: "High, Medium, or Low" },
              pitchIdea: { type: Type.STRING, description: "Specific marketing strategy idea" },
              suggestedPlatform: { type: Type.STRING, description: "Best ad channels for this client" },
              followUpTip: { type: Type.STRING, description: "Actionable tips for outreach" }
            },
            required: ["aiScore", "aiPriority", "pitchIdea", "suggestedPlatform", "followUpTip"]
          }
        }
      });

      resultText = response.text || "{}";
      const cleanJSON = JSON.parse(resultText.trim());
      return res.json(cleanJSON);

    } catch (apiError: any) {
      console.warn("Fallback to local heuristic scoring - Gemini key absent/invalid:", apiError.message);
      
      // Fallback response if Gemini isn't set up
      let score = 50;
      let priority: "High" | "Medium" | "Low" = "Medium";
      let pitch = `Provide high-converting organic video short reels and localized performance ads.`;
      let platform = "Instagram & Facebook Ads";
      let tip = "Schedule an introductory audit call and demonstrate competitor gaps.";

      const lowerType = businessType.toLowerCase();
      const numBudget = Number(budget) || 0;

      if (numBudget >= 40000 || lowerType.includes("ecom") || lowerType.includes("saas")) {
        score = 85;
        priority = "High";
        pitch = `Implement dynamic catalogs, cold retargeting webs, and post-purchase social proof campaigns.`;
      } else if (lowerType.includes("dental") || lowerType.includes("medical") || lowerType.includes("doctor")) {
        score = 80;
        priority = "High";
        pitch = `Target local micro-radius area around client practice with testimonial reels and a 'Book Free consultation' lead funnel.`;
        platform = "Meta Ads & Local GMB";
      } else if (numBudget < 15000) {
        score = 45;
        priority = "Low";
        pitch = `Focus on optimizing organic content layout and high-reach viral reels before launching heavy ads.`;
      }

      return res.json({
        aiScore: score,
        aiPriority: priority,
        pitchIdea: pitch,
        suggestedPlatform: platform,
        followUpTip: tip,
        isFallback: true
      });
    }

  } catch (error: any) {
    console.error("AI Analyze Lead Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. AI Smart Message Generator
app.post("/api/ai/generate-whatsapp", async (req: any, res: any) => {
  try {
    const { name, businessName, businessType, status, campaignType = "SMM Intro" } = req.body;
    
    if (!name || !businessName) {
      return res.status(400).json({ error: "Missing client information" });
    }

    try {
      const ai = getGeminiClient();
      const prompt = `Write a professional, non-spammy personal WhatsApp pitch or reply for a prospect to build SMM rapport.
Client Name: ${name}
Business Name: ${businessName}
Business Focus: ${businessType}
Lead Segment/Trigger: ${status}
Outreach Purpose: ${campaignType}

Instructions:
- Keep it polite, conversational, and direct.
- Do not use more than 2 short emojis.
- Highlight our expertise in social media marketing ads and content.
- Include a logical placeholder for scheduling/booking.
- Speak professionally in English.
- Return ONLY the generated WhatsApp message text, no extra conversational introduction from you.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.json({ message: response.text?.trim() });

    } catch (apiError: any) {
      console.warn("Fallback WhatsApp generator:", apiError.message);
      
      // Heuristic fallback text
      const fallbackMsg = `Hello ${name}, this is Abhiraj from LeadFlow SMM agency. I saw your inquiry for ${businessName}. We specialize in scaling ${businessType || 'local services'} using high-performing social media ads on Meta and TikTok. 

I've reviewed your brand and have 3 tailored video ideas to scale your customer outreach this week. Do you have 5 minutes for a quick feedback call tomorrow at 3 PM? Let me know if that works!`;

      return res.json({ message: fallbackMsg, isFallback: true });
    }

  } catch (error: any) {
    console.error("AI WhatsApp Template Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 4. AI SMM Campaign Launch Planner
app.post("/api/ai/generate-campaign-plan", async (req: any, res: any) => {
  try {
    const { businessType, budget, mainGoal } = req.body;
    
    if (!businessType) {
      return res.status(400).json({ error: "Missing businessType parameter" });
    }

    const monthlyBudget = Number(budget) || 25000;

    try {
      const ai = getGeminiClient();
      const prompt = `Formulate an elite Social Media Marketing (SMM) advertising and content roadmap for:
Client Business Category: ${businessType}
Monthly Inward SMM Ad Budget: ₹${monthlyBudget.toLocaleString("en-IN")}
Primary Campaign Objective: ${mainGoal || "Lead Generation & Direct Acquisition"}

We are an elite conversion-oriented SMM agency. Return a premium structured roadmap in JSON form.
Do not write any markdown blocks besides the pure JSON structure.

Required keys in JSON:
{
  "campaignName": <string: an appealing, catchy project launch campaign name e.g. "SmileBurst Local Meta Funnel">,
  "adPlatform": <string: best recommended primary platform, e.g. "Instagram Page Promotion & Meta Lookalikes">,
  "estimatedLeads": <number: estimated monthly leads expected based on typical conversion costs matching the budget>,
  "targetCpl": <number: estimated Cost Per Lead (CPL) in INR matching standard industry metrics for the niche>,
  "audienceSetup": <string: detailed custom targeting variables, demographics, or interest sets to configure inside the ad manager>,
  "strategicAdCreativeHook": <string: a highly compelling 1-line script trigger hook for interactive video reels or static graphic ads>,
  "campaignRoadmap": <array of strings: 4 chronological action steps describing exactly how the agency will draft creatives, configure retargeting, build landing assets, and run onboarding audits>
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              campaignName: { type: Type.STRING },
              adPlatform: { type: Type.STRING },
              estimatedLeads: { type: Type.INTEGER },
              targetCpl: { type: Type.INTEGER },
              audienceSetup: { type: Type.STRING },
              strategicAdCreativeHook: { type: Type.STRING },
              campaignRoadmap: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["campaignName", "adPlatform", "estimatedLeads", "targetCpl", "audienceSetup", "strategicAdCreativeHook", "campaignRoadmap"]
          }
        }
      });

      const cleanJSON = JSON.parse(response.text?.trim() || "{}");
      return res.json(cleanJSON);

    } catch (apiError: any) {
      console.warn("Fallback campaign plan - Gemini key absent/invalid:", apiError.message);
      
      // Smart Heuristic Fallback
      let campaignName = "Local Resonance Meta Funnel";
      let adPlatform = "Meta Ads (Instagram & Facebook)";
      let targetCpl = 180;
      let audienceSetup = "Lookalikes of profile visitors, local address radius (12km), high-intent demographics.";
      let creativeHook = "Stop scrolling! Here is exactly why 90% of local customers choose us over competitors.";
      let roadmap = [
        "Audit existing reels and configure dynamic pixel event tracking metrics.",
        "Launch A/B variations targeting key local audience brackets with customer testimonial hooks.",
        "Deploy conversational lead forms with instant automated WhatsApp follow-ups.",
        "Continuous optimization of CPL through daily budget reallocations and creative bidding modifications."
      ];

      const lowerType = businessType.toLowerCase();
      if (lowerType.includes("dental") || lowerType.includes("clinic") || lowerType.includes("doctor")) {
        campaignName = "BrightSmile Cosmetic Inflow";
        adPlatform = "Meta Testimonial Reels & Local Geofencing";
        targetCpl = 250;
        audienceSetup = "Local radius (15km) around office location, ages 24-55, interest in wellness & self-care.";
        creativeHook = "Afraid of smiling in pictures? Get a flawless dental transformation consult starting next week.";
        roadmap = [
          "Record high-resolution dentist introduction and video reviews of positive transformations.",
          "Set up local micro-targeted campaigns offering a free detailed dental assessment diagnostic.",
          "Sync lead captures immediately with CRM automated WhatsApp follow-up schedules.",
          "Run a monthly retargeting funnel with before-and-after visual carousels."
        ];
      } else if (lowerType.includes("ecom") || lowerType.includes("retail") || lowerType.includes("clothing") || lowerType.includes("brand")) {
        campaignName = "RevenueBurst Ecom Scaler";
        adPlatform = "Instagram Reels Ads & TikTok Spark Campaigns";
        targetCpl = 95;
        audienceSetup = "Interests: online shopping, luxury goods, fashion accessories, direct lookalikes of purchasers.";
        creativeHook = "This viral retail find is selling out fast! Swipe up for a 20% discount code.";
        roadmap = [
          "Deploy dynamic catalog cataloging feeds and set up pixel purchase tracking events.",
          "Partner with 5 micro-influencer creators to produce interactive hook-based reels.",
          "Launch cold outreach campaigns paired with intensive cart abandonment retargeting loops.",
          "Optimize catalog CTR matching high-performing ad creatives."
        ];
      } else if (lowerType.includes("real estate") || lowerType.includes("home") || lowerType.includes("property")) {
        campaignName = "DreamHabitat Premium Landings";
        adPlatform = "Google Search Ads & Meta Lead Forms";
        targetCpl = 650;
        audienceSetup = "Ages 30-55, interests in property investments, mortgage facilities, premium real estate listings.";
        creativeHook = "Looking for your dream home? Tour this exclusive luxury apartment layout without leaving your sofa.";
        roadmap = [
          "Design dynamic premium virtual walkthrough video reels.",
          "Configure high-conversional Google or Meta ad pools asking for simple callback schedules.",
          "Trigger immediate sales team call routing alerts whenever a lead is captured.",
          "Automate lookaround brochures dispatched directly to verified numbers."
        ];
      }

      const estimatedLeads = Math.floor(monthlyBudget / targetCpl);

      return res.json({
        campaignName,
        adPlatform,
        estimatedLeads,
        targetCpl,
        audienceSetup,
        strategicAdCreativeHook: creativeHook,
        campaignRoadmap: roadmap,
        isFallback: true
      });
    }
  } catch (error: any) {
    console.error("AI Campaign Launch Planner Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Vite Middleware implementation for fullstack SPA support
const isProd = process.env.NODE_ENV === "production";
const distPath = path.join(process.cwd(), "dist");

async function initDevServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in Development mode");
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static files served in Production mode");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LeadFlow Agency CRM running on host http://0.0.0.0:${PORT}`);
  });
}

initDevServer();
