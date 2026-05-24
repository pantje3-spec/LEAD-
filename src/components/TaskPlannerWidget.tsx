import React, { useState, useEffect } from "react";
import { TeamMember, RecurringTask } from "../types";
import { 
  ClipboardList, Plus, Trash2, CheckCircle, Clock, 
  User, Check, AlertCircle, Sparkles
} from "lucide-react";

interface TaskPlannerProps {
  team: TeamMember[];
}

export default function TaskPlannerWidget({ team }: TaskPlannerProps) {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  // Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [assignedMember, setAssignedMember] = useState("");
  const [taskFrequency, setTaskFrequency] = useState<"Daily" | "Mon-Fri" | "Weekends">("Daily");
  const [taskNotes, setTaskNotes] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Load tasks on mount
  useEffect(() => {
    const saved = localStorage.getItem("crm_recurring_tasks_v1");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        // Fall back below
      }
    } else if (team.length > 0) {
      // Set pristine mock data matching current team members
      const initialTasks: RecurringTask[] = [
        {
          id: "task_1",
          memberName: "Abhiraj Gupta",
          title: "Audit High-Budget Meta Ads Performance",
          notes: "Verify CPL and CTR in the strategy center to ensure target margins.",
          frequency: "Daily",
          lastCompletedDate: ""
        },
        {
          id: "task_2",
          memberName: "Sanya Roy",
          title: "Call 5 Warm Leads & Schedule Demos",
          notes: "Focus on dental clinics and real estate brokers with budgets > ₹25k.",
          frequency: "Daily",
          lastCompletedDate: ""
        },
        {
          id: "task_3",
          memberName: "Karan Johar",
          title: "Refresh Instagram Campaign Ad Hooks",
          notes: "Compose three fresh visual hooks using SMM copy architect.",
          frequency: "Daily",
          lastCompletedDate: todayStr // Mock checked off today
        },
        {
          id: "task_4",
          memberName: "Meera Patel",
          title: "Publish Weekly Client Success Carousel",
          notes: "Format with high-contrast slate theme templates.",
          frequency: "Mon-Fri",
          lastCompletedDate: ""
        }
      ];
      setTasks(initialTasks);
      localStorage.setItem("crm_recurring_tasks_v1", JSON.stringify(initialTasks));
    }
  }, [team]);

  // Set default assigned member when team list loads or changes
  useEffect(() => {
    if (team.length > 0 && !assignedMember) {
      setAssignedMember(team[0].name);
    }
  }, [team, assignedMember]);

  const saveTasks = (newTasks: RecurringTask[]) => {
    setTasks(newTasks);
    localStorage.setItem("crm_recurring_tasks_v1", JSON.stringify(newTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !assignedMember) return;

    const newTask: RecurringTask = {
      id: `task_${Date.now()}`,
      memberName: assignedMember,
      title: taskTitle.trim(),
      notes: taskNotes.trim() || undefined,
      frequency: taskFrequency,
      lastCompletedDate: ""
    };

    const updated = [...tasks, newTask];
    saveTasks(updated);
    
    // Reset form
    setTaskTitle("");
    setTaskNotes("");
    setIsAddFormOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const handleToggleTaskCompletion = (task: RecurringTask) => {
    const isCompleted = task.lastCompletedDate === todayStr;
    const updated = tasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          lastCompletedDate: isCompleted ? "" : todayStr
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Group tasks by team member
  const getTasksForMember = (name: string) => {
    return tasks.filter(t => t.memberName === name);
  };

  return (
    <div id="task-planner-root" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 rounded-2xl shadow-xs p-5 space-y-5">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-50 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-50 dark:bg-indigo-950 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Recurring Staff Task Planner</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Admin dashboard to dispatch repetitive daily operations with automatic overnight reset.</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
          className="flex items-center justify-center gap-1.5 self-start sm:self-center bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAddFormOpen ? "Close Scheduler" : "Assign Daily Task"}
        </button>
      </div>

      {/* Inline Form to add recurring tasks */}
      {isAddFormOpen && (
        <form onSubmit={handleAddTask} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-xl space-y-4 animate-fadeIn text-xs">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Create Brand Strategy & Sales Dispatch Template</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Assign To Staff</label>
              <select
                value={assignedMember}
                onChange={(e) => setAssignedMember(e.target.value)}
                className="w-full bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
              >
                {team.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Task Title / Instruction</label>
              <input
                type="text"
                placeholder="e.g., Audit lead conversions, draft 5 new carousel ads"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Recurring Frequency</label>
              <select
                value={taskFrequency}
                onChange={(e) => setTaskFrequency(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="Daily">Daily Recurring</option>
                <option value="Mon-Fri">Weekdays (Mon-Fri)</option>
                <option value="Weekends">Weekends Only</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Explanatory Notes (Optional)</label>
              <input
                type="text"
                placeholder="Add context resources or priority hints"
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                className="w-full bg-white dark:bg-slate-905 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddFormOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-bold"
            >
              Dispatch Task
            </button>
          </div>
        </form>
      )}

      {/* Grid of Team Members and their task reports */}
      {team.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map(member => {
            const memberTasks = getTasksForMember(member.name);
            const totalTasks = memberTasks.length;
            const completedTasks = memberTasks.filter(t => t.lastCompletedDate === todayStr).length;
            const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const initials = member.name.split(" ").map(n => n[0]).join("");

            return (
              <div 
                key={member.id} 
                className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5 transition hover:shadow-xs"
              >
                {/* Member profile header and miniature progress wheel */}
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/40 pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${member.avatarColor || "bg-indigo-600 text-white"} text-[10px] font-black flex items-center justify-center`}>
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{member.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">
                      {completedTasks}/{totalTasks} Done
                    </span>
                    <span className="text-[8px] font-bold text-indigo-500 uppercase">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Task list for this member */}
                <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto pr-0.5">
                  {memberTasks.length > 0 ? (
                    memberTasks.map(task => {
                      const isCompleted = task.lastCompletedDate === todayStr;
                      return (
                        <div 
                          key={task.id} 
                          className={`p-2.5 rounded-lg border transition ${
                            isCompleted 
                              ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20" 
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80"
                          } group flex items-start gap-2.5 text-xs`}
                        >
                          {/* Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleTaskCompletion(task)}
                            className={`mt-0.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition shrink-0 cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-600 border-emerald-650 text-white"
                                : "border-slate-250 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400"
                            }`}
                          >
                            {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 space-y-0.5 min-w-0">
                            <h5 className={`font-extrabold text-slate-800 dark:text-slate-100 leading-tight break-words ${
                              isCompleted ? "line-through text-slate-400 dark:text-slate-500" : ""
                            }`}>
                              {task.title}
                            </h5>
                            
                            {task.notes && (
                              <p className={`text-[9px] ${
                                isCompleted ? "text-slate-400/85 dark:text-slate-500/80" : "text-slate-400"
                              } break-words leading-tight`}>
                                {task.notes}
                              </p>
                            )}

                            <div className="flex items-center gap-2 pt-1 text-[8px] font-bold text-slate-400 uppercase">
                              <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded-sm">{task.frequency}</span>
                              {isCompleted && (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-extrabold">
                                  <CheckCircle className="w-2.5 h-2.5" /> Met Today
                                </span>
                              )}
                              {!isCompleted && (
                                <span className="text-amber-500 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> Pending
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete button (only visible on hover/focus to keep aesthetic pristine) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-850 opacity-0 group-hover:opacity-100 transition cursor-pointer select-none self-center shrink-0"
                            title="Remove recurring instruction"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 space-y-1 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-lg bg-white dark:bg-slate-900/40">
                      <AlertCircle className="w-4 h-4 mx-auto text-slate-350" />
                      <p className="text-[10px]">No daily tasks set.</p>
                      <button 
                        type="button"
                        onClick={() => {
                          setAssignedMember(member.name);
                          setIsAddFormOpen(true);
                        }}
                        className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Create Task
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct simple status indicator at footer of each card */}
                {totalTasks > 0 && (
                  <div className="w-full bg-slate-150 dark:bg-slate-800 h-1 rounded-full overflow-hidden shrink-0 mt-2">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
          <p className="text-xs text-slate-400">Please onboard at least one Team Member in the 'Team Performance' tab to configure task schedules.</p>
        </div>
      )}

    </div>
  );
}
