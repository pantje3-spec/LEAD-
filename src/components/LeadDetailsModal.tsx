import React, { useState, useEffect } from "react";
import { Lead, LeadStatus, Note, Activity, STATUS_LOOKUP, TeamMember, WhatsappTemplate } from "../types";
import { 
  X, Phone, Mail, DollarSign, Calendar, User, Tag, 
  Send, Sparkles, MessageSquare, Clock, Plus, RefreshCw, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LeadDetailsProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  team: TeamMember[];
  whatsappTemplates: WhatsappTemplate[];
  onUpdateLead: (updated: Lead) => void;
}

export default function LeadDetailsModal({ 
  lead, 
  isOpen, 
  onClose, 
  team, 
  whatsappTemplates,
  onUpdateLead 
}: LeadDetailsProps) {

  const [activeTab, setActiveTab] = useState<"details" | "notes" | "whatsapp" | "ai">("details");
  const [newNoteText, setNewNoteText] = useState("");
  const [customProposedBudget, setCustomProposedBudget] = useState(lead.budget);
  const [editingWhatsAppMessage, setEditingWhatsAppMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [whatsappSentSuccess, setWhatsappSentSuccess] = useState(false);

  // Sync state if lead changes
  useEffect(() => {
    setActiveTab("details");
    setCustomProposedBudget(lead.budget);
    
    // Choose status-relative whatsapp message automatically
    triggerAutopopulateTemplate(lead.status);
  }, [lead.id]);

  const triggerAutopopulateTemplate = (status: LeadStatus) => {
    const matched = whatsappTemplates.find(t => t.triggerStatus === status) || whatsappTemplates[0];
    if (matched) {
      setSelectedTemplateId(matched.id);
      setEditingWhatsAppMessage(replacePlaceholders(matched.message, lead));
    }
  };

  const replacePlaceholders = (text: string, currentLead: Lead): string => {
    return text
      .replace(/\{\{name\}\}/g, currentLead.name)
      .replace(/\{\{businessName\}\}/g, currentLead.businessName)
      .replace(/\{\{budget\}\}/g, currentLead.budget.toLocaleString("en-IN"))
      .replace(/\{\{businessType\}\}/g, currentLead.businessType)
      .replace(/\{\{onboarding_link\}\}/g, "https://leadflow.agency/onboard/" + currentLead.id);
  };

  const handleStatusChange = (newStatus: LeadStatus) => {
    const statusMeta = STATUS_LOOKUP[newStatus];
    const updatedLead: Lead = {
      ...lead,
      status: newStatus,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "status_change",
          description: `Changed status to "${newStatus}"`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    onUpdateLead(updatedLead);
    
    // Auto-prompt status transition WhatsApp script
    triggerAutopopulateTemplate(newStatus);
    setActiveTab("whatsapp");
  };

  const handleAssignMember = (memberName: string) => {
    const updatedLead: Lead = {
      ...lead,
      assignedTo: memberName,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "assigned",
          description: `Assigned client to specialist: ${memberName}`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    onUpdateLead(updatedLead);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const newNote: Note = {
      id: `n_${Date.now()}`,
      text: newNoteText,
      timestamp: new Date().toISOString(),
      author: "Abhiraj Gupta" // Current logged-in user
    };

    const updatedLead: Lead = {
      ...lead,
      notes: [...lead.notes, newNote],
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "note_added",
          description: `Added client review note: "${newNoteText.substring(0, 30)}..."`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    
    onUpdateLead(updatedLead);
    setNewNoteText("");
  };

  const handleUpdateFollowUpDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLead: Lead = {
      ...lead,
      followUpDate: e.target.value,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "system",
          description: `Outreach check-in date set to ${e.target.value}`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    onUpdateLead(updatedLead);
  };

  const handleUpdateBudget = () => {
    const updatedLead: Lead = {
      ...lead,
      budget: Number(customProposedBudget),
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "system",
          description: `Sales revenue budget adjusted to ₹${Number(customProposedBudget).toLocaleString("en-IN")}`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    onUpdateLead(updatedLead);
  };

  // Run Real-Time Gemini AI Lead Evaluation (with fallback)
  const handleTriggerAiInsights = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          name: lead.name,
          businessName: lead.businessName,
          businessType: lead.businessType,
          leadSource: lead.leadSource,
          budget: lead.budget,
        }),
      });

      if (!response.ok) throw new Error("Server error running evaluation");
      const data = await response.json();

      const updatedLead: Lead = {
        ...lead,
        aiScore: data.aiScore,
        aiPriority: data.aiPriority,
        pitchIdea: data.pitchIdea,
        suggestedPlatform: data.suggestedPlatform,
        followUpTip: data.followUpTip,
        activities: [
          {
            id: `act_${Date.now()}`,
            type: "system",
            description: `Generated AI Lead Scoring insights: Score ${data.aiScore}% (Priority: ${data.aiPriority})`,
            timestamp: new Date().toISOString()
          },
          ...lead.activities
        ]
      };
      
      onUpdateLead(updatedLead);
      setActiveTab("ai");
    } catch (err) {
      console.error("Failed getting Gemini insights", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run Real-Time Custom Gemini AI Custom Copilot Pitch Writer
  const handleTriggerAiProposalWrite = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/generate-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          businessName: lead.businessName,
          businessType: lead.businessType,
          status: lead.status,
          campaignType: "Premium Onboarding Proposal Offer"
        }),
      });
      if (!response.ok) throw new Error("Server error writing copywriting pitch");
      const data = await response.json();
      
      setEditingWhatsAppMessage(data.message);
      setWhatsappSentSuccess(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // One-click Send Message (WhatsApp simulation API redirect)
  const handleSimulateWhatsAppClick = () => {
    setWhatsappSentSuccess(true);
    
    // Open standard WhatsApp action links
    const encodedText = encodeURIComponent(editingWhatsAppMessage);
    const cleanPhone = lead.phone.replace(/[^0-9+]/g, "");
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    
    // Open in separate browser window/tab safety triggers
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Track in CRM database timeline
    const updatedLead: Lead = {
      ...lead,
      activities: [
        {
          id: `act_${Date.now()}`,
          type: "whatsapp",
          description: `Dispatched WhatsApp message: "${editingWhatsAppMessage.substring(0, 45)}..."`,
          timestamp: new Date().toISOString()
        },
        ...lead.activities
      ]
    };
    
    onUpdateLead(updatedLead);
    
    setTimeout(() => {
      setWhatsappSentSuccess(false);
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer Body */}
          <motion.div 
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-slate-950 z-50 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex justify-between items-start bg-slate-50 dark:bg-slate-950/20">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_LOOKUP[lead.status].color} ${STATUS_LOOKUP[lead.status].bg} border ${STATUS_LOOKUP[lead.status].border} mb-2`}>
                  <Tag className="w-3 h-3" />
                  {lead.status}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{lead.businessName}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <User className="w-3.5 h-3.5" /> Contact: <span className="font-medium text-slate-700 dark:text-slate-300">{lead.name}</span> · <span className="italic">{lead.businessType}</span>
                </p>
              </div>
              <button 
                id="close-lead-drawer"
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-905 text-slate-400 hover:text-slate-600 dark:text-slate-500 transition-colors cursor-pointer"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Mini Bar */}
            <div className="px-6 py-3 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-900/80 flex flex-wrap gap-2.5 items-center justify-between text-xs">
              <div className="flex gap-1.5 items-center">
                <span className="text-slate-400">Owner:</span>
                <select 
                  value={lead.assignedTo} 
                  onChange={(e) => handleAssignMember(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2 font-medium text-slate-700 dark:text-slate-300 outline-none"
                >
                  {team.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              {/* CRM Lead status dynamic transitions */}
              <div className="flex gap-1.5 items-center">
                <span className="text-slate-400">Sync Status:</span>
                <select 
                  value={lead.status} 
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2 font-medium text-slate-700 dark:text-slate-300 outline-none"
                >
                  {Object.keys(STATUS_LOOKUP).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-900 text-sm">
              {[
                { id: "details", label: "Client Profile & History", icon: Clock },
                { id: "notes", label: `Staff Notes (${lead.notes.length})`, icon: MessageSquare },
                { id: "whatsapp", label: "WhatsApp Template", icon: Send },
                { id: "ai", label: "Gemini AI Quality Scan", icon: Sparkles }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-1 border-b-2 flex items-center justify-center gap-1.5 cursor-pointer font-medium transition-all ${
                      activeTab === tab.id 
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Quick Metadata Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Revenue Budget (INR)</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">₹</span>
                        <input 
                          type="number"
                          value={customProposedBudget}
                          onChange={(e) => setCustomProposedBudget(Number(e.target.value))}
                          onBlur={handleUpdateBudget}
                          className="w-full bg-transparent font-bold border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none p-0 text-slate-800 dark:text-slate-200 text-lg"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Updates on shift out of focus.</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Follow-Up Target</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <input 
                          type="date"
                          value={lead.followUpDate || ""}
                          onChange={handleUpdateFollowUpDate}
                          className="bg-transparent font-mono font-medium text-xs text-slate-800 dark:text-slate-200 outline-none w-full"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Auto triggers warning calendar reminder.</p>
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="space-y-3.5 bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lead Metadata Profiles</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${lead.phone}`} className="hover:underline hover:text-indigo-600">{lead.phone}</a>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a href={`mailto:${lead.email}`} className="hover:underline hover:text-indigo-600 break-all">{lead.email}</a>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>Acquisition Source: <strong className="text-slate-800 dark:text-slate-200">{lead.leadSource}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Created: <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs">{new Date(lead.dateAdded).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Real-time AI Summary Segment */}
                  {lead.aiScore ? (
                    <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-3 opacity-20 dark:opacity-10">
                        <Sparkles className="w-16 h-16 text-indigo-600" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Gemini AI Core Insights Enabled
                        </h4>
                        <span className="font-mono text-xs font-extrabold px-1.5 py-0.5 rounded-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          PROBABILITY: {lead.aiScore}%
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-slate-100 font-medium">SMM Tactic Idea: </strong>
                          {lead.pitchIdea}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-slate-100 font-medium font-mono">Suggested Channel: </strong>
                          {lead.suggestedPlatform}
                        </p>
                        <div className="p-2.5 bg-white/70 dark:bg-slate-950/50 rounded-lg border border-indigo-50/50 dark:border-indigo-900/20 text-slate-600 dark:text-slate-400 italic">
                          💡 Outreach Guideline: {lead.followUpTip}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 p-6">
                      <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Unscanned Client Lead</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">Run our Gemini-powered lead analyzer to automatically rate profile quality, detect conversion scores, and draft laser-focused marketing pitches.</p>
                      </div>
                      <button 
                        id="run-ai-insights-btn"
                        onClick={handleTriggerAiInsights}
                        disabled={isAiLoading}
                        className="py-1.5 px-4 bg-indigo-600 text-white font-medium text-xs rounded-lg shadow-sm hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Scan Quality with Gemini AI
                      </button>
                    </div>
                  )}

                  {/* Conversation History Timeline */}
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sync CRM Timelines</h3>
                    <div className="space-y-4 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
                      {lead.activities.map((act) => {
                        return (
                          <div key={act.id} className="relative group text-xs">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-700 block" />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{act.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type private member client update note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-600 transition"
                    />
                    <button 
                      onClick={handleAddNote}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0 hover:bg-slate-900 transition font-medium text-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {lead.notes.map((note) => (
                      <div key={note.id} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 relative text-xs">
                        <div className="flex justify-between items-center text-slate-400 font-semibold mb-1">
                          <span className="flex items-center gap-1 font-sans text-indigo-600 dark:text-indigo-400">
                            <User className="w-3 h-3" /> {note.author}
                          </span>
                          <span className="font-mono text-[9px] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(note.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{note.text}</p>
                      </div>
                    ))}

                    {lead.notes.length === 0 && (
                      <div className="text-center p-8 text-xs text-slate-400 italic">
                        No private review notes recorded for this SMM lead yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "whatsapp" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Configure Automation Trigger</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {whatsappTemplates.map(tpl => (
                        <button
                          key={tpl.id}
                          onClick={() => {
                            setSelectedTemplateId(tpl.id);
                            setEditingWhatsAppMessage(replacePlaceholders(tpl.message, lead));
                          }}
                          className={`p-2.5 rounded-lg text-left border text-xs transition duration-150 cursor-pointer ${
                            selectedTemplateId === tpl.id 
                              ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="font-extrabold truncate">{tpl.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Triggers: {tpl.triggerStatus}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold uppercase text-slate-400">Edit Pitch Message Before Shipping</label>
                      <button 
                        onClick={handleTriggerAiProposalWrite}
                        disabled={isAiLoading}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Re-Write Pitch with Gemini AI
                      </button>
                    </div>

                    <textarea
                      value={editingWhatsAppMessage}
                      onChange={(e) => setEditingWhatsAppMessage(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-600 leading-relaxed font-mono"
                    />
                  </div>

                  <div className="flex gap-2 items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-400 max-w-sm">One-click simulated WhatsApp opens the real messenger pre-filled with the customized text pitch to complete contact logs.</p>
                    <button
                      onClick={handleSimulateWhatsAppClick}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {whatsappSentSuccess ? <Check className="w-4 h-4 shrink-0" /> : <Send className="w-3.5 h-3.5 shrink-0" />}
                      {whatsappSentSuccess ? "Dispatched!" : "Launch WhatsApp Chat"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-4">
                  {/* AI Comprehensive Evaluation Dashboard */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 relative text-xs">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-3">
                      <Sparkles className="w-5 h-5" /> Gemini Quality Engine Scan
                    </div>

                    <div className="space-y-4 font-sans leading-relaxed text-slate-600 dark:text-slate-300">
                      <p>Running Gemini diagnostics uses real SMM campaigns conversion metadata. Evaluating the client budget metrics to establish direct closing parameters.</p>
                      
                      <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Conversion Quality Rating</div>
                          {lead.aiScore ? (
                            <div className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-slate-100">
                              {lead.aiScore}% <span className="text-xs font-normal text-indigo-500">({lead.aiPriority} Priority)</span>
                            </div>
                          ) : (
                            <div className="text-base text-slate-400 italic">No Scan Record</div>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Active Recommendation Channel</div>
                          <div className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                            {lead.suggestedPlatform || "N/A"}
                          </div>
                        </div>
                      </div>

                      {lead.pitchIdea && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Tailored pitch strategy</label>
                          <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 rounded-lg italic">
                            "{lead.pitchIdea}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      id="re-scan-lead-btn"
                      onClick={handleTriggerAiInsights}
                      disabled={isAiLoading}
                      className="flex-1 py-2.5 bg-indigo-600 text-white font-medium text-xs rounded-lg shadow-sm hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      {lead.aiScore ? "Re-Run Analysis Model" : "Execute First Diagnostics"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
